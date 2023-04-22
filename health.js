const logger = require('./logger/logger')

const health = (app) => app.get('/aditya', (req, res) => {
  res.status(200).send("OK - Aditya API");
  logger.customlogger.info('Access of API health')
});

module.exports = health;
