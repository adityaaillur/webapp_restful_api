const express = require('express');
const { PostAllProducts, GetAllProducts,PutAllProducts,PatchAllProducts,DeleteAllProducts,PostAllProductImages} = require("../controllers/productController");

const router = express.Router();

const productAuth = require("../auth/productAuth");

const apiCallCounter = require("../aws/cloud-watch")

// all routes should start with / as this is give / users in the index.js

// Routes for Adding the product
// //GET
router.get("/product/:productId", GetAllProducts);

//POST
router.post("/product/", productAuth, PostAllProducts);

// INSERT
router.put("/product/:productId", productAuth, PutAllProducts);

// PATCH
router.patch("/product/:productId", productAuth, PatchAllProducts);

// //DELETE
router.delete("/product/:productId", productAuth, DeleteAllProducts);




module.exports = router;