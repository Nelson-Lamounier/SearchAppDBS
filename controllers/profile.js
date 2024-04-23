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
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("user/create-profile", {
      path: "user/create-profile",
      pageTitle: " Create user Profile",
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
      validationErrors: errors.array(),
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const profile = new Profile({
        firstName: firstName,
        lastName: lastName,
        headline: headline,
        email: email,
        phone: phone,
        location: location,
        password: hashedPassword,
      });
      return profile.save();
    })
    .then((result) => {
      console.log(result);
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);

      res.redirect("/");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

//Function to get user profile page logged in

exports.getUserProfile = (req, res, next) => {
  req.profile
    .getProfiles()
    .then((profiles) => {
      console.log(profiles);
      res.render("user/user-profile", {
        profile: profiles,
        path: "/user-profile",
        pageTitle: "User Profile",
      });
    })
    .catch((err) => {
     
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
