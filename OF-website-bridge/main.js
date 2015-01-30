process.env.DEBUG = 'pmosws*'
var net = require('net')
  , debug = require('debug')
  , debugWS = debug('pmosws.ws')
  , debugOF = debug('pmosws.of')
  , WebSocket = require('ws')
  , moscow = require('moscow')
  , websocket = null
  , server = null

var settings = {
  websocket: {
    url: 'ws://versificator.fm',
    retry: 5000
  },
  of: {
    port: 1212
  }
}

var connectWS = function() {
  websocket = new WebSocket(settings.websocket.url)

  websocket.once('open', function() {
    debugWS('websocket open')
  })

  websocket.once('close', function() {
    debugWS('websocket closed')
    websocket.removeAllListeners()
    websocket = null
    setTimeout(function() { connectWS() }, settings.websocket.retry)
  })

  websocket.on('error', function(err) {
    console.error('ERROR: ', err)
  })

  websocket.on('message', function(echoed) {
    console.log('ECHOED: ', echoed)
  })
}

var connectOF = function() {
  server = moscow.createServer(settings.of.port, 'udp')
  server.start(function(err) {
    if (err) throw err
    debugOF('server started')
  })

  server.on('error', function(err) {
    console.error(err)
  })

  server.on('message', function(address, args) {
    debugOF('message received ' + address + args)
    // HERE : pack to JSON to a msg and we send it just below 

    var jsonOut = {
      channel: parseInt(args[0]),
      timestamp: parseInt(args[1]),
      x: parseFloat(args[2]),
      y: parseFloat(args[3]),
      num: parseInt(args[4]),
      frequency: parseFloat(args[5]),
      diameter: parseInt(args[6])
    }

    var msg = JSON.stringify(jsonOut)
    debugOF('json: ' + msg)
    if (websocket)
      websocket.send(msg, function(err) { if (err) console.error(err) })
  })
}

connectWS()
connectOF()