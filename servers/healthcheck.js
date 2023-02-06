const healthCheck = (app) => app.get('/v1/healthz', (req, res) => {
    res.status(200).send();
  });
  
  module.exports = healthCheck;