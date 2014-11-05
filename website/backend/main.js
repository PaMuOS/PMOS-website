#!/usr/bin/env node
var path = require('path')
  , _ = require('underscore')
  , debug = require('debug')('passiomusicae.main')
  , async = require('async')
  , mongoose = require('mongoose')
  , express = require('express')
  , bodyParser = require('body-parser')
  , serveStatic = require('serve-static')
  , clc = require('cli-color')
  , websockets = require('rhizome-server').websockets
  , connections = require('rhizome-server').connections
  , osc = require('rhizome-server').osc
  , config = require('./config')
  , views = require('./src/views')
  , models = require('./src/models')
mongoose.connect('mongodb://localhost/' + config.db.name)

var app = express()
  , httpServer = require('http').createServer(app)
  , wsServer = new websockets.WebSocketServer()
  , oscServer = new osc.OSCServer()
  , packageRootPath = path.join(__dirname, '..')
  , distDir = path.join(packageRootPath, 'dist')
  , jsDir = path.join(packageRootPath, 'frontend', 'build')
config.serverInstance = httpServer

// Configure express app
app.set('port', config.webPort)
app.use(bodyParser.json())
app.use('/', serveStatic(distDir))
views.declare(app)

var Listener = {

  send: function(address, args) {

    if (address === '/tube') {
      var tubeEvent = new TubeEvent({
        timestamp: args[0],
        userId: args[1],
        tubeId: args[2],
        state: args[3]
      })
      tubeEvent.save(function (err) {
        if (err) console.error('error saving tube event: ', err)
      })

    } else if (address === '/move') {
      var moveEvent = new MoveEvent({
        timestamp: args[0],
        userId: args[1],
        x: args[2],
        y: args[3]
      })
      tubeEvent.save(function (err) {
        if (err) console.error('error saving move event: ', err)
      })
    }
  }

}
connections.subscribe(Listener, '/tubeEvent')
connections.subscribe(Listener, '/moveEvent')

// Start everything
async.parallel([
  websockets.renderClient.bind(websockets, jsDir),
  wsServer.start.bind(wsServer, config),
  oscServer.start.bind(oscServer, config),
  httpServer.listen.bind(httpServer, config.webPort)
], function(err) {
  if (err) throw err
  console.log(clc.bold('server running') )
})

