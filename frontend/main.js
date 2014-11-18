var querystring = require('querystring')
  , _ = require('underscore')
  , async = require('async')
  , tubeViews = require('./src/tube-views')
  , tubeModels = require('./src/tube-models')
  , tubeEventViews = require('./src/tubeEvent-views')
  , config = require('./config')

rhizome.start(function() {
  rhizome.send('/sys/subscribe', ['/tube/on'])
  rhizome.send('/sys/subscribe', ['/tube/off'])
})

rhizome.on('message', function(address, args) {
  if (address === '/tube') {
    tubeEventViews.perform({ userId: args[1], tubeId: args[2], state: args[3] })

  } else if (address === '/sys/subscribed') {
    console.log(address, args[0])

  } else console.log('unknown address')
})

window.onload = function() {
  $('form#perform').submit(function(event) {
    event.preventDefault()
    tubeEventViews.startPerformance(
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