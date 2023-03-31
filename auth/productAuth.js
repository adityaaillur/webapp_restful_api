const bcrypt = require('bcrypt');
const mysql = require('mysql');
const { validatePassword, validateEmail, validateNumber} = require('../validation/validation');
const {User,Product,Images} = require('../models')
const logger = require('../logger/logger')

// Basic HTTP authentication middleware
const auth = async (req, res, next) => {
    if (req.method === 'GET'||req.method === 'POST' || req.method === 'PUT'|| req.method === 'PATCH'|| req.method === 'DELETE') {

        if(!req.get('Authorization')){
            var err = new Error('Not Authenticated!')
            // Set status code to '401 Unauthorized' and 'WWW-Authenticate' header to 'Basic'
            res.status(401).set('WWW-Authenticate', 'Basic')
            res.send("Please give Basic Auth with username and password")
            logger.customlogger.error('Please give Basic Auth with username and password for product')
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

            var productId = req.params.productId;
            var imageId = req.params.imageId;

            const initial_url = req.url;
            const urlPath = initial_url .split( '/' );

            const lastSegment = urlPath.pop();
            
            let isImage
            if(lastSegment != 'image'){
                isImage = true
            }else{
                isImage = false
            }

            console.log(productId== null);

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
                    logger.customlogger.error('The username does not exists')
                    next(err)
                }else{
                    if (req.method === 'POST' && isImage){
                        
                        validateUsernameAndPassword(username,password,userFound,next,res);

                    }else{
                        let productIdErr = validateNumber(productId);
                        let imageIdErr
                        if(imageId != undefined){
                            imageIdErr = validateNumber(imageId);
                        }

                        console.log(productId);
                        console.log(imageId);

                        if(productIdErr){

                            var productFound = await Product.findOne({
                                where: { id: productId },
                            }).catch((err) => {
                                if(err){
                                    console.log(err);
                                }
                            });
                            
                            console.log(productFound);

                            if(productFound == null){
                                var err = new Error('Not Authenticated!')
                                // Set status code to '401 Unauthorized' and 'WWW-Authenticate' header to 'Basic'
                                res.status(404).set('WWW-Authenticate', 'Basic')
                                res.send("The product doesn't exists")
                                logger.customlogger.error('The product does not exists')
                                next(err)
                            }else{
                                if(productFound.owner_user_id == userFound.id){
                                    if(imageId == undefined){
                                        validateUsernameAndPassword(username,password,userFound,next,res);
                                    }else{
                                        if(imageIdErr){
                                            var imageFound = await Images.findOne({
                                                where: { image_id: imageId },
                                            }).catch((err) => {
                                                if(err){
                                                    console.log(err);
                                                }
                                            });
                                            if(imageFound == null){
                                                var err = new Error('Not Authenticated!')
                                                // Set status code to '401 Unauthorized' and 'WWW-Authenticate' header to 'Basic'
                                                res.status(404).set('WWW-Authenticate', 'Basic')
                                                res.send("The image doesn't exists")
                                                logger.customlogger.error('The image does not exists')
                                                next(err)
                                            }else{
                                                validateUsernameAndPassword(username,password,userFound,next,res);
                                            } 
                                        }else{
                                            res.status(403).send("The image Id is Invalid")
                                            logger.customlogger.error('The image Id is Invalid')
                                        }
                                    }
                                }else{
                                    res.status(403).set('WWW-Authenticate', 'Basic')
                                    res.send("The product is not created by this user")
                                    logger.customlogger.error('The product is not created by this user')
                                }
                            }

                        }
                        else{
                            res.status(403).send("The product Id is Invalid")
                            logger.customlogger.error('The product is not created by this user')
                        }
                    }                                          
                }               
            }else{
                res.status(401).send("Invalid email or password in Authorization");
                logger.customlogger.error('The product is not created by this user')
            }
        }
    }else {
        next();
    }
};

function validateUsernameAndPassword(username, password, userFound,next,res){

    if(username == userFound.username){
        const hashedPassword = userFound.password;
        bcrypt.compare(password, hashedPassword, function (err, result) {
            if (result === true) {
                next()
                console.log("Authenticated")
                logger.customlogger.info('Valid User is Authenticated')
            } else {
                var err = new Error('Not Authenticated!')
                // Set status code to '401 Unauthorized' and 'WWW-Authenticate' header to 'Basic'
                res.status(401).set('WWW-Authenticate', 'Basic')
                res.send("The password is wrong in Authorization")
                logger.customlogger.error('The password is wrong in Authorization')
            }
        });
    }else{
        var err = new Error('Not Authenticated!')
        // Set status code to '401 Unauthorized' and 'WWW-Authenticate' header to 'Basic'
        res.status(401).set('WWW-Authenticate', 'Basic')
        res.send("The username is wrong in Authorization")
        logger.customlogger.error('The username is wrong in Authorization')
    } 
}

module.exports = auth;