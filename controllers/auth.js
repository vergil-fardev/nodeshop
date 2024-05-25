const crypto = require("crypto");
const sendGridAPIKey = require("../util/sendgrid").sendGridAPIKey;
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
            from: "rafaguard@gmail.com",
            subject: "Sign Up",
            html: "<h1>You successfully signed up!</h1>",
          });
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getReset = (req, res, next) => {
  res.render("auth/reset-password", {
    pageTitle: "Reset Password",
    path: "/reset",
    errorMessage: req.flash("error")[0] ?? null,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/");
    }

    const token = buffer.toString("hex");
    console.log("Reset Token", token);
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email was found.");
          return res.redirect("/");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 60 * 60 * 1_000; // 1 hour
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        return transporter.sendMail({
          to: req.body.email,
          from: "rafaguard@gmail.com",
          subject: "Sign Up",
          html: `
            <p>You requested a Password Reset</p>
            <p>Click <a href="http://localhost:3000/reset/${token}">this link</a> to reset your password:</p>
          `,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        next();
        return;
      }
      res.render("auth/new-password", {
        pageTitle: "New Password",
        path: "/new-password",
        errorMessage: req.flash("error")[0] ?? null,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({ 
    resetToken: passwordToken, 
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId, 
  })
  .then((user) => {
    if(!user) {
      req.flash("error", "User not found.");
      res.redirect("/reset");
      return;
    }
    resetUser = user;
    return bcrypt.hash(newPassword, 12);
  })
  .then((hashedPassword) => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save();
  })
  .then((result) => {
    res.redirect('/login');
  })
  .catch((err) => {
    console.log(err);
  })
};
