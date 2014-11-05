var _ = require('underscore')
  , tubeModels = require('./tube-models')
  , config = require('./config')

exports.setPlaying = function(userId, tubeId) {
  var user = getUser(userId)
  d3.selectAll('circle.tube').filter(function(d) { return d.id === tubeId })
    .classed('idle', false)
    .attr('fill', user.color)
}

exports.setIdle = function(userId, tubeId) {
  d3.selectAll('circle.tube').filter(function(d) { return d.id === tubeId })
    .classed('idle', true)
    .attr('fill', 'none')
}

exports.setAllIdle = function() {
  d3.selectAll('circle.tube')
    .classed('idle', true)
    .attr('fill', 'none') 
}

exports.load = function(done) {
  var tubesSvg = d3.select('svg#tubes')
    , width = tubesSvg.attr('width')
    , height = tubesSvg.attr('height')

  var scale, hScale
    , x1s = [], x2s = []
    , y1s = [], y2s = []
    , xMin, bbW, yMin, bbH

  _.forEach(tubeModels.all, function(tube) {
    x1s.push(tube.x - tube.d / 2)
    x2s.push(tube.x + tube.d / 2)
    y1s.push(tube.y - tube.d / 2)
    y2s.push(tube.y + tube.d / 2)
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
    .attr('r', function(t) { return scale * t.d / 2 })

  done()

}


var currentUsers = []
  , colorCounter = 0
  , colorList = ['red', 'blue', 'green', 'yellow', 'purple', 'pink']

var getUser = function(userId) {
  var user = _.find(currentUsers, function(u) { return u.id === userId })
  if (!user) {
    colorCounter = (colorCounter + 1) % colorList.length
    user = {
      id: userId,
      color: colorList[colorCounter]
    }
    currentUsers.push(user)
  }
  return user
}