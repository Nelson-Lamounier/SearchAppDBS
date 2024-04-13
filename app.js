// Core Modules
// Http => Launch a server, send requests
// htttps => Launch a SSl server
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error')
const sequelize = require('./util/database')
const Job = require('./models/job')
const User = require('./models/user')

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const jobRoutes = require('./routes/job-cart');
const adminRouter = require('./routes/admin')
const userRouter = require('./routes/profile')


app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(jobRoutes);
app.use('/admin', adminRouter);
app.use('/user', userRouter);

app.use(errorController.get404)

// Create association for the database

Job.belongsTo(User, {constraints: true, onDelete: 'CASCADE'})
User.hasMany(Job)
// {force: true}
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
  app.listen(3000);
}).catch(err => {
  console.log(err);
})

