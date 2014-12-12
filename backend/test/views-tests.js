var assert = require('assert')
  , _ = require('underscore')
  , mongoose = require('mongoose')
  , async = require('async')
  , request = require('supertest')
  , express = require('express')
  , models = require('../src/models')
  , views = require('../src/views')
  , app = express()
  , config = { pagination: 100 }
views.declare(app, config)

describe('views', function() {

  before(function(done) {
    mongoose.connect('mongodb://localhost:27017/pmos-test', done)
  })

  after(function(done) {
    mongoose.disconnect(done)
  })

  var toJSON = function(events) {
    return events.map(function(event) { return _.omit(event.toJSON(), ['_id']) })
  }

  var omitId = function(events) {
    return events.map(function(event) { return _.omit(event, ['_id']) })
  }

  beforeEach(function(done) {
    // Restore config
    config.pagination = 100
    event3 = new models.Event({ timestamp: 3000, channel: 2, x: 0, y: 0, num: 56, frequency: 660 })
    event1 = new models.Event({ timestamp: 1000, channel: 2, x: 0, y: 0, num: 54, frequency: 440 })
    event2 = new models.Event({ timestamp: 2000, channel: 2, x: 0, y: 0, num: 55, frequency: 550 })
    event4 = new models.Event({ timestamp: 4000, channel: 3, x: 0, y: 0, num: 56, frequency: 770 })

    async.series([
      models.Event.remove.bind(models.Event, {}),
      event1.save.bind(event1),
      event4.save.bind(event4),
      event3.save.bind(event3),
      event2.save.bind(event2)
    ], done)
  })

  afterEach(function(done) { models.Event.remove({}, done) })

  describe('replay', function() {

    it('should return all events if time span not specified', function(done) {
      request(app)
        .get('/replay/')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) throw err
          assert.deepEqual(omitId(res.body), toJSON([event1, event2, event3, event4]))
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
          assert.deepEqual(omitId(res.body), toJSON([event1, event2]))
          done()
        })
    })

    it('should support pagination', function(done) {
      config.pagination = 2
      async.series([
        function(next) {
          request(app)
            .get('/replay/?_id=' + event1._id)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              if (err) throw err
              assert.deepEqual(omitId(res.body), toJSON([event2, event3]))
              next()
            })
        },
        function(next) {
          request(app)
            .get('/replay/?_id=' + event3._id)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              if (err) throw err
              assert.deepEqual(omitId(res.body), toJSON([event4]))
              next()
            })
        },
        function(next) {
          request(app)
            .get('/replay/?_id=' + event4._id)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              if (err) throw err
              assert.deepEqual(res.body, [])
              next()
            })
        }
      ], done)
    })

    it('should be protected against wrong values in the query', function(done) {
      async.series([
        function(next) {
          request(app)
            .get('/replay/?fromTime=qwerty')
            .expect('Content-Type', /json/)
            .expect(400)
            .end(function(err, res) {
              if (err) throw err
              next()
            })
        },
        function(next) {
          request(app)
            .get('/replay/?toTime=asdfg')
            .expect('Content-Type', /json/)
            .expect(400)
            .end(function(err, res) {
              if (err) throw err
              next()
            })
        },
        function(next) {
          request(app)
            .get('/replay/?_id=zxcvb')
            .expect('Content-Type', /json/)
            .expect(400)
            .end(function(err, res) {
              if (err) throw err
              next()
            })
        }
      ], done)
    })

  })

})
