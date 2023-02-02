const mysql = require('mysql2');

//mysql connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin123',
  database: 'cloud'
});

module.exports = connection;

