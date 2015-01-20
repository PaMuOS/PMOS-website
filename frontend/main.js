var querystring = require('querystring')
  , _ = require('underscore')
  , async = require('async')
  , debug = require('debug')
  , page = require('page') 
  , tubeViews = require('./src/tubes/views')
  , tubeModels = require('./src/tubes/models')
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

  // Routing
  page.base('/pages')

  page.redirect('/', '/about')
  page('/about', function() {
    $('nav a').removeClass('active')
    $('nav a[href="./about"]').addClass('active')
    async.parallel([
      function(next) { $('#tubesContainer').fadeOut(next) },
      function(next) { fadeAllPages(next) }
    ], function() {
      $('.about').fadeIn()
    })
  })

  page('/live', function() {
    $('nav a').removeClass('active')
    $('nav a[href="./live"]').addClass('active')
    fadeAllPages(function() {
      $('#tubesContainer').fadeIn()
      $('.live').fadeIn()
    })
  })

  page('/archive', function() {
    $('nav a').removeClass('active')
    $('nav a[href="./archive"]').addClass('active')
    fadeAllPages(function() {
      $('#tubesContainer').fadeIn()
      $('.archive').fadeIn()
    })
  })

  page('/demo', function() {
    $('nav a').removeClass('active')
    $('nav a[href="./demo"]').addClass('active')

    fadeAllPages(function() {
      $('#tubesContainer').fadeIn()
      $('.demo').fadeIn()
    })
  })

  page('/video', function() {
    $('nav a').removeClass('active')
    $('nav a[href="./video"]').addClass('active')
    async.parallel([
      function(next) { $('#tubesContainer').fadeOut(next) },
      function(next) { fadeAllPages(next) }
    ], function() {
      $('.video').fadeIn()
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
    _.bind(tubeModels.load, tubeModels)
  ], function(err) {
    if (err) throw err
    tubeViews.render()
  })

})