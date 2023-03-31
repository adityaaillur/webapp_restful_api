const {
    validateProduct,
    checkResponseForPostProduct,
    validateQuantity,
    validateNumber,
    validateQuantityPatch} = require('../validation/validation');
    const {Product,User,Images} = require('../models')
    const {deleteFile} = require('../aws/s3')
    const logger = require('../logger/logger')
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
                    logger.customerLogger.error('error','Not an Unique SKU')
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
                res.status(400).send("Please give the Quantity of Product which nedds to more than 0 and less than 100");
                logger.customerLogger.error('error','Invalid Quantity!')
            }
        }else{
            res.status(400).send("Please give values to name,description,sku or manufacturer");
            logger.customerLogger.error('error','Values Missing!')
        }
    }else{
        res.status(400).send("Un-intended Key or No key  is being sent ");
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
            res.status(403).send("The ProductId doesn't exists")
            logger.customerLogger.log('error','Product Not Found!')
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
                            res.status(403).send("ProductId doesn't exists");
                            logger.customerLogger.error('error','Product Not Found!')
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
                                logger.customerLogger.error('error','Unique SKU Required!')
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
                                    res.status(200).send("Product account updated successfully");
                                    console.log("//PUT"+ '\n' +  JSON.stringify(userFound) +  "is updated")
                                    logger.customlogger.info("Product account updated successfully")
                                }).catch((error) => {
                                console.error("Error updating user: ", error);
                                }); 
                                
                            }
                        }
                        
                    }else{
                        res.status(400).send("Please give the Quantity of Product which needs to more than 0 and less than 100");
                        logger.customerLogger.error('error','Invalid Quantity!')
                    }
    
                }else{
                    res.status(400).send("Please give values to name,description,sku or manufacturer");
                    logger.customerLogger.error('error','Values Missing!')
                }
        
            }else{
                res.status(403).send(error);
            }

        }else{
            res.status(400).send("Un-intended Key is being sent ");
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
                            logger.customerLogger.error('error','Product not Found!')
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
                                logger.customerLogger.error('error','Unique SKU required!')
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
                                    res.status(200).send("Product account updated successfully");
                                    logger.customerLogger.error('error','Product Update Successful!')
                                    console.log("//PATCH"+ '\n' +  JSON.stringify(userFound) +  "is updated")
                                    logger.customlogger.info("//PATCH"+ '\n' +  JSON.stringify(userFound) +  "is updated")
                                }).catch((error) => {
                                console.error("Error updating user: ", error);
                                }); 
                                
                            }
                        }
                        
                    }else{
                        res.status(400).send("Please give the Quantity of Product which needs to more than 0 and less than 100");
                        logger.customerLogger.error('error','Invalid Product Quantity!')
                    }
           
            }else{
                res.status(403).send(error);
            }

        }else{
            res.status(400).send("Un-intended Key is being sent ");
        }
    }
    else{
        res.status(204).send("No Content");
        logger.customerLogger.error('error','Content Not Found!')
    }
};

const DeleteAllProducts = async (req,res) => { 
    const productId = req.params.productId;
    const error = "Invalid id"

    let idError = productId => validateNumber;

    if(idError){

        const productFoundOne = await Product.findOne({
            where: { id: productId},
        }).catch((err) => {
            if(err){
                console.log(err);
            }
        });
       if(productFoundOne != null){
        const imagesFound = await Images.findAll({
            where: { product_id: productId },

        }).catch((err) => {
            if(err){
                console.log(err);
            }
        });
        
        console.log(imagesFound);
        if(imagesFound != null ){
            console.log("Got Here")
            await Images.destroy({
                where: { product_id: productId },
            }).catch((err) => {
                if(err){
                    console.log(err);
                }
            });
        }   
        for (const image of imagesFound) {
            await deleteFile(image.file_name);
        }
        const productFound =  await Product.destroy({
            where: { id: productId },
        }).catch((err) => {
            if(err){
                console.log(err);
            }
        });

        res.status(200).send("Product is Deleted")
        console.log("//Delete"+ '\n' +  JSON.stringify(productFound) +  "is deleted")
        logger.customlogger.info('DB Error: Product Deleted Sucessfully')
    }

    }else{
        res.status(404).send(error);
        logger.customlogger.info('Invalid Id')
    }

};

module.exports = {
    PostAllProducts,
    GetAllProducts,
    PutAllProducts,
    PatchAllProducts,
    DeleteAllProducts
};
