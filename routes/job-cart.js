const path = require('path');

const express = require('express');

const jobController = require ("../controllers/publish-cart");
// const postJobController = require ("../controllers/job");

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/admin-posted',isAuth, jobController.getIndex);

router.get('/', jobController.getPosts)

// router.get('/search-jobs', jobController.getPostedJobs)

router.get('/published-cart',isAuth, jobController.getPostedJobs)

router.post('/published-cart',isAuth, jobController.postPostedJobs)

router.post('/delete-published-item',isAuth, jobController.postDeletePost)

router.post('/admin-posted',isAuth, jobController.postIndex)



// router.post('/search-jobs', postJobController.postAddPost)

module.exports = router;

