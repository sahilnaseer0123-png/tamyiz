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
    subtitle: 'Zero Shipping Delays. Cryptographic Tokenized Access Vault.',
    lastUpdated: 'October 2026',
    sections: [
      {
        heading: '01. Instantaneous Fulfillment Engine',
        content: `All TAMYIZ digital publications, architectural monographs, Notion workspaces, and design systems are 100% digital products delivered immediately upon payment authorization. There are zero physical shipping lead times, customs barriers, or courier delays.

Immediately upon transaction clearance through our 256-bit encrypted gateway, your order session transitions to your personal Order Confirmation & Download Vault (TAMYIZ-ORD-XXXX).`
      },
      {
        heading: '02. Redundant Triple-Channel Dispatch',
        content: `To eliminate delivery failure risks, access credentials and files are simultaneously routed via three redundant channels:
1. On-Screen Download Vault: Direct one-click download buttons on your order confirmation screen.
2. Verified Email Dispatch: A permanent cryptographic link sent to your specified email address within 60 seconds.
3. WhatsApp Concierge Backup: An automated WhatsApp confirmation message with transaction hash and vault recovery link.`
      },
      {
        heading: '03. Formats & File Integrity',
        content: `All publications are packaged as DRM-free, high-resolution vector PDF (300DPI architectural layout) and reflowable EPUB 3 (optimized for Apple Books, Amazon Kindle, and Remarkable). Notion systems include verified workspace duplication URLs. Design systems include Figma community links and clean code zip archives.`
      },
      {
        heading: '04. Lifetime Free Revision Upgrades',
        content: `Purchasing any TAMYIZ edition entitles the single-operator licensee to all future errata fixes, revised editions, upgraded Notion formulas, and refreshed Figma design token updates for life at zero additional charge.`
      }
    ]
  },
  'license': {
    slug: 'license',
    code: 'POL-02',
    title: 'Atelier Guarantee & License Terms',
    subtitle: 'Single-Operator Autonomy & Intellectual Property Protection.',
    lastUpdated: 'October 2026',
    sections: [
      {
        heading: '01. Personal & Single-Operator Commercial Grant',
        content: `Upon acquisition, TAMYIZ Studio grants you a non-exclusive, perpetual, worldwide license to download, read, study, and apply the methodologies, Notion database architectures, and UI/UX component libraries across personal and commercial client projects.`
      },
      {
        heading: '02. Scope of Commercial Application',
        content: `You MAY:
• Deploy the Notion systems inside your own business, agency, or single-operator consultancy.
• Use the Swiss UI Kit components to build client websites, SaaS products, and digital interfaces.
• Print personal reference copies of the monographs for your private study desk.

You MAY NOT:
• Resell, sub-license, redistribute, share, torrent, or upload the raw files, PDFs, EPUBs, or Figma templates to public repositories or shared drives.
• Claim authorship of the written architectural essays, original philosophies, or TAMYIZ brand assets.`
      },
      {
        heading: '03. 7-Day Compatibility Guarantee',
        content: `If an acquired edition fails to open on your verified hardware reader (Apple Books, Amazon Kindle, Notion app, or Figma desktop) and our concierge cannot resolve the technical incompatibility within 48 hours, we will issue a full 100% refund without friction.`
      }
    ]
  },
  'privacy': {
    slug: 'privacy',
    code: 'POL-03',
    title: 'Privacy & Data Security Architecture',
    subtitle: 'Zero Telemetry Selling. Minimal Necessary Data Collection.',
    lastUpdated: 'October 2026',
    sections: [
      {
        heading: '01. Philosophy of Data Minimization',
        content: `In alignment with our Swiss and Himalayan minimalist philosophy, TAMYIZ Studio collects only the absolute minimum data required to deliver your digital purchases, authenticate licensed updates, and provide direct concierge support. We do NOT run tracking pixels, intrusive behavioral fingerprinting, or ad-retargeting cookies.`
      },
      {
        heading: '02. Information We Process',
        content: `• Customer Name & Email: For generating personalized order license vaults and sending download receipts.
• WhatsApp / Phone Number: Used solely for backup delivery dispatch and opt-in order status alerts.
• Transaction Metadata: Amount, currency, and payment reference token (we NEVER store credit card numbers, CVVs, or UPI PINs on our servers).`
      },
      {
        heading: '03. Payment Gateway Compliance',
        content: `All financial transactions are processed through Level 1 PCI-DSS certified payment processors (e.g. Razorpay, Stripe, Cashfree) using 256-bit end-to-end SSL/TLS encryption. Your financial credentials never touch our application memory.`
      },
      {
        heading: '04. Rights Under Indian & International Law',
        content: `You retain the right to request full erasure of your contact record from our active mailing list at any time by contacting our concierge at ${siteConfig.conciergeEmail}.`
      }
    ]
  },
  'terms': {
    slug: 'terms',
    code: 'POL-04',
    title: 'Terms of Service & Atelier Agreement',
    subtitle: 'Legal Framework Governing TAMYIZ Digital Operations.',
    lastUpdated: 'October 2026',
    sections: [
      {
        heading: '01. Acceptance of Terms',
        content: `By accessing the TAMYIZ platform (tamyiz.in), browsing curated editions, or acquiring digital assets, you legally accept and agree to be bound by these Terms of Service and our Atelier Guarantee.`
      },
      {
        heading: '02. Digital Product Nature & Refund Protocol',
        content: `Because digital downloads are instantly accessible and non-returnable once files are dispatched, orders are final upon payment, subject only to our 7-Day Technical Compatibility Guarantee. Corrupted download archives will be reissued immediately with renewed cryptographic tokens upon concierge request.`
      },
      {
        heading: '03. Intellectual Property Rights',
        content: `TAMYIZ™, the T• monogram seal, all text, architectural monograph contents, graphic illustrations, code snippets, and custom typography pairings are the proprietary intellectual property of TAMYIZ Studio (Sopore, Kashmir). Unauthorized commercial re-syndication will be prosecuted under the Copyright Act, 1957 and international copyright treaties.`
      },
      {
        heading: '04. Governing Law & Jurisdiction',
        content: `These terms shall be governed by and construed in accordance with the laws of Jammu & Kashmir, India. Any disputes arising in connection with this studio shall be subject to the exclusive jurisdiction of the competent courts in Sopore / Baramulla, Jammu & Kashmir.`
      }
    ]
  }
};

export function renderLegalPage(activeSlug = 'delivery-protocol', appInstance) {
  const validSlug = legalDocs[activeSlug] ? activeSlug : 'delivery-protocol';
  const doc = legalDocs[validSlug];

  const tabList = [
    { slug: 'delivery-protocol', label: 'Delivery Protocol', code: '01' },
    { slug: 'license', label: 'Atelier License', code: '02' },
    { slug: 'privacy', label: 'Privacy & Security', code: '03' },
    { slug: 'terms', label: 'Terms of Service', code: '04' }
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
                  <h3 class="text-base sm:text-lg font-bold font-mono tracking-tight text-black mb-3 pb-2 border-b border-neutral-100">
                    ${sec.heading}
                  </h3>
                  <div class="text-sm sm:text-base leading-relaxed text-neutral-700 whitespace-pre-line font-serif sm:font-sans">
                    ${sec.content}
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- INDIAN PAYMENT GATEWAY & STATUTORY KYC COMPLIANCE DISCLOSURE -->
            <div class="mt-12 p-6 sm:p-7 bg-neutral-50 border border-neutral-300 rounded text-xs font-mono text-neutral-700 leading-relaxed">
              <div class="font-bold text-black uppercase tracking-wider text-sm mb-3 pb-2 border-b border-neutral-200">
                Registered Atelier Headquarters &amp; Regulatory Compliance Information
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div class="mb-1.5"><strong class="text-black">Operating Entity:</strong> TAMYIZ™ Digital Publishing &amp; Systems Architecture Atelier</div>
                  <div class="mb-1.5"><strong class="text-black">Studio Address:</strong> Sopore, Kashmir 193201, India</div>
                  <div class="mb-1.5"><strong class="text-black">Geographic Coordinates:</strong> 34.28° N, 74.46° E (Himalayan Valley Base)</div>
                  <div><strong class="text-black">Co-Founders:</strong> Basit (Ethics &amp; Research) &amp; Sahil (Systems &amp; Architecture)</div>
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
