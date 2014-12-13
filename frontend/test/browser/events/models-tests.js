var assert = require('assert')
  , _ = require('underscore')
  , async = require('async')
  , eventModels = require('../../../src/events/models')
  , config = require('../../../config')


describe('tubes.models', function() {

  var omitId = function(events) {
    return events.map(function(event) { return _.omit(event, ['_id']) })
  }

  describe('load', function() {

    it('should load events', function(done) {
      eventModels.load(1000, 4000, function(err, events) {
        if (err) throw err
        assert.deepEqual(omitId(events), [
          { timestamp: 1000, num: 3, channel: 4, x: 0, y: 0, frequency: 100 },
          { timestamp: 2000, num: 3, channel: 2, x: 0, y: 0, frequency: 200 },
          { timestamp: 2500, num: 1, channel: 1, x: 0, y: 0, frequency: 0 }
        ])
        done()
      })
    })

  })

  describe('next', function() {

    it('should load next pages after a load', function(done) {
      async.series([
        eventModels.load.bind(eventModels, 0, 5500),
        eventModels.next.bind(eventModels),
        eventModels.next.bind(eventModels),
        eventModels.next.bind(eventModels)
      ], function(err, results) {
        if (err) throw err

        assert.deepEqual(omitId(results.shift()), [
          { timestamp: 1000, num: 3, channel: 4, x: 0, y: 0, frequency: 100 },
          { timestamp: 2000, num: 3, channel: 2, x: 0, y: 0, frequency: 200 },
          { timestamp: 2500, num: 1, channel: 1, x: 0, y: 0, frequency: 0 }
        ])

        assert.deepEqual(omitId(results.shift()), [
          { timestamp: 3000, num: 3, channel: 3, x: 0, y: 0, frequency: 300 },
          { timestamp: 4000, num: 5, channel: 6, x: 0, y: 0, frequency: 0 },
          { timestamp: 4100, num: 4, channel: 5, x: 0, y: 0, frequency: 100 }
        ])

        assert.deepEqual(omitId(results.shift()), [
          { timestamp: 5000, num: 4, channel: 5, x: 0, y: 0, frequency: 500 },
          { timestamp: 6000, num: 4, channel: 5, x: 0, y: 0, frequency: 600 }
        ])

        assert.deepEqual(results.shift(), [])

        done()
      })
    })

  })

})