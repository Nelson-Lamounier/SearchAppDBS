const path = require("path");

const express = require("express");

const { check, body } = require("express-validator");

const isAuth = require('../middleware/is-auth');

const userController = require("../controllers/profile");
const Profile = require("../models/profile");

const router = express.Router();

router.get("/create-profile", userController.getProfile);

// router.get('/create-profile', userController.getUser)

router.post(
  "/create-profile",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        return Profile.findOne({ where: { email: value } }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "Email exist already, please login or user a different email"
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      "password",
      "Password MUST be only numbers and text and at least 5 characters"
    ).isLength({min: 5}).isAlphanumeric().trim(),
    body('confirmPassword').trim().custom((value, {req}) => {
      if(value !== req.body.password) {
        throw new Error("Passwords does not Match!")
      }
      return true;
    })
  ],
  userController.postProfile
);

router.get("/profile-login", userController.getProfileLogin);

router.post(
  "/profile-login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address.")
      .normalizeEmail(),
    body("password", "Password has to be valid.")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  userController.postProfileLogin
);

router.get("/user-profile", isAuth, userController.getUserProfile);

// router.post('/user-profile', userController.postUserProfile)

router.post("/profile-logout", userController.postProfileLogout);

router.get("/saved-jobs", isAuth, userController.getUserSavedJobs);

router.post("/saved-jobs", isAuth, userController.postUserCart);

router.post("/remove-saved", isAuth, userController.postDeleteSavedJob);

// router.post('/user-profile', isAuth, userController.postUpload)

// router.get('/saved-jobs', userController.getUserSavedJobs)

module.exports = router;
