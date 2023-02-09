const {
    validateProduct,
    checkResponseForPostProduct,
    validateQuantity,
    validateNumber,
    validateQuantityPatch} = require('../validation/validation');
const {Product} = require('../models')
const {User} = require('../models')

const PostAllProducts = async (req,res) => {
    const response = req.body;
    const name = req.body.name;
    const description = req.body.description;
    const sku = req.body.sku;
    const manufacturer = req.body.manufacturer;
    const quantity = req.body.quantity;

    let responseErr = checkResponseForPostProduct(response);
    let nameErr = validateProduct(name);
    let descriptionErr = validateProduct(description);
    let skuErr = validateProduct(sku);
    let manufacturerErr = validateProduct(manufacturer);
    let quantityErr = validateQuantity(quantity);

    const auth = req.headers.authorization;

    const [username, password] = new Buffer.from(auth.split(" ")[1], "base64")
    .toString()
    .split(":");

    if(responseErr){

        if(nameErr && descriptionErr && skuErr && manufacturerErr)
        {
            if(quantityErr){

                const userFound = await User.findOne({
                    where: { username: username },
                }).catch((err) => {
                    if(err){
                        console.log(err);
                    }
                });

                const productFound = await Product.findOne({
                    where: { sku: sku },
                }).catch((err) => {
                    if(err){
                        console.log(err);
                    }
                });

                console.log(productFound);

                if(productFound != null){
                    res.status(400).send("SKU needs to be unique");
                }else{
                    await Product.create({
                        name:name,
                        description:description,
                        sku:sku,
                        manufacturer:manufacturer,
                        quantity:quantity,
                        owner_user_id:userFound.id
                    }).catch((err) => {
                        if(err){
                            console.log(err);
                        }
                    });
    
                    res.status(201)
                    const productLoaded = await Product.findOne({
                        where: { sku: sku },
                    }).catch((err) => {
                        if(err){
                            console.log(err);
                        }
                    });
                    res.send(productLoaded);
    
                }
                
            }else{
                res.status(400).send("Invalid quantity: Please enter a value between 1 and 100.");
            }
        }else{
            res.status(400).send("Missing information: Please provide values for name, description, SKU, and manufacturer.");
        }
    }else{
        res.status(400).send("Unexpected key detected: Please remove the unintended key.");
    }
    
};

const GetAllProducts = async (req,res) => { 
    const productId = req.params.productId;
    const error = "Invalid id"

    let idError = productId => validateNumber;

    if(idError){

        const productFound = await Product.findOne({
            where: { id: productId },
        }).catch((err) => {
            if(err){
                console.log(err);
            }
        });

        if(productFound == null ){
            res.status(403).send("Invalid Product ID: Product not found.")
        }else{
            res.status(200);
            res.send(productFound);
            console.log("//GET"+ '\n' +  JSON.stringify(productFound) +  "is fetched")
        }

    }else{
        res.status(400).send(error);
    }

};

const PutAllProducts = async (req,res) => {
    
    const response = req.body;
    const name = req.body.name;
    const description = req.body.description;
    const sku = req.body.sku;
    const manufacturer = req.body.manufacturer;
    const quantity = req.body.quantity;
    const productId = req.params.productId;

    let responseErr = checkResponseForPostProduct(response);
    let nameErr = validateProduct(name);
    let descriptionErr = validateProduct(description);
    let skuErr = validateProduct(sku);
    let manufacturerErr = validateProduct(manufacturer);
    let quantityErr = validateQuantity(quantity);
    let productIdErr = validateNumber(productId);

    const error = "Invalid productId"

    const auth = req.headers.authorization;

    const [username, password] = new Buffer.from(auth.split(" ")[1], "base64")
    .toString()
    .split(":");

    if(Object.keys(response).length != 0){

        if(responseErr){

            if(productIdErr){ 

                if(nameErr && descriptionErr && skuErr && manufacturerErr)
                {
                    if(quantityErr){

                        const userFound = await User.findOne({
                            where: { username: username },
                        }).catch((err) => {
                            if(err){
                                console.log(err);
                            }
                        });
        
                        const productFound = await Product.findOne({
                            where: { id: productId },
                        }).catch((err) => {
                            if(err){
                                console.log(err);
                            }
                        });
        
                        if(productFound == null){
                            res.status(403).send("Product not found...");
                        }else{

                            const productSku = await Product.findOne({
                                where: { sku: sku },
                            }).catch((err) => {
                                if(err){
                                    console.log(err);
                                }
                            });

                            if(productSku != null && productFound.sku != productSku.sku){
                                res.status(400).send("SKU already exists: Unique SKU required.");
                            }else{
                                Product.update({
                                    name:name,
                                    description:description,
                                    sku:sku,
                                    manufacturer:manufacturer,
                                    quantity:quantity
                                },{
                                    where: { id: productId }
                                  },
                                  { merge: true }).then(() => {
                                    res.status(200).send("Product account update successful.");
                                    console.log("//PUT"+ '\n' +  JSON.stringify(userFound) +  "is updated")
                                }).catch((error) => {
                                console.error("Error updating user: ", error);
                                }); 
                                
                            }
                        }
                        
                    }else{
                        res.status(400).send("Invalid quantity: Please enter a value between 1 and 100.");
                    }
    
                }else{
                    res.status(400).send("Missing information: Please provide values for name, description, SKU, and manufacturer.");
                }
        
            }else{
                res.status(403).send(error);
            }

        }else{
            res.status(400).send("Unexpected key detected: Please remove the unintended key.");
        }
    }
    else{
        res.status(204).send("No Content");
    }
};

const PatchAllProducts = async (req,res) => {
    
    const response = req.body;
    const name = req.body.name;
    const description = req.body.description;
    const sku = req.body.sku;
    const manufacturer = req.body.manufacturer;
    const quantity = req.body.quantity;
    const productId = req.params.productId;

    let responseErr = checkResponseForPostProduct(response);
    let quantityErr = validateQuantityPatch(quantity);
    let productIdErr = validateNumber(productId);

    const error = "Invalid productId"

    const auth = req.headers.authorization;

    const [username, password] = new Buffer.from(auth.split(" ")[1], "base64")
    .toString()
    .split(":");

    if(Object.keys(response).length != 0){

        if(responseErr){

            if(productIdErr){ 

                    if(quantityErr){

                        const userFound = await User.findOne({
                            where: { username: username },
                        }).catch((err) => {
                            if(err){
                                console.log(err);
                            }
                        });
        
                        const productFound = await Product.findOne({
                            where: { id: productId },
                        }).catch((err) => {
                            if(err){
                                console.log(err);
                            }
                        });
        
                        if(productFound == null){
                            res.status(403).send("Product doesn't exists");
                        }else{

                            const productSku = await Product.findOne({
                                where: { sku: sku },
                            }).catch((err) => {
                                if(err){
                                    console.log(err);
                                }
                            });

                            if(productSku != null && productFound.sku != productSku.sku){
                                res.status(400).send("SKU needs to be unique");
                            }else{
                                Product.update({
                                    name: name,
                                    description:description,
                                    sku:sku,
                                    manufacturer:manufacturer,
                                    quantity:quantity
                                },{
                                    where: { id: productId }
                                  },
                                  { merge: true }).then(() => {
                                    res.status(200).send("Product account update successful.");
                                    console.log("//PATCH"+ '\n' +  JSON.stringify(userFound) +  "is updated")
                                }).catch((error) => {
                                console.error("Error updating user: ", error);
                                }); 
                                
                            }
                        }
                        
                    }else{
                        res.status(400).send("Invalid quantity: Please enter a value between 1 and 100.");
                    }
           
            }else{
                res.status(403).send(error);
            }

        }else{
            res.status(400).send("Unexpected key detected: Please remove the unintended key.");
        }
    }
    else{
        res.status(204).send("No Content");
    }
};

const DeleteAllProducts = async (req,res) => { 
    const productId = req.params.productId;
    const error = "Invalid id"

    let idError = productId => validateNumber;

    if(idError){

       const productFound =  await Product.destroy({
            where: { id: productId },
        }).catch((err) => {
            if(err){
                console.log(err);
            }
        });

        res.status(200).send("Product is Deleted")
        console.log("//Delete"+ '\n' +  JSON.stringify(productFound) +  "is deleted")


    }else{
        res.status(404).send(error);
    }

};

module.exports = {
    PostAllProducts,
    GetAllProducts,
    PutAllProducts,
    PatchAllProducts,
    DeleteAllProducts
};
