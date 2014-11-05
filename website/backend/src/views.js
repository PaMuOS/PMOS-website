var _ = require('underscore')
  , models = require('./models')

exports.declare = function(app) {

  app.get('/tubeEvents/', function(req, res) {
    var fromTime = req.query.fromTime ? parseInt(req.query.fromTime, 10) : null
      , toTime = req.query.toTime ? parseInt(req.query.toTime, 10) : null
      , dbQuery = models.TubeEvent.find({}).limit(30).sort('timestamp')

    if (fromTime || toTime) {
      dbQuery = dbQuery.where('timestamp')
      if (fromTime) dbQuery = dbQuery.gt(fromTime)
      if (toTime) dbQuery = dbQuery.lt(toTime)
    }

    dbQuery.exec(function(err, tubeEvents) {
      tubeEvents = tubeEvents.map(function(t) { return _.pick(t, ['state', 'tubeId', 'userId', 'timestamp']) })
      res.set('Content-Type', 'application/json')
      res.status(200)
      res.end(JSON.stringify(tubeEvents))
    })
  })

}