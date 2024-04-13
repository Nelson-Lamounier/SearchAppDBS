const path = require("path");

const express = require("express");

const userController = require("../controllers/user");

const router = express.Router();


router.get('/create-profile', userController.getAddUser)

// router.get('/create-profile', userController.getUser)

router.post('/create-profile', userController.postAddUser)

router.get('/user-profile', userController.getUser)

router.get('/saved-jobs', userController.getUserSavedJobs)



module.exports = router;
