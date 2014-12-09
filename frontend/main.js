var querystring = require('querystring')
  , _ = require('underscore')
  , async = require('async')
  , tubeViews = require('./src/tube-views')
  , tubeModels = require('./src/tube-models')
  , eventViews = require('./src/event-views')
  , websocket = require('./src/websocket')
  , config = require('./config')

websocket.start(_.pick(config.web, ['port', 'hostname', 'reconnectTime']), function(err) {
  if (err) {
    alert('Couldn\'t connect to the server')
    throw err
  }
})

websocket.events.on('connected', function() {
  console.log('websocket connected')
})

websocket.events.on('connection lost', function() {
  console.log('websocket connection lost')
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
    _.bind(tubeModels.load, tubeModels),
    _.bind(tubeViews.load, tubeViews)
  ], function(err) {
    if (err) throw err
    console.log('loaded successfully')
  })
}