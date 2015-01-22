var _ = require('underscore')
  , urljoin = require('url-join')
  , debug = require('debug')('tubes.models')
  , config = require('../../config')

// Load the all the tubes from the XML file in config.
// Tubes are loaded to `models.all`
exports.load = function(done) {
  $.get(urljoin(config.web.dataRoot, 'tubes.xml'), function(data) {
    exports.all = $(data).find('tube').map(function(i, tube) {
      tube = $(tube)
      var num = parseInt(tube.find('num').text())
        , x = parseFloat(tube.find('x').text())
        , y = parseFloat(tube.find('y').text())
        , diameter = parseFloat(tube.find('diameter').text())
        , frequency = parseFloat(tube.find('frequency').text())
      return { num: num, diameter: diameter, frequency: frequency, x: x, y: y }
    })
    debug('loaded')

    done(null, exports.all)
  })
}

exports.all = []