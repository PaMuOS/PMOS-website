var _ = require('underscore')
  , config = require('../config')
  , csv = require('csv')

exports.load = function(done) {
  $.get('/data/tubes.csv', function(data) {
    csv.parse(data, function(err, data){
      if (err) return done(err)
      exports.all = data.map(function(row, i) {
        var x = parseFloat(row[4])
          , y = parseFloat(row[5])
          , d = parseFloat(row[3]) * config.dScale
        return { id: i, d: d, x: x, y: y }
      })
      done(null, exports.all)
    })
  })
}

exports.all = []