const logger = require('./logger/logger')

const health = (app) => app.get('/health', (req, res) => {
  res.status(200).send("OK Health 200%");
  logger.customlogger.info('Access of API health')
});

module.exports = health;