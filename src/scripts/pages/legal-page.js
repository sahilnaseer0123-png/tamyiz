/**
 * TAMYIZ™ Legal & Atelier Protocols Page
 * Routes:
 *   /legal
 *   /legal/delivery-protocol
 *   /legal/license
 *   /legal/privacy
 *   /legal/terms
 */

import { siteConfig } from '../../data/site-config.js';

export const legalDocs = {
  'delivery-protocol': {
    slug: 'delivery-protocol',
    code: 'POL-01',
    title: 'Instant Digital Delivery Protocol',
    subtitle: 'Shipping & Delivery Policy // 100% Digital Fulfilment (0–2 Minutes SLA)',
    lastUpdated: 'October 2026',
    sections: [
      {
        heading: '01. Nature of Goods & Zero Physical Shipping',
        content: `All TAMYIZ™ catalog products are 100% digital assets: editorial monographs (Retina 300DPI vector PDF, reflowable EPUB 3, Kindle EPUB), Notion operating workspaces, and Figma UI/UX design systems. Zero physical manufacturing, postal dispatch, or courier shipping is required.`
      },
      {
        heading: '02. Delivery Timeline (Instantaneous 0–2 Minutes SLA)',
        content: `Digital fulfillment is instantaneous (0–2 minutes) upon transaction verification. Immediately upon payment authorization through our 256-bit encrypted gateway, your session transitions to the on-screen ATELIER DISPATCH COMPLETE — EDITION UNLOCKED chamber with one-click direct download and duplication vault buttons.
A copy of your download links is also sent to the email address you gave at checkout.`
      },
      {
        heading: '03. Concierge Escalation Protocol',
        content: `If digital delivery is delayed beyond 10 minutes due to aggressive recipient email spam filters or telecommunication gateway latency, buyers may contact our direct WhatsApp Concierge (+91 95417 22379) or email tamyiz.co@gmail.com quoting their Transaction Reference ID for immediate manual file dispatch within 1 hour.`
      },
      {
        heading: '04. Lifetime Free Digital Updates & Errata',
        content: `All digital edition licenses include perpetual, complimentary access to future edition revisions, errata corrections, Notion formula upgrades, and Figma component updates at zero additional fee.`
      }
    ]
  },
  'license': {
    slug: 'license',
    code: 'POL-02',
    title: 'Refund, Cancellation & License Policy',
    subtitle: 'Refunds, cancellations and what your purchase lets you do',
    lastUpdated: 'October 2026',
    sections: [
      {
        heading: '01. Perpetual Single-Operator Commercial License Grant',
        content: `Upon purchase clearance, TAMYIZ Studio grants you a perpetual, non-exclusive, worldwide single-operator personal and commercial license.
You are permitted to apply the frameworks, deploy the Notion operating systems across your personal or freelance business, and use the Figma UI Kit components in unlimited client and commercial web applications.
Redistribution, reselling, sub-licensing, torrenting, or public sharing of raw PDF, EPUB, Notion duplication URLs, or Figma source files is strictly prohibited under the Copyright Act, 1957.`
      },
      {
        heading: '02. Refund & Cancellation Terms for Digital Assets',
        content: `Because all TAMYIZ™ editions are delivered instantaneously as DRM-free digital files and duplicable workspace templates, completed digital sales are final once unlocked on screen or dispatched.`
      },
      {
        heading: '03. Statutory Exceptions (7-Day Resolution Window)',
        content: `A full replacement or 100% refund is unconditionally guaranteed within 7 days of purchase under the following circumstances:
• Duplicate transactions or duplicate UPI debits resulting from payment gateway network timeouts.
• Corrupted archive files or defective template duplication links that cannot be resolved by TAMYIZ engineering within 24 hours of notification.`
      },
      {
        heading: '04. Settlement & Refund Processing Timeline',
        content: `Approved refunds are initiated through our payment gateway within 48 hours of verification and credited back to the original source account (UPI, Credit/Debit Card, or NetBanking) within 5–7 business days in accordance with Indian banking clearing standards.`
      }
    ]
  },
  'privacy': {
    slug: 'privacy',
    code: 'POL-03',
    title: 'Privacy & Data Security Policy',
    subtitle: 'DPDP Act India Compliant Architecture // Zero Telemetry Selling',
    lastUpdated: 'October 2026',
    sections: [
      {
        heading: '01. Data Minimization & DPDP Act India Compliance',
        content: `In compliance with the Digital Personal Data Protection (DPDP) Act of India and international data protection standards, TAMYIZ collects only the absolute minimum data required to execute digital fulfillment, authenticate lifetime edition updates, and furnish concierge assistance.
We collect strictly: Buyer Full Name, Dispatch Email Address, WhatsApp Mobile Number, and Payment Reference ID.`
      },
      {
        heading: '02. Payment Gateway Security Architecture',
        content: `TAMYIZ™ operates zero-knowledge financial handling. We NEVER store, process, or view credit/debit card numbers, CVV codes, or UPI PINs on our servers. All transactions are routed directly through PCI-DSS Level 1 certified Indian payment gateways (Razorpay) utilizing 256-bit TLS encryption.`
      },
      {
        heading: '03. Data Protection, Zero Third-Party Sharing & Erasure Rights',
        content: `We never sell, rent, monetize, or disclose your contact coordinates to advertising networks, data brokers, or third parties.
Users retain the perpetual right to request complete data erasure or access to their digital purchase records at any time by contacting tamyiz.co@gmail.com.`
      }
    ]
  },
  'terms': {
    slug: 'terms',
    code: 'POL-04',
    title: 'Terms of Service & Merchant Notice',
    subtitle: 'Terms & Conditions + Merchant Legal Notice',
    lastUpdated: 'October 2026',
    sections: [
      {
        heading: '01. Who Runs TAMYIZ',
        content: `TAMYIZ™ (tamyiz.pages.dev) is run by its co-founders from Sopore, Jammu & Kashmir 193201, India.
Co-Founded by Basit Majeed (Security & Academic Research) and Sahil (AI/ML & Architecture).`
      },
      {
        heading: '02. Official Merchant Support Channels',
        content: `Official customer support and statutory compliance inquiries:
• Electronic Mail: tamyiz.co@gmail.com
• WhatsApp Concierge: +91 95417 22379 (Available Monday–Saturday, 10:00–19:00 IST)`
      },
      {
        heading: '03. Pricing & Lifetime Update Entitlements',
        content: `All prices are in Indian Rupees (₹). The price shown is the full amount you pay; nothing is added at checkout. Digital edition purchases grant irrevocable single-user access including all asynchronous version updates, errata sheets, and revised format deliverables.`
      },
      {
        heading: '04. Governing Law & Dispute Resolution',
        content: `These terms and all digital transactions are governed exclusively by the laws of India. Any legal disputes arising in connection with TAMYIZ™ shall be subject to the exclusive jurisdiction of the competent courts in Sopore / Baramulla, Jammu & Kashmir, India.`
      }
    ]
  },
  'contact': {
    slug: 'contact',
    code: 'POL-05',
    title: 'Contact Us',
    subtitle: 'How to reach TAMYIZ about an order, a refund or anything else',
    lastUpdated: 'October 2026',
    sections: [
      {
        heading: '01. Fastest: WhatsApp',
        content: `WhatsApp or call +91 95417 22379 (Monday–Saturday, 10:00–19:00 IST). For an order, include the order reference from your receipt.`
      },
      {
        heading: '02. Email',
        content: `tamyiz.co@gmail.com. We reply within one working day.`
      },
      {
        heading: '03. Business details',
        content: `TAMYIZ™ is run by its co-founders Basit Majeed and Sahil Naseer.
Address: Sopore, Jammu & Kashmir 193201, India.`
      }
    ]
  }
};

export function renderLegalPage(activeSlug = 'delivery-protocol', appInstance) {
  const validSlug = legalDocs[activeSlug] ? activeSlug : 'delivery-protocol';
  const doc = legalDocs[validSlug];

  const tabList = [
    { slug: 'delivery-protocol', label: 'Delivery Protocol', code: '01' },
    { slug: 'license', label: 'Refunds & License', code: '02' },
    { slug: 'privacy', label: 'Privacy & Security', code: '03' },
    { slug: 'terms', label: 'Terms of Service', code: '04' },
    { slug: 'contact', label: 'Contact Us', code: '05' }
  ];

  return `
    <div class="tamyiz-page-legal">
      <!-- HEADER BANNER -->
      <section class="tamyiz-page-header">
        <div class="container">
          <div class="tamyiz-page-header-inner">
            <span class="tamyiz-page-badge">STUDIO PROTOCOLS // ${doc.code}</span>
            <h1 class="tamyiz-page-title">${doc.title}</h1>
            <p class="tamyiz-page-description">${doc.subtitle}</p>
          </div>
        </div>
      </section>

      <!-- NAVIGATION TABS -->
      <div class="tamyiz-legal-tabs-bar sticky top-16 md:top-20 z-20 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div class="container">
          <div class="flex overflow-x-auto whitespace-nowrap gap-2 py-3 no-scrollbar">
            ${tabList.map(tab => `
              <button
                class="tamyiz-legal-tab-btn px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-full transition-all ${tab.slug === validSlug ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}"
                onclick="window.tamyizApp.navigateTo('/legal/${tab.slug}')"
              >
                <span class="${tab.slug === validSlug ? 'text-red-500' : 'text-neutral-400'} mr-1.5">${tab.code}</span>
                ${tab.label}
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- MAIN LEGAL CONTENT -->
      <section class="tamyiz-section py-12 md:py-20 bg-[#FBFBFB]">
        <div class="container max-w-4xl mx-auto px-4 sm:px-6">
          <div class="bg-white border border-neutral-200 p-6 sm:p-10 md:p-14 rounded-lg shadow-sm">
            <div class="flex justify-between items-center pb-6 mb-8 border-b border-neutral-200 text-xs font-mono text-neutral-500">
              <span>LEGAL REF: ${doc.code} // TAMYIZ STUDIO</span>
              <span>EFFECTIVE: ${doc.lastUpdated}</span>
            </div>

            <div class="space-y-10 text-neutral-800">
              ${doc.sections.map(sec => `
                <div class="legal-section">
                  <h2 class="text-base sm:text-lg font-bold font-mono tracking-tight text-black mb-3 pb-2 border-b border-neutral-100">
                    ${sec.heading}
                  </h2>
                  <div class="text-sm sm:text-base leading-relaxed text-neutral-700 whitespace-pre-line font-serif sm:font-sans">
                    ${sec.content}
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- BUSINESS CONTACT DETAILS -->
            <div class="mt-12 p-6 sm:p-7 bg-neutral-50 border border-neutral-300 rounded text-xs font-mono text-neutral-700 leading-relaxed">
              <div class="font-bold text-black uppercase tracking-wider text-sm mb-3 pb-2 border-b border-neutral-200">
                Business Contact Details
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div class="mb-1.5"><strong class="text-black">Operating Entity:</strong> TAMYIZ™ Digital Publishing &amp; Systems Architecture Atelier</div>
                  <div class="mb-1.5"><strong class="text-black">Studio Address:</strong> Sopore, Kashmir 193201, India</div>
                                    <div><strong class="text-black">Co-Founders:</strong> Basit Majeed (Security &amp; Research) &amp; Sahil (AI/ML &amp; Build)</div>
                </div>
                <div>
                  <div class="mb-1.5"><strong class="text-black">Direct Concierge Email:</strong> <a href="mailto:tamyiz.co@gmail.com" class="underline text-black font-bold">tamyiz.co@gmail.com</a></div>
                  <div class="mb-1.5"><strong class="text-black">Phone &amp; WhatsApp:</strong> <a href="tel:+919541722379" class="underline text-black font-bold">+91 95417 22379</a> (10:00–19:00 IST)</div>
                  <div class="mb-1.5"><strong class="text-black">Delivery SLA:</strong> Instantaneous on-screen unlock + email dispatch within 60 seconds</div>
                  <div><strong class="text-black">Refund Protocol:</strong> 100% replacement for corrupted files; 7-day refund if reader incompatibility cannot be resolved</div>
                </div>
              </div>
            </div>

            <div class="mt-10 pt-8 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono text-neutral-600">
              <div>
                Questions regarding protocols? Concierge: 
                <a href="mailto:${siteConfig.conciergeEmail}" class="text-black font-bold underline ml-1">${siteConfig.conciergeEmail}</a>
              </div>
              <button 
                class="tamyiz-btn-nav-outline text-xs px-4 py-2"
                onclick="window.tamyizApp.navigateTo('/editions')"
              >
                <span>Return to The Editions</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}
