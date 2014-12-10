var path = require('path')

module.exports = {
  db: {
    url: 'mongodb://nodejitsu:92fc2d2c3a349abc3a2d340def38a866@troup.mongohq.com:10064/nodejitsudb5682505848'
    //url: 'mongodb://localhost:27017/pmos-test'
  },
  web: {
    hostname: 'pmos-website.jit.su',
    port: 8000,
    rootPath: path.resolve(__dirname, '..', 'dist')
  }
}