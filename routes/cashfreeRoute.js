const express = require('express');
const axios = require('axios');
const router = express.Router();

// Cashfree credentials
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_API_URL = process.env.CASHFREE_API_URL; // Use the latest API URL

// Route to create an order
router.post('/create-order', async (req, res) => {
  const { order_id, order_amount, customer_email, customer_phone } = req.body;

  const orderPayload = {
    order_id,
    order_amount,
    order_currency: "INR",
    customer_details: {
      customer_email,
      customer_phone
    },
    order_meta: {
      return_url: "https://fuzzads-main-server.onrender.com/api/cashfree/response",
      notify_url: "https://fuzzads-main-server.onrender.com/api/cashfree/webhook"
    },
    version: "2023-08-01" // Ensure you have a valid version
  };

  try {
    // Make the API request
    const response = await axios.post(CASHFREE_API_URL, orderPayload, {
      headers: {
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'Content-Type': 'application/json'
      }
    });

    // Check if the response is successful
    if (response.data && response.data.status === 'OK') {
      res.json({
        success: true,
        paymentLink: response.data.paymentLink // Assuming the response contains this field
      });
    } else {
      throw new Error(response.data.message || 'Failed to create order');
    }

  } catch (error) {
    console.error(error); // Log the error for debugging

    res.status(500).json({
      success: false,
      message: 'Error processing payment',
      error: error.response ? error.response.data : error.message
    });
  }
});

module.exports = router;
