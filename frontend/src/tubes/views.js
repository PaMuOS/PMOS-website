var EventEmitter = require('events').EventEmitter
  , _ = require('underscore')
  , tubeModels = require('./models')
  , debug = require('debug')('tubes.views')
  , config = require('../../config')
  , isPlayable = false


// Events :
//    - play (events) : list of events to be played
exports.events = new EventEmitter

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
  events.forEach(performEvent)

  // All other tubes are set to idle
  var otherTubes = _.difference(
    _.pluck(tubeModels.all, 'num'),
    _.pluck(events, 'num')
  )
  _.forEach(otherTubes, function(num) { exports.setIdle(num) })
}

var performEvent = function(event) {
  if (event.frequency) exports.setPlaying(event.channel, event.num)
  else exports.setIdle(event.num)
}

// Create all the tube views. Must be called after the tube models have been fetched.
exports.render = function() {
  var tubesSvg = d3.select('svg#tubes')
    , width = window.screen.width / 2
    , height = width / config.tubes.originalRatio
  tubesSvg.attr('width', width + 20)
  tubesSvg.attr('height', height + 20)

  tubesSvg.selectAll('circle.tube').data(tubeModels.all)
    .enter().append('circle').classed({'tube': true})
    .attr('cx', function(t) { return t.x * width })
    .attr('cy', function(t) { return t.y * height })
    .attr('r', function(t) { return t.diameter * width / config.tubes.originalWidth })
    .on('mouseover', function() {
      if (isPlayable) {
        var event = d3.select(this).datum()
        performEvent(event)
        exports.events.emit('play', [event])
      }
    })
    .on('mouseout', function() {
      var event = _.extend({}, d3.select(this).datum(), {frequency: 0})
      performEvent(event)
      exports.events.emit('play', [event])
    })

  debug('rendered')
}

exports.setPlayable = function(val) {
  isPlayable = val
  d3.selectAll('circle.tube').classed('playable', val)
}

exports.setPlaying = function(channel, num) {
  d3.selectAll('circle.tube').filter(function(d) { return d.num === num })
    .classed('playing', true)
}

exports.setIdle = function(num) {
  d3.selectAll('circle.tube').filter(function(d) { return d.num === num })
    .classed('playing', false)
}

exports.setAllIdle = function() {
  d3.selectAll('circle.tube')
    .classed('playing', false)
}