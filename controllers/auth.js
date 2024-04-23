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

// Create Nodemail SES transporter

const transporter = nodemailer.createTransport(
  sesTransport({ SES: { SESConfig, AWS } })
);

const User = require("../models/user");



exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
    },
    validationErrors: []
  });
};





// isAuthenticated: false,
// csrfToken: req.csrfToken()

// Function to gather user login information / Cookies
exports.postLogin = (req, res, next) => {
  // Extract the email/password from the request body => two info we need to sign the user in
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password
      },
      validationErrors: errors.array()
    })
  }
  User.findOne({ where: { email: email } })
    .then((user) => {
      if (!user) {
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle:'Login',
          errorMessage: 'Invalid email or password.',
          oldInput: {
            email: email,
            password: password
          },
          validationErrors: []
        })

      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user; // The user here is the suer we are retriving from the database
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/"); // Only redirect after we saved the session successfuly
            });
          }
          return res.status(422).render('auth/login', {
            path:'/login',
            pageTitle: 'Login',
            errorMessage: 'Invalid email or password',
            oldInput: {
              email: email,
              password: password
            },
            validationErrors: []
          })
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    });
};

// Function to logout user
exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getSignUp = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/create-profile", {
    path: "/signup",
    pageTitle: " Sign Up",
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
    validationErrors: []
  });
};

// Function to create a user/profile
// Gathering the information from the incoming request => Storing a new user to the database
exports.postSignup = (req, res, next) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const headline = req.body.headline;
  const phone = req.body.phone;
  const email = req.body.email;
  const location = req.body.location;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("auth/create-profile", {
      path: "/signup",
      pageTitle: " Sign Up",
      errorMessage: errors.array()[0].msg,
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
      validationErrors: errors.array()
   
    });
  }

  // This is an asynchronous task and therefore this actually gives us back a promise => I will return this so that I can chain another 'then' call/block where I will get my hashed
  bcrypt // The above code will be only excuted when you reach to the 'hashedPassword' code
    .hash(password, 12) // Generate a hash password
    .then((hashedPassword) => {
      const user = new User({
        firstName: firstName,
        lastName: lastName,
        headline: headline,
        email: email,
        phone: phone,
        location: location,
        password: hashedPassword,
        // cart: { items: []}
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/login"); // Fuction to run once saves ids done
      // Send email using nodemailer
      return transporter.sendMail({
        from: "lamounier_88@hotmail.com",
        to: email,
        subject: "Signup Succeeded",
        html: "<h1>Thaks for signup for Smarth Path</h1>",
      });
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/login");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    });
};

// Render reset-password page

exports.getResetPassword = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset-password", {
    path: "/reset-password",
    pageTitle: " Reset Password",
    errorMessage: message,
  });
};

// Token func to reset the password by providing a secxured link
exports.postResetPassword = (req, res, next) => {
  //Buffer object/constructor => manipulate the binary data
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset-password");
    }
    //=> manipulate the binary data
    const token = buffer.toString("hex");
    User.findOne({ where: { email: req.body.email } })
      .then((user) => {
        if (!user) {
          req.flash("error", "No Account found! Please create one Account");
          return res.redirect("/signup");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 43200;
        return user.save();
      })
      .then((user) => {
        console.log(user.id, user.password);
      })
      .then((result) => {
        res.redirect("/");
        transporter.sendMail({
          from: "lamounier_88@hotmail.com",
          to: req.body.email,
          subject: "Password Reset",
          html: `<p>You've requested a password reset</p>
        <p>Click this <a href="http://localhost:3000/reset-password/${token}">link to set a new password</p>`, //It will look to the datebase to confirm that the link was sent by us because only we know the token
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error)
      });
  });
};

// require('pg').types.setTypeParser(1114, function(stringValue) {
//   return new Date(stringValue.substring(0, 10) + 'T' + stringValue.substring(11) + '.000Z');
// });

// New passord render
exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ where: { resetToken: token } })
    .then((user) => {
      console.log(user.id);
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        userId: user.id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    });
};

// Post new password
exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    where: {
      resetToken: passwordToken,
      // resetTokenExpiration: { [Op.gt]: Date.now() }, // Sequelize gives wrong datetime then my OS provides
      id: userId,
    },
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    });
};

// It is a huge problem if we want to pass some some data into the rendered view when we are redering, beacuse upon a redirect, technically a new request is started, a new request to /login, /signup, etc. That is because on that new request, we don't know we got here because the user entered an invalid e-mail or name formt. When we trigger the new request, it is treated in the same wasy as a request that we triggered by checking on the login button in our menu => with that we have no way of finding out if we provide an error message or not
// => to solve the above mentioned issue we store some data before we redirect whcih we then use in the brand new request
// To store data across request, we need a session
// error code 500 => server side issue occured