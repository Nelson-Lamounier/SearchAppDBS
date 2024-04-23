const Job = require("../models/post");
const Published = require("../models/published");

exports.getPosts = (req, res, next) => {
  Published.findAll({ include: ["jobs"] })
    .then((publisheds) => {
      res.render("main/post-list", {
        pageTitle: "All Post",
        path: "/",
        publisheds: publisheds,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postIndex = (req, res, next) => {
  let fetchedCart;
  req.user
    .getCart()
    .then((cart) => {
      //Access to the cart
      fetchedCart = cart;
      return cart.getJobs();
    })
    .then((posts) => {
      return req.user
        .createPublished()
        .then((published) => {
          return published.addJobs(posts);
        })
        .catch((err) => console.log(err));
    })
    .then((result) => {
      return fetchedCart.setJobs(null);
    })
    .then((result) => {
      res.redirect("/admin-posted");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Function to get the main page with published posts
exports.getIndex = (req, res, next) => {
  req.user
    .getPublisheds({ include: ["jobs"] })
    .then((publisheds) => {
      res.render("published/admin-posted", {
        path: "/admin-posted",
        pageTitle: "Admin Search",
        publisheds: publisheds,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// exports.getIndex = (req, res, next) => {
//   res.render("published/index", {
//     pageTitle: "Home",
//   });
// };

// Function to get the Cart/Posted job page
exports.getSearchJobs = (req, res, next) => {
  res.render("admin/published-cart", {
    pageTitle: "Jobs",
    path: "/published/published-cart",
  });
};

// Function to display the job post on the main page with the Post information extracted from the jobs.json file
exports.getPostedJobs = (req, res, next) => {
  req.user
    .createCart()
    .then((cart) => {
      if (cart) {
        req.user
          .getCart()
          .then((cart) => {
            return cart
              .getJobs()
              .then((postJobs) => {
                res.render("admin/published-cart", {
                  path: "/admin/published-cart",
                  pageTitle: "Admin Publish",
                  posts: postJobs,
                });
              })
              .catch((err) => console.log(err));
          })
          .catch((err) => console.log(err));
      }
    })
    .then((cart) => {
      return cart;
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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

      return Job.findByPk(postId);
    })
    .then((post) => {
      return fetchedCart.addJob(post);
    })
    .then(() => {
      res.redirect("/published-cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
// Function to delete Published Post 'cartItem' sequelize method to access the cart object
exports.postDeletePost = (req, res, next) => {
  const postId = req.body.jobId;
  req.user
    .getCart()
    .then((cart) => {
      return cart.getJobs({ where: { id: postId } });
    })
    .then((posts) => {
      const post = posts[0];
      return post.cartItem.destroy();
    })
    .then((result) => {
      res.redirect("/admin/posts");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// exports.getPublished = (req, res, next) =>{
//   req.user.getPublished({include: ['posts']}).then(posts => {
//     res.render('/home', {
//       path: '/home',
//       pageTitle: 'Search for Jobs',
//       posts: posts
//     })
//   }).catch(err => console.log(err))
// }
