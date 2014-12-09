var _ = require('underscore')
  , models = require('./models')

exports.declare = function(app) {

  app.get('/replay/', function(req, res) {
    var fromTime = req.query.fromTime ? parseInt(req.query.fromTime, 10) : null
      , toTime = req.query.toTime ? parseInt(req.query.toTime, 10) : null
      , dbQuery = models.Event.find({}).limit(30).sort('timestamp')

    if (fromTime || toTime) {
      dbQuery = dbQuery.where('timestamp')
      if (fromTime) dbQuery = dbQuery.gte(fromTime)
      if (toTime) dbQuery = dbQuery.lt(toTime)
    }

    dbQuery.exec(function(err, events) {
      events = events.map(function(event) { return event.toJSON() })
      res.set('Content-Type', 'application/json')
      res.status(200)
      res.end(JSON.stringify(events))
    })
  })

}