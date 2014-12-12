var mongoose = require('mongoose')

var EventSchema = new mongoose.Schema({
  channel: {type: Number, required: true},
  timestamp: {type: Number, required: true},
  x: {type: Number, required: true},
  y: {type: Number, required: true},
  num: {type: Number, required: true},
  frequency: {type: Number, required: true}
})

// Remove useless fields from the JSON
EventSchema.methods.toJSON = function() {
  var obj = this.toObject()
  delete obj.__v
  return obj
}

exports.Event = mongoose.model('Event', EventSchema)