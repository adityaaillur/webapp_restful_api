require('dotenv').config()
const fs = require('fs');
const S3 = require('aws-sdk/clients/s3')

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
})

// uploads a file to s3

function uploadFile(file) {

    const fileStream = fs.createReadStream(file.path)
  
    const uploadParams = {
      Bucket: bucketName,
      Body: fileStream,
      Key: file.filename
    }
  
    return s3.upload(uploadParams).promise()
}

exports.uploadFile = uploadFile

//delete a file to s3

function deleteFile(key) { 
    console.log(key);
    const deleteParams = {
      Bucket: bucketName,
      Key: key
    }
  
    return s3.deleteObject(deleteParams).promise()
}

exports.deleteFile = deleteFile



