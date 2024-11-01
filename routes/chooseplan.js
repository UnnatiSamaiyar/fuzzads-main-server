// formRoutes.js
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// POST route for form submission
router.post('/choose-plan/submit', async (req, res) => {
  const { serviceCategory, fullName, email, phone, message } = req.body;
  
  // Set up nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Or your preferred email service
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
  });

  // Email content
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'contact@fuzzads.com', // Send to yourself
    subject: `New Service Inquiry from ${fullName}`,
    html: `
      <h2 style="color: #26017b;">Service Inquiry</h2>
      <p><strong style="color: #00a5e0;">Service Category:</strong> ${serviceCategory}</p>
      <p><strong style="color: #00a5e0;">Full Name:</strong> ${fullName}</p>
      <p><strong style="color: #00a5e0;">Email:</strong> ${email}</p>
      <p><strong style="color: #00a5e0;">Phone:</strong> ${phone}</p>
      <p><strong style="color: #00a5e0;">Message:</strong> ${message}</p>
    `,
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Form submitted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Form submission failed.', error });
  }
});

module.exports = router;
