var assert = require('assert')
  , mongoose = require('mongoose')
  , async = require('async')
  , config = require('../config')
  , models = require('../src/models')

mongoose.connect(config.db.url, function(err) {
  if (err) throw err
  async.series([
    models.Event.count.bind(models.Event),
    models.Event.remove.bind(models.Event, {}),
    models.Event.count.bind(models.Event)
  ], function(err, results) {
    assert.equal(results.pop(), 0)
    console.log('removed ' + results.shift() + ' events from ' + config.db.url)
    process.exit(0)
  })
})