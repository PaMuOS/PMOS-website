var assert = require('assert')
  , mongoose = require('mongoose')
  , async = require('async')
  , config = require('../config')
  , models = require('../src/models')

mongoose.connect(config.db.url, function(err) {
  if (err) throw err
  async.series([
    models.Event.count.bind(models.Event),
    models.Event.remove.bind(models.Event, {timestamp: {'$lt': 1421881200000}}),
    models.Event.count.bind(models.Event)
  ], function(err, results) {
    var countBefore = results.shift()
      , countAfter = results.pop()
    console.log('' + countAfter + ' events left in ' + config.db.url)
    console.log('removed ' + (countBefore - countAfter) + ' events from ' + config.db.url)
    process.exit(0)
  })
})