var EventEmitter = require('events').EventEmitter
  , async = require('async')
  , _ = require('underscore')
  , WAAWhiteNoise = require('waawhitenoise')
  , debug = require('debug')('audio.engine')
  , patch

/*
exports.load = function(done) {
  debug('loading tubes audio ...')
  async.parallel([
    function(next) {
      $.ajax({
        url: '/data/pd/pink~.pd',
        success: function(data) { next(null, data) },
        error: function(xhr) { next(new Error(xhr)) }
      })
    },
    function(next) {
      $.ajax({
        url: '/data/pd/main.pd',
        success: function(data) { next(null, data) },
        error: function(xhr) { next(new Error(xhr)) }
      })
    }
  ], function(err, patches) {
    if (err) return done(err)
    Pd.registerAbstraction('pink~', patches[0])
    patch = Pd.loadPatch(patches[1])
    debug('tubes audio loaded')
    done()
  })
}

exports.start = function() {
  Pd.start()

    window.patch = patch
    r = patch.objects.filter(function(o) { return o.type === 'receive' })
    rFreq = r[0]
    //rFreq.o(0).message([30])
    dac = patch.objects.filter(function(o) { return o.type === 'dac~' })[0]
    pink = patch.objects.filter(function(o) { return o.type === 'patch' })[0]
    vcf = patch.objects.filter(function(o) { return o.type === 'vcf~' })[0]
    context = Pd._glob.audio.context
    noise = vcf.i(0).connections[0].obj
    pdout = Pd._glob.audio.context.destination
}

exports.stop = function() {
  Pd.stop()
}
*/
var channels = []
  , isStarted = false
  , sinkNode, volumeGain
  , context

exports.load = function(done) {
  done()
}

exports.start = function() {
  if (!exports.waaSupported) return
  if (!isStarted) {
    isStarted = true
    // Creating stuff
    context = new AudioContext
    sinkNode = context.createBiquadFilter()
    volumeGain = context.createGain()

    // Setting parameters
    exports.events.emit('volume', 0.5)
    volumeGain.gain.value = mapVolume(0.5)
    sinkNode.type = 'lowpass'
    sinkNode.frequency.value = 420
    
    // connections
    sinkNode.connect(volumeGain)
    volumeGain.connect(context.destination)

    _.range(10).forEach(function() {
      channels.push(createPatch())
    })
  }
}

exports.stop = function() {
  if (isStarted) {
    isStarted = false
    volumeGain.disconnect()
    context = null
    channels = []
  }
}

exports.setFrequency = function(channel, frequency) {
  if (isStarted) {
    channels[channel].setFrequency(frequency)
  }
}

exports.setAllIdle = function() {
  if (isStarted) {
    channels.forEach(function(channel) {
      channel.setFrequency(0)
    })
  }
}

exports.setDiameter = function(channel, diameter) {
  if (isStarted) {
    channels[channel].setDiameter(diameter)
  } 
}

exports.setVolume = function(ratio) {
  if (isStarted)
    volumeGain.gain.value = mapVolume(ratio)
}

var mapVolume = function(ratio) {
  return (Math.exp(2.5 * ratio) - 1) * 5
}

var createPatch = function() {
  var noise = new WAAWhiteNoise(context)
    , masterGain = context.createGain()
    , harmonics = []
    , gains = [1, 0.7, 0.5, 0.4, 0.3, 0.25, 0.2, 0.1]
    , dGains = [null, 0.005, 0.004, 0.0025, 0.0018, 0.0013, 0.0008, 0.0005]
  masterGain.gain.value = 1
  masterGain.connect(sinkNode)
  noise.start(0)

  // Create all harmonics
  _.range(8).forEach(function(i) {
    var harmonicGain = context.createGain()
      , outGain = context.createGain()
      , filter = context.createBiquadFilter()
    
    // Initialize values
    harmonicGain.gain.value = gains[i]
    outGain.gain.value = 1
    filter.type = 'bandpass'
    filter.Q.value = 370
    filter.frequency.value = 0

    // Connections
    noise.connect(filter)
    filter.connect(harmonicGain)
    harmonicGain.connect(outGain)
    outGain.connect(masterGain)

    harmonics.push({
      input: filter,
      output: outGain,
      setFrequency: function(f) {
        if (f !== 0) {
          outGain.gain.value = 1
          filter.frequency.setValueAtTime(f * i, context.currentTime + 0.005)
        } else
          outGain.gain.value = 0
      },
      setDiameter: function(d) {
        if (i !== 0)
          harmonicGain.gain.value = dGains[i] * d
      }
    })

  })

  // Patch
  return {
    harmonics: harmonics,
    noise: noise, 
    output: masterGain,
    setFrequency: function(f) {
      this.harmonics.forEach(function(h) {
        h.setFrequency(f)
      })
    },
    setDiameter: function(d) {
      d = (50 - d) * 3
      this.harmonics.forEach(function(h) {
        h.setDiameter(d)
      })
    }
  }

}

exports.events = new EventEmitter