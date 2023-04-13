const { client } = require('./aws/cloud-watch')

const health = (app) => app.get('/healthz', (req, res) => {
  client.increment('health_check');
  res.status(200).send("OK");
});

module.exports = health;