var _ = require('underscore')
  , bson = require('bson')
  , models = require('./models')


exports.declare = function(app, config) {

  app.get('/replay/', function(req, res) {
    var fromTime = req.query.fromTime ? parseInt(req.query.fromTime, 10) : null
      , toTime = req.query.toTime ? parseInt(req.query.toTime, 10) : null
      , _id = req.query._id || null // This is only for pagination
      , dbQuery = models.Event.find({}).limit(config.pagination).sort([['timestamp','asc'], ['_id','asc']])

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

    // Build the db query
    if (!_id && (fromTime || toTime)) {
      dbQuery = dbQuery.where('timestamp')
      if (fromTime) dbQuery = dbQuery.gte(fromTime)
      if (toTime) dbQuery = dbQuery.lt(toTime)
    }
    if (_id) {
      dbQuery = dbQuery.where('_id')
      dbQuery = dbQuery.gt(_id)
    }

    dbQuery.exec(function(err, events) {
      if (err) throw err
      events = events.map(function(event) { return event.toJSON() })
      res.set('Content-Type', 'application/json')
      res.status(200)
      res.end(JSON.stringify(events))
    })
  })

}