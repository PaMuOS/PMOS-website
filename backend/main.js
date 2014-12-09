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
  , config = require('./config')
  , websockets = require('./src/websockets')
  , views = require('./src/views')
  , models = require('./src/models')
mongoose.connect(config.db.url)

var app = express()
  , httpServer = require('http').createServer(app)
  , wsConfig = { server: httpServer }

// Configure express app
app.set('port', config.web.port)
app.use(bodyParser.json())
app.use('/', serveStatic(config.web.rootPath))
views.declare(app)

// Start everything
async.parallel([
  websockets.start.bind(websockets, wsConfig),
  httpServer.listen.bind(httpServer, config.web.port)
], function(err) {
  if (err) throw err
  console.log(clc.bold('server running') )
})

