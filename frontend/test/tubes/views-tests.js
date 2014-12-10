var assert = require('assert')
  , _ = require('underscore')
  , fixtures = require('../fixtures')
  , tubeViews = require('../../src/tubes/views')
  , tubeModels = require('../../src/tubes/models')
  , config = require('../../config')

// Mock-ups for tests
var received = []
tubeViews.setPlaying = function(channel, num) { received.push(['setPlaying', num, channel]) }
tubeViews.setIdle = function(num) { received.push(['setIdle', num]) }

describe('tubes.views', function() {

  afterEach(function() {
    received = []
  })

  describe('perform', function() {

    it('should perform the events given', function() {
      // Fake tubes
      tubeModels.all = _.range(8).map(function(i) { return { num: i } })
      
      tubeViews.perform(fixtures.events)
      assert.deepEqual(received.sort(), [
        ['setPlaying', 3, 3],
        ['setIdle', 1],
        ['setIdle', 5],
        ['setPlaying', 4, 5],

        ['setIdle', 0],
        ['setIdle', 2],
        ['setIdle', 6],
        ['setIdle', 7]
      ].sort())
    })

  })

})