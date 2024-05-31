const express = require("express");
const { check, body } = require("express-validator");
const authController = require("../controllers/auth");
const router = express.Router();
const User = require('../models/user');

router.get("/login", authController.getLogin);
router.post(
  "/login", 
  [
    body('email', 'Invalid email address.')
    .isEmail()
    .normalizeEmail(),
    body('password', 'Invalid email address or password')
    .isLength({ min: 6 })
    .isAlphanumeric()
    .trim(),
  ],
  authController.postLogin
);

router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignUp);
router.post(
  "/signup",
  [
    body("name", "Please use a name that is at least 3 characters long")
      .isLength({ min: 3 })
      .isAlpha(),
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .normalizeEmail()
      .custom((value, { req }) => {
        // if (value === "test@test.com") {
        //   throw new Error("This email address is forbidden.");
        // }
        // return true;
        return User.findOne({ email: value })
          .then((userDoc) => {
            if (userDoc) {
              return Promise.reject('E-mail already exists, please pick a different one.');
            }
          })
      }),
    body(
      "password",
      "Please use a password that has only letters and numbers and is at least 6 characters long"
    )
      .isLength({ min: 6 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords don't match!");
      }
      return true;
    }),
  ],
  authController.postSignUp
);

router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
