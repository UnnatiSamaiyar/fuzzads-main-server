const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// POST route for handling contact form submissions
router.post('/contact', async (req, res) => {
  const { name, phone, email, businessName, businessDescription, query } = req.body;

  try {
    // Create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail account
        pass: process.env.EMAIL_PASS, // Your Gmail password or App Password
      },
    });

    // Email content
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Admin email to receive the form data
      subject: 'New Contact Form Submission',
      html: `
        <h3>Contact Form Details</h3>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Phone:</strong> ${phone}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Business Name:</strong> ${businessName}</li>
          <li><strong>Business Description:</strong> ${businessDescription}</li>
          <li><strong>Query:</strong> ${query}</li>
        </ul>
      `,
    };

    // Send mail with defined transport object
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Contact form submitted successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
});

module.exports = router;
