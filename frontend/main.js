var querystring = require('querystring')
  , _ = require('underscore')
  , async = require('async')
  , debug = require('debug')
  , page = require('page') 
  , tubeViews = require('./src/tubes/views')
  , tubeModels = require('./src/tubes/models')
  , tubeAudio = require('./src/tubes/audio')
  , eventViews = require('./src/events/views')
  , websocket = require('./src/websocket')
  , config = require('./config')
debug.enable('*')

websocket.start(_.pick(config.web, ['port', 'hostname', 'reconnectTime']), function(err) {
  if (err) {
    alert('Couldn\'t connect to the server')
    throw err
  }
})

websocket.events.on('connected', function() {})
websocket.events.on('connection lost', function() {})

$(function() {

  var fadeAllPages = function(done) {
    var faded = 0
      , pageCount = $('.page').length
    $('.page').fadeOut(function() {
      faded++
      if (faded === pageCount) done()
    })
  }

  var peformLiveEvents = function(event) {
    tubeViews.perform([event])
  }

  // Routing
  page.base('/pages')

  page.redirect('/', '/about')
  page('/about', function() {
    websocket.events.removeAllListeners('message')
    $('nav a').removeClass('active')
    $('nav a[href="./about"]').addClass('active')

    async.parallel([
      function(next) { $('#tubesContainer').fadeOut(next) },
      function(next) { fadeAllPages(next) }
    ], function() {
      $('.about').fadeIn()
      tubeAudio.stop()
    })
  })

  page('/live', function() {
    websocket.events.removeAllListeners('message')
    $('nav a').removeClass('active')
    $('nav a[href="./live"]').addClass('active')

    fadeAllPages(function() {
      $('#tubesContainer').fadeIn()
      $('.live').fadeIn()
      tubeAudio.start()
      tubeViews.setPlayable(false)
      websocket.events.on('message', peformLiveEvents)
    })
  })

  page('/archive', function() {
    websocket.events.removeAllListeners('message')
    $('nav a').removeClass('active')
    $('nav a[href="./archive"]').addClass('active')

    fadeAllPages(function() {
      $('#tubesContainer').fadeIn()
      $('.archive').fadeIn()
      tubeAudio.start()
      tubeViews.setPlayable(false)
    })
  })

  page('/demo', function() {
    websocket.events.removeAllListeners('message')
    $('nav a').removeClass('active')
    $('nav a[href="./demo"]').addClass('active')

    fadeAllPages(function() {
      $('#tubesContainer').fadeIn()
      $('.demo').fadeIn()
      tubeAudio.start()
      tubeViews.setPlayable(true)
    })
  })

  page('/video', function() {
    websocket.events.removeAllListeners('message')
    $('nav a').removeClass('active')
    $('nav a[href="./video"]').addClass('active')
    async.parallel([
      function(next) { $('#tubesContainer').fadeOut(next) },
      function(next) { fadeAllPages(next) }
    ], function() {
      $('.video').fadeIn()
      tubeAudio.stop()
    })
  })

  page('*', function() {
    fadeAllPages(function() {
      $('#notFound').fadeIn()
    })
  })

  page.start()

  // Loading
  async.series([
    _.bind(tubeModels.load, tubeModels),
    _.bind(tubeAudio.load, tubeAudio),
  ], function(err) {
    if (err) throw err
    tubeViews.render()
  })

})