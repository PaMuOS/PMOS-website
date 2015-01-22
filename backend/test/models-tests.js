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
})
