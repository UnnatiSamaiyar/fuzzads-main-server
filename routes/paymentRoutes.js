const express = require("express");
const Razorpay = require("razorpay");
const nodemailer = require("nodemailer");
const router = express.Router();

// Razorpay instance with LIVE credentials
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Replace with your live Razorpay key_id
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Replace with your live Razorpay key_secret
});

// Configure Nodemailer transporter (using Gmail as an example)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS // Your email password or an app-specific password
  },
});

// Payment route
router.post("/create-order", async (req, res) => {
  const { amount, email } = req.body; // Include the user's email in the request body
  const options = {
    amount: amount * 100, // Convert to paise (Razorpay works in smallest currency unit)
    currency: "INR",
    receipt: "order_rcptid_11",
  };
  try {
    const order = await razorpay.orders.create(options);

   

    // Redirect to the Thank You page on the frontend
    res.status(200).json({ success: true, order, redirectURL: "/thank-you" });

  } catch (error) {
    res.status(500).json({ success: false, error });
  }
});

module.exports = router;
