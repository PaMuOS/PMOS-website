var _ = require('underscore')
  , config = require('../config')

exports.load = function(done) {
  $.get('/data/tubes.xml', function(data) {
    exports.all = $(data).find('tube').map(function(i, tube) {
      tube = $(tube)
      var id = parseInt(tube.find('num').text())
        , x = parseFloat(tube.find('x').text())
        , y = parseFloat(tube.find('y').text())
        , diameter = parseFloat(tube.find('diameter').text()) * config.tubes.diameterScale
      return { id: id, diameter: diameter, x: x, y: y }
    })

    done(null, exports.all)
  })
}

exports.all = []