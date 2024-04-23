const path = require("path");

const express = require("express");

const userController = require("../controllers/profile");

const router = express.Router();


router.get('/create-profile', userController.getProfile)

// router.get('/create-profile', userController.getUser)

router.post('/create-profile', userController.postProfile)

router.get('/user-profile', userController.getUserProfile)

// router.get('/saved-jobs', userController.getUserSavedJobs)



module.exports = router;
