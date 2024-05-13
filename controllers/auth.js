const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Shop",
    path: "/login",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  User.findById("661fe8444f906cae2742501b").then((user) => {
    req.session.isLoggedIn = true;
    req.session.userId = user._id;
    req.session.save((err) => { // not mandatory but ensures that session is created before doing other operations.
      console.log(err);
      res.redirect("/");
    })
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};