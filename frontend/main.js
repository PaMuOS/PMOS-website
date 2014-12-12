var querystring = require('querystring')
  , _ = require('underscore')
  , async = require('async')
  , debug = require('debug') 
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

websocket.events.on('connected', function() {
})

websocket.events.on('connection lost', function() {
})

window.onload = function() {
  $('form#perform').submit(function(event) {
    event.preventDefault()
    eventViews.startPerformance(
      +(new Date(this.elements[0].value)),
      +(new Date(this.elements[1].value))
    )
  })

  async.series([
    _.bind(tubeModels.load, tubeModels)
  ], function(err) {
    if (err) throw err
    tubeViews.render()
  })
}