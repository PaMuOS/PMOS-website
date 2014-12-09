var EventEmitter = require('events')
  , WebSocket = require('ws')

var socketEmitter = new EventEmitter()
  , socket
  , savedConfig

// Events :
// 'connected' : emitted when socket connection got opened or re-opened
// 'connection lost' : emitted when connection lost
exports.events = new EventEmitter()

// Starts the websocket client and calls `done(err)`
exports.start = function(config, done) {
  if (savedConfig) return done(new Error('start already called!'))
  savedConfig = config
  connect(done)

  // Automatic reconnection when socket got closed
  socketEmitter.on('close', function() {
    exports.events.emit('connection lost')
    reconnect()
  })
}

// Connects to the server and calls `done(err)`
var connect = function(done) {
  socket = new WebSocket('ws://' + savedConfig.hostname + ':' + savedConfig.port)
  socket.onopen = function() { socketEmitter.emit('open') }
  socket.onmessage = function(msg, flags) { socketEmitter.emit('message', JSON.parse(msg)) }
  socket.onclose = function() { socketEmitter.emit('close') }
  socket.onerror = function(err) { socketEmitter.emit('error', err) }

  var _onceOpen = function() {
    socketEmitter.removeListener('error', _onceError)
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