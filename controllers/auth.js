const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

exports.addUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation of user details failed!!");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  try {
    const hashPass = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashPass,
      name: name,
    });
    const result = await user.save();
    res
      .status(201)
      .json({ message: "User signedup successfully!", userId: result._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.authUser = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("Email not found!!");
      error.statusCode = 404;
      throw error;
    }
    const isAuth = await bcrypt.compare(password, user.password);
    if (!isAuth) {
      const error = new Error("Invalid password!!");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      { email: email, userId: user._id.toString() },
      process.env.NODE_APP_JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      message: "Signin successfull!",
      token: token,
      userId: user._id.toString(),
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
