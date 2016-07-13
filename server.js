const app = require('./app');
const fs = require('fs');
const https = require('https');

const options = {
  key: fs.readFileSync('domain.key'),
  cert: fs.readFileSync('domain.crt')
};

https.createServer(options, app.callback()).listen(3001);
