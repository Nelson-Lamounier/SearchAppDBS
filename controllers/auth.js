const User = require('../models/user')

exports.getLogin = (req, res, next) =>{
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login'
  })
}