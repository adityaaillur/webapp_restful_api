const {     validateNumber,
    validatePassword,
    validateEmail,
    validateFirstAndLastName,
    encryptPassword,
    checkResponseForPost} = require('../validation/validation');
const {User} = require('../models')
const { client } = require('../aws/cloud-watch')

const logger = require('../logger/logger')

const GetAllUsers = async (req,res) => { 

    client.increment('get_user');
    const iduser = req.params.userId;
    const error = "Invalid id"

    let idError = iduser => validateNumber;

    if(idError){

        const userFound = await User.findOne({
            attributes: {exclude: ['password']},
            where: { id: iduser },
        }).catch((err) => {
            if(err){
                console.log(err);
                logger.customlogger.error('DB Error: User is not found during the get of User')    
            }
        });

        if(userFound == null ){
            res.status(400).send("The userid doesn't exists")
            logger.customlogger.error('The userid does not exists')

        }else{
            res.status(200);
            res.send(userFound);
            logger.customlogger.info("//GET"+ '\n' +  JSON.stringify(userFound) +  "is fetched")
            console.log("//GET"+ '\n' +  JSON.stringify(userFound) +  "is fetched")
        }

    }else{
        res.status(400).send(error);
        logger.customlogger.error('The Invalid Id')
    }

};

const PostAllUsers = async (req,res) => {

    client.increment('create_user');
    const response = req.body;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.username;
    const password = req.body.password;

    let responseErr = checkResponseForPost(response);

    let passwordErr = validatePassword(password); 
    let emailError = validateEmail(email);
    let firstNameErr = validateFirstAndLastName(firstName);
    let lastNameErr = validateFirstAndLastName(lastName);

    if(responseErr){

        if(firstNameErr && lastNameErr)
        {
            if(emailError && passwordErr ){
                let hashedPassword= await encryptPassword(password);

                    const userFound = await User.findOne({
                        where: { username: email },
                    }).catch((err) => {
                        if(err){
                            console.log(err);
                            logger.customlogger.error('DB Error: User is not found during the post of User') 
                        }
                    });

                    if(userFound != null ){
                        res.status(400).send("The account already exists")
                        logger.customlogger.error('The account already exists')
                    }else{
                        await User.create({
                            firstName : firstName,
                            lastName : lastName,
                            username : email,
                            password : hashedPassword,
                        }).catch((err) => {
                            if(err){
                                console.log(err);
                                logger.customlogger.error("DB Error: can't create a user")
                            }
                        });
                        res.status(201)
                        logger.customlogger.info('The User account is created')
                        const userLoaded = await User.findOne({
                            attributes: {exclude: ['password']},
                            where: { username: email },
                        }).catch((err) => {
                            if(err){
                                console.log(err);
                                logger.customlogger.error("DB Error: can't find the created a user")
                            }
                        });
                        res.send(userLoaded);
                    }

            }else{
                res.status(400).send("Invalid email or password");
                logger.customlogger.error("Invalid email or password")
            }
        }else{
            res.status(400).send("Empty firstName or LastName");
            logger.customlogger.error("Empty firstName or LastName")
        }
    }else{
        res.status(400).send("UnIntened Key or No key is being sent ");
        logger.customlogger.error("UnIntened Key or No key is being sent")
    }
    
};

const PutAllUsers = async (req,res) => {

    client.increment('put_user');
    
    const response = req.body;
    const iduser = req.params.userId;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.username;
    const password = req.body.password;

    let idError = validateNumber(iduser);
    let responseErr = checkResponseForPost(response);
    let passwordErr = validatePassword(password); 
    let emailError = validateEmail(email);
    let firstNameErr = validateFirstAndLastName(firstName);
    let lastNameErr = validateFirstAndLastName(lastName);

    const error = "Invalid id"

    if(responseErr){

        if(idError){ 

            if(firstNameErr && lastNameErr)
            {
                    if(emailError && passwordErr ){
                        let hashedPassword= await encryptPassword(password);


                            const userFound = await User.findOne({
                                where: { id: iduser },
                            }).catch( err => {
                                if(err){
                                    console.log(err);
                                    logger.customlogger.error('DB Error: User is not found during the put of User') 
                                }
                            });

                            if(userFound == null){
                                res.status(400).send("The account doesn't exists")
                                logger.customlogger.error("The account doesn't exists") 
                            }else{
                                if(userFound.username == email){
                                    userFound.update({
                                        firstName: firstName,
                                        lastName: lastName,
                                        username:email,
                                        password:hashedPassword
                                    }, { merge: true }).then(() => {
                                        res.status(200).send("User account updated successfully");
                                        logger.customlogger.info("User account updated successfully") 
                                        console.log("//PUT"+ '\n' +  JSON.stringify(userFound) +  "is updated")
                                    }).catch((error) => {
                                    console.error("Error updating user: ", error);
                                    logger.customlogger.error('DB Error: Error updating user')
                                    }); 
                                }else{
                                    res.status(400).send("The username is wrong")
                                    logger.customlogger.error('The username is wrong')
                                }
                            }
                
                    }else{
                        res.status(400).send("Invalid email or password");
                        logger.customlogger.error('Invalid email or password')
                    }
    
                }else{
                    res.status(400).send("The firstName or LastName that needs to updated is Empty");
                    logger.customlogger.error('The firstName or LastName that needs to updated is Empty')                    
                }
    
        }else{
            res.status(403).send(error);
            logger.customlogger.error('Invalid Id')    
        }

    }else{
        res.status(400).send("UnIntened Key or No key  is being sent ");
        logger.customlogger.error('UnIntened Key or No key  is being sent') 
    }
};

module.exports = {
    GetAllUsers,
    PostAllUsers,
    PutAllUsers
};