var assert = require('assert')
  , _ = require('underscore')
  , mongoose = require('mongoose')
  , async = require('async')
  , models = require('../src/models')
  , views = require('../src/views')
  , fixtures = require('./fixtures')

describe('models', function() {

  before(function(done) {
    mongoose.connect('mongodb://localhost:27017/pmos-test', done)
  })

  after(function(done) {
    mongoose.disconnect(done)
  })

  beforeEach(function(done) {
    async.series([
      models.Event.remove.bind(models.Event, {}),
      models.Event.create.bind(models.Event, fixtures.events)
    ], done)
  })

  afterEach(function(done) { models.Event.remove({}, done) })

  describe('timeline', function() {

    it('should create a timeline from the event in database', function(done) {
      models.Event.timeline({ clusterTime: 2000 }, function(err, timeline) {
        if (err) throw err
        assert.deepEqual(timeline, [
          {timestamp: 2000, count: 3},
          {timestamp: 4500, count: 1}
        ])
        done()
      })
    })

  })

})
