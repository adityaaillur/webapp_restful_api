
const express = require('express');
const portfinder = require('portfinder');
const bodyParser = require('body-parser');
const usersRoutes = require('./routes/users');
const productRoutes = require('./routes/product');
const health = require('./health.js');

const db = require('./models')

const app = express();

health(app);

app.use(bodyParser.json());

app.use('/v1',usersRoutes);

app.use('/v1',productRoutes);

db.sequelize.sync().then((req) => {
    portfinder.getPortPromise()
    .then((port) => {
      app.listen(port,()=>console.log(`Example app listening on Port http://localhost:${port}`));
      
    })
    .catch((err) => {
      console.log(`Not Connected to the any port!`);
    });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/user/create",)



