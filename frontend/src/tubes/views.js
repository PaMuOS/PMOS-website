var _ = require('underscore')
  , tubeModels = require('./models')
  , debug = require('debug')('tubes.views')
  , config = require('../../config')

// This performs a list of events, putting the tubes on and off accordingly.
exports.perform = function(events) {
  // Tubes can have only one state at the time, so if several events
  // on the same tube, we keep only the last event.
  var compressed = {}
  events = _.sortBy(events, function(event) { return event.timestamp })
  _.forEach(events, function(event) {
    compressed[event.num] = event
  })
  events = _.values(compressed)

  // For all events, set the corresponding tube to idle or playing
  events.forEach(function(event) {
    if (event.frequency) exports.setPlaying(event.channel, event.num)
    else exports.setIdle(event.num)
  })

  // All other tubes are set to idle
  var otherTubes = _.difference(
    _.pluck(tubeModels.all, 'num'),
    _.pluck(events, 'num')
  )
  _.forEach(otherTubes, function(num) { exports.setIdle(num) })
}

exports.setAllIdle = function() {
  d3.selectAll('circle.tube')
    .classed('idle', true)
    .attr('fill', 'none') 
}

// Create all the tube views. Must be called after the tube models have been fetched.
exports.render = function() {
  var tubesSvg = d3.select('svg#tubes')
    , width = tubesSvg.attr('width')
    , height = tubesSvg.attr('height')

  var scale, hScale
    , x1s = [], x2s = []
    , y1s = [], y2s = []
    , xMin, bbW, yMin, bbH

  _.forEach(tubeModels.all, function(tube) {
    x1s.push(tube.x - tube.diameter / 2)
    x2s.push(tube.x + tube.diameter / 2)
    y1s.push(tube.y - tube.diameter / 2)
    y2s.push(tube.y + tube.diameter / 2)
  })

  xMin = _.min(x1s)
  bbW = _.max(x2s) - xMin
  yMin = _.min(y1s)
  bbH = _.max(y2s) - yMin
  scale = width / bbW
  height = bbH * scale
  tubesSvg.attr('height', height)

  tubesSvg.selectAll('circle.tube').data(tubeModels.all)
    .enter().append('circle').classed({'tube': true, 'idle': true})
    .attr('cx', function(t) { return (t.x - xMin) * scale })
    .attr('cy', function(t) { return (t.y - yMin) * scale })
    .attr('r', function(t) { return scale * t.diameter / 2 })

  debug('initialized')
}

exports.setPlaying = function(channel, num) {
  d3.selectAll('circle.tube').filter(function(d) { return d.id === num })
    .classed('idle', false)
    .attr('fill', config.performance.channels[channel].color)
}

exports.setIdle = function(num) {
  d3.selectAll('circle.tube').filter(function(d) { return d.id === num })
    .classed('idle', true)
    .attr('fill', 'none')
}