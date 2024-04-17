const bcrypt = require("bcryptjs");
const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
  });
};

// Function to gather user login information / Cookies
exports.postLogin = (req, res, next) => {
  // Extract the email/password from the request body => two info we need to sign the user in
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ where: { email: email } })
    .then((user) => {
      if (!user) {
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
  res.render("auth/create-profile", {
    path: "/signup",
    pageTitle: " Sign Up",
    isAuthenticated: false,
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
        return res.redirect("/signup");
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
        });
    })
    .catch((err) => console.log(err));
};
