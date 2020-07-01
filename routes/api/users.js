const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../../models/Users");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const config = require("config");
const jwtSecretToken = config.get("jwtSecretToken");
const jwt = require("jsonwebtoken");

// @route   POST api/users
// @desc    Register Users
// @access  Public
router.post(
  "/",
  [
    check("name", "Not a valid name")
      .not()
      .isEmpty(),
    check("email", "Not a valid email").isEmail(),
    check("password", "Password must have atleast six characters").isLength({
      min: 6
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;

    try {
      //See if user exists

      let user = await User.findOne({ email });
      if (user) {
        res.status(400).json({ erros: [{ msg: "User already exists" }] });
      }
      //Get gravatar

      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm"
      });

      //User model

      user = new User({
        name,
        email,
        avatar,
        password
      });
      //Encrypt the password and store in db

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      //Return json web token

      const payload = {
        user: user.id
      };

      jwt.sign(payload, jwtSecretToken, { expiresIn: 36000 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;
