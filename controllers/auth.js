const sendGridAPIKey = require('../util/sendgrid');
const User = require("../models/user");
const bcrypt = require("bcryptjs");

const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: sendGridAPIKey,        
    },
  })
);

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Shop",
    path: "/login",
    isAuthenticated: false,
    errorMessage: req.flash("error")[0] ?? null,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid user or email.");
        return res.redirect("/login");
      }
      bcrypt.compare(password, user.password).then((doMatch) => {
        if (doMatch) {
          req.session.isLoggedIn = true;
          req.session.userId = user._id;

          // not mandatory but ensures that session is created before doing other operations.
          return req.session.save((err) => {
            console.log(err);
            res.redirect("/");
          });
        }
        req.flash("error", "Invalid user or email.");
        res.redirect("/login");
      });
    })
    .catch((err) => {
      req.flash("error", "Something went wrong, please try again.");
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getSignUp = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Sign Up",
    path: "/signup",
    isAuthenticated: false,
  });
};

exports.postSignUp = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  //const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        return res.redirect("/");
      }

      return bcrypt
        .hash(password, 12)
        .then((encryptedPassword) => {
          const user = new User({
            name: name,
            email: email,
            password: encryptedPassword,
            cart: { items: [] },
          });

          return user.save();
        })
        .then((result) => {
          console.log(result);
          res.redirect("/login");
          return transporter.sendMail({
            to: email,
            from: "raf-shop@node-shop.com",
            subject: "Sign Up",
            html: "<h1>You successfully signed up!</h1>",
          });
        });
    })
    .catch((err) => {
      console.log(err);
    });
};
