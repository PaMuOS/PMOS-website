var path = require('path')

module.exports = {
  db: {
    //url: 'mongodb://nodejitsu:92fc2d2c3a349abc3a2d340def38a866@troup.mongohq.com:10064/nodejitsudb5682505848'
    url: 'mongodb://localhost:27017/pmos-test'
  },
  web: {
    hostname: 'pmos-website.jit.su',
    port: 8000,
    rootPath: path.resolve(__dirname, '..', 'dist')
  },
  api: {
    pagination: 100,                      // Number of events returned in each page
    timeline: {
      clusterTime: 1000 * 60 * 10,        // Granularity of the timeline (milliseconds)
      cacheTime: 1000 * 60 * 60 * 10      // How long the timeline is cached (ms)
    }
  }
}