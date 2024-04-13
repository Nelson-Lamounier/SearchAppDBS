const Post = require('../models/post')
const Job = require('../models/job')

exports.getIndex = (req,res,next) => {
    res.render('job/index', {
      pageTitle: 'Home'
    });

};

exports.getSearchJobs = (req,res, next) => {
  res.render('job/search-jobs', {
    pageTitle: 'Jobs',
    path:'/job/search-jobs'
  })
}

// Function to display the job post on the main page with the Post information extracted from the jobs.json file
exports.getPostedJobs = (req, res, next) => {
  Post.getPost(posted => {
    Job.fetchAll(posts => {
      const postJobs = [];
      for (post of posts) {
        const postJobData = posted.posts.find(
          postId => postId.id === post.id
        ); // 'posts' on this section refers to the 'posts' on Job class
        if (postJobData) {
          postJobs.push({ postData:post})
        }
      }
      res.render('job/search-jobs', {
        path: '/job/search-jobs',
        pageTitle: 'All Posted Jobs',
        posts: postJobs
      })
    })
  
  })
  
}
 exports.postPostedJobs = (req, res, next) => {
   const postId = req.body.jobId;
   Job.findById(postId, job => {
     Post.addPost(postId)
   })
   console.log(Post)
   res.redirect('/search-jobs')
 }

 exports.postDeletePost = (req, res, next) => {
   const postId = req.body.jobId;
   Job.deleteByID(postId);
   res.redirect('/admin/posts')
 }