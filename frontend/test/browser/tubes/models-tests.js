var assert = require('assert')
  , _ = require('underscore')
  , tubeModels = require('../../../src/tubes/models')
  , config = require('../../../config')


describe('tubes.models', function() {

  describe('load', function() {

    it('should load tubes from the xml file', function(done) {
      tubeModels.load(function(err) {
        if (err) throw err
        assert.ok(tubeModels.all.length, 570)
        _.forEach(tubeModels.all, function(tube) {
          assert.deepEqual(_.keys(tube).sort(), (['num', 'x', 'y', 'diameter']).sort())
          assert.ok(_.isNumber(tube.num))
          assert.ok(_.isNumber(tube.x))
          assert.ok(_.isNumber(tube.y))
          assert.ok(_.isNumber(tube.diameter))
        })
        done()
      })
    })

  })

})