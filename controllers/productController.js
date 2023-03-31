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
                        logger.customerLogger.error('DB Error: User is not found during the post of Product')    
                    }
                });

                const productFound = await Product.findOne({
                    where: { sku: sku },
                }).catch((err) => {
                    if(err){
                        console.log(err);
                        logger.customerLogger.error('DB Error: ProductFound issue during the post of Product')  
                    }
                });

                console.log(productFound);

                if(productFound != null){
                    res.status(400).send("SKU needs to be unique");
                    logger.customerLogger.error('SKU needs to be unique')  
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
                            logger.customerLogger.error('DB Error: Product is not created during the post of Product') 
                        }
                    });
    
                    res.status(201)
                    logger.customerLogger.info('Created the Product Sucessfully') 
                    const productLoaded = await Product.findOne({
                        where: { sku: sku },
                    }).catch((err) => {
                        if(err){
                            console.log(err);                 
                            logger.customerLogger.error('DB Error: Product created during the post of Product is not been able to fetch') 
                        }
                    });
                    res.send(productLoaded);
    
                }
                
            }else{
                res.status(400).send("Please give the Quantity of Product which nedds to more than 0 and less than 100");
                logger.customerLogger.error('Please give the Quantity of Product which nedds to more than 0 and less than 100')
            }
        }else{
            res.status(400).send("Please give values to name,description,sku or manufacturer");
            logger.customerLogger.error('Please give values to name,description,sku or manufacturer')
        }
    }else{
        res.status(400).send("UnIntened Key or No key  is being sent ");
        logger.customerLogger.error('UnIntened Key or No key  is being sent')
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
                logger.customerLogger.error('DB Error: Product is not found during the get of Product')    
            }
        });

        if(productFound == null ){
            res.status(403).send("The ProductId doesn't exists")
            logger.customerLogger.error('The ProductId does not exists')
        }else{
            res.status(200);
            res.send(productFound);
            console.log("//GET"+ '\n' +  JSON.stringify(productFound) +  "is fetched")
            logger.customerLogger.info("//GET"+ '\n' +  JSON.stringify(productFound) +  "is fetched")
        }

    }else{
        res.status(400).send(error);
        logger.customerLogger.error('The ProductId does not exists')
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
                                logger.customerLogger.error('DB Error: User is not found during the Put of Product')  
                            }
                        });
        
                        const productFound = await Product.findOne({
                            where: { id: productId },
                        }).catch((err) => {
                            if(err){
                                console.log(err);
                                logger.customerLogger.error('DB Error: ProductFound issues during the Put of Product')
                            }
                        });
        
                        if(productFound == null){
                            res.status(403).send("ProductId doesn't exists");
                            logger.customerLogger.error("ProductId doesn't exists")
                        }else{

                            const productSku = await Product.findOne({
                                where: { sku: sku },
                            }).catch((err) => {
                                if(err){
                                    console.log(err);
                                    logger.customerLogger.error('DB Error: Fetching the product with sku issue')
                                }
                            });

                            if(productSku != null && productFound.sku != productSku.sku){
                                res.status(400).send("SKU needs to be unique");
                                logger.customerLogger.error("SKU needs to be unique")
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
                                    logger.customerLogger.info("Product account updated successfully")
                                    console.log("//PUT"+ '\n' +  JSON.stringify(userFound) +  "is updated")
                                }).catch((error) => {
                                console.error("Error updating user: ", error);
                                logger.customerLogger.error('DB Error: Error Updating the Product')
                                }); 
                                
                            }
                        }
                        
                    }else{
                        res.status(400).send("Please give the Quantity of Product which nedds to more than 0 and less than 100");
                        logger.customerLogger.error("Please give the Quantity of Product which nedds to more than 0 and less than 100")
                    }
    
                }else{
                    res.status(400).send("Please give values to name,description,sku or manufacturer");
                    logger.customerLogger.error("Please give values to name,description,sku or manufacturer")
                }
        
            }else{
                res.status(403).send(error);
                logger.customerLogger.error("Invalid Id")               
            }

        }else{
            res.status(400).send("UnIntened Key is being sent ");
            logger.customerLogger.error("UnIntened Key is being sent")  
        }
    }
    else{
        res.status(204).send("No Content");
        logger.customerLogger.error("No Content")
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
                            attributes: {exclude: ['password']},
                            where: { username: username },
                        }).catch((err) => {
                            if(err){
                                console.log(err);
                                logger.customerLogger.error('DB Error: User is not found during the Patch of Product')
                            }
                        });
        
                        const productFound = await Product.findOne({
                            where: { id: productId },
                        }).catch((err) => {
                            if(err){
                                console.log(err);
                                logger.customerLogger.error('DB Error: ProductFound issues during the Patch of Product')
                            }
                        });
        
                        if(productFound == null){
                            res.status(403).send("Product doesn't exists");
                            logger.customerLogger.error("Product doesn't exists")
                        }else{

                            const productSku = await Product.findOne({
                                where: { sku: sku },
                            }).catch((err) => {
                                if(err){
                                    console.log(err);
                                    logger.customerLogger.error("DB Error: Fetching the product with sku issue")
                                }
                            });

                            if(productSku != null && productFound.sku != productSku.sku){
                                res.status(400).send("SKU needs to be unique");
                                logger.customerLogger.error("SKU needs to be unique")
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
                                    console.log("//PATCH"+ '\n' +  JSON.stringify(userFound) +  "is updated")
                                    logger.customerLogger.info("//PATCH"+ '\n' +  JSON.stringify(userFound) +  "is updated")
                                }).catch((error) => {
                                console.error("Error updating user: ", error);
                                logger.customerLogger.error('DB Error: Error Patching the Product')
                                }); 
                                
                            }
                        }
                        
                    }else{
                        res.status(400).send("Please give the Quantity of Product which nedds to more than 0 and less than 100");
                        logger.customerLogger.error('Please give the Quantity of Product which nedds to more than 0 and less than 100')
                    }
           
            }else{
                res.status(403).send(error);
                logger.customerLogger.error("Invalid Id")
            }

        }else{
            res.status(400).send("UnIntened Key is being sent ");
            logger.customerLogger.error("UnIntened Key is being sent")
        }
    }
    else{
        res.status(204).send("No Content");
        logger.customerLogger.error("No Content")
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
                logger.customerLogger.error('DB Error: ProductFound issues during the Delete of Product')
            }
        });

       if(productFoundOne != null){
        const imagesFound = await Images.findAll({
            where: { product_id: productId },
        }).catch((err) => {
            if(err){
                console.log(err);
                logger.customerLogger.error('DB Error: Image fetch issues during the Delete of Product')
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
                    logger.customerLogger.error('DB Error: Images delete issues during the Delete of Product')
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
                logger.customerLogger.error('DB Error: Product fetch issues during the Delete of Product')
            }
        });

        res.status(200).send("Product is Deleted")
        console.log("//Delete"+ '\n' +  JSON.stringify(productFound) +  "is deleted")
        logger.customerLogger.info('DB Error: Product Deleted Sucessfully')
        }

    }else{
        res.status(404).send(error);
        logger.customerLogger.info('Invalid Id')
    }

};

module.exports = {
    PostAllProducts,
    GetAllProducts,
    PutAllProducts,
    PatchAllProducts,
    DeleteAllProducts
};
