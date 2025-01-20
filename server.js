const express = require("express");
const cors = require("cors"); // Add this line
const helmet = require("helmet");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const formRoutes = require("./routes/formRoutes");
const contactform = require("./routes/contactformRoutes");
const bookdemoform = require("./routes/demoformRoute");
const contact = require("./routes/maincontactform");
const passport = require("passport");
const session = require("express-session");
const customplan = require("./routes/customplan.js");
const chooseplan = require("./routes/chooseplan.js");
const cashfree = require("./routes/cashfreeRoute.js");
const paymentRoutes = require("./routes/paymentRoutes.js");
require("dotenv").config();

require("./config/passport.js");

const app = express();

// List of allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://fuzzads.com',
  'https://www.fuzzads.com'
];

// Configure CORS middleware
const corsOptions = {
  origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
          callback(null, true);
      } else {
          callback(new Error('Not allowed by CORS'));
      }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

connectDB();

app.use(express.json());

app.use(
  helmet({
    frameguard: { action: "SAMEORIGIN" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "f3ca9b58afc81aa4ff183c0ac43a210962d3353b00f46d90b2b844f31b75b835",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api", formRoutes);
app.use("/api", contactform);
app.use("/api", bookdemoform);
app.use("/api", contact);
app.use("/api", customplan);
app.use("/api", chooseplan);
app.use("/api", paymentRoutes);
app.use("/api/cashfree", cashfree);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
