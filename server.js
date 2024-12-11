const express = require("express");
const helmet = require("helmet");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const formRoutes = require("./routes/formRoutes");
const contactform = require("./routes/contactformRoutes");
const bookdemoform = require("./routes/demoformRoute");
const contact = require("./routes/maincontactform");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const customplan = require("./routes/customplan.js");
const chooseplan = require("./routes/chooseplan.js");
const cashfree = require("./routes/cashfreeRoute.js");
const paymentRoutes = require("./routes/paymentRoutes.js");
require("dotenv").config();

require("./config/passport.js");

const app = express();

// Use CORS with explicit settings for security
app.use(
  cors({
    origin: ["https://fuzzads.com"], // Replace with your trusted domains
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Connect to the database
connectDB();

app.use(express.json());

// Helmet for secure headers
app.use(
  helmet({
    frameguard: { action: "SAMEORIGIN" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },  // Explicitly setting the Referrer-Policy header
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true, // Apply to all subdomains
      preload: true, // Indicate that your domain should be included in the HSTS preload list
    },
  })
);


// Session management
app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "f3ca9b58afc81aa4ff183c0ac43a210962d3353b00f46d90b2b844f31b75b835",
    resave: false,
    saveUninitialized: true,
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Route declarations
app.use("/api/auth", authRoutes);
app.use("/api", formRoutes);
app.use("/api", contactform);
app.use("/api", bookdemoform);
app.use("/api", contact);
app.use("/api", customplan);
app.use("/api", chooseplan);
app.use("/api", paymentRoutes);
app.use("/api/cashfree", cashfree);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
