/**
 * TAMYIZ™ Dedicated Instant Digital Checkout Page
 * Route: /checkout
 */

import { store } from '../store.js';
import { brandInfo } from '../../data/content.js';
import { siteConfig } from '../../data/site-config.js';

export function renderCheckoutPage(appInstance) {
  // If we have an active confirmed order in the session, show the Download Vault
  if (appInstance.confirmedOrder) {
    return renderOrderVaultHtml(appInstance.confirmedOrder);
  }

  const cart = store.cart;
  if (cart.length === 0) {
    return `
      <div class="tamyiz-page-checkout">
        <section class="tamyiz-page-header">
          <div class="container">
            <div class="tamyiz-page-header-inner">
              <span class="tamyiz-page-badge">INSTANT DIGITAL CHECKOUT</span>
              <h1 class="tamyiz-page-title">Your Atelier Bag is Empty</h1>
              <p class="tamyiz-page-description">
                You have not selected any digital publications or Notion operating systems yet.
              </p>
            </div>
          </div>
        </section>

        <section class="py-16 text-center">
          <div class="container">
            <p style="color: var(--color-grey); font-size: 1rem; margin-bottom: 2rem;">
              Browse our curated collection of e-books, Notion workspaces, and Swiss UI kits.
            </p>
            <button class="tamyiz-hero-btn-primary" onclick="window.tamyizApp.navigateTo('/editions')">
              <span>EXPLORE DIGITAL EDITIONS</span>
              <span>→</span>
            </button>
          </div>
        </section>
      </div>
    `;
  }

  const subtotal = store.getSubtotal();
  const discount = store.getDiscount();
  const total = store.getTotal();
  const coupon = store.coupon;

  return `
    <div class="tamyiz-page-checkout">
      <!-- DEDICATED HEADER BANNER -->
      <section class="tamyiz-page-header">
        <div class="container">
          <div class="tamyiz-page-header-inner">
            <span class="tamyiz-page-badge">SECURE 256-BIT ENCRYPTED DIGITAL CHECKOUT</span>
            <h1 class="tamyiz-page-title">Instant Digital Dispatch</h1>
            <p class="tamyiz-page-description">
              Files are unlocked on-screen immediately upon payment, with permanent redundant copies sent to your verified email and WhatsApp.
            </p>
          </div>
        </div>
      </section>

      <!-- 2-COLUMN CHECKOUT ARCHITECTURE -->
      <section class="tamyiz-section py-10 md:py-16" style="background: var(--color-offwhite);">
        <div class="container">
          <div class="tamyiz-checkout-grid">
            <!-- LEFT COLUMN: CUSTOMER DETAILS & PAYMENT METHOD -->
            <div class="tamyiz-checkout-left-col">
              <form id="checkout-form" onsubmit="event.preventDefault(); window.tamyizApp.submitCheckout();">
                <!-- STEP 1: INSTANT DELIVERY DETAILS -->
                <div class="tamyiz-checkout-card mb-6">
                  <div class="tamyiz-step-header">
                    <span class="tamyiz-step-num">01</span>
                    <div>
                      <h3 class="tamyiz-step-title">Instant Delivery Protocol</h3>
                      <p class="tamyiz-step-sub">Where should we deliver your digital download links?</p>
                    </div>
                  </div>

                  <div class="space-y-4">
                    <div>
                      <label class="tamyiz-form-label">Full Name *</label>
                      <input
                        type="text"
                        id="chk-name"
                        required
                        class="tamyiz-form-input"
                        placeholder="e.g. Sahil Naseer"
                        autocomplete="name"
                      />
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label class="tamyiz-form-label">Email Address (Primary Download) *</label>
                        <input
                          type="email"
                          id="chk-email"
                          required
                          class="tamyiz-form-input"
                          placeholder="name@domain.com"
                          autocomplete="email"
                        />
                      </div>
                      <div>
                        <label class="tamyiz-form-label">WhatsApp Number (Backup Alert) *</label>
                        <input
                          type="tel"
                          id="chk-phone"
                          required
                          class="tamyiz-form-input"
                          placeholder="+91 98765 43210"
                          autocomplete="tel"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- STEP 2: PAYMENT METHOD SELECTOR -->
                <div class="tamyiz-checkout-card mb-6">
                  <div class="tamyiz-step-header">
                    <span class="tamyiz-step-num">02</span>
                    <div>
                      <h3 class="tamyiz-step-title">Select Payment Method</h3>
                      <p class="tamyiz-step-sub">Encrypted 256-bit gateway. Instant access unlocked.</p>
                    </div>
                  </div>

                  <div class="space-y-3">
                    <label class="tamyiz-payment-option-label">
                      <input type="radio" name="checkout-payment" value="upi" checked />
                      <div class="flex-1">
                        <div class="flex justify-between items-center">
                          <strong>Instant UPI (Google Pay, PhonePe, Paytm, QR)</strong>
                          <span class="tamyiz-badge-fast">⚡ Instant</span>
                        </div>
                        <span class="text-xs text-neutral-500 block mt-0.5">Zero convenience fees • Instant mobile checkout</span>
                      </div>
                    </label>

                    <label class="tamyiz-payment-option-label">
                      <input type="radio" name="checkout-payment" value="card" />
                      <div class="flex-1">
                        <div class="flex justify-between items-center">
                          <strong>Credit / Debit Card (Visa, Mastercard, RuPay)</strong>
                        </div>
                        <span class="text-xs text-neutral-500 block mt-0.5">Secure bank OTP authentication</span>
                      </div>
                    </label>

                    <label class="tamyiz-payment-option-label">
                      <input type="radio" name="checkout-payment" value="netbanking" />
                      <div class="flex-1">
                        <div class="flex justify-between items-center">
                          <strong>NetBanking &amp; International Cards</strong>
                        </div>
                        <span class="text-xs text-neutral-500 block mt-0.5">All major Indian and global banks supported</span>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- GUARANTEE BADGE & SUBMIT BUTTON -->
                <div class="tamyiz-digital-delivery-card mb-6">
                  <div class="tamyiz-digital-delivery-badge">
                    <span>⚡</span>
                    <span>Zero Waiting Time Guarantee</span>
                  </div>
                  <p style="font-size: 0.84rem; color: #555; margin: 0; line-height: 1.5;">
                    Immediate on-screen unlock. Your access keys and digital download links will appear on this screen instantly upon clicking Complete Order.
                  </p>
                </div>

                <button type="submit" class="tamyiz-btn-submit-order w-full">
                  <span>COMPLETE ACQUISITION →</span>
                  <span>•</span>
                  <span>₹${total.toLocaleString('en-IN')}</span>
                </button>
              </form>
            </div>

            <!-- RIGHT COLUMN: STICKY ORDER SUMMARY -->
            <div class="tamyiz-checkout-right-col">
              <div class="tamyiz-checkout-summary-card">
                <div class="tamyiz-summary-header">
                  <h3>Order Summary</h3>
                  <span class="text-xs font-bold text-neutral-500 uppercase">${cart.length} Item${cart.length > 1 ? 's' : ''}</span>
                </div>

                <!-- Items List -->
                <div class="tamyiz-summary-items-list">
                  ${cart.map(item => `
                    <div class="tamyiz-summary-item" id="summary-item-${item.cartItemId}">
                      <img src="${item.image}" alt="${item.name}" class="summary-item-thumb" />
                      <div class="summary-item-info">
                        <h4 class="summary-item-name">${item.name}</h4>
                        <span class="summary-item-variant">${item.variant}</span>
                        <div class="flex items-center gap-3 mt-1.5">
                          <div class="tamyiz-qty-picker-small">
                            <button type="button" onclick="window.tamyizApp.updateSummaryQty('${item.cartItemId}', -1)">−</button>
                            <span>${item.quantity}</span>
                            <button type="button" onclick="window.tamyizApp.updateSummaryQty('${item.cartItemId}', 1)">+</button>
                          </div>
                          <strong class="text-sm font-bold text-black">₹${(item.price * item.quantity).toLocaleString('en-IN')}</strong>
                        </div>
                      </div>
                      <button
                        type="button"
                        class="summary-item-remove"
                        onclick="window.tamyizApp.removeSummaryItem('${item.cartItemId}')"
                        title="Remove from bag"
                      >✕</button>
                    </div>
                  `).join('')}
                </div>

                <!-- Coupon Section -->
                <div class="tamyiz-summary-coupon-box">
                  ${coupon ? `
                    <div class="flex justify-between items-center text-sm" style="color: #278838; font-weight: 700;">
                      <div class="flex items-center gap-1.5">
                        <span>🏷️ ${coupon.code}</span>
                        <span class="text-xs text-neutral-500">(${coupon.label})</span>
                      </div>
                      <button
                        type="button"
                        onclick="window.tamyizApp.removeCouponFromCheckout()"
                        style="color: var(--color-red); background: none; border: none; cursor: pointer; font-size: 0.75rem; font-weight: 800;"
                      >
                        REMOVE
                      </button>
                    </div>
                  ` : `
                    <div class="flex gap-2">
                      <input
                        type="text"
                        id="checkout-coupon-input"
                        placeholder="Coupon (DISTINCT10)"
                        class="tamyiz-coupon-input flex-1"
                        style="text-transform: uppercase;"
                      />
                      <button
                        type="button"
                        class="tamyiz-btn-apply-coupon"
                        onclick="window.tamyizApp.applyCouponFromCheckout()"
                      >
                        APPLY
                      </button>
                    </div>
                  `}
                </div>

                <!-- Price Calculations Breakdown -->
                <div class="tamyiz-summary-calc-rows">
                  <div class="flex justify-between text-sm py-1">
                    <span class="text-neutral-600">Subtotal</span>
                    <strong class="text-neutral-900">₹${subtotal.toLocaleString('en-IN')}</strong>
                  </div>

                  ${discount > 0 ? `
                    <div class="flex justify-between text-sm py-1" style="color: #278838;">
                      <span>Coupon Discount</span>
                      <strong>−₹${discount.toLocaleString('en-IN')}</strong>
                    </div>
                  ` : ''}

                  <div class="flex justify-between text-sm py-1">
                    <span class="text-neutral-600">Digital Dispatch</span>
                    <span style="color: #278838; font-weight: 700;">FREE (INSTANT)</span>
                  </div>

                  <div class="tamyiz-summary-total-row">
                    <span>Total Payable</span>
                    <span class="tamyiz-summary-total-val">₹${total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <!-- Trust Microcopy -->
                <div class="tamyiz-trust-bar mt-4 pt-4 border-t border-gray-100">
                  <span>Instant UPI</span>
                  <span class="tamyiz-trust-bar-dot">•</span>
                  <span>Cards</span>
                  <span class="tamyiz-trust-bar-dot">•</span>
                  <span>Direct Download Vault</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

/**
 * Order Confirmation & Download Vault View
 */
export function renderOrderVaultHtml(order) {
  return `
    <div class="tamyiz-page-order-vault py-12 md:py-20">
      <div class="container max-w-3xl mx-auto">
        <div class="tamyiz-vault-card">
          <!-- Success Seal -->
          <div class="tamyiz-vault-seal">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>

          <span class="tamyiz-vault-kicker">Digital Dispatch Protocol Confirmed</span>
          <h1 class="tamyiz-vault-title">Instant Access Unlocked</h1>
          <p class="tamyiz-vault-sub">
            Order <strong>#${order.orderId}</strong> • Total Paid: <strong>₹${order.total.toLocaleString('en-IN')}</strong>
          </p>
          <p style="font-size: 0.9rem; color: #555; margin-bottom: 2rem;">
            Redundant copies have been dispatched to <strong>${order.shippingAddress?.email || 'your email'}</strong> and <strong>${order.shippingAddress?.phone || 'WhatsApp'}</strong>. Your files are ready for immediate download below:
          </p>

          <!-- Download Cards for Each Item -->
          <div class="tamyiz-vault-downloads-list mb-8">
            ${order.items.map(item => `
              <div class="tamyiz-download-item-card">
                <div class="flex items-center gap-4">
                  <img src="${item.image}" alt="${item.name}" class="vault-item-thumb" />
                  <div class="text-left">
                    <h4 class="vault-item-title">${item.name}</h4>
                    <span class="vault-item-spec">${item.variant} • Retina 300DPI • Lifetime License</span>
                    <div class="vault-item-key">
                      <span>LICENSE KEY:</span>
                      <code>TMZ-${Math.random().toString(36).substr(2, 9).toUpperCase()}</code>
                    </div>
                  </div>
                </div>

                <div class="mt-4 sm:mt-0">
                  <button
                    class="tamyiz-btn-download-vault"
                    onclick="window.tamyizApp.triggerDownloadSim('${item.name}')"
                  >
                    <span>⬇ DOWNLOAD FILES</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Secondary Actions -->
          <div class="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a
              href="https://wa.me/${siteConfig.whatsappNumber}?text=Hello%20TAMYIZ,%20I%20just%20completed%20Order%20${order.orderId}%20and%20would%20like%20my%20receipt%20confirmation."
              target="_blank"
              rel="noopener"
              class="tamyiz-btn-nav-outline"
              style="display: inline-flex; align-items: center; gap: 0.4rem; color: #278838; border-color: #278838;"
            >
              <span>💬 Send Receipt to WhatsApp</span>
              <span>↗</span>
            </a>

            <button
              class="tamyiz-hero-btn-primary"
              style="padding: 0.75rem 1.75rem; font-size: 0.82rem;"
              onclick="window.tamyizApp.resetOrderAndReturnHome()"
            >
              <span>Return To Digital Flagship</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
