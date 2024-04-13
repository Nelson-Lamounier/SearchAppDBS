const Post = require("../models/cart");
const Job = require("../models/job");

// Function to get the main page
exports.getIndex = (req, res, next) => {
  res.render("job/index", {
    pageTitle: "Home",
  });
};

// Function to get the Cart/Posted job page
exports.getSearchJobs = (req, res, next) => {
  res.render("job/search-jobs", {
    pageTitle: "Jobs",
    path: "/job/search-jobs",
  });
};

// Function to display the job post on the main page with the Post information extracted from the jobs.json file
exports.getPostedJobs = (req, res, next) => {
  req.user
    .getCart()
    .then((cart) => {
      return cart.getJobs().then((postJobs) => {
        res.render("job/published-cart", {
          path: "/job/published-cart",
          pageTitle: "All Posted Jobs",
          posts: postJobs,
        });
      });
    })
    .catch((err) => console.log(err));
};
// Function to post the information to the Publish Cart
exports.postPostedJobs = (req, res, next) => {
  const postId = req.body.jobId;
  let fetchedCart;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getJobs({ where: { id: postId } });
    })
    .then((posts) => {
      let post;
      if (posts.length > 0) {
        post = posts[0];
      }
   
      return Job.findByPk(postId)
    })
    .then((post) => {
      return fetchedCart.addJob(post);
    })
    .then(() => {
      res.redirect("/published-cart");
    })
    .catch((err) => console.log(err));
};

exports.postDeletePost = (req, res, next) => {
  const postId = req.body.jobId;
  Job.deleteByID(postId);
  res.redirect("/admin/posts");
};
