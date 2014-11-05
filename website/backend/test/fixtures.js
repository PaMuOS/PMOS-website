var config = require('../config')
  , fixtures = require('pow-mongodb-fixtures').connect(config.db.name)

var tubeEvents = [
  {
    "type" : "on", "tubeId" : 42, "userId": 1,
    "date" : new Date("2014-11-04T22:02:50.539Z"), "__v" : 0
  },
  {
    "type" : "off", "tubeId" : 42, "userId": 1,
    "date" : new Date("2014-11-04T22:02:51.539Z"), "__v" : 0
  },
  {
    "type" : "on", "tubeId" : 42, "userId": 1,
    "date" : new Date("2014-11-04T22:02:52.539Z"), "__v" : 0
  },
  {
    "type" : "off", "tubeId" : 42, "userId": 2,
    "date" : new Date("2014-11-04T22:02:53.539Z"), "__v" : 0
  },
  {
    "type" : "on", "tubeId" : 42, "userId": 2,
    "date" : new Date("2014-11-04T22:02:54.039Z"), "__v" : 0
  },
  {
    "type" : "off", "tubeId" : 42, "userId": 2,
    "date" : new Date("2014-11-04T22:02:54.539Z"), "__v" : 0
  },
  {
    "type" : "on", "tubeId" : 42, "userId": 2,
    "date" : new Date("2014-11-04T22:02:55.039Z"), "__v" : 0
  },


  {
    "type" : "on", "tubeId" : 35, "userId": 1,
    "date" : new Date("2014-11-04T22:02:50.539Z"), "__v" : 0
  },
  {
    "type" : "off", "tubeId" : 35, "userId": 1,
    "date" : new Date("2014-11-04T22:02:52.539Z"), "__v" : 0
  },
  {
    "type" : "off", "tubeId" : 35, "userId": 3,
    "date" : new Date("2014-11-04T22:02:54.539Z"), "__v" : 0
  },
  {
    "type" : "on", "tubeId" : 35, "userId": 3,
    "date" : new Date("2014-11-04T22:02:56.539Z"), "__v" : 0
  },
  {
    "type" : "off", "tubeId" : 35, "userId": 3,
    "date" : new Date("2014-11-04T22:02:58.539Z"), "__v" : 0
  },
  {
    "type" : "on", "tubeId" : 35, "userId": 3,
    "date" : new Date("2014-11-04T22:03:00.539Z"), "__v" : 0
  },
  {
    "type" : "off", "tubeId" : 35, "userId": 3,
    "date" : new Date("2014-11-04T22:03:02.539Z"), "__v" : 0
  }  
]

fixtures.clearAndLoad({ 'tubeevents': tubeEvents }, function(err) {
  if (err) throw err
  console.log('fixtures loaded!')
  process.exit(0)
})

