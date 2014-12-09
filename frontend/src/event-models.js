var _ = require('underscore')
  , querystring = require('querystring')

// Load events between the dates `fromTime` and `toTime` and calls
// `done(err, events)`. Dates must be given as timestamps.
exports.load = function(fromTime, toTime, done) {
  var url = '/replay/?' + querystring.stringify({
    fromTime: fromTime,
    toTime: toTime
  })
  $.getJSON(url, function(events) { done(null, events) })
}