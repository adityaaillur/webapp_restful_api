const {     validateNumber,
    validatePassword,
    validateEmail,
    validateFirstAndLastName,
    encryptPassword,
    checkResponseForPost} = require('../validation/validation');
const {User} = require('../models')

const logger = require('../logger/logger')

const GetAllUsers = async (req,res) => { 
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
                logger.customerLogger.error('DB Error: User is not found during the get of User')    
            }
        });

        if(userFound == null ){
            res.status(400).send("The userid doesn't exists")
            logger.customerLogger.error('The userid does not exists')

        }else{
            res.status(200);
            res.send(userFound);
            logger.customerLogger.info("//GET"+ '\n' +  JSON.stringify(userFound) +  "is fetched")
            console.log("//GET"+ '\n' +  JSON.stringify(userFound) +  "is fetched")
        }

    }else{
        res.status(400).send(error);
        logger.customerLogger.error('The Invalid Id')
    }

};

const PostAllUsers = async (req,res) => {
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
                            logger.customerLogger.error('DB Error: User is not found during the post of User') 
                        }
                    });

                    if(userFound != null ){
                        res.status(400).send("The account already exists")
                        logger.customerLogger.error('The account already exists')
                    }else{
                        await User.create({
                            firstName : firstName,
                            lastName : lastName,
                            username : email,
                            password : hashedPassword,
                        }).catch((err) => {
                            if(err){
                                console.log(err);
                                logger.customerLogger.error("DB Error: can't create a user")
                            }
                        });
                        res.status(201)
                        logger.customerLogger.info('The User account is created')
                        const userLoaded = await User.findOne({
                            attributes: {exclude: ['password']},
                            where: { username: email },
                        }).catch((err) => {
                            if(err){
                                console.log(err);
                                logger.customerLogger.error("DB Error: can't find the created a user")
                            }
                        });
                        res.send(userLoaded);
                    }

            }else{
                res.status(400).send("Invalid email or password");
                logger.customerLogger.error("Invalid email or password")
            }
        }else{
            res.status(400).send("Empty firstName or LastName");
            logger.customerLogger.error("Empty firstName or LastName")
        }
    }else{
        res.status(400).send("UnIntened Key or No key is being sent ");
        logger.customerLogger.error("UnIntened Key or No key is being sent")
    }
    
};

const PutAllUsers = async (req,res) => {
    
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
                                    logger.customerLogger.error('DB Error: User is not found during the put of User') 
                                }
                            });

                            if(userFound == null){
                                res.status(400).send("The account doesn't exists")
                                logger.customerLogger.error("The account doesn't exists") 
                            }else{
                                if(userFound.username == email){
                                    userFound.update({
                                        firstName: firstName,
                                        lastName: lastName,
                                        username:email,
                                        password:hashedPassword
                                    }, { merge: true }).then(() => {
                                        res.status(200).send("User account updated successfully");
                                        logger.customerLogger.info("User account updated successfully") 
                                        console.log("//PUT"+ '\n' +  JSON.stringify(userFound) +  "is updated")
                                    }).catch((error) => {
                                    console.error("Error updating user: ", error);
                                    logger.customerLogger.error('DB Error: Error updating user')
                                    }); 
                                }else{
                                    res.status(400).send("The username is wrong")
                                    logger.customerLogger.error('The username is wrong')
                                }
                            }
                
                    }else{
                        res.status(400).send("Invalid email or password");
                        logger.customerLogger.error('Invalid email or password')
                    }
    
                }else{
                    res.status(400).send("The firstName or LastName that needs to updated is Empty");
                    logger.customerLogger.error('The firstName or LastName that needs to updated is Empty')                    
                }
    
        }else{
            res.status(403).send(error);
            logger.customerLogger.error('Invalid Id')    
        }

    }else{
        res.status(400).send("UnIntened Key or No key  is being sent ");
        logger.customerLogger.error('UnIntened Key or No key  is being sent') 
    }
};

module.exports = {
    GetAllUsers,
    PostAllUsers,
    PutAllUsers
};