var EventEmitter = require('events').EventEmitter
  , _ = require('underscore')
  , async = require('async')
  , debug = require('debug')('events.views')
  , eventModels = require('./models')
  , config = require('../../config')

// Events :
//    - setTime (timestamp) : timeline moved and released to another date
//    - play (events) : list of events to be played
//    - performanceOver : a performance has ended. Reinitialize the UI
exports.events = new EventEmitter

exports.render = function() {
  var cursor = $('#timeline .cursor')
    , cursorWidth = cursor.width()
    , cursorPad = 0
    , dragging = false
    , ratio
  cursor.css({ left: cursorPad })
  setCursorTime(eventModels.bounds[0])

  // Interaction for moving the cursor
  cursor.on('mousedown', function() { dragging = true })
  
  $(window).on('mouseup', function() {
    if (dragging === true)
      exports.events.emit('setTime', ratioToTimestamp(ratio))
    dragging = false
  })
  .on('mousemove', function(event) {
    if (dragging === true) {
      var timelineX = $('#timeline').offset().left
        , pos = event.pageX - cursorWidth / 2 - timelineX
        , maxPos = $('#timeline').width() - cursorPad - cursorWidth
      pos = Math.max(Math.min(pos, maxPos), cursorPad)
      ratio = pos / maxPos
      setCursorTime(ratioToTimestamp(ratio))
      cursor.css({ left: pos })
    }
  })

}

// Set the date / time feedback on the cursor
var setCursorTime = function(timestamp) {
  var dateDiv = $('#timeline .date')
    , timeDiv = $('#timeline .time')
    , formattedTime = formatTime(timestamp)
  dateDiv.html(formattedTime[0])
  timeDiv.html(formattedTime[1])
}

// Convert a ratio to a timestamp according to the bounds [<min timestamp>, <max timestamp>]
var ratioToTimestamp = function(ratio) {
  return Math.round((eventModels.bounds[1] - eventModels.bounds[0]) * ratio + eventModels.bounds[0])
}

// Takes a timestamp and returns a nicely human-readable date&time list `[<date>, <time>]` 
var formatTime = function(timestamp) {
  var date = new Date(timestamp)
    , dateElems = [date.getDate(), date.getMonth() + 1, date.getFullYear()]
    , timeElems = [date.getHours(), date.getMinutes(), date.getSeconds()]
  
  var fixElems = function(el) {
    el = el.toString()
    if (el.length === 1) el = '0' + el
    return el
  }

  return [
    _.map(dateElems, fixElems).join('/'), 
    _.map(timeElems, fixElems).join(':')
  ]
}

// Objects and methods to perform a group of events,
// handling time and scheduling
exports.startPerformance = function(fromTime, toTime) { 
  return new Performance(fromTime, toTime)
}

var Performance = function(fromTime, toTime) {
  var self = this
  if (Performance.current) Performance.current.clear()
  Performance.current = this
  this.fromTime = fromTime
  this.toTime = toTime
  this.load(function(err) {
    if (err) throw err
    self.start()
  })
}
Performance.current = null


_.extend(Performance.prototype, {

  // Load events for this performance.
  load: function(done) {
    var self = this
    eventModels.load(this.fromTime, this.toTime, function(err, events) {
      if (err) return done(err)
      debug('performance loaded')
      self.queue = events
      done()
    })
  },

  // Start the performance
  start: function() {
    debug('start performing')
    var self = this
    this.timeOffset = +(Date.now()) - this.fromTime

    this.intervalHandle = setInterval(function() {
      var currentDate = new Date(+(Date.now()) - self.timeOffset)
      document.getElementById('performanceClock').innerHTML = currentDate
      
      if (self.queue.length === 0) {
        debug('performance over')
        self.clear()

      } else {
        events = []
        while (self.queue[0].timestamp + self.timeOffset < +(Date.now()))
          events.push(self.queue.shift())
        exports.events.emit('play', events)
      }

    }, config.performance.granularity)
  },

  // Clear the performance, stopping the interval and so on
  clear: function() {
    clearInterval(this.intervalHandle)
    exports.events.emit('performanceOver')
    Performance.current = null
    document.getElementById('performanceClock').innerHTML = ''
  }

})
