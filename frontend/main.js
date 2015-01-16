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

  // Events
  $('form#perform').submit(function(event) {
    event.preventDefault()
    eventViews.startPerformance(
      +(new Date(this.elements[0].value)),
      +(new Date(this.elements[1].value))
    )
  })

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
    fadeAllPages(function() {
      $('#about').fadeIn()
    })
  })

  page('/live', function() {
    $('nav a').removeClass('active')
    $('nav a[href="./live"]').addClass('active')
    fadeAllPages(function() {
      $('#comingSoon').fadeIn()
    })
  })

  page('/archive', function() {
    $('nav a').removeClass('active')
    $('nav a[href="./archive"]').addClass('active')

    fadeAllPages(function() {
      $('#comingSoon').fadeIn()
    })
  })

  page('/demo', function() {
    $('nav a').removeClass('active')
    $('nav a[href="./demo"]').addClass('active')

    fadeAllPages(function() {
      $('#comingSoon').fadeIn()
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