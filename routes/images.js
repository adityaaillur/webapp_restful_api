const express = require('express');
const {PostAllProductImages,GetImage,GetAllImages,DeleteAllImages} = require("../controllers/imageController");

const router = express.Router();

const productAuth = require("../auth/productAuth");

const apiCallCounter = require("../aws/cloud-watch")

//Routes for Adding the images

//POST
router.post("/product/:productId/image",productAuth, PostAllProductImages);

//GET
router.get("/product/:productId/image/:imageId", productAuth, GetImage);

//GETALL
router.get("/product/:productId/image", productAuth, GetAllImages);

//DELETE
router.delete("/product/:productId/image/:imageId",productAuth, DeleteAllImages);

module.exports = router;