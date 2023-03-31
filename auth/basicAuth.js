const bcrypt = require('bcrypt');
const mysql = require('mysql');
const { validatePassword, validateEmail} = require('../validation/validation');
const {User} = require('../models')
const logger = require('../logger/logger')

// Basic HTTP authentication middleware
const auth = async (req, res, next) => {
    if (req.method === 'PUT' || req.method === 'GET') {

        if(!req.get('Authorization')){
            var err = new Error('Not Authenticated!')
            // Set status code to '401 Unauthorized' and 'WWW-Authenticate' header to 'Basic'
            res.status(401).set('WWW-Authenticate', 'Basic')
            res.send("Please give Basic Auth with username and password")
            logger.customerLogger.error('Please give Basic Auth with username and password')
            next(err)
        }
        // If 'Authorization' header present
        else{
            // Decode the 'Authorization' header Base64 value
            var creds = Buffer.from(req.get('Authorization').split(' ')[1], 'base64')
            // <Buffer 75 73 65 72 6e 61 6d 65 3a 70 61 73 73 77 6f 72 64>
            .toString()
            // username:password
            .split(':')
            // ['username', 'password']

            var username = creds[0];
            var password = creds[1];

            var userid = req.params.userId;

            let PasswordErr = validatePassword(password);
            let UsernameErr = validateEmail(username);

            if(UsernameErr && PasswordErr) {


                var userFound = await User.findOne({
                    where: { username: username },
                }).catch((err) => {
                    if(err){
                        console.log(err);
                    }
                });

                if(userFound == null){
                    var err = new Error('Not Authenticated!')
                    // Set status code to '401 Unauthorized' and 'WWW-Authenticate' header to 'Basic'
                    res.status(401).set('WWW-Authenticate', 'Basic')
                    res.send("The username doesn't exists")
                    logger.customerLogger.error('The username does not exists')
                    next(err)
                }else{
                    if(userid == userFound.id){
                        if(username == userFound.username){
                            const hashedPassword = userFound.password;
                            bcrypt.compare(password, hashedPassword, function (err, result) {
                                if (result === true) {
                                    next()
                                    console.log("Authenticated")
                                    logger.customerLogger.info('Valid User is Authenticated')
                                } else {
                                    var err = new Error('Not Authenticated!')
                                    // Set status code to '401 Unauthorized' and 'WWW-Authenticate' header to 'Basic'
                                    res.status(401).set('WWW-Authenticate', 'Basic')
                                    res.send("The password is wrong in Authorization")
                                    logger.customerLogger.error('The password is wrong in Authorization')
                                    next(err)
                                }
                            });
                        }else{
                            var err = new Error('Not Authenticated!')
                            // Set status code to '401 Unauthorized' and 'WWW-Authenticate' header to 'Basic'
                            res.status(401).set('WWW-Authenticate', 'Basic')
                            res.send("The username is wrong in Authorization")
                            logger.customerLogger.error('The username is wrong in Authorization')
                            next(err)
                        }
                    } else{
                        var err = new Error('Not Authenticated!')
                        // Set status code to '401 Unauthorized' and 'WWW-Authenticate' header to 'Basic'
                        res.status(403)
                        res.send("The userid is wrong in the parameter")
                        logger.customerLogger.error('The user id is wrong in the parameter')
                        next(err)
                    }                          
                }
                
            }else{
                res.status(401).send("Invalid email or password in Authorization");
                logger.customerLogger.error('Invalid email or password in Authorization')
            }
        }
    }else {
        next();
    }
};

module.exports = auth;