var path = require('path')

module.exports = {
  db: {
    url: 'mongodb://localhost:27017/pmos-test'
  },
  web: {
    hostname: 'localhost',
    port: 8000,
    rootPath: path.resolve(__dirname, '..', '..', '..', '..', 'dist')
  },
  api: {
    pagination: 3 // Number of events returned in each page
  }
}