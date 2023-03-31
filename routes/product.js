const express = require('express');
const { PostAllProducts, GetAllProducts,PutAllProducts,PatchAllProducts,DeleteAllProducts,PostAllProductImages} = require("../controllers/productController");

const router = express.Router();

const productAuth = require("../auth/productAuth");

// all routes should start with / as this is give / users in the index.js

// Routes for Adding the product
// //GET
router.get("/product/:productId", apiCallCounter, GetAllProducts);

//POST
router.post("/product/",apiCallCounter, productAuth, PostAllProducts);

// INSERT
router.put("/product/:productId",apiCallCounter, productAuth, PutAllProducts);

// PATCH
router.patch("/product/:productId",apiCallCounter, productAuth, PatchAllProducts);

// //DELETE
router.delete("/product/:productId",apiCallCounter, productAuth, DeleteAllProducts);

module.exports = router;