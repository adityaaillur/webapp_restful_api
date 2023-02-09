const {validateNumber,
    validatePassword,
    validateEmail,
    validateFirstAndLastName,
    encryptPassword,
    checkResponseForPost} = require('../validation/validation');
const {User} = require('../models')

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
            res.status(400).send("The userid doesn't exists")
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
            }
        }else{
            res.status(400).send("Empty firstName or LastName");
        }
    }else{
        res.status(400).send("UnIntened Key or No key is being sent ");
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
                            }else{
                                if(userFound.username == email){
                                    userFound.update({
                                        firstName: firstName,
                                        lastName: lastName,
                                        username:email,
                                        password:hashedPassword
                                    }, { merge: true }).then(() => {
                                        res.status(200).send("User account updated successfully");
                                        console.log("//PUT"+ '\n' +  JSON.stringify(userFound) +  "is updated")
                                    }).catch((error) => {
                                    console.error("Error updating user: ", error);
                                    }); 
                                }else{
                                    res.status(400).send("The username is wrong")
                                }
                            }
                
                    }else{
                        res.status(400).send("Invalid email or password");
                    }
    
                }else{
                    res.status(400).send("The firstName or LastName that needs to updated is Empty");
                }
    
        }else{
            res.status(403).send(error);
        }

    }else{
        res.status(400).send("UnIntened Key or No key  is being sent ");
    }
};

module.exports = {
    GetAllUsers,
    PostAllUsers,
    PutAllUsers
};