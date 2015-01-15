var mongoose = require('mongoose')
  , _ = require('underscore')

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

// Creates a timeline from all the events saved in the database.
// This is created by clustering events and returning a list of points :
// `[{timestamp: <cluster timestamp>, count: <how many channels were active>}]`.
// Options are : `clusterTime`, which is the size of a cluster in milliseconds
EventSchema.statics.timeline = function(opts, done) {
  var stream = this.find().sort('timestamp').stream()
    , clusterTime = opts.clusterTime
    , timeline = []
    , clusterStart = -Infinity

  stream.on('data', function (event) {
    // If that event is a new cluster, create it
    if (event.timestamp > clusterStart + clusterTime) {
      clusterStart = event.timestamp
      timeline.push([event])

    // Else add the channel of that event to the last cluster
    } else _.last(timeline).push(event)

  }).on('close', function() {
    timeline = _.map(timeline, function(cluster) {
      return {
        timestamp: cluster[0].timestamp,
        count: cluster.length
      }
    })
    done(null, timeline)
  }).on('error', done)
}

EventSchema.index({'timestamp': 1, '_id': 1})

exports.Event = mongoose.model('Event', EventSchema)