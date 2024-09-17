const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

// In-memory storage for OTPs
const otpStorage = {};

exports.signup = async (req, res) => {
  const { firstName, lastName, businessName, email, mobile, password } = req.body;

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Create a new user instance
    user = new User({
      firstName,
      lastName,
      businessName,
      email,
      mobile,
      password,
    });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user to the database
    await user.save();

    // Create and sign a JWT token
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Generate OTP
    const otp = otpGenerator.generate(4, { digits: true, upperCase: false, specialChars: false });

    // Store OTP in memory with expiration (e.g., 10 minutes)
    otpStorage[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send OTP email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`,
    });

    res.status(200).json({ msg: "OTP sent to email" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const storedOtp = otpStorage[email];

    if (!storedOtp) {
      return res.status(400).json({ msg: "OTP not found or expired" });
    }

    if (storedOtp.otp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    if (Date.now() > storedOtp.expiresAt) {
      delete otpStorage[email]; // Clear OTP after expiration
      return res.status(400).json({ msg: "OTP expired" });
    }

    delete otpStorage[email]; // Clear OTP after successful verification
    res.status(200).json({ msg: "OTP verified successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
