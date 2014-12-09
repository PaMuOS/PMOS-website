var assert = require('assert')
  , _ = require('underscore')
  , mongoose = require('mongoose')
  , async = require('async')
  , request = require('supertest')
  , express = require('express')
  , models = require('../src/models')
  , views = require('../src/views')
  , app = express()
views.declare(app)

describe('views', function() {

  before(function(done) {
    mongoose.connect('mongodb://localhost:27017/pmos-test', done)
  })

  after(function(done) {
    mongoose.disconnect(done)
  })

  beforeEach(function(done) {
    event1 = new models.Event({ timestamp: 1000, channel: 2, x: 0, y: 0, num: 54, frequency: 440 })
    event2 = new models.Event({ timestamp: 2000, channel: 2, x: 0, y: 0, num: 55, frequency: 550 })
    event3 = new models.Event({ timestamp: 3000, channel: 2, x: 0, y: 0, num: 56, frequency: 660 })
    async.series([
      models.Event.remove.bind(models.Event, {}),
      event1.save.bind(event1), 
      event3.save.bind(event3),
      event2.save.bind(event2)
    ], done)
  })

  afterEach(function(done) { models.Event.remove({}, done) })

  it('should return all events if time span not specified', function(done) {
    request(app)
      .get('/replay/')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) throw err
        assert.deepEqual(res.body, [event1.toJSON(), event2.toJSON(), event3.toJSON()])
        done()
      })
  })

  it('should return events within time span specified', function(done) {
    request(app)
      .get('/replay/?fromTime=1000&toTime=2500')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) throw err
        assert.deepEqual(res.body, [event1.toJSON(), event2.toJSON()])
        done()
      })
  })

})
