var mongoose = require('mongoose')

exports.TubeEvent = mongoose.model('TubeEvent', {
  timestamp: Number,
  state: { type: String, enum: ['on', 'off'] },
  userId: Number,
  tubeId: Number
})

exports.MoveEvent = mongoose.model('MoveEvent', {
  timestamp: Number,
  userId: Number,
  x: Number,
  y: Number
})