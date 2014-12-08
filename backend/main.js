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
  , config = require('./config')
  , views = require('./src/views')
  , models = require('./src/models')

mongoose.connect(config.db.url)

var app = express()
  , httpServer = require('http').createServer(app)
  , wsServer = new websockets.Server({ serverInstance: httpServer })
  , connectionManager = new connections.ConnectionManager({})
  , packageRootPath = path.join(__dirname, '..')
  , distDir = path.join(packageRootPath, 'dist')
  , jsDir = path.join(packageRootPath, 'frontend', 'build')
connections.manager = connectionManager

// Configure express app
app.set('port', config.web.port)
app.use(bodyParser.json())
app.use('/', serveStatic(distDir))
views.declare(app)

// Helpers to create dummy server-side connections
var LoggingConnection = function(callback) {
  //coreServer.Connection.apply(this)
}
connections.registerConnectionClass('logging', LoggingConnection)

LoggingConnection.prototype.send = function(address, args) {
  if (address === '/message') {
    var tubeEvent = new TubeEvent({
      timestamp: args[0],
      userId: args[1],
      tubeId: args[2],
      state: args[3]
    })
    tubeEvent.save(function (err) {
      if (err) console.error('error saving tube event: ', err)
    })
  }
}

var loggingConnection = new LoggingConnection()


// Start everything
async.parallel([
  websockets.renderClientBrowser.bind(websockets, jsDir),
  connectionManager.start.bind(connectionManager),
  connectionManager.open.bind(connectionManager, loggingConnection),
  wsServer.start.bind(wsServer),
  httpServer.listen.bind(httpServer, config.web.port)
], function(err) {
  if (err) throw err
  connectionManager.subscribe(loggingConnection, '/')
  console.log(clc.bold('server running') )
})

