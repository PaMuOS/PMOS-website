var querystring = require('querystring')
  , _ = require('underscore')
  , urljoin = require('url-join')
  , debug = require('debug')('events.models')
  , config = require('../../config')

// Load events between the dates `fromTime` and `toTime` and calls
// `done(err, events)`. Dates must be given as timestamps.
exports.load = function(fromTime, toTime, done) {
  var url = urljoin(config.web.apiRoot, 'replay?') + querystring.stringify({
    fromTime: fromTime,
    toTime: toTime
  })
  $.getJSON(url, function(events) {
    if (events.length) lastEvent = _.last(events)
    done(null, events)
  })
}

// Load next batch of events. This requires `load` to be called first in order
// to initialize the pagination.
exports.next = function(done) {
  if (!lastEvent) {
    debug('warning : `next` called while there is no previous events')
    return done(null, [])
  }

  var url = urljoin(config.web.apiRoot, 'replay?') + querystring.stringify({
    _id: lastEvent._id,
    fromTime: lastEvent.timestamp
  })

  $.getJSON(url, function(events) {
    if (events.length) lastEvent = _.last(events)
    done(null, events)
  })
}

// Remember the last event received for pagination
var lastEvent = null