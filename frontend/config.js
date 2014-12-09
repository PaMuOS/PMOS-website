module.exports = {
  
  performance: {
    granularity: 500 // milliseconds
  },

  tubes: {
    diameterScale: 0.001, // Scale the tube diameters
  },

  web: {
    hostname: window.location.hostname,
    port: window.location.port,
    reconnectTime: 2000
  }
}
