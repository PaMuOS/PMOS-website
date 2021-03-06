var assert = require('assert')
  , _ = require('underscore')
  , mongoose = require('mongoose')
  , ws = require('ws')
  , async = require('async')
  , websockets = require('../src/websockets')
  , models = require('../src/models')

describe('websockets', function() {

  before(function(done) {
    async.series([
      websockets.start.bind(websockets, { port: 8000 }),
      mongoose.connect.bind(mongoose, 'mongodb://localhost:27017/pmos-test')
    ], done)
  })

  after(function(done) {
    mongoose.disconnect(done)
  })

  beforeEach(function(done) {
    models.Event.remove({}, done)
  })

  it('should log valid messages from installation', function(done) {
    var wsClient = new ws('ws://localhost:8000')
      , originalEvent = {
        channel: 2,
        timestamp: 1234,
        x: 0.1223,
        y: 0.7,
        num: 54,
        frequency: 440,
        diameter: 10
      }

    async.series([
      wsClient.once.bind(wsClient, 'open'),
      function(next) {
        wsClient.send(JSON.stringify(originalEvent))
        setTimeout(next, 1500)
      },
      models.Event.find.bind(models.Event, {})
    ], function(err, results) {
      if (err) throw err
      var events = results.pop()
        , eventSaved
      assert.equal(events.length, 1)
      eventSaved = _.omit(events[0].toJSON(), ['__v', '_id'])
      assert.deepEqual(eventSaved, originalEvent)
      done()
    })

  })

  it('should immediately proxy to other sockets', function(done) {
    var wsClient1 = new ws('ws://localhost:8000')
      , wsClient2 = new ws('ws://localhost:8000')
      , wsClient3 = new ws('ws://localhost:8000')
      , originalEvent = {
        channel: 2,
        timestamp: 1234,
        x: 0.1223,
        y: 0.7,
        num: 54,
        frequency: 440,
        diameter: 34
      }

    async.series([

      async.parallel.bind(async, [
        wsClient1.once.bind(wsClient1, 'open'),
        wsClient2.once.bind(wsClient2, 'open'),
        wsClient3.once.bind(wsClient3, 'open')
      ]),

      function(next) {
        async.parallel([
          function(nextSocket) {
            wsClient2.once('message', function(msg) {
              var event = _.omit(JSON.parse(msg), ['_id'])
              assert.deepEqual(event, originalEvent)
              nextSocket()
            })
          },
          function(nextSocket) {
            wsClient3.once('message', function(msg) {
              var event = _.omit(JSON.parse(msg), ['_id'])
              assert.deepEqual(event, originalEvent)
              nextSocket()
            })
          }
        ], next)
        wsClient1.send(JSON.stringify(originalEvent))
      }

    ], done)

  })

  it('should print an error message if message invalid', function(done) {
    var wsClient = new ws('ws://localhost:8000')

    async.series([
      wsClient.once.bind(wsClient, 'open'),
      function(next) {
        console.log('\nThe following test should print a Validation Error:')
        wsClient.send(JSON.stringify({ unknownAttr: 2 }))
        setTimeout(next, 1500)
      },
      models.Event.find.bind(models.Event, {})
    ], function(err, results) {
      if (err) throw err
      var events = results.pop()
      assert.equal(events.length, 0)
      done()
    })
  })

})
