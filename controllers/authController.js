const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const otpGenerator = require("otp-generator"); // for OTP generation

exports.signup = async (req, res) => {
  const { firstName, lastName, businessName, email, mobile, password } =
    req.body;

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

// Generate OTP and send it to the user
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists with that email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User does not exist" });
    }

    // Generate a random OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Set OTP expiration time (e.g., 10 minutes)
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP and expiration time in the user document
    user.otp = otp;
    user.otpExpiration = otpExpiration;
    await user.save();

    // Send OTP to user's email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return res.status(500).json({ msg: "Error sending OTP email" });
      }
      res.status(200).json({ msg: "OTP sent to your email" });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User does not exist");
      return res.status(400).json({ msg: "User does not exist" });
    }

    console.log("Stored OTP:", user.otp);
    console.log("Entered OTP:", otp);

    // Check if OTP matches and if it is not expired
    if (user.otp !== otp) {
      console.log("Invalid OTP");
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    const otpExpirationDate = new Date(user.otpExpiration);
    console.log("OTP Expiration Date:", otpExpirationDate);
    console.log("Current Date:", new Date());

    if (new Date() > otpExpirationDate) {
      console.log("OTP has expired");
      return res.status(400).json({ msg: "OTP has expired" });
    }

    // OTP is valid, proceed to password reset
    console.log("OTP verified successfully");
    res.status(200).json({ msg: "OTP verified successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};


exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User does not exist" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear OTP and OTP expiration after reset
    user.otp = undefined;
    user.otpExpiration = undefined;

    // Save the updated user
    await user.save();

    res.status(200).json({ msg: "Password has been reset successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
