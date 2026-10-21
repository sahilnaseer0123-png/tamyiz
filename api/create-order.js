/**
 * TAMYIZ™ Serverless Order Creation Endpoint
 * POST /api/create-order
 */

import { calculateOrderTotal } from './_utils.js';

export default async function handler(req, res) {
  // CORS & Methods
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { items, email, phone, coupon } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Atelier bag contains no valid items.' });
    }

    if (!email || !String(email).includes('@') || !String(email).includes('.')) {
      return res.status(400).json({ error: 'A valid email address is required for digital dispatch.' });
    }

    const cleanPhone = String(phone || '').replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ error: 'A valid WhatsApp phone number (minimum 10 digits) is required.' });
    }

    // Server-Side Strict Price Verification
    const orderCalc = calculateOrderTotal(items, coupon);

    const hasRazorpayKeys = Boolean(
      process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      !process.env.RAZORPAY_KEY_ID.includes('YOUR_') &&
      !process.env.RAZORPAY_KEY_SECRET.includes('YOUR_')
    );

    // Live/Test Razorpay Flow
    if (hasRazorpayKeys) {
      const authHeader = Buffer.from(
        `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
      ).toString('base64');

      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: orderCalc.amountPaise,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
          notes: {
            email: String(email).trim().toLowerCase(),
            phone: cleanPhone,
            itemsCount: String(items.length)
          }
        })
      });

      if (!rzpRes.ok) {
        const errText = await rzpRes.text();
        console.error('Razorpay API error response:', errText);
        // Fallback gracefully to atelier sandbox if keys are invalid in test environment
        return res.status(200).json({
          mode: 'atelier_sandbox',
          orderId: `order_sandbox_${Date.now()}`,
          amount: orderCalc.amountPaise,
          currency: 'INR',
          totalINR: orderCalc.total,
          subtotalINR: orderCalc.subtotal,
          discountINR: orderCalc.discount,
          email,
          phone: cleanPhone,
          warning: 'Live gateway returned an error; fallen back to atelier sandbox simulator.'
        });
      }

      const rzpData = await rzpRes.json();
      return res.status(200).json({
        mode: 'razorpay',
        orderId: rzpData.id,
        amount: rzpData.amount,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
        totalINR: orderCalc.total,
        subtotalINR: orderCalc.subtotal,
        discountINR: orderCalc.discount,
        email,
        phone: cleanPhone
      });
    }

    // Smart Sandbox Fallback (Crucial for Immediate Testing Without API Keys)
    return res.status(200).json({
      mode: 'atelier_sandbox',
      orderId: `order_sandbox_${Date.now()}`,
      amount: orderCalc.amountPaise,
      currency: 'INR',
      totalINR: orderCalc.total,
      subtotalINR: orderCalc.subtotal,
      discountINR: orderCalc.discount,
      email,
      phone: cleanPhone,
      isSandbox: true
    });

  } catch (err) {
    console.error('create-order handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal order creation failure' });
  }
}
