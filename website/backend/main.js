#!/usr/bin/env node
var path = require('path')
  , _ = require('underscore')
  , debug = require('debug')('passiomusicae.main')
  , async = require('async')
  , express = require('express')
  , bodyParser = require('body-parser')
  , serveStatic = require('serve-static')
  , clc = require('cli-color')
  , websockets = require('rhizome-server').websockets
  , connections = require('rhizome-server').connections
  , osc = require('rhizome-server').osc
  , config = require('./config')

var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/' + config.db.name)

var TubeEvent = mongoose.model('TubeEvent', {
  type: { type: String, enum: ['on', 'off'] },
  userId: Number,
  tubeId: Number,
  date: { type: Date, default: Date.now }
})

var Listener = {

  send: function(address, args) {
    if (_.contains(['/tube/on', '/tube/off'], address))
    var addressParts = address.split('/')
      , eventType = addressParts[2]
      , tubeEvent = new TubeEvent({ type: eventType, tubeId: args[0] })
    tubeEvent.save(function (err) {
      if (err) console.error('error saving tube event: ', err)
    })
  }

}

connections.subscribe(Listener, '/tube/on')
connections.subscribe(Listener, '/tube/off')

var app = express()
  , httpServer = require('http').createServer(app)
  , wsServer = new websockets.WebSocketServer()
  , oscServer = new osc.OSCServer()
  , packageRootPath = path.join(__dirname, '..')
  , distDir = path.join(packageRootPath, 'dist')
  , jsDir = path.join(packageRootPath, 'frontend', 'build')

var config = {
  webPort: 8000,
  oscPort: 9000,
  usersLimit: 1000,
  serverInstance: httpServer
}

// Configure express app
app.set('port', config.webPort)
app.use(bodyParser.json())
app.use('/', serveStatic(distDir))

app.get('/tubes/', function(req, res) {
  var fromDate = req.query.fromDate ? new Date(req.query.fromDate) : null
    , toDate = req.query.toDate ? new Date(req.query.toDate) : null
    , dbQuery = TubeEvent.find({}).limit(30).sort('date')

  if (fromDate || toDate) {
    dbQuery = dbQuery.where('date')
    if (fromDate) dbQuery = dbQuery.gt(fromDate)
    if (toDate) dbQuery = dbQuery.lt(toDate)
  }

  dbQuery.exec(function(err, tubeEvents) {
    tubeEvents = tubeEvents.map(function(t) { return _.pick(t, ['type', 'tubeId', 'userId', 'date']) })
    res.set('Content-Type', 'application/json')
    res.status(200)
    res.end(JSON.stringify(tubeEvents))
  })
})

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

