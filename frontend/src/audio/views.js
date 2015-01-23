var EventEmitter = require('events').EventEmitter
  , debug = require('debug')('audio.views')


exports.render = function() {
  var volumeChanging = false
    , volumeSvg = d3.select('svg#volume')
    , volumeRects = d3.selectAll('svg#volume rect')
    , volumeWidth = parseInt(volumeSvg.attr('width'), 10)
    , volumeHeight = parseInt(volumeSvg.attr('height'), 10)
    , rectPadding = 3
    , rectHeight = volumeHeight / volumeRects.size() - rectPadding

  volumeRects.each(function(rect, i) {
    rect = d3.select(this)
    rect.attr('width', volumeWidth)
    rect.attr('height', rectHeight)
    rect.attr('y', i * (rectHeight + rectPadding))
  })

  exports.setVolume = function(ratio) {
    var numRects = ratio * volumeRects.size()
    if (numRects)
      d3.selectAll(volumeRects[0].slice(-numRects)).classed('active', true)
    d3.selectAll(volumeRects[0].slice(0, -numRects)).classed('active', false)
  }

  d3.selectAll('svg#volume')
    .on('mousedown', function() {
      var ratio = (volumeHeight - d3.event.offsetY) / volumeHeight
      volumeChanging = true
      exports.setVolume(ratio)
      exports.events.emit('volume', ratio)
    })
    .on('mousemove', function(event) {
      if (volumeChanging) { 
        var ratio = (volumeHeight - d3.event.offsetY) / volumeHeight
        exports.setVolume(ratio)
        exports.events.emit('volume', ratio)
      }
    })

  d3.select('body')
    .on('mouseup', function() {
      volumeChanging = false
    })
    .on('mousemove', function() {
      if (volumeChanging) d3.event.stopImmediatePropagation()
    })

  debug('volume control rendered')
}

exports.setVolume = null // Initialized in 'render'

exports.events = new EventEmitter