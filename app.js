// Core Modules
// Http => Launch a server, send requests
// htttps => Launch a SSl server
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error')
const sequelize = require('./util/database')

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

sequelize.sync().then(result => {
  // console.log(result);
  app.listen(3000);
}).catch(err => {
  console.log(err);
})

