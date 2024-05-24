const express = require("express");
const router = express.Router();
const { check, body } = require("express-validator");
const authController = require("../controllers/auth");
const User = require("../models/user");

router.put(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter valid email!!")
      .custom(async (value, { req }) => {
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          return Promise.reject("Email already exists!!");
        }
        if (value === "test@test.com") {
          throw new Error("This kind of email's are forbidden");
        }
        return userDoc;
      })
      .normalizeEmail(),
    body(
      "password",
      "Please enter the password length of atleast 7 or grater with one or more special character and numbers"
    )
      .trim()
      .isStrongPassword({
        minLength: 7,
        minUppercase: 1,
        minLowercase: 2,
        minSymbols: 1,
        minNumbers: 2,
      }),
    body("name").trim().not().isEmpty(),
  ],
  authController.addUser
);

module.exports = router;
