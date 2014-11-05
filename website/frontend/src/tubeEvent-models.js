var _ = require('underscore')
  , querystring = require('querystring')

exports.load = function(fromTime, toTime, done) {
  var url = '/tubeEvents/?' + querystring.stringify({
    fromTime: fromTime,
    toTime: toTime
  })

  $.getJSON(url, function(data) {
    done(null, _.map(data, function(tubeEvent) {
      return tubeEvent
    }))
  })
}