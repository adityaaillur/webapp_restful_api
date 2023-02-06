const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const {
  check,
  validationResult
} = require('express-validator');
const mysql = require('mysql2');
const healthcheck = require('./healthcheck.js');
const postMethod = require('./postMethod.js');
const app = express();
app.use(bodyParser.json());
app.use(express.json());


// import the mysql connection
const connection = require('./connection');

//post method to accept user details
app.post('/v1/user', [
  check('email').isEmail(),
  check('first_name').isLength({
    min: 3
  }),
  check('last_name').isLength({
    min: 3
  }),
  check('password').isLength({
    min: 6
  })
], (req, res) => {
  return postMethod(req, res);
});

// Get method with authentication

function isValidUsernamePassword(username, password) {
  return new Promise((resolve, reject) => {
    connection.query("SELECT password FROM user WHERE email = ?", [username], function (error, results, fields) {
      if (error) {
        reject(error);
      }

      if (results.length === 0) {
        resolve(false);
      } else {
        const hashedPassword = results[0].password;
        bcrypt.compare(password, hashedPassword, function (err, result) {
          if (result === true) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      }
    });
  });
}

app.get("/v1/user/:user_id", (req, res) => {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({
      error: "Unauthorized, no authentication provided",
    });
  }

  const [username, password] = new Buffer(auth.split(" ")[1], "base64")
    .toString()
    .split(":");

  isValidUsernamePassword(username, password)
    .then((isValid) => {
      if (!isValid) {
        return res.status(401).json({
          error: "Unauthorized, invalid username or password",
        });
      }

      const user_id = req.params.user_id;

      connection.query("SELECT * FROM user WHERE id = ? AND email = ?",[user_id, username],function (error, results, fields) {
          if (error) {
            return res.status(401).json({
              error: error,
            });
          }
          if (results.length == 0) {
            return res.status(403).json({
              error: "Forbidden",
            });
          }
          res.status(200).json({
            id: results[0].id,
            first_name: results[0].first_name,
            last_name: results[0].last_name,
            email: results[0].email,
          });
        }
      );
    })
    .catch((error) => {
      return res.status(500).json({
        error: error,
      });
    });
});

// current put - auth works perfectly but valid put make app go
app.put('/v1/user/:user_id', [
  check('first_name').optional().isLength({min: 3}),
  check('last_name').optional().isLength({min: 3}),
  check('password').optional().isLength({min: 6})
], (req, res) => {

  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({
      error: "Unauthorized, no authentication provided",
    });
  }

  const [username, password] = new Buffer(auth.split(" ")[1], "base64")
    .toString()
    .split(":");

  isValidUsernamePassword(username, password)
    .then((isValid) => {
      if (!isValid) {
        return res.status(401).json({
          error: "Unauthorized, invalid username or password",
        });
      }

      const user_id = req.params.user_id;
      const first_name = req.body.first_name;
      const last_name = req.body.last_name;
      const password = req.body.password;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array()
        });
      }

      //check if the user exists
      connection.query("SELECT * FROM user WHERE id = ?", [user_id], function (error, results, fields) {
        if (error) {
          return res.status(401).json({
            error: error,
          });
        }
        if (results.length == 0) {
          return res.status(403).json({
            error: "Forbidden, user does not exist"
          });
        }

        if (results[0].email !== username) {
          return res.status(401).json({
            error: "Unauthorized, user does not match with token"
          });
        }

        //update user details
        let sql = "UPDATE user SET"; // sql update command
        let flag = false;
        if (first_name) {
          sql += " first_name = '" + first_name + "',";
          flag = true;
        }

        if (last_name) {
          sql += " last_name = '" + last_name + "',";
          flag = true;
        }
        if (password) {
          bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
              return res.status(500).json({
                error: "Internal Server Error"
              });
            } else {
              sql += " password = '" + hash + "',";
              flag = true;
            }
          });
        }
        if (!flag) {
          return res.status(204).json({
            message: "No content"
          });
        }
        sql = sql.slice(0, -1); // remove the last comma
        sql += " WHERE id = " + user_id;
        connection.query(sql, function (error, results, fields) {
          if (error) {
            return res.status(500).json({
              error: error
            });
          }
          return res.status(200).json({message: "ok"});
        });

        // res.status(200).json({
        //   id: results[0].id,
        //   first_name: results[0].first_name,
        //   last_name: results[0].last_name,
        //   email: results[0].email,
        // });

        //timestamp

        function convertToSQLTimestamp() {
          const date = new Date();
          const year = date.getFullYear();
          const month = date.getMonth() + 1; // Month is 0-based
          const day = date.getDate();
          const hours = date.getHours();
          const minutes = date.getMinutes();
          const seconds = date.getSeconds();
          return `${year}-${pad(month)}-${pad(day)} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        }

        function pad(number) {
          return number.toString().padStart(2, '0');
        }

        sql += " updated_at= '" + convertToSQLTimestamp() + "'/"

        if (flag) {
          sql = sql.slice(0, -1);
          sql += " WHERE id = '" + user_id + "'";
          connection.query(sql, function (error, results, fields) {

            return res.status(200).json({
              message: "ok"
            });
            
          });
        } else {
          return res.status(204).send();
        }
      });
    });
});


//backup put 1 - details get updated(only once), but auth is not working

// app.put('/v1/user/:user_id', [
//   check('first_name').optional().isLength({min: 3}),
//   check('last_name').optional().isLength({min: 3}),
//   check('password').optional().isLength({min: 6})
// ], (req, res) => {
//   const auth = req.headers.authorization;
//   if (!auth) {
//     return res.status(401).json({
//       error: "Unauthorized, no authentication provided",
//     });
//   }

//   const [username, password] = new Buffer(auth.split(" ")[1], "base64")
//     .toString()
//     .split(":");

//   isValidUsernamePassword(username, password)
//     .then((isValid) => {
//       if (!isValid) {
//         return res.status(401).json({
//           error: "Unauthorized, invalid username or password",
//         });
//       }

//       const user_id = req.params.user_id;
//       const first_name = req.body.first_name;
//       const last_name = req.body.last_name;
//       const password = req.body.password;
//       const errors = validationResult(req);

//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           errors: errors.array()
//         });
//       }

//       //check if the user exists
//       connection.query("SELECT * FROM user WHERE id = ?", [user_id], function (error, results, fields) {
//         if (error) {
//           return res.status(401).json({
//             error: error,
//           });
//         }
//         if (results.length == 0) {
//           return res.status(403).json({
//             error: "Forbidden, user does not exist"
//           });
//         }
//         console.log(results);
//         console.log(username);
//         if (results[0].email !== username) {
//           return res.status(401).json({
//             error: "Unauthorized, user does not match with token"
//           });
//         }
//         res.status(200).json({
//           id: results[0].id,
//           first_name: results[0].first_name,
//           last_name: results[0].last_name,
//           email: results[0].email,
//         });

//         //update user details
//         let sql = "UPDATE user SET"; // sql update command
//         let flag = false;
//         if (first_name) {
//           sql += " first_name = '" + first_name + "',";
//           flag = true;
//         }

//         if (last_name) {
//           sql += " last_name = '" + last_name + "',";
//           flag = true;
//         }
//         if (password) {
//           bcrypt.hash(password, 10, (err, hash) => {
//             if (err) {
//               return res.status(500).json({
//                 error: "Internal Server Error"
//               });
//             } else {
//               sql += " password = '" + hash + "',";
//               flag = true;
//             }
//           });
//         }
//         if (!flag) {
//           return res.status(204).json({
//             message: "No content"
//           });
//         }
//         sql = sql.slice(0, -1); // remove the last comma
//         sql += " WHERE id = " + user_id;
//         connection.query(sql, function (error, results, fields) {
//           if (error) {
//             return res.status(500).json({
//               error: error
//             });
//           }
//           return res.status(204).send();
//         });

//         function convertToSQLTimestamp() {
//           const date = new Date();
//           const year = date.getFullYear();
//           const month = date.getMonth() + 1; // Month is 0-based
//           const day = date.getDate();
//           const hours = date.getHours();
//           const minutes = date.getMinutes();
//           const seconds = date.getSeconds();
//           return `${year}-${pad(month)}-${pad(day)} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
//         }

//         function pad(number) {
//           return number.toString().padStart(2, '0');
//         }

//         sql += " updated_at= '" + convertToSQLTimestamp() + "'/"

//         if (flag) {
//           sql = sql.slice(0, -1);
//           sql += " WHERE id = '" + user_id + "'";
//           connection.query(sql, function (error, results, fields) {
//             if (error) {
//               return res.status(400).json({
//                 error: error
//               });
//             }
//             res.status(200).send();
//             //res.send({ 204 :  "updated"})
//           });
//         } else {
//           return res.status(204).send();
//         }
//       });
//     });
// });


//backup put
// app.put('/v1/user/:user_id', [
//   check('first_name').optional().isLength({ min: 3 }),
//   check('last_name').optional().isLength({ min: 3 }),
//   check('password').optional().isLength({ min: 6 })
// ], (req, res) => {
//   const user_id = req.params.user_id;
//   const first_name = req.body.first_name;
//   const last_name = req.body.last_name;
//   const password = req.body.password;
//   const username = req.headers.username;
//   const errors = validationResult(req);

//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   //check if the user exists
//   connection.query("SELECT * FROM user WHERE id = ?", [user_id], function (error, results, fields) {
//     if (error) {
//       return res.status(401).json({
//         error: error
//       });
//     }
//     if (results.length == 0) {
//       return res.status(403).json({
//         error: "Forbidden"
//       });
//     }
//     if (results[0].username !== username) {
//       return res.status(401).json({
//         error: "Unauthorized"
//       });
//     }
//     //update user details
//     let sql = "UPDATE user SET"; // sql update command
//     let flag = false;
//     if (first_name) {
//       sql += " first_name = '" + first_name + "',";
//       flag = true;
//     }

//     if (last_name) {
//       sql += " last_name = '" + last_name + "',";
//       flag = true;
//     }
//     if (password) {
//       bcrypt.hash(password, 10, (err, hash) => {
//         if (err) {
//           return res.status(500).json({
//             error: err
//           });
//         } else {
//           sql += " password = '" + hash + "',";
//           flag = true;
//         }
//       });
//     }
//     function convertToSQLTimestamp() {
//       const date = new Date();
//       const year = date.getFullYear();
//       const month = date.getMonth() + 1; // Month is 0-based
//       const day = date.getDate();
//       const hours = date.getHours();
//       const minutes = date.getMinutes();
//       const seconds = date.getSeconds();
//       return `${year}-${pad(month)}-${pad(day)} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
//     }

//     function pad(number) {
//       return number.toString().padStart(2, '0');
//     }

//     sql += " updated_at= '" + convertToSQLTimestamp() + "'/"

//     if (flag) {
//       sql = sql.slice(0, -1);
//       sql += " WHERE id = '" + user_id + "'";
//       connection.query(sql, function (error, results, fields) {
//         if (error) {
//           return res.status(400).json({
//             error: error
//           });
//         }
//         res.status(200).send();
//         //res.send({ 204 :  "updated"})
//       });
//     } else {
//       return res.status(204).send();
//     }
//   });
// });

healthcheck(app);
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});