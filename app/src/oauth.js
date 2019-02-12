const express = require('express');

const startServer = () => {
  const app = express();

  const server = app.listen(13030, () => {
    console.log('Listening to PORT: ', server.address().port);
  });
  
  app.get('/callback', (req, res, next) => {
    res.json(req);
    server.close();
  });
}

module.exports = { startServer };