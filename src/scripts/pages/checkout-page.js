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
      <section class="tamyiz-section py-10 md:py-16 pb-16 md:pb-24" style="background: var(--color-offwhite);">
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
                          placeholder="+91 95417 22379"
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
                  <span id="checkout-submit-label">Pay &amp; Access Editions →</span>
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
                  <span class="text-xs font-bold text-neutral-500 uppercase">${cart.length} Digital License${cart.length > 1 ? 's' : ''}</span>
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
                          <span class="text-xs font-mono text-neutral-500 uppercase tracking-wider">Single License (1)</span>
                          <strong class="text-sm font-bold text-black">₹${item.price.toLocaleString('en-IN')}</strong>
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
                        placeholder="Coupon code (DISTINCT10)"
                        class="tamyiz-coupon-input flex-1"
                        style="text-transform: uppercase;"
                        onkeydown="if(event.key==='Enter'){ event.preventDefault(); window.tamyizApp.applyCouponFromCheckout(); }"
                      />
                      <button
                        type="button"
                        class="tamyiz-btn-apply-coupon"
                        onclick="window.tamyizApp.applyCouponFromCheckout()"
                      >
                        Apply Code
                      </button>
                    </div>
                    <div id="checkout-coupon-feedback" style="display: none; font-size: 0.75rem; margin-top: 0.45rem; font-weight: 600;"></div>
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
  const currentDateStr = order.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const invoiceNumber = `INV-TMZ-${order.orderId}`;
  const authToken = `TMZ-AUTH-${order.orderId}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  return `
    <div class="tamyiz-page-order-vault py-12 md:py-20">
      <div class="container max-w-4xl mx-auto">
        <div class="tamyiz-vault-card">
          <!-- Success Seal -->
          <div class="tamyiz-vault-seal no-print">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>

          <span class="tamyiz-vault-kicker no-print">Order Confirmed &amp; Authenticated</span>
          <h1 class="tamyiz-vault-title no-print">Instant Access Unlocked</h1>
          <p class="tamyiz-vault-sub no-print">
            Order <strong>#${order.orderId}</strong> • Total Paid: <strong>₹${order.total.toLocaleString('en-IN')}</strong>
          </p>
          <p class="no-print" style="font-size: 0.9rem; color: #555; margin-bottom: 2rem;">
            A confirmation has been dispatched to <strong>${order.shippingAddress?.email || 'your email'}</strong> and <strong>${order.shippingAddress?.phone || 'WhatsApp'}</strong>. Your files and official invoice are ready below:
          </p>

          <!-- Download Cards for Each Item -->
          <div class="tamyiz-vault-downloads-list mb-8 no-print">
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
                    <span>Download Edition</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Quick Invoice Action Bar -->
          <div class="no-print flex flex-wrap gap-3 justify-center items-center mb-6">
            <button
              class="tamyiz-hero-btn-primary"
              style="padding: 0.75rem 1.6rem; font-size: 0.82rem;"
              onclick="window.print()"
            >
              <span>🖨 Print Invoice</span>
            </button>
            <button
              class="tamyiz-btn-nav-outline"
              style="padding: 0.75rem 1.6rem; font-size: 0.82rem;"
              onclick="window.tamyizApp.downloadInvoice('${order.orderId}')"
            >
              <span>⬇ Download Invoice</span>
            </button>
            <a
              href="https://wa.me/${siteConfig.whatsappNumber}?text=Hello%20TAMYIZ,%20I%20just%20completed%20Order%20${order.orderId}%20and%20would%20like%20my%20receipt%20confirmation."
              target="_blank"
              rel="noopener noreferrer"
              class="tamyiz-btn-nav-outline"
              style="padding: 0.75rem 1.4rem; font-size: 0.82rem; display: inline-flex; align-items: center; gap: 0.4rem; color: #278838; border-color: #278838;"
            >
              <span>💬 WhatsApp Confirmation ↗</span>
            </a>
            <button
              class="tamyiz-btn-nav-outline"
              style="padding: 0.75rem 1.4rem; font-size: 0.82rem;"
              onclick="window.tamyizApp.resetOrderAndReturnHome()"
            >
              <span>Continue Browsing Editions →</span>
            </button>
          </div>

          <!-- OFFICIAL PRINTABLE SWISS DIGITAL TAX INVOICE -->
          <div class="tamyiz-invoice-card" id="tamyiz-printable-invoice">
            <div class="tamyiz-invoice-header">
              <div class="tamyiz-invoice-brand">
                <h2>TAMYIZ™</h2>
                <div style="font-size: 0.72rem; color: #555; font-family: var(--font-sub); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 0.2rem;">
                  Digital Publishing &amp; Systems Architecture Atelier
                </div>
                <div style="font-size: 0.76rem; color: #555; margin-top: 0.35rem; line-height: 1.45;">
                  Atelier Sopore, Kashmir 193201, India<br/>
                  Phone / WhatsApp: ${siteConfig.phone} • Email: ${siteConfig.email}
                </div>
              </div>

              <div class="tamyiz-invoice-meta sm:text-right">
                <div class="tamyiz-invoice-badge">TAX &amp; DIGITAL COMMERCIAL INVOICE</div>
                <div style="margin-top: 0.5rem; font-family: var(--font-sub); font-size: 0.78rem; line-height: 1.5;">
                  <div><strong>INVOICE NO:</strong> ${invoiceNumber}</div>
                  <div><strong>ORDER ID:</strong> #${order.orderId}</div>
                  <div><strong>DATE OF ISSUE:</strong> ${currentDateStr}</div>
                  <div><strong>PAYMENT STATUS:</strong> <span style="color: #278838; font-weight: 800;">PAID (CONFIRMED)</span></div>
                </div>
              </div>
            </div>

            <div class="tamyiz-invoice-divider"></div>

            <!-- Customer & License Details -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
              <div>
                <span class="tamyiz-invoice-section-label">BILLED TO (LICENSEE)</span>
                <div style="font-size: 0.9rem; font-weight: 700; color: #111;">
                  ${order.shippingAddress?.fullName || order.shippingAddress?.name || 'Valued Patron'}
                </div>
                <div style="font-size: 0.8rem; color: #555; line-height: 1.45; margin-top: 0.15rem;">
                  Email: ${order.shippingAddress?.email || '—'}<br/>
                  ${order.shippingAddress?.phone ? `WhatsApp: ${order.shippingAddress.phone}` : ''}
                </div>
              </div>

              <div class="sm:text-right">
                <span class="tamyiz-invoice-section-label">DELIVERY &amp; LICENSE SPECIFICATION</span>
                <div style="font-size: 0.9rem; font-weight: 700; color: #111;">
                  Instant Digital Fulfillment
                </div>
                <div style="font-size: 0.8rem; color: #555; line-height: 1.45; margin-top: 0.15rem;">
                  Single-Seat Lifetime Commercial License<br/>
                  Cryptographic Auth Token: <code>${authToken}</code>
                </div>
              </div>
            </div>

            <!-- Itemized Table -->
            <div class="tamyiz-invoice-table-wrap">
              <table class="tamyiz-invoice-table">
                <thead>
                  <tr>
                    <th style="text-align: left;">EDITION / TITLE</th>
                    <th style="text-align: left;">SPECIFICATION / FORMAT</th>
                    <th style="text-align: center;">QTY</th>
                    <th style="text-align: right;">PRICE</th>
                    <th style="text-align: right;">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items.map(item => `
                    <tr>
                      <td>
                        <strong>${item.name}</strong>
                        <div style="font-size: 0.72rem; color: #777;">Full Single-Seat License Included</div>
                      </td>
                      <td>${item.variant || 'Standard Digital Edition'}</td>
                      <td style="text-align: center;">1</td>
                      <td style="text-align: right;">₹${item.price.toLocaleString('en-IN')}</td>
                      <td style="text-align: right; font-weight: 700;">₹${item.price.toLocaleString('en-IN')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Financial Totals -->
            <div class="flex justify-end mt-4">
              <div style="width: 290px;">
                <div class="flex justify-between py-1 text-xs">
                  <span style="color: #666;">Subtotal:</span>
                  <span style="font-weight: 600;">₹${order.subtotal.toLocaleString('en-IN')}</span>
                </div>
                ${order.discount ? `
                  <div class="flex justify-between py-1 text-xs" style="color: var(--color-red);">
                    <span>Coupon Discount (${order.coupon?.code || 'APPLIED'}):</span>
                    <span style="font-weight: 700;">−₹${order.discount.toLocaleString('en-IN')}</span>
                  </div>
                ` : ''}
                <div class="flex justify-between py-1 text-xs">
                  <span style="color: #666;">Digital Delivery &amp; Storage:</span>
                  <span style="color: #278838; font-weight: 700;">₹0 (Complimentary)</span>
                </div>
                <div class="flex justify-between py-2 text-sm font-bold border-t border-black mt-2" style="font-family: var(--font-display);">
                  <span>Total Paid:</span>
                  <span style="color: var(--color-red);">₹${order.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <!-- Invoice Footer & Verification -->
            <div class="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-gray-500">
              <div>
                <div>Authenticated by TAMYIZ™ Digital Publishing Studio • Basit &amp; Sahil</div>
                <div>All digital editions include zero DRM friction and perpetual single-seat commercial rights.</div>
              </div>
              <div class="mt-2 sm:mt-0 font-mono text-right" style="font-size: 0.7rem;">
                VERIFICATION TOKEN: <strong>${authToken}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
