const errorController = require("./controllers/error");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");


const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const mongoose = require("mongoose");

const csrf = require('csurf');
const flash = require('connect-flash');

const User = require("./models/user");

const MONGODB_CONNECTION_STRING =
  require("./util/database").databaseConnectionString;

const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const store = new MongoDBStore({
  uri: MONGODB_CONNECTION_STRING,
  collection: "sessions",
});
const csrfProtection = csrf();

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "my example secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection);
app.use(flash());

/* Expression Session object returns JS objects, not Mongoose object.
Therefore, methods such as .addToCart() or .populate() become unavailable in certain parts of the code.
To fix that, we create a middleware that grabs User Id from Session, fetches the Mongoose Model User Object
based on it, and then sets it as the 'user' in the Request object.
 */
app.use((req, res, next) => {
  if (!req.session || !req.session.userId) {
    return next();
  }
  User.findById(req.session.userId)
    .then((user) => {
      if (user) {
        req.user = user;
        next();
      } else {
        next(new Error("Could not retrieve user from session."));
      }
    })
    .catch((err) => console.log(err));
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

mongoose
  .connect(MONGODB_CONNECTION_STRING)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
