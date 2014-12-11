var EventEmitter = require('events').EventEmitter
  , WebSocket = require('ws')
  , debug = require('debug')('websocket')

var socketEmitter = new EventEmitter()
  , socket
  , savedConfig

// Events :
// 'connected' : emitted when socket connection got opened or re-opened
// 'connection lost' : emitted when connection lost
// 'message' : emitted when message received
exports.events = new EventEmitter()

// Starts the websocket client and calls `done(err)`
exports.start = function(config, done) {
  if (savedConfig) return done(new Error('start already called!'))
  savedConfig = config
  connect(done)

  // Automatic reconnection when socket got closed
  socketEmitter.on('close', function() {
    debug('connection lost')
    exports.events.emit('connection lost')
    reconnect()
  })

  // Parse and emit messages
  socketEmitter.on('message', function(e) {
    exports.events.emit('message', JSON.parse(e.data))
  })
}

// Connects to the server and calls `done(err)`
var connect = function(done) {
  debug('connecting ...')
  socket = new WebSocket('ws://' + savedConfig.hostname + ':' + savedConfig.port)
  socket.onopen = function() { socketEmitter.emit('open') }
  socket.onmessage = function(msg, flags) { socketEmitter.emit('message', msg) }
  socket.onclose = function() { socketEmitter.emit('close') }
  socket.onerror = function(err) { socketEmitter.emit('error', err) }

  var _onceOpen = function() {
    socketEmitter.removeListener('error', _onceError)
    debug('connected')
    done()
    exports.events.emit('connected')
  }

  var _onceError = function(err) {
    socketEmitter.removeListener('open', _onceOpen)
    done(err)
  }

  socketEmitter.once('open', _onceOpen)
  socketEmitter.once('error', _onceError)
}

// Starts a loop of reconnection, running forever until success
var reconnect = function() {
  setTimeout(function() {
    connect(function(err) { if (err) reconnect() })
  }, savedConfig.reconnectTime)
}