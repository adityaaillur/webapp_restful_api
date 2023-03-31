const express = require('express');
const { GetAllUsers,PostAllUsers, PutAllUsers } = require("../controllers/userController");

const checkAuth = require("../auth/basicAuth");

const apiCallCounter = require("../aws/cloud-watch")

const router = express.Router();

// all routes should start with / as this is give / users in the index.js

//GET
router.get("/user/:userId", apiCallCounter, checkAuth, GetAllUsers);

//POST
router.post("/user/", apiCallCounter, PostAllUsers);

//INSERT
router.put("/user/:userId",apiCallCounter, checkAuth, PutAllUsers);

module.exports = router;