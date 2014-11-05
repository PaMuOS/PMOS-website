var querystring = require('querystring')
  , _ = require('underscore')
  , async = require('async')
  , tubeViews = require('./src/tube-views')
  , tubeModels = require('./src/tube-models')
  , perform = require('./src/perform')
  , config = require('./src/config')

rhizome.start(function() {
  rhizome.send('/sys/subscribe', ['/tube/on'])
  rhizome.send('/sys/subscribe', ['/tube/off'])
})

rhizome.on('message', function(address, args) {
  if (address === '/tube') {
    var userId = args[1]
      , tubeState = args[2]
      , tubeId = args[3]
    if (tubeState === 'on') tubeViews.setPlaying(userId, tubeId)
    else if (tubeState === 'off') tubeViews.setIdle(userId, tubeId)
    else throw new Error('invalid tube state ' + tubeState)

  } else if (address === '/sys/subscribed') {
    console.log(address, args[0])
  } else console.log('unknown address')
})

window.onload = function() {
  $('form#perform').submit(function(event) {
    event.preventDefault()
    perform.betweenDates(new Date(this.elements[0].value), new Date(this.elements[1].value))
  })

  async.series([
    _.bind(tubeModels.load, tubeModels),
    _.bind(tubeViews.load, tubeViews)
  ], function(err) {
    if (err) throw err
    console.log('loaded successfully')
  })
}