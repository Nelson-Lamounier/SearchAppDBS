const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const AWS = require("@aws-sdk/client-ses");
const sesTransport = require("nodemailer-ses-transport");
const { validationResult, check } = require("express-validator");
const dotenv = require("dotenv");

const Op = require("@sequelize/core");

dotenv.config();
// To use SES transport, set a aws.SES object as the value for SES property in Nodemailer transport options. That’s it. You are responsible of initializing that object yourself as Nodemailer does not touch the AWS settings in any way. Reference https://nodemailer.com/transports/ses/
// Connecting to IAM user on AWS
const SESConfig = new AWS.SES({
  apiVersion: "2010-12-01",
  region: "eu-west-1", // Your region will need to be updated
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
  },
});

const transporter = nodemailer.createTransport(
  sesTransport({ SES: { SESConfig, AWS } })
);

const Profile = require("../models/profile");
const Job = require("../models/post");
const UserCart = require("../models/user-cart");

// Function to render user profile creation
exports.getProfile = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("user/create-profile", {
    pageTitle: "Create a profile",
    path: "/user/create-profile",
    errorMessage: message,
    oldInput: {
      firstName: "",
      lastName: "",
      headline: "",
      phone: "",
      email: "",
      location: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
  });
};

exports.postProfile = (req, res, next) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const headline = req.body.headline;
  const phone = req.body.phone;
  const email = req.body.email;
  const location = req.body.location;
  const uploadCv = req.file;
  const password = req.body.password;
  console.log(uploadCv);
  if (!uploadCv) {
    return res.status(422).render("user/create-profile", {
      path: "/user/create-profile",
      pageTitle: " Create user Profile",
      oldInput: {
        firstName: firstName,
        lastName: lastName,
        headline: headline,
        phone: phone,
        email: email,
        location: location,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
      errorMessage: 'Attached file is not a PDF file',
      validationErrors:[]
    });
    
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("user/create-profile", {
      path: "/user/create-profile",
      pageTitle: " Create user Profile",
      oldInput: {
        firstName: firstName,
        lastName: lastName,
        headline: headline,
        phone: phone,
        email: email,
        location: location,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  
  

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const upload = uploadCv.path;
      const profile = new Profile({
        firstName: firstName,
        lastName: lastName,
        headline: headline,
        email: email,
        phone: phone,
        location: location,
        uploadCv: upload,
        password: hashedPassword,
      });
      return profile.save();
    })
    .then((result) => {
      res.redirect("/user/profile-login");
      return transporter.sendMail({
        from: "lamounier_88@hotmail.com",
        to: email,
        subject: "Account Created",
        html: "<h1>Welcome to SMARTPatch! You account was created!</h1>",
      });
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/user/profile-login");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
// Funtion to get/render User profile login
exports.getProfileLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("user/profile-login", {
    path: "/user/profile-login",
    pageTitle: "User Login",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

// Function to Post user profile login
exports.postProfileLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("user/profile-login", {
      path: "/user/user-profile",
      pageTitle: "User Login",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }
  Profile.findOne({ where: { email: email } })
    .then((profile) => {
      if (!profile) {
        return res.status(422).render("user/profile-login", {
          path: "/user/profile-login",
          pageTitle: "Profile Login",
          errorMessage: "Invalid email or password.",
          oldInput: {
            email: email,
            password: password,
          },
          validationErrors: [],
        });
      }
      bcrypt
        .compare(password, profile.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.profile = profile;
            return req.session.save((err) => {
              console.log(err);

              res.redirect("/user/user-profile");
            });
          }
          return res.status(422).render("user/profile-login", {
            path: "/user/profile-login",
            pageTitle: "Profile Login",
            errorMessage: "Invalid email or password",
            oldInput: {
              email: email,
              password: password,
            },
            validationErrors: [],
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/user-profile");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

//Function to logout Profile
exports.postProfileLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

//Function to get user profile page logged in
exports.getUserProfile = (req, res, next) => {
  const profileId = req.profile.id;
  console.log(profileId);
  Profile.findOne({ where: { id: profileId } })
    .then((profile) => {
      res.render("user/user-profile", {
        path: "/user/user-profile",
        pageTitle: "User Profile",
        profile: profile,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
// Function to get all saved job for user profile

exports.getUserSavedJobs = (req, res, next) => {
  req.profile
    .createUserCart()
    .then((cart) => {
      if (cart) {
        req.profile
          .getUserCart()
          .then((cart) => {
            return cart
              .getJobs()
              .then((posts) => {
                res.render("user/saved-jobs", {
                  path: "/user/saved-jobs",
                  pageTitle: "Saved Jobs",
                  posts: posts,
                });
              })
              .catch((err) => {
                console.log(err);
              });
          })
          .catch((err) => {
            console.log(err);
          });
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
//Function to add saved job to user profile
exports.postUserCart = (req, res, next) => {
  const jobId = req.body.jobId;
  let fetchedUserCart;
  req.profile
    .getUserCart()
    .then((cart) => {
      console.log(cart);
      fetchedUserCart = cart;
      return cart.getJobs({ where: { id: jobId } });
    })
    .then((posts) => {
      let post;
      if (posts.length > 0) {
        post = posts[0];
      }
      if (post) {
        return post;
      }
      return Job.findByPk(jobId);
    })
    .then((post) => {
      return fetchedUserCart.addJob(post);
    })
    .then(() => {
      res.redirect("/user/saved-jobs");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

//Function to remove saved jobs from user profile account
exports.postDeleteSavedJob = (req, res, next) => {
  const postId = req.body.jobId;
  req.profile
    .getUserCart()
    .then((cart) => {
      return cart.getJobs({ where: { id: postId } });
    })
    .then((posts) => {
      const post = posts[0];
      return post.userCartItem.destroy();
    })
    .then((result) => {
      res.redirect("/user/saved-jobs");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// exports.postUpload = (req, res, next) => {
//   const cv = req.file;
//   const uploadCover = req.file;
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     console.log(uploadCv);
//     return res.status(422).render("user/user-profile", {
//       pageTitle: "User Profile",
//       path: "/user/user-profile",
//       // profile: {
//       //   uploadCv: uploadCv,
//       //   uploadCover: uploadCover
//       // },
//       errorMessage: errors.array()[0].msg,
//       validationErrors: errors.array(),
//     });
//   }
//   const uploadCv = image.path;
//   const profile = new Profile({
//     uploadCv: uploadCv,
//   });
//   profile.update({uploadCv: uploadCv}).profile
//     .save()
//     .then((result) => {
//       console.log(uploadCv);
//       res.redirect("/user/create-profile");
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };
