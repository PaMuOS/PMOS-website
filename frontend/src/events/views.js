var EventEmitter = require('events').EventEmitter
  , _ = require('underscore')
  , async = require('async')
  , debug = require('debug')('events.views')
  , eventModels = require('./models')
  , config = require('../../config')

// Events :
//    - play (events) : list of events to be played
//    - performanceOver : a performance has ended. Reinitialize the UI
exports.events = new EventEmitter

exports.render = function() {
  var cursor = $('#timeline .cursor')
    , cursorWidth = cursor.width()
    , dragging = false
    , ratio
  setCursor(0)

  // Interaction for moving the cursor
  cursor.on('mousedown', function() {
    if (Performance.current) Performance.current.clear()
    dragging = true
  })
  
  $(window).on('mouseup', function() {
    if (dragging === true)
      new Performance(ratioToTimestamp(ratio), eventModels.bounds[1])
    dragging = false
  })
  .on('mousemove', function(event) {
    if (dragging === true) {
      var pos = event.pageX - cursorWidth / 2 - $('#timeline').offset().left
        , maxPos = $('#timeline').width() - cursorWidth
      ratio = Math.max(Math.min(pos / maxPos, 1), 0)
      setCursor(ratio)
    }
  })

}

// If there is a performance active, clears it
exports.clearPerformance = function() {
  if (Performance.current) Performance.current.clear()
}

// Set the date / time feedback on the cursor and cursor position
var setCursor = function(ratio) {
  var dateDiv = $('#timeline .date')
    , timeDiv = $('#timeline .time')
    , cursor = $('#timeline .cursor')
    , formattedTime = formatTime(ratioToTimestamp(ratio))
    , pos = ($('#timeline').width() - cursor.width()) * ratio
  
  dateDiv.html(formattedTime[0])
  timeDiv.html(formattedTime[1])
  cursor.css({ left: pos })
}

// Converts a ratio to a timestamp according to the bounds [<min timestamp>, <max timestamp>]
var ratioToTimestamp = function(ratio) {
  return Math.round((eventModels.bounds[1] - eventModels.bounds[0]) * ratio + eventModels.bounds[0])
}

// Converts a timestamp to a ratio according to the bounds [<min timestamp>, <max timestamp>]
var timestampToRatio = function(timestamp) {
  return (timestamp - eventModels.bounds[0]) / (eventModels.bounds[1] - eventModels.bounds[0])
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

// Performance object to handle all teh scheduling and paginated load of events more easily
var Performance = function(fromTime, toTime) {
  var self = this
  if (Performance.current) Performance.current.clear()
  Performance.current = this
  this.fetching = false
  this.over = true
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

  // Fetch next events
  next: function() {
    debug('performance fetch next')
    var self = this
    if (this.fetching === true) return
    this.fetching = true
    eventModels.next(function(err, events) {
      _.forEach(events, function(event) { self.queue.push(event) })
      if (events.length === 0) self.over = true
      self.fetching = false
    })
  },

  // Start the performance
  start: function() {
    debug('start performing')
    var self = this
    this.timeOffset = +(Date.now()) - this.fromTime

    this.intervalHandle = setInterval(function() {
      var currentDate = new Date(+(Date.now()) - self.timeOffset)
      setCursor(timestampToRatio(+currentDate))
      
      if (self.over && self.queue.length === 0) {
        debug('performance over')
        self.clear()

      } else {
        // If there is not so many events left in the queue, fetch next
        if (self.queue.length < 50) self.next()

        // Play the events whose time has come
        events = []
        while (self.queue[0].timestamp + self.timeOffset < +(Date.now()))
          events.push(self.queue.shift())
        if (events.length)
          exports.events.emit('play', events)
      }

    }, config.performance.granularity)
  },

  // Clear the performance, stopping the interval and so on
  clear: function() {
    debug('clearing performance')
    clearInterval(this.intervalHandle)
    exports.events.emit('performanceOver')
    Performance.current = null
  }

})
