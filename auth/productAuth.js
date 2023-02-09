const bcrypt = require('bcrypt');
const mysql = require('mysql');
const { validatePassword, validateEmail, validateNumber} = require('../validation/validation');
const {User,Product} = require('../models')

// Basic HTTP authentication middleware
const auth = async (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT'|| req.method === 'PATCH'|| req.method === 'DELETE') {

        if(!req.get('Authorization')){
            var err = new Error('Not Authenticated!')
            // Set status code to '401 Unauthorized' and 'WWW-Authenticate' header to 'Basic'
            res.status(401).set('WWW-Authenticate', 'Basic')
            res.send("Missing Auth username/password")
            next(err)
        }
        // If 'Authorization' header present
        else{
            // Decode the 'Authorization' header Base64 value
            var creds = Buffer.from(req.get('Authorization').split(' ')[1], 'base64')
            .toString()
            // username:password
            .split(':')
            // ['username', 'password']

            var username = creds[0];
            var password = creds[1];

            var productId = req.params.productId;

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
                    res.send("The Username Not Found")
                    next(err)
                }else{

                    if (req.method === 'POST'){
                        
                        validateUsernameAndPassword(username,password,userFound,next,res);

                    }else{

                        let productIdErr = validateNumber(productId);

                        if(productIdErr){

                            var productFound = await Product.findOne({
                                where: { id: productId },
                            }).catch((err) => {
                                if(err){
                                    console.log(err);
                                }
                            });
                            if(productFound == null){
                                var err = new Error('Not Authenticated!')
                                // Set status code to '401 Unauthorized' and 'WWW-Authenticate' header to 'Basic'
                                res.status(404).set('WWW-Authenticate', 'Basic')
                                res.send("Product Not Found!")
                                next(err)
                            }else{
                                if(productFound.owner_user_id == userFound.id){
                                    validateUsernameAndPassword(username,password,userFound,next,res);
                                }else{
                                    res.status(403).set('WWW-Authenticate', 'Basic')
                                    res.send("User not recognized as creator of product")
                                }
                            }
                        }
                        else{
                            res.status(400).send("Invalid ProductID")
                        }
                    }                                          
                }               
            }else{
                res.status(401).send("Invalid Auth email/password");
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
            } else {
                var err = new Error('Not Authenticated!')
                // Set status code to '401 Unauthorized' and 'WWW-Authenticate' header to 'Basic'
                res.status(401).set('WWW-Authenticate', 'Basic')
                res.send("Invalid Auth Password")
            }
        });
    }else{
        var err = new Error('Not Authenticated!')
        // Set status code to '401 Unauthorized' and 'WWW-Authenticate' header to 'Basic'
        res.status(401).set('WWW-Authenticate', 'Basic')
        res.send("Invalid Auth Username")
    } 
}

module.exports = auth;