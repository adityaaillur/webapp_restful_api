const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)

const {Images} = require('../models')

const multer  = require('multer')

const upload = multer({ dest: 'uploads/'}).single('image');

const {uploadFile,deleteFile} = require('../aws/s3')

const {
    validateNumber
}= require('../validation/validation');

const logger = require('../logger/logger')

const PostAllProductImages = (req,res,err) => {

    const productId = req.params.productId;

    upload(req, res, async function (err) {
        if (err) {
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_COUNT') {
              // Too many files error
              res.status(400).send('Too many files');
              logger.customerLogger.error('Too many files')
            } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
              // Unexpected field error
              res.status(400).send('Unexpected field or Too many Files');
              logger.customerLogger.error('Unexpected field or Too many Files')
            } else {
              // Some other Multer error occurred
              res.status(400).send('Multer error');
              logger.customerLogger.error('Multer error')
            }
          } else {
            // An unknown error occurred
            res.status(400).send('Unknown error');
            logger.customerLogger.error('Unknown error')
          }
        } else {
          // Check if multiple files were sent
          if (!req.file) {
            res.status(400).send('No files were sent');
            logger.customerLogger.error('No files were sent')
          } else if (req.file.mimetype.startsWith('image/')) {
            const file = req.file;
            console.log(file)
            const result = await uploadFile(file)
            logger.customerLogger.info('S3: Image Found is uploaded to the bucket')   
            await unlinkFile(file.path)
            const imageFound = await Images.findOne({
                where: { file_name: result.key },
            }).catch((err) => {
                if(err){
                    console.log(err);
                    logger.customerLogger.error('DB Error: Image is not found during the post of Image')    
                }
            });

            if(imageFound != null ){
                res.status(400).send("The account already exists")
                logger.customerLogger.error('The account already exists')
            }else{
                await Images.create({
                    product_id : productId,
                    file_name: result.key,
                    s3_bucket_path : result.Location,
                }).catch((err) => {
                    if(err){
                        console.log(err);
                        logger.customerLogger.error('DB:Error Not able to upload the file')
                    }
                });
                res.status(201)
                logger.customerLogger.info('Image info is added to the Database')
                const imageLoaded = await Images.findOne({
                    where: { file_name: result.key },
                }).catch((err) => {
                    if(err){
                        console.log(err);
                        logger.customerLogger.error('DB:Error Not able to find the image')
                    }
                });
                res.send(imageLoaded);
            }
            console.log(result);
          } else {
            res.status(400).send('Image file is not sent');
            logger.customerLogger.error('Image file is not sent')
          }
        }
      });
};

const GetImage = async (req,res) => { 
    const productId = req.params.productId;
    const imageId = req.params.imageId;
    const error = "Invalid id's"

    let idErrorPro = validateNumber(productId);
    let idErrorImage = imageId => validateNumber;

    if(idErrorPro && idErrorImage){

        const imageFound = await Images.findOne({
            where: { product_id: productId, 
                image_id: imageId },
        }).catch((err) => {
            if(err){
                console.log(err);
                logger.customerLogger.error('DB Error: Image is not found during the get of Image')   
            }
        });

        if(imageFound == null ){
            res.status(403).send("The imageId doesn't exists")
            logger.customerLogger.error("The imageId doesn't exists")   
        }else{
                res.status(200);
                res.send(imageFound);
                console.log("//GET"+ '\n' +  JSON.stringify(imageFound) +  "is fetched")  
                logger.customerLogger.info("//GET"+ '\n' +  JSON.stringify(imageFound) +  "is fetched")   
        }
            
    }else{
        res.status(403).send(error);
        logger.customerLogger.error(error)   
    }

};

const GetAllImages = async (req,res) => { 
    const productId = req.params.productId;
    const error = "Invalid Product id"

    let idErrorPro = validateNumber(productId);

    if(idErrorPro){

        const imagesFound = await Images.findAll({
            where: { product_id: productId },
        }).catch((err) => {
            if(err){
                console.log(err);
                logger.customerLogger.error('DB Error: Images is not found during the get all Images')   
            }
        });

        if(imagesFound == null ){
            res.status(403).send("The product Id doesn't exists")
            logger.customerLogger.error("The product Id doesn't exists") 
        }else{
            res.status(200);
            res.send(imagesFound);
            logger.customerLogger.info("//GET"+ '\n' +  JSON.stringify(imagesFound) +  "is fetched") 
        }           
    }else{
        res.status(403).send(error);
        logger.customerLogger.error(error) 
    }
};

const DeleteAllImages = async (req,res) => { 
    const productId = req.params.productId;
    const imageId = req.params.imageId;
    const error = "Invalid id's"

    let idErrorPro = validateNumber(productId);
    let idErrorImage = imageId => validateNumber;

    if(idErrorPro && idErrorImage){

        const imageFound = await Images.findOne({
            where: { product_id: productId, 
                image_id: imageId },
        }).catch((err) => {
            if(err){
                console.log(err);
                logger.customerLogger.error('DB Error: Images is not found during the delete of Image')
            }
        });

        if(imageFound == null){
            res.status(404).send("ImageId dosen't exists")
            logger.customerLogger.error("ImageId dosen't exists")
        }else{
            await Images.destroy({
                where: { product_id: productId, 
                    image_id: imageId },
            }).catch((err) => {
                if(err){
                    console.log(err);
                    logger.customerLogger.error('DB Error: Images is not able to delete during the delete of Image')
                }
            });
    
            console.log(imageFound.file_name);
    
            const result = await deleteFile(imageFound.file_name)
            logger.customerLogger.info('S3: Image is deleted Successfully')
        }

        res.status(200).send("Image is Deleted")
        console.log("//Delete"+ '\n' +  JSON.stringify(imageFound) +  "is deleted")
        logger.customerLogger.info('Image is deleted Successfully from DB')


    }else{
        res.status(404).send(error);
        logger.customerLogger.error(error)
    }

};

module.exports = {
    PostAllProductImages,
    GetImage,
    GetAllImages,
    DeleteAllImages
};
