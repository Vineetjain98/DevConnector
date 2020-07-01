const express = require("express");
const router = express.Router();
const auth = require("../../middlewear/auth");
const User = require("../../models/Users");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const config = require("config");
const jwtSecretToken = config.get("jwtSecretToken");
const jwt = require("jsonwebtoken");

// @route   GET api/auth
// @desc    Get user details
// @access  Public
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user }).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// @route   POST api/auth
// @desc    Login Users
// @access  Public
router.post(
  "/",
  [
    check("email", "Not a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
      //See if user exists

      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      //Match password

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      //Return json web token

      const payload = {
        user: user._id,
      };

      jwt.sign(payload, jwtSecretToken, { expiresIn: 36000 }, (err, token) => {
        if (err) throw err;
        return res.json({ token });
      });
    } catch (error) {
      return res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;
