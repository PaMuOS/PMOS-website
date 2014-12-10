var _ = require('underscore')
  , async = require('async')
  , debug = require('debug')('events.views')
  , tubeViews = require('./views')
  , eventModels = require('../events/models')
  , config = require('../../config')

var perform = exports.perform = function(events) {
  tubeViews.perform(events)
}

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
        perform(events)
      }

    }, config.performance.granularity)
  },

  // Clear the performance, stopping the interval and so on
  clear: function() {
    clearInterval(this.intervalHandle)
    tubeViews.setAllIdle()
    Performance.current = null
    document.getElementById('performanceClock').innerHTML = ''
  }

})
