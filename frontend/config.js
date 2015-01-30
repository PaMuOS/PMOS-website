var config = module.exports = {
  
  performance: {
    granularity: 100, // milliseconds
    channels: [
      {id: 0, color: 'red'}, {id: 1, color: 'blue'},
      {id: 2, color: 'green'}, {id: 3, color: 'yellow'},
      {id: 4, color: 'purple'}, {id: 5, color: 'pink'},
      {id: 6, color: '#337766'}, {id: 7, color: '#661100'},
      {id: 8, color: '#0099a2'}, {id: 9, color: '#53a10b'} 
    ]
  },

  tubes: {
    originalRatio: 16/9,  // Ratio ratio w/h, original schematics 1280x720
    originalWidth: 1280
  },

  web: {
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'localhost',
    port: typeof window !== 'undefined' ? window.location.port : 80,
    reconnectTime: 2000,
    apiRoot: '/',
    dataRoot: '/data'
  }
}
