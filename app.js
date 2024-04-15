// Core Modules
// Http => Launch a server, send requests
// htttps => Launch a SSl server
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error')
const sequelize = require('./util/database')
const Job = require('./models/post')
const User = require('./models/user')
const Cart = require('./models/cart')
const CartItem = require('./models/cart-item')
const Published = require('./models/published')
const PublishedItem = require('./models/published-item')

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const jobRoutes = require('./routes/job-cart');
const adminRouter = require('./routes/admin')
const userRouter = require('./routes/profile')
const authRouter = require('./routes/auth')


app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

// sequelize register this function but never run it, this is only run for incoming request
app.use((req, res, next) => {
  User.findByPk(1).then(user => {
    req.user = user;
    next()
  }).catch(err => {
    console.log(err)
  })
});

app.use(jobRoutes);
app.use('/admin', adminRouter);
app.use('/user', userRouter);
app.use(authRouter)


app.use(errorController.get404)

// Create association for the database

Job.belongsTo(User, {constraints: true, onDelete: 'CASCADE'})
User.hasMany(Job)
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Job, { through: CartItem})
Job.belongsToMany(Cart, { through: CartItem});
Published.belongsTo(User);
User.hasMany(Published);
Published.belongsToMany(Job, { through: PublishedItem})

// {force: true}
// 'npm start' => runs the function 
sequelize.sync().then(result => {
  return User.findByPk(1)
  // console.log(result);
 
}).then(user => {
  if(!user) {
    return User.create({name: 'Nelson', email:'test@test.com'});
  }
  return user;
} 
).then(user => {
  // console.log(user)
  return user.createCart()

}).then(cart => {
  app.listen(3000);
}).catch(err => {
  console.log(err);
})

