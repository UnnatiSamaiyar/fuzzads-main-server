require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const axios = require("axios");
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

const router = express.Router();

const MERCHANT_KEY = "ac2cb79f-b306-40fd-a05f-238315f8c246";
const MERCHANT_ID = "M226Q15EKG437";

const MERCHANT_BASE_URL = "https://api.phonepe.com/apis/hermes"; // Payment URL
const MERCHANT_STATUS_URL = "https://api.phonepe.com/apis/hermes"; // Status URL

const TEST_KEY = "f2c864ec-b46a-4732-8ddf-fa11666d2acc";
const TEST_ID = "PGTESTPAYUAT144";
const TEST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const TEST_INDEX = 1;

const redirectUrl = "http://localhost:8000/status"; // Callback URL after payment
const successUrl = "https://fuzzads.com/thank-you";
const failureUrl = "https://fuzzads.com/error";

// Environment variables
const {
  PHONEPE_MERCHANT_ID,
  PHONEPE_MERCHANT_KEY,
  SALT_KEY,
  PRODUCTION_LINK,
} = process.env;

// Payment endpoint
// Route to create order and initiate payment
app.post('/create-order', async (req, res) => {
  const { name, mobileNumber, amount } = req.body;
  const orderId = uuidv4();

  const paymentPayload = {
      merchantId: MERCHANT_ID,
      merchantUserId: name,
      mobileNumber: mobileNumber,
      amount: amount,
      merchantTransactionId: orderId,
      redirectUrl: `${redirectUrl}/?id=${orderId}`,
      redirectMode: 'POST',
      paymentInstrument: {
          type: 'PAY_PAGE'
      }
  };

  const payload = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
  const keyIndex = 1;
  const string = payload + '/pg/v1/pay' + MERCHANT_KEY;
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  const checksum = sha256 + '###' + keyIndex;

  const option = {
      method: 'POST',
      url: MERCHANT_BASE_URL,
      headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          'X-VERIFY': checksum
      },
      data: {
          request: payload
      }
  };

  try {
      const response = await axios.request(option);
      res.status(200).json({ msg: "OK", url: response.data.data.instrumentResponse.redirectInfo.url });
  } catch (error) {
      console.log("Error in payment", error);
      res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// Route to check the payment status
app.post('/status', async (req, res) => {
  const merchantTransactionId = req.query.id;

  const keyIndex = 1;
  const string = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + MERCHANT_KEY;
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  const checksum = sha256 + '###' + keyIndex;

  const option = {
      method: 'GET',
      url: `${MERCHANT_STATUS_URL}/${MERCHANT_ID}/${merchantTransactionId}`,
      headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': MERCHANT_ID
      }
  };

  axios.request(option).then((response) => {
      if (response.data.success === true) {
          return res.redirect(successUrl);
      } else {
          return res.redirect(failureUrl);
      }
  });
});

module.exports = router;
