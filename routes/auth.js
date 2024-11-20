const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the User model
const passport = require('passport');
const authController = require('../controllers/authController'); // Import the auth controller

// Initiate Google OAuth
router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}));

// Handle Google OAuth callback
router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: '/' // Redirect on failure
}), (req, res) => {
    // Successful authentication, redirect to the desired page or frontend URL
    res.redirect('http://localhost:3000'); // Adjust the URL as needed
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    const { firstName, lastName, businessName, email, mobile, password } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create a new user
        user = new User({
            firstName,
            lastName,
            businessName,
            email,
            mobile,
            password
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save user
        await user.save();

        // Return JSON Web Token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5 days' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Generate JWT token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5 days' },
            (err, token) => {
                if (err) throw err;

                // Return initials along with the token
                const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
                res.json({ token, initials });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// POST /api/auth/request-reset
router.post('/request-reset', authController.requestPasswordReset);

// POST /api/auth/verify-otp
router.post('/verify-otp', authController.verifyOTP);

// POST /api/auth/reset-password
router.post('/reset-password', authController.resetPassword);



module.exports = router;
    
