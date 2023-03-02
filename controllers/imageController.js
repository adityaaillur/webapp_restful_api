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


const PostAllProductImages = (req,res,err) => {

    const productId = req.params.productId;

    upload(req, res, async function (err) {
        if (err) {
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_COUNT') {
              // Too many files error
              res.status(400).send('Too many files');
            } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
              // Unexpected field error
              res.status(400).send('Unexpected field or Too many Files');
            } else {
              // Some other Multer error occurred
              res.status(400).send('Multer error');
            }
          } else {
            // An unknown error occurred
            res.status(400).send('Unknown error');
          }
        } else {
          // Check if multiple files were sent
          if (!req.file) {
            res.status(400).send('No files were sent');
          } else if (req.file.mimetype.startsWith('image/')) {
            const file = req.file;
            console.log(file)
            const result = await uploadFile(file)
            await unlinkFile(file.path)
            const imageFound = await Images.findOne({
                where: { file_name: result.key },
            }).catch((err) => {
                if(err){
                    console.log(err);
                }
            });

            if(imageFound != null ){
                res.status(400).send("The account already exists")
            }else{
                await Images.create({
                    product_id : productId,
                    file_name: result.key,
                    s3_bucket_path : result.Location,
                }).catch((err) => {
                    if(err){
                        console.log(err);
                    }
                });
                res.status(201)
                const imageLoaded = await Images.findOne({
                    where: { file_name: result.key },
                }).catch((err) => {
                    if(err){
                        console.log(err);
                    }
                });
                res.send(imageLoaded);
            }
            console.log(result);
          } else {
            res.status(400).send('Image file is not sent');
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
            }
        });

        if(imageFound == null ){
            res.status(403).send("The imageId doesn't exists")
        }else{
                res.status(200);
                res.send(imageFound);
                console.log("//GET"+ '\n' +  JSON.stringify(imageFound) +  "is fetched")  
        }
            
    }else{
        res.status(403).send(error);
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
            }
        });

        if(imagesFound == null ){
            res.status(403).send("The product Id doesn't exists")
        }else{
            res.status(200);
            res.send(imagesFound);
        }           
    }else{
        res.status(403).send(error);
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
            }
        });

        if(imageFound == null){
            res.status(404).send("ImageId dosen't exists")
        }else{
            await Images.destroy({
                where: { product_id: productId, 
                    image_id: imageId },
            }).catch((err) => {
                if(err){
                    console.log(err);
                }
            });
    
            console.log(imageFound.file_name);
    
            const result = await deleteFile(imageFound.file_name)
        }

        res.status(200).send("Image is Deleted")
        console.log("//Delete"+ '\n' +  JSON.stringify(imageFound) +  "is deleted")


    }else{
        res.status(404).send(error);
    }

};

module.exports = {
    PostAllProductImages,
    GetImage,
    GetAllImages,
    DeleteAllImages
};
