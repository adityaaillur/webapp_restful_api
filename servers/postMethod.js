const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const connection = require('./connection');

const postMethod = (req, res) => {

    const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const email = req.body.email;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const password = req.body.password;

  //hash password
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: err
      });
    } else {
      //insert data into the mysql database
      connection.query("INSERT INTO user (email, first_name, last_name, password) values (?,?,?,?)", [email, first_name, last_name, hash], function (error, results, fields) {
        if (error) {
          return res.status(400).json({
            message: 'User already exists!'
          });
        }
        res.status(201).json({
          message: 'User created successfully'
        });
      });
    }
  });
}

module.exports = postMethod;