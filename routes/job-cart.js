const path = require('path');

const express = require('express');

const jobController = require ("../controllers/publish-cart");
// const postJobController = require ("../controllers/job");

const router = express.Router();

router.get('/', jobController.getIndex);

router.get('/posts', jobController.getPosts)

// router.get('/search-jobs', jobController.getPostedJobs)

router.get('/published-cart', jobController.getPostedJobs)

router.post('/published-cart', jobController.postPostedJobs)

router.post('/delete-published-item', jobController.postDeletePost)

router.post('/', jobController.postIndex)



// router.post('/search-jobs', postJobController.postAddPost)

module.exports = router;

