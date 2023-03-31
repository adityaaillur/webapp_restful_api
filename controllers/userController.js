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
            }
        });

        if(userFound == null ){
            res.status(400).send("The user-id doesn't exists")
            logger.customerLogger.error('error','No such User-ID!')
        }else{
            res.status(200);
            res.send(userFound);
            console.log("//GET"+ '\n' +  JSON.stringify(userFound) +  "is fetched")
        }

    }else{
        res.status(400).send(error);
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
                        }
                    });

                    if(userFound != null ){
                        res.status(400).send("The account already exists")
                        logger.customerLogger.error('error','Account already exist!')
                    }else{
                        await User.create({
                            firstName : firstName,
                            lastName : lastName,
                            username : email,
                            password : hashedPassword,
                        }).catch((err) => {
                            if(err){
                                console.log(err);
                            }
                        });
                        res.status(201)
                        const userLoaded = await User.findOne({
                            attributes: {exclude: ['password']},
                            where: { username: email },
                        }).catch((err) => {
                            if(err){
                                console.log(err);
                            }
                        });
                        res.send(userLoaded);
                    }

            }else{
                res.status(400).send("Invalid email or password");
                logger.customerLogger.error('error','Invalid Credentials!')
            }
        }else{
            res.status(400).send("Empty firstName or lastName");
            logger.customerLogger.error('error','Null fName or lName!')
        }
    }else{
        res.status(400).send("Un-intended Key or No key is being sent ");
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
                                }
                            });

                            if(userFound == null){
                                res.status(400).send("The account doesn't exists")
                                logger.customerLogger.error('error','No such Account!')
                            }else{
                                if(userFound.username == email){
                                    userFound.update({
                                        firstName: firstName,
                                        lastName: lastName,
                                        username:email,
                                        password:hashedPassword
                                    }, { merge: true }).then(() => {
                                        res.status(200).send("User account updated successfully");
                                        logger.customerLogger.error('error','Account updated successfully!')
                                        console.log("//PUT"+ '\n' +  JSON.stringify(userFound) +  "is updated")
                                    }).catch((error) => {
                                    console.error("Error updating user: ", error);
                                    }); 
                                }else{
                                    res.status(400).send("The username is wrong")
                                    logger.customerLogger.error('error','Invalid Username!')
                                }
                            }
                
                    }else{
                        res.status(400).send("Invalid email or password");
                        logger.customerLogger.error('error','Invalid Credentials!')
                    }
    
                }else{
                    res.status(400).send("The firstName or lastName that needs to updated is Empty");
                    logger.customerLogger.error('error','Null fname or lName!')
                }
    
        }else{
            res.status(403).send(error);
        }

    }else{
        res.status(400).send("Un-intended Key or No key  is being sent ");
    }
};

module.exports = {
    GetAllUsers,
    PostAllUsers,
    PutAllUsers
};