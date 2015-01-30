var assert = require('assert')
  , _ = require('underscore')
  , mongoose = require('mongoose')
  , async = require('async')
  , request = require('supertest')
  , express = require('express')
  , models = require('../src/models')
  , views = require('../src/views')
  , fixtures = require('./fixtures')
  , app = express()
  , config = {
    pagination: 100,
    timeline: {
      clusterTime: 2000,
      cacheTime: 0
    }
  }
views.declare(app, config)

describe('views', function() {

  before(function(done) {
    mongoose.connect('mongodb://localhost:27017/pmos-test', done)
  })

  after(function(done) {
    mongoose.disconnect(done)
  })

  var omitId = function(events) {
    return events.map(function(event) { return _.omit(event, ['_id']) })
  }

  beforeEach(function(done) {
    // Restore config
    config.pagination = 100

    async.series([
      models.Event.remove.bind(models.Event, {}),
      models.Event.create.bind(models.Event, fixtures.events)
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
          assert.deepEqual(omitId(res.body), [  
            { timestamp: 1000, channel: 2, x: 0, y: 0, num: 54, frequency: 440, diameter: 10 },
            { timestamp: 1000, channel: 4, x: 0, y: 0, num: 54, frequency: 330, diameter: 10 },
            { timestamp: 1000, channel: 2, x: 0, y: 0, num: 54, frequency: 220, diameter: 10 },
            { timestamp: 2000, channel: 2, x: 0, y: 0, num: 55, frequency: 550, diameter: 10 },
            { timestamp: 3000, channel: 3, x: 0, y: 0, num: 56, frequency: 660, diameter: 10 },
            { timestamp: 4000, channel: 3, x: 0, y: 0, num: 56, frequency: 770, diameter: 10 },
            { timestamp: 5000, channel: 3, x: 0, y: 0, num: 56, frequency: 880, diameter: 10 }
          ])
          done()
        })
    })

    it('should return events within time span specified', function(done) {
      request(app)
        .get('/replay/?fromTime=2000&toTime=4000')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) throw err
          assert.deepEqual(omitId(res.body), [
            { timestamp: 2000, channel: 2, x: 0, y: 0, num: 55, frequency: 550, diameter: 10 },
            { timestamp: 3000, channel: 3, x: 0, y: 0, num: 56, frequency: 660, diameter: 10 },
          ])
          done()
        })
    })

    it('should support pagination', function(done) {
      config.pagination = 2
      var firstUrl = '/replay/?fromTime=1000'
        , lastEvent = null

      var nextPage = function(expected) {
        return function(next) {
          var url
          if (lastEvent)
            url = '/replay/?fromTime=' + lastEvent.timestamp + '&_id=' + lastEvent._id
          else url = firstUrl
          request(app)
            .get(url)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              if (err) throw err
              assert.deepEqual(omitId(res.body), expected)
              lastEvent = _.last(res.body)
              next()
            })
        }
      }

      async.series([
        nextPage([
          { timestamp: 1000, channel: 2, x: 0, y: 0, num: 54, frequency: 440, diameter: 10 },
          { timestamp: 1000, channel: 4, x: 0, y: 0, num: 54, frequency: 330, diameter: 10 }
        ]),
        nextPage([
          { timestamp: 1000, channel: 2, x: 0, y: 0, num: 54, frequency: 220, diameter: 10 },
          { timestamp: 2000, channel: 2, x: 0, y: 0, num: 55, frequency: 550, diameter: 10 }
        ]),
        nextPage([
          { timestamp: 3000, channel: 3, x: 0, y: 0, num: 56, frequency: 660, diameter: 10 },
          { timestamp: 4000, channel: 3, x: 0, y: 0, num: 56, frequency: 770, diameter: 10 }
        ]),
        nextPage([
          { timestamp: 5000, channel: 3, x: 0, y: 0, num: 56, frequency: 880, diameter: 10 }
        ]),
        nextPage([])
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
            .get('/replay/?_id=zxcvb&fromTime=100000')
            .expect('Content-Type', /json/)
            .expect(400)
            .end(function(err, res) {
              if (err) throw err
              next()
            })
        },
        function(next) {
          request(app)
            .get('/replay/?_id=qwerty')
            .expect('Content-Type', /json/)
            .expect(400)
            .end(function(err, res) {
              if (err) throw err
              next()
            })
        },
      ], done)
    })

  })


  describe('bounds', function() {

    it('should return the bounds [<min event timestamp>, <max event timestamp>]', function(done) {
      request(app)
        .get('/bounds/')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) throw err
          assert.deepEqual(res.body, [1000, 5000])
          done()
        })
    })

  })


})
