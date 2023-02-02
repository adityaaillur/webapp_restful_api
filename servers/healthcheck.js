const healthCheck = (app) => app.get('/healthz', (req, res) => {
    res.status(200).send();
  });
  
  module.exports = healthCheck;