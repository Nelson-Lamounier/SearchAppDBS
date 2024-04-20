const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const AWS = require("@aws-sdk/client-ses");
const sesTransport = require("nodemailer-ses-transport");
const dotenv = require("dotenv");

dotenv.config()
// To use SES transport, set a aws.SES object as the value for SES property in Nodemailer transport options. That’s it. You are responsible of initializing that object yourself as Nodemailer does not touch the AWS settings in any way. Reference https://nodemailer.com/transports/ses/
// Connecting to IAM user on AWS
const SESConfig = new AWS.SES({   apiVersion: "2010-12-01",
  region: "eu-west-1", // Your region will need to be updated
  credentials: {
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
},
});;


// Create Nodemail SES transporter

const transporter = nodemailer.createTransport(sesTransport({ SES: { SESConfig, AWS } }
));


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
  });
};

// isAuthenticated: false,
// csrfToken: req.csrfToken()

// Function to gather user login information / Cookies
exports.postLogin = (req, res, next) => {
  // Extract the email/password from the request body => two info we need to sign the user in
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ where: { email: email } })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid Email or Password!");
        return res.redirect("/login");
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
          req.flash("error", "Invalid Email or Password!");
          res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => console.log(err));
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
  // Check if the user exists on the database comparing email
  User.findOne({ where: { email: email } }) // Check if the email already exist
    .then((userDoc) => {
      // Getting the User document/table
      if (userDoc) {
        req.flash("error", "E-Mail already exists, please Login");
        return res.redirect("/login");
      }
      // This is an asynchronous task and therefore this actually gives us back a promise => I will return this so that I can chain another 'then' call/block where I will get my hashed
      return bcrypt // The above code will be only excuted when you reach to the 'hashedPassword' code
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
        .catch((messageId) => {
          console.log(messageId); //messageId – is the Message-ID header value. This value is derived from the response of SES API, so it differs from the Message-ID values used in logging.
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

// It is  ahuge problem if we want to pass some some data into the rendered view when we are redering, beacuse upon a redirect, technically a new request is started, a new request to /login, /signup, etc. That is because on that new request, we don't know we got here because the user entered an invalid e-mail or name formt. When we trigger the new request, it is treated in the same wasy as a request that we triggered by checking on the login button in our menu => with that we have no way of finding out if we provide an error message or not
// => to solve the above mentioned issue we store some data before we redirect whcih we then use in the brand new request
// To store data across request, we need a session
