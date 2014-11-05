var querystring = require('querystring')
  , csv = require('csv')
  , _ = require('underscore')

var config = {
  dScale: 0.2, // Scale the tube diameters
  performanceGranularity: 500 // milliseconds
}

var tubeList
  , tubesSvg, width, height

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

rhizome.start(function() {
  rhizome.send('/sys/subscribe', ['/tube/on'])
  rhizome.send('/sys/subscribe', ['/tube/off'])
})

rhizome.on('message', function(address, args) {
  if (address === '/tube/on') {
    var tubeId = args[0]
    d3.selectAll('circle.tube').filter(function(d) { return d.id === tubeId })
      .classed('idle', false)
      .attr('fill', 'red')

  } else if (address === '/tube/off') {
    var tubeId = args[0]
    d3.selectAll('circle.tube').filter(function(d) { return d.id === tubeId })
      .classed('idle', true)
      .attr('fill', 'none')

  } else if (address === '/sys/subscribed') {
    console.log(address, args[0])
  } else console.log('unknown address')
})

window.onload = function() {
  tubesSvg = d3.select('svg#tubes')
  width = tubesSvg.attr('width')
  height = tubesSvg.attr('height')

  $('form#perform').submit(function(event) {
    event.preventDefault()
    schedulePerfomance(new Date(this.elements[0].value), new Date(this.elements[1].value))
  })

  $.get('/data/tubes.csv', function(data) {
    csv.parse(data, function(err, data){
      if (err) throw err
      var scale, hScale
        , x1s = [], x2s = []
        , y1s = [], y2s = []
        , xMin, bbW, yMin, bbH

      tubeList = data.map(function(row, i) {
        var x = parseFloat(row[4])
          , y = parseFloat(row[5])
          , d = parseFloat(row[3]) * config.dScale
        x1s.push(x - d / 2)
        x2s.push(x + d / 2)
        y1s.push(y - d / 2)
        y2s.push(y + d / 2)
        var tube = { id: i, d: d, x: x, y: y }
        return tube
      })

      xMin = _.min(x1s)
      bbW = _.max(x2s) - xMin
      yMin = _.min(y1s)
      bbH = _.max(y2s) - yMin
      scale = width / bbW
      height = bbH * scale
      tubesSvg.attr('height', height)

      tubesSvg.selectAll('circle.tube').data(tubeList)
        .enter().append('circle').classed({'tube': true, 'idle': true})
        .attr('cx', function(t) { return (t.x - xMin) * scale })
        .attr('cy', function(t) { return (t.y - yMin) * scale })
        .attr('r', function(t) { return scale * t.d / 2 })
    })
  })

}