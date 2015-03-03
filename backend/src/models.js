var mongoose = require('mongoose')
  , _ = require('underscore')

var EventSchema = new mongoose.Schema({
  channel: {type: Number, required: true},
  timestamp: {type: Number, required: true},
  x: {type: Number, required: true},
  y: {type: Number, required: true},
  num: {type: Number, required: true},
  frequency: {type: Number, required: true},
  diameter: {type: Number, required: true}
})

// Remove useless fields from the JSON
EventSchema.methods.toJSON = function() {
  var obj = this.toObject()
  delete obj.__v
  return obj
}

EventSchema.index({'timestamp': 1, '_id': 1})

exports.Event = mongoose.model('Event', EventSchema)

// Cache the max and min timestamp of events, as the aggregate is quite slow
exports.eventBounds = null

exports.fetchEventBounds = function(done) {
  exports.Event.aggregate(
    { '$group': {
      _id: null, 
      maxTimestamp: { '$max': '$timestamp' },
      minTimestamp: { '$min': '$timestamp' }
    }},
    function(err, results) {
      if (err) done(err)
      else if (!results[0]) done(new Error('it seems db is empty so couldnt find bounds'))
      else {
        exports.eventBounds = [results[0].minTimestamp, results[0].maxTimestamp]
        done()
      }
    }
  )
}
