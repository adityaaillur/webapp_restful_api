'use strict';

require('dotenv').config()
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const logger = require('../logger/logger')

const db = {};

const sequelize = new Sequelize(
   process.env.DB_DATABASE,
   process.env.DB_USER,
   process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'mysql'
    }
  );

  try {
    sequelize.authenticate();
    console.log('Connection has been established successfully.');
    logger.customlogger.info('Connection to the Database has been established successfully.')
  } catch (error) {
    logger.customlogger.info('Unable to connect to the database')
    console.error('Unable to connect to the database:', error);
  }

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
