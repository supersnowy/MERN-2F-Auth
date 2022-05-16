const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");
const { authenticator } = require('otplib');
const QRCode = require('qrcode');

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// Load User model
const User = require("../../models/User");

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {
  // Form validation

  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const secret = authenticator.generateSecret();
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        secret: secret
      });

      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => {
              // res.json(user)
              QRCode.toDataURL(authenticator.keyuri(req.body.email, '2FA Node App', secret), (err, url) => {
                if (err) {
                  throw err
                }
      
                return res
                  .status(200)
                  .json({ qr: url, secret: secret, email: req.body.email });
              })
            })
            .catch(err => console.log(err));
        });
      });
    }
  });
});

router.post('/sign-up-2fa', (req, res) => {
  const email = req.body.email,
    code = req.body.code

  return checkCode(email, code, req, res)
});

router.post('/sign-in-2fa', (req, res) => {
  const id = req.body.id,
    code = req.body.code

  return checkCodeById(id, code, req, res)
})

function checkCode (email, code, req, res) {
  //load user by email
  User.findOne({ email }).then(user => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ status: 'fail', code: "Email not found" });
    }

    if (!authenticator.check(code, user.secret)) {
      //redirect back
      return res.status(404).json({ status: 'fail', code: "Code Error" });
    }
    return res.status(200).json({ status: 'success', code: "" });
  })
}

function checkCodeById (id, code, req, res) {
  //load user by email
  User.findById(id).then(user => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ status: 'fail', code: "User not found" });
    }

    if (!authenticator.check(code, user.secret)) {
      //redirect back
      return res.status(404).json({ status: 'fail', code: "Code Error" });
    }
    return res.status(200).json({ status: 'success', code: "" });
  })
}

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req, res) => {
  // Form validation

  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({ email }).then(user => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ emailnotfound: "Email not found" });
    }

    // Check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name
        };

        // Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 31556926 // 1 year in seconds
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  });
});

module.exports = router;
