const express = require('express');
const nodemailer = require('nodemailer'); 
const router = express.Router();


const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});


router.post('/demoform', async (req, res) => {
  const { name, email, phone, companyName: location, dateTime: timeslot } = req.body;

  
  const mailOptions = {
    from: process.env.EMAIL_USER, 
    to: 'fuzzads.co@gmail.com', 
    subject: 'Booked a free demo session!',
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nLocation: ${location}\nTime Slot: ${timeslot}`
  };

  try {
    
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Error submitting form' });
  }
});

module.exports = router;
