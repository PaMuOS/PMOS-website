var querystring = require('querystring')
  , csv = require('csv')
  , _ = require('underscore')

var config = {
  dScale: 0.2, // Scale the tube diameters
  performanceGranularity: 500 // milliseconds
}

var performanceQueue = []
  , performanceInterval = null

var fetchTubeEvents = function(fromDate, toDate, done) {
  var url = '/tubes/?' + querystring.stringify({
    fromDate: fromDate,
    toDate: toDate
  })

  $.getJSON(url, function(data) {
    done(null, _.map(data, function(tubeEvent) {
      tubeEvent.date = new Date(tubeEvent.date)
      return tubeEvent
    }))
  })
}

var schedulePerfomance = function(fromDate, toDate) {
  fetchTubeEvents(fromDate, toDate, function(err, data) {
    if (err) throw err
    performanceQueue = data
    startPerforming(fromDate)
  })
}

var performTubeEvent = function(tubeEvent) {
  var selection = d3.selectAll('circle.tube').filter(function(d) { return d.id === tubeEvent.tubeId })
  if (tubeEvent.type === 'on') {
    selection
      .classed('idle', false)
      .attr('fill', 'red')
  } else if (tubeEvent.type === 'off') {
    selection
      .classed('idle', true)
      .attr('fill', 'none')
  } else throw new Error('invalid event type ' + tubeEvent.type)
}

var startPerforming = function(fromDate) {
  console.log('start performing')
  performanceDateOffset = +(Date.now()) - fromDate
  // TODO reset tubes
  if (!performanceInterval) {
    performanceInterval = setInterval(function() {
      if (performanceQueue.length === 0) clearInterval(performanceInterval)
      else if (+(performanceQueue[0].date) + performanceDateOffset < +(Date.now())) {
        var tubeEvent = performanceQueue.shift()
        console.log('tube ' + tubeEvent.tubeId + ' ' + tubeEvent.type)
        performTubeEvent(tubeEvent)
      }
    }, config.performanceGranularity)
  }
}
