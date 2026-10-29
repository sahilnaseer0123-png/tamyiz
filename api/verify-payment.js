/**
 * TAMYIZ™ Serverless Payment Verification & Instant Vault Unlock Endpoint
 * POST /api/verify-payment
 */

import crypto from 'crypto';
import { CATALOG_PRICES, calculateOrderTotal, resolveDownloadLink, sendReceiptEmail } from './_utils.js';

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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      mode,
      items,
      email,
      phone,
      coupon,
      couponCode
    } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing items for digital fulfillment' });
    }

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPhone = String(phone || '').trim();
    const appliedCoupon = coupon || couponCode;

    // Calculate strict order totals
    let orderCalc = { total: 0, subtotal: 0, discount: 0, amountPaise: 0 };
    try {
      orderCalc = calculateOrderTotal(items, appliedCoupon);
    } catch (_) {}

    // 1. Signature Verification for Live/Test Razorpay Mode
    if (mode === 'razorpay') {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: 'Incomplete Razorpay payment verification parameters' });
      }

      const secret = process.env.RAZORPAY_KEY_SECRET || '';
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        console.error('Signature mismatch:', { generatedSignature, received: razorpay_signature });
        return res.status(400).json({ error: 'Invalid payment signature. Verification failed.' });
      }
    }

    // 2. Generate Cryptographic Reference ID
    const refCode = Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    const referenceId = `TAMYIZ-ORD-${refCode}`;
    const paymentId = razorpay_payment_id || `pay_sandbox_${Date.now()}`;
    const orderId = razorpay_order_id || `order_sandbox_${Date.now()}`;

    // 3. Resolve Download Vault & Duplication Links
    const downloads = items.map(item => {
      const prodId = item.productId || item.id;
      const variant = item.variant || item.size || 'Standard';
      const dl = resolveDownloadLink(prodId, variant);
      const catProd = CATALOG_PRICES[prodId];
      const variantData = catProd?.variants?.[variant] || (catProd ? Object.values(catProd.variants)[0] : null);
      dl.price = item.price || variantData?.price || 499;
      return dl;
    });

    // 4. Trigger Transactional Email Receipt (if Resend is configured)
    await sendReceiptEmail({
      email: cleanEmail,
      phone: cleanPhone,
      orderId,
      referenceId,
      items,
      downloads
    }).catch(err => console.error('Email dispatch error (non-blocking):', err));

    // 5. Return Complete Verification & Instant Unlocked Vault
    return res.status(200).json({
      verified: true,
      mode: mode || 'atelier_sandbox',
      referenceId,
      paymentId,
      orderId,
      timestamp: new Date().toISOString(),
      email: cleanEmail,
      phone: cleanPhone,
      itemsCount: items.length,
      subtotalINR: orderCalc.subtotal,
      discountINR: orderCalc.discount,
      totalINR: orderCalc.total,
      amount: orderCalc.amountPaise,
      downloads
    });

  } catch (err) {
    console.error('verify-payment handler error:', err);
    return res.status(500).json({ error: err.message || 'Payment verification failed' });
  }
}
