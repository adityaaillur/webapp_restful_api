const logger = require('./logger/logger')

const health = (app) => app.get('/healthz', (req, res) => {
  res.status(200).send("OK");
  logger.customerLogger.info('Access of API healthz')
});

module.exports = health;