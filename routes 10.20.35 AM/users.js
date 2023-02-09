const express = require('express');
const { GetAllUsers,PostAllUsers, PutAllUsers } = require("../controllers/userController");

const checkAuth = require("../auth/basicAuth");

const router = express.Router();

// all routes should start with / as this is give / users in the index.js

//GET
router.get("/user/:userId", checkAuth, GetAllUsers);

//POST
router.post("/user/", PostAllUsers);

//INSERT
router.put("/user/:userId", checkAuth, PutAllUsers);


module.exports = router;