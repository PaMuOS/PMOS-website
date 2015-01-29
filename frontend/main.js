// Feature detection
var waaSupported = true
if (!window.AudioContext) waaSupported = false

var querystring = require('querystring')
  , _ = require('underscore')
  , async = require('async')
  , debug = require('debug')
  , page = require('page') 
  , tubeViews = require('./src/tubes/views')
  , tubeModels = require('./src/tubes/models')
  , audioEngine = require('./src/audio/engine')
  , audioViews = require('./src/audio/views')
  , eventViews = require('./src/events/views')
  , websocket = require('./src/websocket')
  , config = require('./config')
debug.enable('*')
audioEngine.waaSupported = waaSupported

// Starting websocket stuff
websocket.start(_.pick(config.web, ['port', 'hostname', 'reconnectTime']), function(err) {
  if (err) {
    alert('Couldn\'t connect to the server')
    throw err
  }
})

websocket.events.on('connected', function() {})
websocket.events.on('connection lost', function() {})

// Initialize the rest of the app
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
    console.log(event)
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
      audioEngine.stop()
    })
  })

  page('/live', function() {
    websocket.events.removeAllListeners('message')
    $('nav a').removeClass('active')
    $('nav a[href="./live"]').addClass('active')

    fadeAllPages(function() {
      $('#tubesContainer').fadeIn()
      $('.live').fadeIn()
      audioEngine.start()
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
      audioEngine.start()
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
      audioEngine.start()
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
      audioEngine.stop()
    })
  })

  page('*', function() {
    fadeAllPages(function() {
      $('#notFound').fadeIn()
    })
  })

  // Loading
  async.series([
    _.bind(tubeModels.load, tubeModels),
    _.bind(audioEngine.load, audioEngine),
  ], function(err) {
    if (err) throw err

    // Render views
    tubeViews.render()
    audioViews.render()
    eventViews.render()

    // Tie up models <-> views
    audioViews.events.on('volume', audioEngine.setVolume)
    audioEngine.events.on('volume', audioViews.setVolume)
    tubeViews.events.on('play', function(channel, frequency, diameter) {
      audioEngine.setFrequency(channel || 0, frequency)
      audioEngine.setDiameter(channel || 0, diameter)
    })

    // Final things
    if (!waaSupported) $('#noAudio').show()
    page.start()
    $('body').fadeIn()
  })

})