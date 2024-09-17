const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const formRoutes = require('./routes/formRoutes'); // Import the form routes
const contactform = require('./routes/contactformRoutes');
const passport = require('passport');
const bookdemoform = require('./routes/demoformRoute');
const contact = require('./routes/maincontactform');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();

// Initialize CORS
app.use(cors());

// Connect to Database
connectDB();

// Init Middleware
app.use(express.json()); // Parse JSON bodies

// Session and Passport Initialization
app.use(session({
  secret: process.env.SESSION_SECRET || 'f3ca9b58afc81aa4ff183c0ac43a210962d3353b00f46d90b2b844f31b75b835', // Replace with a secure secret
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Define Routes
app.use('/api/auth', authRoutes); // Use auth routes under /api/auth
app.use('/api', formRoutes); // Use form routes under /api
app.use('/api', contactform);
app.use('/api', bookdemoform);
app.use('/api', contact);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
