/**
 * TAMYIZ™ Serverless Payment & Fulfillment Utilities
 */

import crypto from 'crypto';

// Authoritative Server-Side Product Catalog & Variant Pricing Map
// Prevents client-side price tampering
export const CATALOG_PRICES = {
  "tmz-dig-001": {
    name: "TAMYIZ Monograph 01: The Architecture of Distinction",
    variants: {
      "PDF + EPUB Bundle": { price: 499, originalPrice: 999 },
      "Kindle EPUB": { price: 399, originalPrice: 799 }
    },
    defaultVariant: "PDF + EPUB Bundle"
  },
  "tmz-dig-002": {
    name: "The Solo Creator & Digital Craft Playbook",
    variants: {
      "PDF + Checklists": { price: 699, originalPrice: 1299 },
      "EPUB": { price: 499, originalPrice: 899 }
    },
    defaultVariant: "PDF + Checklists"
  },
  "tmz-dig-003": {
    name: "Ethical Technology & Deep Research: The Student's Compendium",
    variants: {
      "PDF + EPUB": { price: 449, originalPrice: 899 },
      "Annotated Edition": { price: 599, originalPrice: 1199 }
    },
    defaultVariant: "PDF + EPUB"
  },
  "tmz-dig-004": {
    name: "Zero-to-One Digital Product Launch Blueprint",
    variants: {
      "PDF + Checklists": { price: 549, originalPrice: 1099 },
      "EPUB": { price: 449, originalPrice: 899 }
    },
    defaultVariant: "PDF + Checklists"
  },
  "tmz-dig-005": {
    name: "TAMYIZ Second Brain & Deep Work Notion OS",
    variants: {
      "Notion Duplicate Link + Guide": { price: 799, originalPrice: 1499 },
      "Team License": { price: 1499, originalPrice: 2999 }
    },
    defaultVariant: "Notion Duplicate Link + Guide"
  },
  "tmz-dig-006": {
    name: "Freelance Atelier & Client Portal Notion Workspace",
    variants: {
      "Notion Template + Invoice Kit": { price: 899, originalPrice: 1699 },
      "Studio Multi-Client Pack": { price: 1599, originalPrice: 2999 }
    },
    defaultVariant: "Notion Template + Invoice Kit"
  },
  "tmz-dig-007": {
    name: "Academic Research & Literature Tracker Notion Matrix",
    variants: {
      "Notion Template + Zotero Guide": { price: 399, originalPrice: 799 },
      "Student Edition": { price: 299, originalPrice: 599 }
    },
    defaultVariant: "Notion Template + Zotero Guide"
  },
  "tmz-dig-008": {
    name: "TAMYIZ Swiss Grid & Luxury Portfolio UI Kit 2026",
    variants: {
      "Figma + Tailwind Code": { price: 999, originalPrice: 1999 },
      "Figma Only": { price: 699, originalPrice: 1399 }
    },
    defaultVariant: "Figma + Tailwind Code"
  }
};

// Verified Coupon Codes
export const VALID_COUPONS = {
  'DISTINCT10': { type: 'percent', value: 10 },
  'DISTINCT': { type: 'percent', value: 10 },
  'WELCOME10': { type: 'percent', value: 10 },
  'TAMYIZ15': { type: 'percent', value: 15 },
  'HORIZON500': { type: 'flat', value: 500, minOrder: 3000 }
};

/**
 * Validates cart items and computes strict server-side price in INR & paise
 */
export function calculateOrderTotal(items, couponCode = null) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cart contains no valid items");
  }

  let subtotal = 0;
  const validatedItems = [];

  for (const item of items) {
    const prodId = item.productId || item.id;
    const catProd = CATALOG_PRICES[prodId];
    if (!catProd) {
      throw new Error(`Invalid catalog product: ${prodId}`);
    }

    const selectedVariant = item.variant || item.size || catProd.defaultVariant;
    const variantData = catProd.variants[selectedVariant] || Object.values(catProd.variants)[0];

    const price = variantData.price;
    subtotal += price;

    validatedItems.push({
      productId: prodId,
      name: catProd.name,
      variant: selectedVariant,
      price: price
    });
  }

  // Calculate discount if coupon provided
  let discount = 0;
  if (couponCode) {
    const c = VALID_COUPONS[String(couponCode).toUpperCase().trim()];
    if (c) {
      if (c.type === 'percent') {
        discount = Math.round(subtotal * (c.value / 100));
      } else if (c.type === 'flat' && (!c.minOrder || subtotal >= c.minOrder)) {
        discount = c.value;
      }
    }
  }

  const total = Math.max(1, subtotal - discount);
  const amountPaise = total * 100;

  return {
    subtotal,
    discount,
    total,
    amountPaise,
    items: validatedItems
  };
}

/**
 * Resolves purchased item to downloadable asset / Notion duplication link
 */
export function resolveDownloadLink(productId, variant) {
  const normVar = String(variant || '').toLowerCase();

  switch (productId) {
    case 'tmz-dig-001':
      if (normVar.includes('kindle')) {
        return {
          productId,
          name: "TAMYIZ Monograph 01: The Architecture of Distinction",
          variant: "Kindle EPUB",
          formatType: "ebook",
          downloadUrl: process.env.URL_MONOGRAPH_EPUB || "https://assets.tamyiz.in/downloads/tamyiz-monograph-01-kindle.epub",
          actionLabel: "Download Kindle EPUB ↗",
          specs: "Kindle KFX/EPUB 3 • Reflowable • DRM-Free"
        };
      }
      return {
        productId,
        name: "TAMYIZ Monograph 01: The Architecture of Distinction",
        variant: "PDF + EPUB Bundle",
        formatType: "ebook",
        downloadUrl: process.env.URL_MONOGRAPH_BUNDLE || "https://assets.tamyiz.in/downloads/tamyiz-monograph-01-bundle.zip",
        actionLabel: "Download PDF + EPUB Bundle (ZIP) ↗",
        specs: "140 Pages • 300DPI Retina Vector PDF + EPUB • DRM-Free"
      };

    case 'tmz-dig-002':
      if (normVar.includes('epub')) {
        return {
          productId,
          name: "The Solo Creator & Digital Craft Playbook",
          variant: "EPUB Edition",
          formatType: "ebook",
          downloadUrl: process.env.URL_PLAYBOOK_EPUB || "https://assets.tamyiz.in/downloads/solo-creator-playbook.epub",
          actionLabel: "Download EPUB Edition ↗",
          specs: "88 Pages • Mobile & Tablet Optimized EPUB"
        };
      }
      return {
        productId,
        name: "The Solo Creator & Digital Craft Playbook",
        variant: "PDF + Checklists Bundle",
        formatType: "ebook",
        downloadUrl: process.env.URL_PLAYBOOK_PDF || "https://assets.tamyiz.in/downloads/solo-creator-playbook-worksheets.zip",
        actionLabel: "Download PDF + Interactive Checklists (ZIP) ↗",
        specs: "Tactical PDF Guide + 12 Interactive Creator Worksheets"
      };

    case 'tmz-dig-003':
      if (normVar.includes('annotated')) {
        return {
          productId,
          name: "Ethical Technology & Deep Research: The Student's Compendium",
          variant: "Annotated Edition",
          formatType: "ebook",
          downloadUrl: process.env.URL_COMPENDIUM_ANNOTATED || "https://assets.tamyiz.in/downloads/ethical-tech-annotated.pdf",
          actionLabel: "Download Annotated Research PDF ↗",
          specs: "110 Pages • Classical Citations & Epistemology Notes"
        };
      }
      return {
        productId,
        name: "Ethical Technology & Deep Research: The Student's Compendium",
        variant: "PDF + EPUB Bundle",
        formatType: "ebook",
        downloadUrl: process.env.URL_COMPENDIUM_BUNDLE || "https://assets.tamyiz.in/downloads/ethical-tech-compendium-bundle.zip",
        actionLabel: "Download PDF + EPUB Bundle ↗",
        specs: "Vector PDF + Reflowable EPUB 3 Edition"
      };

    case 'tmz-dig-004':
      if (normVar.includes('epub')) {
        return {
          productId,
          name: "Zero-to-One Digital Product Launch Blueprint",
          variant: "EPUB Edition",
          formatType: "ebook",
          downloadUrl: process.env.URL_BLUEPRINT_EPUB || "https://assets.tamyiz.in/downloads/zero-to-one-blueprint.epub",
          actionLabel: "Download EPUB Edition ↗",
          specs: "94 Pages • Kindle & Smartphone Reflowable"
        };
      }
      return {
        productId,
        name: "Zero-to-One Digital Product Launch Blueprint",
        variant: "PDF + Launch Checklists",
        formatType: "ebook",
        downloadUrl: process.env.URL_BLUEPRINT_PDF || "https://assets.tamyiz.in/downloads/zero-to-one-blueprint-bundle.zip",
        actionLabel: "Download Blueprint PDF + Checklists (ZIP) ↗",
        specs: "94 Pages • 12 Launch Day Tactical Spreadsheets Included"
      };

    case 'tmz-dig-005':
      return {
        productId,
        name: "TAMYIZ Second Brain & Deep Work Notion OS",
        variant: variant || "Notion Duplicate Link + Guide",
        formatType: "notion",
        downloadUrl: process.env.URL_NOTION_SECONDBRAIN || "https://tamyiz.notion.site/TAMYIZ-Second-Brain-Deep-Work-OS-2026-duplicate-v1",
        actionLabel: "Duplicate Notion Workspace (1-Click) ↗",
        specs: "PARA Framework • Daily Focus Cockpit • Free & Plus Notion Compatible"
      };

    case 'tmz-dig-006':
      return {
        productId,
        name: "Freelance Atelier & Client Portal Notion Workspace",
        variant: variant || "Notion Template + Invoice Kit",
        formatType: "notion",
        downloadUrl: process.env.URL_NOTION_CLIENTPORTAL || "https://tamyiz.notion.site/TAMYIZ-Freelance-Atelier-Client-Portal-duplicate-v1",
        actionLabel: "Duplicate Client Portal Notion System ↗",
        specs: "Interactive Milestone Kanban • Proposal Decks • Tax Invoice Calculator"
      };

    case 'tmz-dig-007':
      if (normVar.includes('student')) {
        return {
          productId,
          name: "Academic Research & Literature Tracker Notion Matrix",
          variant: "Student Edition",
          formatType: "notion",
          downloadUrl: process.env.URL_NOTION_STUDENT || "https://tamyiz.notion.site/TAMYIZ-Academic-Research-Student-duplicate-v1",
          actionLabel: "Duplicate Student Notion Matrix ↗",
          specs: "Thesis Drafting Outliner • Citation Tags • Student License"
        };
      }
      return {
        productId,
        name: "Academic Research & Literature Tracker Notion Matrix",
        variant: "Notion Template + Zotero Guide",
        formatType: "notion",
        downloadUrl: process.env.URL_NOTION_MATRIX || "https://tamyiz.notion.site/TAMYIZ-Academic-Research-Literature-Matrix-duplicate-v1",
        actionLabel: "Duplicate Full Research Notion Matrix ↗",
        specs: "Literature Review Matrix • Zotero Sync Documentation Guide"
      };

    case 'tmz-dig-008':
      if (normVar.includes('figma only')) {
        return {
          productId,
          name: "TAMYIZ Swiss Grid & Luxury Portfolio UI Kit 2026",
          variant: "Figma Only",
          formatType: "figma",
          downloadUrl: process.env.URL_FIGMA_UI_KIT || "https://www.figma.com/community/file/13298492026/tamyiz-swiss-grid-design-system",
          actionLabel: "Open Figma Community Design File ↗",
          specs: "50+ Swiss Grid Components • Syne & Inter Typography Pairing Tokens"
        };
      }
      return {
        productId,
        name: "TAMYIZ Swiss Grid & Luxury Portfolio UI Kit 2026",
        variant: "Figma + Tailwind Code",
        formatType: "figma",
        downloadUrl: process.env.URL_FIGMA_UI_KIT_CODE || "https://github.com/tamyiz/swiss-grid-ui-kit-tailwind",
        actionLabel: "Access Figma File + Tailwind Codebase ↗",
        specs: "Figma File (.fig) + Clean Tailwind / CSS Production Components"
      };

    default:
      return {
        productId,
        name: "TAMYIZ Digital Edition",
        variant: variant || "Standard",
        formatType: "download",
        downloadUrl: "https://assets.tamyiz.in/downloads/tamyiz-archive-dispatch.zip",
        actionLabel: "Download Digital Archive ↗",
        specs: "DRM-Free Single-Operator License"
      };
  }
}

/**
 * Triggers transactional receipt email via Resend REST API if configured
 */
export async function sendReceiptEmail({ email, phone, orderId, referenceId, items, downloads }) {
  if (!process.env.RESEND_API_KEY) {
    return false;
  }

  const itemsHtml = downloads.map(dl => `
    <tr style="border-bottom: 1px solid #EEEEEE;">
      <td style="padding: 12px 0;">
        <strong style="font-family: monospace; font-size: 13px; color: #000;">${dl.name}</strong><br/>
        <span style="font-family: monospace; font-size: 11px; color: #666; text-transform: uppercase;">FORMAT: ${dl.variant}</span>
      </td>
      <td style="padding: 12px 0; text-align: right;">
        <a href="${dl.downloadUrl}" style="display: inline-block; background: #000000; color: #FFFFFF; font-family: monospace; font-size: 11px; font-weight: bold; text-decoration: none; padding: 6px 14px; text-transform: uppercase;">
          Access Edition ↗
        </a>
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F7F4; margin: 0; padding: 24px; color: #000000;">
      <div style="max-width: 580px; margin: 0 auto; background: #FFFFFF; border: 1px solid #000000; padding: 32px;">
        <div style="font-family: monospace; font-size: 10px; letter-spacing: 0.15em; color: #DC2626; text-transform: uppercase; font-weight: bold;">
          ● TRANSACTION CONFIRMED // INSTANT ATELIER DISPATCH
        </div>
        <h1 style="font-family: monospace; font-size: 24px; font-weight: 900; text-transform: uppercase; margin: 8px 0 16px 0; letter-spacing: -0.02em;">
          TAMYIZ™ DIGITAL VAULT
        </h1>
        <p style="font-size: 13px; line-height: 1.5; color: #333333; margin-bottom: 24px;">
          Thank you for collecting from the TAMYIZ atelier. Your cryptographic access tokens have been verified and your editions are unlocked below.
        </p>

        <div style="background: #F4F4F2; padding: 12px 16px; font-family: monospace; font-size: 11px; margin-bottom: 24px; border-left: 3px solid #000000;">
          <div><strong>ORDER REF:</strong> ${referenceId}</div>
          <div><strong>VERIFIED EMAIL:</strong> ${email}</div>
          <div><strong>WHATSAPP:</strong> ${phone}</div>
          <div><strong>LICENSE:</strong> Perpetual Single-Operator Commercial Grant</div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
          <thead>
            <tr style="border-bottom: 2px solid #000000; text-align: left; font-family: monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em;">
              <th style="padding-bottom: 8px;">Edition</th>
              <th style="padding-bottom: 8px; text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="font-size: 11px; color: #666666; line-height: 1.6; border-top: 1px solid #EEEEEE; padding-top: 20px;">
          <strong>TAMYIZ™ Digital Publishing &amp; Design Systems Studio</strong><br/>
          Sopore, Kashmir 193201, India • Co-Founded by Basit Majeed &amp; Sahil.<br/>
          Concierge Support: <a href="mailto:tamyiz.co@gmail.com" style="color: #000;">tamyiz.co@gmail.com</a> • WhatsApp: +91 95417 22379
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'TAMYIZ Atelier <orders@tamyiz.in>',
        to: [email],
        subject: `TAMYIZ™ Order Unlocked // Ref: ${referenceId}`,
        html
      })
    });
    return res.ok;
  } catch (err) {
    console.error('Resend email error:', err);
    return false;
  }
}
