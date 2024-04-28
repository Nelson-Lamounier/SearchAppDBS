// Core Modules
// Http => Launch a server, send requests
// htttps => Launch a SSl server
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MysqlStore = require("express-mysql-session")(session);
const csrf = require("csurf"); // CSRF protection middleware.
const flash = require("connect-flash");
const multer = require("multer"); // Multer => Is a middleware which we execute on every incoming request and it then simply has a look at that sees if it's multipart form data and tries to extract files if amy

const errorController = require("./controllers/error");
const sequelize = require("./util/database");
const Job = require("./models/post");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const UserCart = require("./models/user-cart");
const UserCartItem = require("./models/user-cart-item");
const Published = require("./models/published");
const PublishedItem = require("./models/published-item");
const Profile = require("./models/profile");

// MySQL session store
const options = {
  host: "localhost",
  user: "root",
  password: "Dublin2024",
  database: "job-search",
  logging: false,
};

// const {
//   invalidCsrfTokenError, // This is just for convenience if you plan on making your own middleware.
//   generateToken, // Use this in your routes to generate, store, and get a CSRF token.
//   getTokenFromRequest, // use this to retrieve the token submitted by a user
//   getTokenFromState, // The default method for retrieving a token from state.
//   storeTokenInState, // The default method for storing a token in state.
//   revokeToken, // Revokes/deletes a token by calling storeTokenInState(undefined)
//   csrfSynchronisedProtection, // This is the default CSRF protection middleware.
// } = csrfSync();
// const doubleCsrfProtection = doubleCsrf({getSecret:() => 'Secret'});

// const doubleCsrfUtilities = doubleCsr({getSecret:() => 'Secret'})

const app = express();

const sessionStore = new MysqlStore(options);

const csrfProtection = csrf();

// Multer file handle/tells Multer where to upload the files.
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "pdfResumes");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

// Check file form/valid
const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(null, false)
  }
}


app.set("view engine", "ejs");
app.set("views", "views");

const jobRoutes = require("./routes/job-cart");
const adminRouter = require("./routes/admin");
const userRouter = require("./routes/profile");
const authRouter = require("./routes/auth");

// Express session middleware
app.use(bodyParser.urlencoded({ extended: false }));
// Multer adds a body object and a file or files object to the request object. The body object contains the values of the text fields of the form, the file or files object contains the files uploaded via the form/
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("uploadCv")
);
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    key: "session_cookie",
    secret: "my secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
  })
);

// Middleware for CSRF token creation and validation. This middleware adds a req.csrfToken() function to make a token which should be added to requests which mutate state, within a hidden form field, query-string etc.
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});
// sequelize register this function but never run it, this is only run for incoming request
app.use((req, res, next) => {
  // throw new Error('Sync Dummy');
  if (!req.session.user) {
    return next();
  }
  User.findByPk(req.session.user.id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use((req, res, next) => {
  if (!req.session.profile) {
    return next();
  }
  Profile.findByPk(req.session.profile.id)
    .then((profile) => {
      req.profile = profile;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use(jobRoutes);
app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use(authRouter);

app.get("/500", errorController.get500);

app.use(errorController.get404);

// Global middleware to handle 500 error
// app.use((error, req, res, next)=> {
//   res.status(500).render('500', {
//     pageTitle: 'Error!',
//     path: '/500',
//     isAuthenticated: req.session.isLoggedIn
//   })
// })

// Create association for the database

Job.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
Job.belongsTo(UserCart, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Job);
User.hasOne(Cart);
Profile.hasOne(UserCart);
UserCart.belongsTo(Profile);
UserCart.belongsToMany(Job, { through: UserCartItem });
Job.belongsToMany(UserCart, { through: UserCartItem });
Cart.belongsTo(User);
Cart.belongsToMany(Job, { through: CartItem });
Job.belongsToMany(Cart, { through: CartItem });
Published.belongsTo(User);
User.hasMany(Published);
Published.belongsToMany(Job, { through: PublishedItem });

// sync() - This creates the table if it doesn't exist (and does nothing if it already exists)
// sync({ force: true }) - This creates the table, dropping it first if it already existed
// sync({ alter: true }) - This checks what is the current state of the table in the database (which columns it has, what are their data types, etc), and then performs the necessary changes in the table to make it match the model.
// 'npm start' => runs the function
sequelize
  .sync({ alter: true })
  .then((cart) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
