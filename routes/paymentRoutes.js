const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const axios = require("axios");

require("dotenv").config();

// Extract PhonePe credentials from environment variables
const MERCHANT_ID = process.env.MERCHANT_ID;
const MERCHANT_KEY = process.env.MERCHANT_KEY; // Update with your key
const SALT_INDEX = process.env.SALT_INDEX; // Update with your salt index
const PROD_URL = process.env.PROD_URL; // PhonePe Production URL

// Endpoint to initiate payment
router.post("/phonepe/payment", async (req, res) => {
  try {
    const { amount, transactionId, redirectUrl, callbackUrl, mobileNumber } = req.body;

    if (!amount || !transactionId || !redirectUrl || !callbackUrl) {
      console.error("Missing required fields:", req.body);
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Prepare the payload
    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: transactionId,
      merchantUserId: "MUID123", // Static or dynamically fetched
      amount: amount * 100, // Convert to paisa
      redirectUrl,
      redirectMode: "REDIRECT",
      callbackUrl,
      mobileNumber: mobileNumber || "", // Optional
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    // Stringify and encode the payload to Base64
    const payloadString = JSON.stringify(payload);
    const encodedPayload = Buffer.from(payloadString).toString("base64");

    // Generate the checksum
    const checksum = crypto
      .createHash("sha256")
      .update(encodedPayload + "/pg/v1/pay" + MERCHANT_KEY)
      .digest("hex");

    // Prepare the request headers
    const headers = {
      "Content-Type": "application/json",
      "X-VERIFY": `${checksum}###${SALT_INDEX}`,
    };

    console.log("Payload being sent to PhonePe:", payload);
    console.log("Checksum:", checksum);

    // Make the API request to PhonePe
    const response = await axios.post(PROD_URL, { request: encodedPayload }, { headers });

    // Handle response
    if (response.data.success) {
      console.log("PhonePe response:", response.data);
      return res.status(200).json({
        success: true,
        paymentUrl: response.data.data.instrumentResponse.redirectInfo.url, // Payment URL
      });
    } else {
      console.error("PhonePe API Error:", response.data.message);
      return res.status(400).json({ success: false, error: response.data.message });
    }
  } catch (error) {
    console.error("Error initiating PhonePe payment:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to handle PhonePe callback
router.post("/phonepe/callback", (req, res) => {
  console.log("PhonePe callback data:", req.body);
  res.status(200).send("Callback received");
});

module.exports = router;
