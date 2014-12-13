var assert = require('assert')
  , async = require('async')
  , _ = require('underscore')
  , WebSocket = require('ws')
  , websocket = require('../../src/websocket')
  , wsServer = require('../../../backend/src/websockets')
  , fixtures = require('../fixtures')
  , serverConfig = { port: 8000 } 

describe('websocket', function() {

  before(function(done) {
    async.series([
      wsServer.start.bind(wsServer, serverConfig),
      function(next) {
        websocket.start({ hostname: 'localhost', port: 8000, reconnectTime: 10 }, function(err) {
          if (err) throw err
          websocket.events.once('connected', function() { next() })
        })
      }
    ], done)
  })

  describe('reconnect', function() {

    it('should reconnect automatically when connection is lost', function(done) {
      async.series([
        wsServer.stop.bind(wsServer),
        function(next) {
          wsServer.stop(function() {})
          websocket.events.once('connection lost', function() { next() })
        },
        function(next) {
          websocket.events.once('connected', next)
          wsServer.start(serverConfig, function(err) { if (err) throw err })
        }
      ], done)
    })

  })

  describe('message', function() {

    it('should emit messages received', function(done) {
      // Open another client to send messages
      var installWs = new WebSocket('ws://localhost:8000')
      async.series([
        installWs.once.bind(installWs, 'open'),
        function(next) {
          installWs.send(JSON.stringify(fixtures.events[0]))
          websocket.events.on('message', function(msg) {
            assert.deepEqual(_.omit(msg, ['_id']), fixtures.events[0])
            next()
          })
        }
      ], done)
    })

  })

})