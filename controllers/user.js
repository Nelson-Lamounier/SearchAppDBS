const User = require('../models/user')

exports.getAddUser = (req, res, next) => {
  res.render('user/create-profile', {
    pageTitle: 'Create a profile',
    path:'/user/create-profile'
  })
}

exports.getUserProfile = (req, res, next) => {
  res.render('user/user-profile', {
    pageTitle:'User Profile',
    path:'user/user-profile',
    
  })
}

exports.getUserSavedJobs = (req, res, next) => {
  res.render('user/saved-jobs', {
    pageTitle:'Saved Jobs',
    path:'/user/saved-jobs'
  })
}

exports.postAddUser = (req, res, next) => {
  const id = req.body.id;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const headline = req.body.headline;
  const phone = req.body.phone;
  const email = req.body.email;
  const location = req.body.location;
  const user = new User(id,firstName, lastName, headline, phone, email, location);
  user.save();
  res.redirect('/user/user-profile')
  console.log(user)
}

exports.getUser = (req,res, next) => {
  User.fetchAll(user => {
    res.render('user/user-profile',{
      users:user,
      pageTitle:'User Profile',
      path:'/user/user-profile',
    })
  })
}



