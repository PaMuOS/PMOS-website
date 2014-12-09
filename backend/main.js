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
  . websockets = require('./websockets')
  , views = require('./src/views')
  , models = require('./src/models')

mongoose.connect(config.db.url)

var app = express()
  , httpServer = require('http').createServer(app)
  , packageRootPath = path.join(__dirname, '..')
  , distDir = path.join(packageRootPath, 'dist')
  , jsDir = path.join(packageRootPath, 'frontend', 'build')

// Configure express app
app.set('port', config.web.port)
app.use(bodyParser.json())
app.use('/', serveStatic(distDir))
views.declare(app)

// Start everything
async.parallel([
  websockets.start.bind(websockets),
  httpServer.listen.bind(httpServer, config.web.port)
], function(err) {
  if (err) throw err
  connectionManager.subscribe(loggingConnection, '/')
  console.log(clc.bold('server running') )
})

