// Little to test script to send and save an event through websockets,
// the way the installation would do

var WebSocket = require('ws')
  , config = require('../config')
  , socket = new WebSocket('ws://' + config.web.hostname + ':' + config.web.port)

socket.on('open', function() {
  socket.send(JSON.stringify({
    channel: 2,
    timestamp: 1234,
    x: 0.1223,
    y: 0.7,
    num: 54,
    frequency: 440,
    diameter: 50
  }))
  console.log('message sent')
})

socket.on('error', function(err) { console.error('Socket error! ' + err) })