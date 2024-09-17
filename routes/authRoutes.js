// routes/authRoutes.js
const express = require("express");
const { signup } = require("../controllers/authController");

const router = express.Router();

// @route   POST api/auth/signup
// @desc    Register user
// @access  Public
router.post("/signup", signup);

module.exports = router;
