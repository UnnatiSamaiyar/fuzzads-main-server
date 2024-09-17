const express = require('express');
const nodemailer = require('nodemailer'); // Import nodemailer
const router = express.Router();

// Configure nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // or another email service provider
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS  // Your email password (or app-specific password)
  }
});

// Route to handle form submission
router.post('/demoform', async (req, res) => {
  const { name, email, phone, location, timeslot } = req.body;

  // Email options
  const mailOptions = {
    from: process.env.EMAIL_USER, // sender address
    to: 'fuzzads.co@gmail.com', // list of receivers
    subject: 'Booked a free demo session!',
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nLocation: ${location}\nTime Slot: ${timeslot}`
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Error submitting form' });
  }
});

module.exports = router;
