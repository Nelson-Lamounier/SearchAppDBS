const path = require("path");

const express = require("express");

const adminController = require('../controllers/admin')


const router = express.Router();

router.get('/post-job', adminController.getAddPost); // Route for the create post page => GET request

router.post('/post-job', adminController.postAddPost); // Route for the create post page => POST request


router.post('/posts', adminController.postAddPost);

router.get('/posts', adminController.getJobs); // Route for get ALL created post display at the admin section

router.get('/post/:jobId', adminController.getJobById)

router.get('/edit-post/:jobId', adminController.getEditJob)

router.post('/edit-post', adminController.postEditJob)

router.post('/delete-job', adminController.postDeleteJob)



// router.post('/posts', adminController.postAddPost);


module.exports = router;