#!/usr/bin/env node
var path = require('path')
  , _ = require('underscore')
  , debug = require('debug')('passiomusicae.main')
  , async = require('async')
  , mongoose = require('mongoose')
  , express = require('express')
  , bodyParser = require('body-parser')
  , mustacheExpress = require('mustache-express')
  , serveStatic = require('serve-static')
  , clc = require('cli-color')
  , websockets = require('./src/websockets')
  , views = require('./src/views')
  , models = require('./src/models')

var start = exports.start = function(config, done) {
  mongoose.connect(config.db.url)
  var app = express()
    , httpServer = require('http').createServer(app)
    , wsConfig = { server: httpServer }

  // Configure express app
  app.set('port', config.web.port)
  app.use(bodyParser.json())
  app.engine('mustache', mustacheExpress())
  app.set('view engine', 'mustache')
  app.set('views', path.resolve(__dirname, '..', 'frontend', 'templates'))

  // Setup other routes
  app.route(/^\/pages(\/|(\/\w+))?$/).get(function(req, res) {
    res.render('index')
  })
  app.get('/', function(req, res) { res.redirect('/pages/') })

  // Setup static routes
  app.use('/css', serveStatic(path.join(config.web.rootPath, 'css')))
  app.use('/data', serveStatic(path.join(config.web.rootPath, 'data')))
  app.use('/js', serveStatic(path.join(config.web.rootPath, 'js')))
  app.use('/images', serveStatic(path.join(config.web.rootPath, 'images')))

  views.declare(app, config.api)

  // Start everything
  async.parallel([
    models.fetchEventBounds.bind(models),
    websockets.start.bind(websockets, wsConfig),
    httpServer.listen.bind(httpServer, config.web.port)
  ], done)
}

if (require.main === module) {
  var config = require('./config')
  start(config, function(err) {
    if (err) throw err
    console.log(clc.bold('server running') )
  })
}
