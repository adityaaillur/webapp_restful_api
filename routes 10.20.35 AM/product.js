const express = require('express');
const { PostAllProducts, GetAllProducts,PutAllProducts,PatchAllProducts,DeleteAllProducts} = require("../controllers/productController");

const router = express.Router();

const productAuth = require("../auth/productAuth");

// all routes should start with / as this is give / users in the index.js

// //GET
router.get("/product/:productId", GetAllProducts);

//POST
router.post("/product/",productAuth, PostAllProducts);

// INSERT
router.put("/product/:productId",productAuth, PutAllProducts);

// PATCH
router.patch("/product/:productId",productAuth, PatchAllProducts);

// //DELETE
router.delete("/product/:productId",productAuth, DeleteAllProducts);

module.exports = router;