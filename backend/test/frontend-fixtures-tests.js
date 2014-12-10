var async = require('async')
  , mongoose = require('mongoose')
  , fixtures = require('../../frontend/test/fixtures')
  , models = require('../src/models')

describe('frontend.fixtures', function() {

  before(function(done) {
    mongoose.connect('mongodb://localhost:27017/pmos-test', done)
  })

  after(function(done) {
    mongoose.disconnect(done)
  })
  
  it('should validate against backend models', function(done) {
    async.each(fixtures.events, function(event, next) {
      event = new models.Event(event)
      event.save(next)
    }, done)
  })

})