const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const axios = require("axios");

require("dotenv").config();

// Extract PhonePe credentials from environment variables
const MERCHANT_ID = process.env.MERCHANT_ID || "M226Q15EKG437";
const MERCHANT_KEY = process.env.MERCHANT_KEY || "ac2cb79f-b306-40fd-a05f-238315f8c246";
const SALT_INDEX = process.env.SALT_INDEX || "1";
const PROD_URL = process.env.PROD_URL || "https://api.phonepe.com/apis/hermes/pg/v1/pay";

// Endpoint to initiate payment
router.post("/phonepe/payment", async (req, res) => {
  try {
    const { amount, transactionId, redirectUrl, callbackUrl } = req.body;

    if (!amount || !transactionId || !redirectUrl || !callbackUrl) {
      console.error("Missing required fields:", req.body);
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Prepare the payload to send to PhonePe
    const payload = {
      merchantId: MERCHANT_ID,
      amount: amount * 100, // Convert to paisa
      transactionId,
      redirectUrl,    // Include the redirectUrl here
      callbackUrl,    // Include the callbackUrl here
    };

    // Stringify the payload and encode it to Base64
    const payloadString = JSON.stringify(payload);
    const encodedPayload = Buffer.from(payloadString).toString("base64");

    // Generate the checksum using HMAC-SHA256
    const checksum = crypto
      .createHmac("sha256", MERCHANT_KEY)
      .update(encodedPayload)
      .digest("hex");

    // Prepare the request headers
    const headers = {
      "Content-Type": "application/json",
      "X-VERIFY": `${checksum}###${SALT_INDEX}`,
    };

    console.log("Payload being sent to PhonePe:", payload);

    // Make the API request to PhonePe
    const response = await axios.post(PROD_URL, { request: encodedPayload }, { headers });

    // Handle response from PhonePe
    if (response.data.success) {
      console.log("PhonePe response:", response.data);
      return res.status(200).json({
        success: true,
        paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,  // PhonePe's payment URL
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
  // Validate the response and process it accordingly
  res.status(200).send("Callback received");
});

module.exports = router;
