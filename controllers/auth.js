const User = require('../models/user')

exports.getLogin = (req, res, next) =>{
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false
  })
}

// Function to gather user login information / Cookies
exports.postLogin = (req, res, next) => {
  User.findByPk('1').then(user=> {
    req.session.isLoggedIn= true;
    req.session.user = user,
    req.session.save(err => {
      console.log(err);
      res.redirect('/')
    })
   
  }).catch(err => console.log(err))
  
}

// Function to logout user
exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/')
  })
}

exports.getSignUp = (req, res, next) => {
  res.render('auth/create-profile', {
    path: '/sign-up',
    pageTitle: ' Sign Up',
    isAuthenticated: false

  })
}

// Function to create a user/profile
exports.postSignup = (req, res, next) =>{} // Gathering the information from the incoming request
