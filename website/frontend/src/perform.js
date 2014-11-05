var querystring = require('querystring')
  , _ = require('underscore')
  , tubeViews = require('./tube-views')
  , config = require('./config')

var performanceQueue = []
  , performanceInterval = null

exports.betweenDates = function(fromDate, toDate) {
  clearPerformance()
  fetchTubeEvents(fromDate, toDate, function(err, data) {
    if (err) throw err
    performanceQueue = data
    startPerforming(fromDate)
  })
}

var fetchTubeEvents = function(fromDate, toDate, done) {
  debugger
  var url = '/tubes/?' + querystring.stringify({
    fromDate: fromDate.toISOString(),
    toDate: toDate.toISOString()
  })

  $.getJSON(url, function(data) {
    done(null, _.map(data, function(tubeEvent) {
      tubeEvent.date = new Date(tubeEvent.date)
      return tubeEvent
    }))
  })
}

var performTubeEvent = function(tubeEvent) {
  if (tubeEvent.type === 'on') tubeViews.setPlaying(tubeEvent.userId, tubeEvent.tubeId)
  else if (tubeEvent.type === 'off') tubeViews.setIdle(tubeEvent.userId, tubeEvent.tubeId)
  else throw new Error('invalid event type ' + tubeEvent.type)
}

var startPerforming = function(fromDate) {
  console.log('start performing')
  var performanceDateOffset = +(Date.now()) - fromDate

  performanceInterval = setInterval(function() {
    var currentDate = new Date(+(Date.now()) - performanceDateOffset)
    document.getElementById('performanceClock').innerHTML = currentDate
    
    if (performanceQueue.length === 0) {
      console.log('performance over')
      clearPerformance()

    } else if (+(performanceQueue[0].date) + performanceDateOffset < +(Date.now())) {
      var tubeEvent = performanceQueue.shift()
      console.log('tube ' + tubeEvent.tubeId + ' ' + tubeEvent.type)
      performTubeEvent(tubeEvent)
    }

  }, config.performanceGranularity)
}

var clearPerformance = function() {
  clearInterval(performanceInterval)
  tubeViews.setAllIdle()
  performanceInterval = null
  performanceQueue = []
  document.getElementById('performanceClock').innerHTML = ''
}