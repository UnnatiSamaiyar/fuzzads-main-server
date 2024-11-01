const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const formRoutes = require('./routes/formRoutes');
const contactform = require('./routes/contactformRoutes');
const bookdemoform = require('./routes/demoformRoute');
const contact = require('./routes/maincontactform');
const passport = require('passport'); // Passport must be imported
const session = require('express-session');
const cors = require('cors');
const customplan = require('./routes/customplan.js');
const chooseplan = require('./routes/chooseplan.js');
const cashfree = require('./routes/cashfreeRoute.js');
const payment = require('./routes/paymentRoutes.js')
require('dotenv').config(); // Load environment variables

// Passport config
require('./config/passport.js'); // Make sure to require the passport config here

const app = express();

// Initialize CORS
app.use(cors());

// Connect to Database
connectDB();

// Init Middleware
app.use(express.json());

// Session and Passport Initialization
app.use(session({
  secret: process.env.SESSION_SECRET || 'f3ca9b58afc81aa4ff183c0ac43a210962d3353b00f46d90b2b844f31b75b835',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize()); // Initialize Passport
app.use(passport.session()); // Persistent login sessions

// Define Routes
app.use('/api/auth', authRoutes); // Use auth routes under /api/auth
app.use('/api', formRoutes); // Use form routes under /api
app.use('/api', contactform);
app.use('/api', bookdemoform);
app.use('/api', contact);
app.use('/api', customplan);
app.use('/api', chooseplan);
app.use('/api', payment);

// Define Routes
app.use('/api/cashfree', cashfree); // Cashfree routes

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
