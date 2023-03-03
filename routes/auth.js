const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const validateRegisterInput = require("../validation/registerValidation");
const jwt = require("jsonwebtoken");
const requiresAuth = require("../middleware/permissions");

// @route  GET /api/auth/test
// @desc  Test the auth route
// @access Public
router.get("/test", (req, res) => {
  res.send("Auth route working1");
});

// @route  POST /api/auth/register
// @desc  Create a new user
// @access Public
router.post("/register", async (req, res) => {
  try {
    const { errors, isValid } = validateRegisterInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }
    // check for existing user
    const existingEmail = await User.findOne({
      email: new RegExp("^" + req.body.email + "$", "i"),
    });

    if (existingEmail) {
      return res
        .status(400)
        .json({ error: "There is already a user with this email." });
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    // create a new user
    const newUser = new User({
      email: req.body.email,
      password: hashedPassword,
      name: req.body.name,
    });

    // save user to the database
    const savedUser = await newUser.save();

    // create a new user variable using the spread operator
    const userToReturn = { ...savedUser._doc };
    // delete the password so that it isn't returned in the json
    delete userToReturn.password;

    // return the new user (Be sure to return the newly created user variable)
    return res.json(userToReturn);
  } catch (err) {
    // error here
    console.log(err);

    res.status(500).send(err.message);
  }
});

// @route  POST /api/auth/login
// @desc  Log in user and return an access token
// @access Public
// npm i cookie-parser jsonwebtoken
router.post("/login", async (req, res) => {
  try {
    // check for the user
    const user = await User.findOne({
      email: new RegExp("^" + req.body.email + "$", "i"),
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "There was a problem with your login credentials." });
    }

    const passwordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!passwordMatch) {
      return res
        .status(400)
        .json({ error: "There was a problem with your login credentials." });
    }

    const payload = { userId: user._id };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("access-token", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    const userToReturn = { ...user._doc };
    delete userToReturn.password;

    return res.json({
      token: token,
      user: userToReturn,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).send(err.message);
  }
});

// @route  GET /api/auth/current
// @desc  Return the currently authed user
// @access Private
router.get("/current", requiresAuth, (req, res) => {
  if (!req.user) {
    return res.status(401).send("Unauthorized");
  }

  return res.json(req.user);
});

module.exports = router;
