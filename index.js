const express = require('express');
const portfinder = require('portfinder');
const bodyParser = require('body-parser');
const usersRoutes = require('./routes/users');
const productRoutes = require('./routes/product');
const imageRoutes = require('./routes/images');
const health = require('./health.js');

const db = require('./models')

const app = express();

health(app);

app.use(bodyParser.json());

app.use('/v1',usersRoutes);

app.use('/v1',productRoutes);

app.use('/v1',imageRoutes);

var PORT = 8000;

db.sequelize.sync().then((req) => {
  app.listen(PORT, function(err){
    if (err) console.log("Error in server setup")
    console.log("Server listening on Port", PORT);
})
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/user/create",)