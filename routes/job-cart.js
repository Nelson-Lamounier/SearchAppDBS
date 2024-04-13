const path = require('path');

const express = require('express');

const jobController = require ("../controllers/publish-cart");
// const postJobController = require ("../controllers/job");

const router = express.Router();

router.get('/', jobController.getIndex);

// router.get('/search-jobs', jobController.getPostedJobs)

router.get('/published-cart', jobController.getPostedJobs)

router.post('/published-cart', jobController.postPostedJobs)





// router.post('/search-jobs', postJobController.postAddPost)

module.exports = router;

