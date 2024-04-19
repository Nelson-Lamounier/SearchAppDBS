const path = require("path");

const express = require("express");

const adminController = require('../controllers/admin')

const isAuth = require('../middleware/is-auth');


const router = express.Router();

router.get('/post-job', isAuth, adminController.getAddPost); // Route for the create post page => GET request

router.post('/post-job', isAuth, adminController.postAddPost); // Route for the create post page => POST request


router.post('/posts', isAuth, adminController.postAddPost);

router.get('/posts', isAuth, adminController.getJobs); // Route for get ALL created post display at the admin section

router.get('/post/:jobId', isAuth, adminController.getJobById) // Route to get the create job post by Id => this function leads to the edit post section

router.get('/edit-post/:jobId', isAuth, adminController.getEditJob) //Function to edit the created post before Posting to the cart 

router.post('/edit-post',isAuth, adminController.postEditJob) // This route edit the job posted on the admin user section 

router.post('/delete-job',isAuth, adminController.postDeleteJob) // This route delete the job from created post admin section

router.post('/cart',isAuth, adminController.postCart)

// router.post('/posts', adminController.postAddPost);


module.exports = router;