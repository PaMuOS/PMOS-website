var fs = require('fs')
  , path = require('path')
  , async = require('async')
  , spawn = require('child_process').spawn
  , backend = require('../../../../backend/main')
  , models = require('../../../../backend/src/models')
  , fixtures = require('../../fixtures')
  , config = require('./config')

var rootDir = path.resolve(__dirname, '../../../..')
  , tmpDir = path.resolve(rootDir, 'tmp')


var symlink = function(from, to, next) {
  fs.symlink(path.resolve(rootDir, 'frontend/deps'), path.join(__dirname, to), function(err) {
    if (err && err.code === 'EEXIST') next()
    else next(err)
  })
}

var runCommand = function(bin, args, done) {
  var ps = spawn(bin, args)
    , errStr = ''
    , outStr = ''

  ps.stdout.on('data', function(str) {
    outStr += str
  })

  ps.stderr.on('data', function(str) {
    errStr += str
  })

  ps.on('close', function() {
    if (errStr.length) done(errStr, outStr)
    else done(null, outStr)
  })
}

async.series([
  // Create symlink to get get the data we need to access from index.html
  symlink.bind(this, 'frontend/deps', 'deps'),
  symlink.bind(this, 'tmp', 'tmp'),
  symlink.bind(this, 'node_modules/mocha', 'mocha'),
  symlink.bind(this, 'dist/data', 'data'),

  // Start the backend at localhost:8000 and load fixtures
  backend.start.bind(backend, config),
  models.Event.remove.bind(models.Event, {}),
  models.Event.create.bind(models.Event, fixtures.events),

  // Browserify all browsers tests
  function(next) {
    runCommand('browserify', [path.resolve(__dirname, '../index.js')], function(err, browserified) {
      if (err) return next(new Error(err))
      fs.writeFile(path.resolve(rootDir, 'tmp/frontend-tests.js'), browserified, next)
    })
  }

], function(err) {
  if (err) throw err
  console.log('test backend started')

  // Run the tests with phantomjs-mocha
  runCommand('mocha-phantomjs', ['http://localhost:8000'], function(testErrs, testResults) {
    if (err) {
      process.stdout.write(err.message)
      process.exit(1)
    } else {
      process.stdout.write(testResults)
      process.exit(0)
    }

  })
})