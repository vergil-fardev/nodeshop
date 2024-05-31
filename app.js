const errorController = require("./controllers/error");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const mongoose = require("mongoose");

const csrf = require("csurf");
const flash = require("connect-flash");

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

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

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
    .catch((err) => {
      throw new Error(err);
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get("/500", errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.user.isAuthenticated,
  });
});

mongoose
  .connect(MONGODB_CONNECTION_STRING)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
