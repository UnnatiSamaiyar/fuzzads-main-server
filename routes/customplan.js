const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// POST route for the contact form
router.post('/customplan/submit', async (req, res) => {
  const { name, email, phoneNumber, message } = req.body;

  // Configure nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your email password or app password
    },
  });

  const mailOptions = {
    from: email,
    to: 'contact@fuzzads.com', // Receiver's email
    subject: 'New Custom Plan Request',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #00a5e0;">
        <h2 style="color: #26017b;">New Custom Plan Request</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; border: 1px solid #00a5e0; color: #26017b;">Name:</td>
            <td style="padding: 10px; border: 1px solid #00a5e0;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #00a5e0; color: #26017b;">Email:</td>
            <td style="padding: 10px; border: 1px solid #00a5e0;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #00a5e0; color: #26017b;">Phone Number:</td>
            <td style="padding: 10px; border: 1px solid #00a5e0;">${phoneNumber}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #00a5e0; color: #26017b;">Message:</td>
            <td style="padding: 10px; border: 1px solid #00a5e0;">${message}</td>
          </tr>
        </table>
        <p style="color: #00a5e0;">Update the records!</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Form submitted successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Failed to send email.' });
  }
});

module.exports = router;
