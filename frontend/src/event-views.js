var _ = require('underscore')
  , async = require('async')
  , tubeViews = require('./tube-views')
  , tubeEventModels = require('./tube-models')
  , config = require('../config')

var perform = exports.perform = function(tubeEvent) {
  console.log('perform tube ' + tubeEvent.tubeId + ' ' + tubeEvent.state)
  if (tubeEvent.state === 'on') tubeViews.setPlaying(tubeEvent.userId, tubeEvent.tubeId)
  else if (tubeEvent.state === 'off') tubeViews.setIdle(tubeEvent.userId, tubeEvent.tubeId)
  else throw new Error('invalid event state ' + tubeEvent.state)
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

  load: function(done) {
    var self = this
    tubeEventModels.load(this.fromTime, this.toTime, function(err, tubeEvents) {
      if (err) return done(err)
      console.log('performance loaded')
      self.queue = tubeEvents
      done()
    })
  },

  clear: function() {
    clearInterval(this.intervalHandle)
    tubeViews.setAllIdle()
    Performance.current = null
    document.getElementById('performanceClock').innerHTML = ''
  },

  start: function() {
    console.log('start performing')
    var self = this
    this.timeOffset = +(Date.now()) - this.fromTime

    this.intervalHandle = setInterval(function() {
      var currentDate = new Date(+(Date.now()) - self.timeOffset)
      document.getElementById('performanceClock').innerHTML = currentDate
      
      if (self.queue.length === 0) {
        console.log('performance over')
        self.clear()

      } else if (self.queue[0].timestamp + self.timeOffset < +(Date.now())) {
        perform(self.queue.shift())
      }

    }, config.performance.granularity)
  }

})
