var _ = require('underscore')
  , bson = require('bson')
  , models = require('./models')


exports.declare = function(app, config) {

  app.get('/replay/', function(req, res) {
    var fromTime = req.query.fromTime ? parseInt(req.query.fromTime, 10) : null
      , toTime = req.query.toTime ? parseInt(req.query.toTime, 10) : null
      , _id = req.query._id || null // This is only for pagination
      , findOpts = { sort: {'timestamp': 1, '_id': 1}, limit: config.pagination }
      , findQuery = {}

    // Check of the query is valid to avoid crashes, and return 400 if it isn't
    var unvalidReq = function(queryAttr) {
      var errs = {}
      errs[queryAttr] = 'invalid : ' + req.query[queryAttr]
      res.set('Content-Type', 'application/json')
      res.status(400)
      res.end(JSON.stringify(errs))
    }
    if (fromTime !== null && _.isNaN(fromTime)) return unvalidReq('fromTime')
    if (toTime !== null && _.isNaN(toTime)) return unvalidReq('toTime')
    if (_id && !bson.ObjectID.isValid(_id)) return unvalidReq('_id')
    if (_id && fromTime === null) return unvalidReq('_id')

    // Prepare the find. It `_id` is present, this is a paginated request.
    if (_id) {
      findOpts['min'] = {'timestamp': fromTime, '_id': bson.ObjectID.createFromHexString(_id)}
      findOpts['skip'] = 1
    } else if (fromTime || toTime) {
      findQuery['timestamp'] = {}
      if (fromTime) findQuery['timestamp']['$gte'] = fromTime
      if (toTime) findQuery['timestamp']['$lt'] = toTime
    }

    models.Event.find(findQuery, null, findOpts, function(err, events) {
      if (err) throw err
      events = events.map(function(event) { return event.toJSON() })
      res.set('Content-Type', 'application/json')
      res.status(200)
      res.end(JSON.stringify(events))
    })
  })

  app.get('/bounds/', function(req, res) {

    models.Event.aggregate(
      { '$group': {
        _id: null, 
        maxTimestamp: { '$max': '$timestamp' },
        minTimestamp: { '$min': '$timestamp' }
      }},
      function(err, results) {
        if (err) throw err
        res.set('Content-Type', 'application/json')
        res.status(200)
        if (!results[0]) throw new Error('it seems db is empty so couldnt find bounds')
        res.end(JSON.stringify([results[0].minTimestamp, results[0].maxTimestamp]))
      }
    )
  })

}