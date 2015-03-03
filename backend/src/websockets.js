var async = require('async')
  , debug = require('debug')('pmos.websockets')
  , ws = require('ws')
  , models = require('./models')
  , wsServer

exports.start = function(config, done) {
  wsServer = new ws.Server(config)
  wsServer.on('connection', _onConnection)
  wsServer.on('error', function(err) { console.error('WebSocket server error : ' + err) })
  wsServer.once('listening', function() { done() })
}

exports.stop = function(done) {
  wsServer.close()
  done()
}

var _onConnection = function(socket) {
  debug('connected ' + wsServer.clients.length)

  socket.on('message', function(msg) {
    // Save the event to the database
    var event = new models.Event(JSON.parse(msg))
    event.save(function (err) {
      if (err) return console.error('error saving event: ', err)
    })

    // Update the event bounds
    if (models.eventBounds !== null && models.eventBounds[1] < event.timestamp)
      models.eventBounds[1] = event.timestamp

    // Send the event to all the sockets currently connected.
    msg = JSON.stringify(event.toJSON())
    wsServer.clients
      .filter(function(s) { return s !== socket })
      .forEach(function(s) {
        s.send(msg, function(err) { if (err) console.error('send error', err) })
      })  
  })

  socket.on('close', function() {
    debug('closed ' + wsServer.clients.length)
    socket.removeAllListeners()
  })

  socket.on('error', function() {
    console.error('error', 'Socket error')
  })

}
