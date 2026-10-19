/**
 * TAMYIZ™ Dedicated Product Detail Page (Full Page PDP)
 * Route: /edition/:slug
 */

import { findProductBySlugOrId, getRelatedProducts } from '../../data/products.js';
import { renderProductCardHtml } from './home-page.js';

export function renderProductDetailPage(slug, appInstance) {
  const product = findProductBySlugOrId(slug);

  if (!product) {
    return `
      <div class="container py-24 text-center">
        <h2 style="font-family: var(--font-display); font-size: 2rem; font-weight: 900; text-transform: uppercase; margin-bottom: 1rem;">
          Edition Not Found
        </h2>
        <p style="color: var(--color-grey); margin-bottom: 2rem;">
          The requested digital edition could not be located in the archive.
        </p>
        <button class="tamyiz-hero-btn-primary" onclick="window.tamyizApp.navigateTo('/editions')">
          <span>Return To The Archive</span>
          <span>→</span>
        </button>
      </div>
    `;
  }

  const hasVariants = product.variants && product.variants.options && product.variants.options.length > 0;
  const currentSelectedOption = appInstance.selectedSizes[product.id] || (hasVariants ? product.variants.options[0] : "Standard");
  const related = getRelatedProducts(product.id, 3);
  const activeImgIndex = appInstance.activePdpImageIndex || 0;
  const currentImg = product.images[activeImgIndex] || product.images[0];
  const hasSample = Boolean(product.sampleExcerpt || product.tableOfContents);

  return `
    <div class="tamyiz-page-pdp">
      <!-- BREADCRUMB & BACK NAVIGATION -->
      <div class="tamyiz-pdp-breadcrumb-bar">
        <div class="container">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
            <nav class="tamyiz-breadcrumbs" aria-label="Breadcrumb">
              <span class="crumb-link" onclick="window.tamyizApp.navigateTo('/')">Home</span>
              <span class="crumb-sep">/</span>
              <span class="crumb-link" onclick="window.tamyizApp.navigateTo('/editions')">Editions</span>
              <span class="crumb-sep">/</span>
              <span class="crumb-link" onclick="window.tamyizApp.filterCategoryAndNavigate('${product.categoryCode}')">${product.category}</span>
              <span class="crumb-sep">/</span>
              <span class="crumb-current">${product.name}</span>
            </nav>

            <button class="tamyiz-btn-back-link" onclick="window.tamyizApp.navigateTo('/editions')">
              <span>← Back to Editions</span>
            </button>
          </div>
        </div>
      </div>

      <!-- MAIN 2-COLUMN PDP LAYOUT -->
      <section class="tamyiz-pdp-main-section py-8 md:py-14">
        <div class="container">
          <div class="tamyiz-pdp-full-grid">
            <!-- LEFT COLUMN: INTERACTIVE GALLERY & LIVE SAMPLE VIEWER -->
            <div class="tamyiz-pdp-col-left">
              <div class="tamyiz-pdp-main-img-wrap">
                <img
                  id="pdp-main-image"
                  src="${currentImg}"
                  alt="${product.name}"
                  class="tamyiz-pdp-main-img"
                  loading="eager"
                />
                <span class="tamyiz-pdp-badge-pill">${product.badge}</span>
              </div>

              <!-- Thumbnail Gallery / Toggle -->
              ${product.images.length > 1 ? `
                <div class="tamyiz-pdp-thumbs mt-4">
                  ${product.images.map((img, idx) => `
                    <button
                      class="tamyiz-pdp-thumb-btn ${idx === activeImgIndex ? 'active' : ''}"
                      onclick="window.tamyizApp.setPdpImage(${idx})"
                      aria-label="View edition image ${idx + 1}"
                    >
                      <img src="${img}" alt="${product.name} view ${idx + 1}" />
                      <span class="tamyiz-thumb-label">${idx === 0 ? 'Cover Art' : 'Interior Sample'}</span>
                    </button>
                  `).join('')}
                </div>
              ` : ''}

              <!-- INTERACTIVE ON-PAGE SAMPLE VIEWER -->
              ${hasSample ? `
                <div class="tamyiz-pdp-sample-box mt-8">
                  <div class="tamyiz-pdp-sample-head">
                    <div>
                      <span class="tamyiz-sample-kicker">Interactive Atelier Preview</span>
                      <h3 class="tamyiz-sample-title">Read Sample Chapter &amp; Excerpt</h3>
                    </div>
                    <button class="tamyiz-sample-toggle-btn" id="sample-toggle-btn" onclick="window.tamyizApp.toggleSampleViewer()">
                      <span id="sample-toggle-text">Expand Preview</span>
                      <span id="sample-toggle-icon">↓</span>
                    </button>
                  </div>

                  <div class="tamyiz-pdp-sample-content" id="pdp-sample-content">
                    ${product.sampleExcerpt ? `
                      <div class="tamyiz-excerpt-paper">
                        <div class="tamyiz-excerpt-chap-label">${product.sampleExcerpt.chapter}</div>
                        <h4 class="tamyiz-excerpt-chap-title">${product.sampleExcerpt.subtitle}</h4>
                        <div class="tamyiz-excerpt-body tamyiz-excerpt-dropcap">
                          ${product.sampleExcerpt.text}
                        </div>
                        <div class="tamyiz-excerpt-pullquote">
                          "Distinction is not loud; it is undeniable weight and proportion."
                        </div>
                        <div class="tamyiz-reader-specs-chip">
                          <span>📐 Architectural Layout 300DPI</span>
                          <span>•</span>
                          <span>📱 Retina Optimized</span>
                        </div>
                      </div>
                    ` : ''}

                    ${product.tableOfContents ? `
                      <div class="tamyiz-toc-box mt-6">
                        <h5 style="font-family: var(--font-sub); font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.85rem; color: var(--color-black);">
                          Architecture of Contents:
                        </h5>
                        <ul class="tamyiz-toc-list">
                          ${product.tableOfContents.map(toc => `
                            <li class="tamyiz-toc-item">${toc}</li>
                          `).join('')}
                        </ul>
                      </div>
                    ` : ''}
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- RIGHT COLUMN: PRODUCT DETAILS, ACTIONS & STRUCTURED ACCORDIONS -->
            <div class="tamyiz-pdp-col-right">
              <div class="tamyiz-pdp-details-card">
                <div class="flex items-center justify-between gap-3 mb-2">
                  <span class="tamyiz-pdp-cat">${product.category}</span>
                  <span class="tamyiz-tag-dispatch">⚡ INSTANT DISPATCH</span>
                </div>

                <h1 class="tamyiz-pdp-title">${product.name}</h1>
                <p class="tamyiz-pdp-tagline">${product.tagline}</p>

                <!-- Reviews Rating Badge -->
                <div class="tamyiz-pdp-rating-row">
                  <span class="tamyiz-stars">★★★★★</span>
                  <span class="tamyiz-rating-score">${product.rating.toFixed(1)}</span>
                  <span class="tamyiz-rating-count">(${product.reviewsCount} verified readers)</span>
                </div>

                <!-- Pricing -->
                <div class="tamyiz-pdp-pricing">
                  <span class="tamyiz-pdp-price-cur">₹${product.price.toLocaleString('en-IN')}</span>
                  ${product.originalPrice ? `
                    <span class="tamyiz-pdp-price-orig">₹${product.originalPrice.toLocaleString('en-IN')}</span>
                    <span class="tamyiz-pdp-save-badge">SAVE ${Math.round((1 - product.price / product.originalPrice) * 100)}%</span>
                  ` : ''}
                </div>
                <div class="tamyiz-pdp-tax-note">
                  Inclusive of all taxes • Instant PDF / EPUB / Notion dispatch to your email
                </div>

                <!-- Format Selection Pills -->
                ${hasVariants ? `
                  <div class="tamyiz-pdp-format-section">
                    <div class="flex justify-between items-center mb-2">
                      <span class="font-bold text-xs uppercase tracking-wider text-neutral-600">
                        Select ${product.variants.type || 'Format'}:
                      </span>
                      <span class="text-xs font-bold text-black" id="pdp-selected-size-label">
                        ${currentSelectedOption}
                      </span>
                    </div>

                    <div class="tamyiz-pdp-format-pills">
                      ${product.variants.options.map(opt => `
                        <button
                          type="button"
                          class="tamyiz-pdp-format-pill ${opt === currentSelectedOption ? 'active' : ''}"
                          onclick="window.tamyizApp.selectProductSize('${product.id}', '${opt}', this)"
                        >
                          <span class="pill-dot"></span>
                          <span>${opt}</span>
                        </button>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}

                <!-- Primary & Direct Actions -->
                <div class="tamyiz-pdp-actions-stack">
                  <button
                    class="tamyiz-pdp-btn-add"
                    onclick="window.tamyizApp.quickAddToCart('${product.id}')"
                  >
                    <span>ADD TO BAG &amp; INSTANT ACCESS</span>
                    <span>•</span>
                    <span>₹${product.price.toLocaleString('en-IN')}</span>
                  </button>

                  <button
                    class="tamyiz-pdp-btn-buy-now"
                    onclick="window.tamyizApp.buyNowDirect('${product.id}')"
                  >
                    <span>⚡ BUY NOW (DIRECT CHECKOUT)</span>
                  </button>
                </div>

                <!-- Trust Guarantee List -->
                <div class="tamyiz-pdp-guarantee-list">
                  <div class="tamyiz-guarantee-item">
                    <span>⚡</span>
                    <span>Instant on-screen download + redundant copies to email and WhatsApp.</span>
                  </div>
                  <div class="tamyiz-guarantee-item">
                    <span>📱</span>
                    <span>DRM-free files compatible with Apple Books, Kindle, and mobile tablets.</span>
                  </div>
                  <div class="tamyiz-guarantee-item">
                    <span>♾️</span>
                    <span>Lifetime free updates whenever new revisions or templates are published.</span>
                  </div>
                </div>

                <!-- Description -->
                <div class="tamyiz-pdp-description-box">
                  <h3 class="tamyiz-pdp-desc-heading">Overview &amp; Architecture</h3>
                  <p class="tamyiz-pdp-desc">${product.description}</p>
                </div>

                <!-- STRUCTURED SPECS ACCORDION (3 TABS) -->
                <div class="tamyiz-pdp-accordions" id="pdp-accordions">
                  <!-- Accordion 1: What's Inside -->
                  <div class="tamyiz-pdp-acc-item open" id="acc-inside">
                    <button class="tamyiz-pdp-acc-trigger" onclick="window.tamyizApp.toggleAccordion('acc-inside')">
                      <span>01 / WHAT'S INSIDE (MODULES &amp; CHAPTERS)</span>
                      <span class="tamyiz-pdp-acc-icon">−</span>
                    </button>
                    <div class="tamyiz-pdp-acc-content">
                      <ul class="tamyiz-acc-bullets">
                        ${(product.highlights || [
                          "Complete publication file package (Interactive PDF & EPUB)",
                          "Detailed blueprints, architectural formulas, and tactical models",
                          "Full personal & single-operator commercial deployment rights",
                          "Lifetime async updates and revisions"
                        ]).map(hl => `<li>${hl}</li>`).join('')}
                      </ul>
                    </div>
                  </div>

                  <!-- Accordion 2: Technical Format & Compatibility -->
                  <div class="tamyiz-pdp-acc-item" id="acc-compat">
                    <button class="tamyiz-pdp-acc-trigger" onclick="window.tamyizApp.toggleAccordion('acc-compat')">
                      <span>02 / TECHNICAL FORMAT &amp; COMPATIBILITY</span>
                      <span class="tamyiz-pdp-acc-icon">+</span>
                    </button>
                    <div class="tamyiz-pdp-acc-content">
                      <div class="tamyiz-spec-table">
                        ${(product.specifications || [
                          { label: "Format", value: "Instant Digital Download (PDF + EPUB bundle)" },
                          { label: "Reader Support", value: "Apple Books, Kindle, Adobe Acrobat, iPad, Android" },
                          { label: "Delivery", value: "Instant download link + email backup" }
                        ]).map(spec => `
                          <div class="tamyiz-spec-row">
                            <span class="tamyiz-spec-label">${spec.label}</span>
                            <span class="tamyiz-spec-val">${spec.value}</span>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  </div>

                  <!-- Accordion 3: Lifetime Updates & Atelier License -->
                  <div class="tamyiz-pdp-acc-item" id="acc-license">
                    <button class="tamyiz-pdp-acc-trigger" onclick="window.tamyizApp.toggleAccordion('acc-license')">
                      <span>03 / LIFETIME UPDATES &amp; ATELIER LICENSE</span>
                      <span class="tamyiz-pdp-acc-icon">+</span>
                    </button>
                    <div class="tamyiz-pdp-acc-content">
                      <p style="font-size: 0.84rem; color: #555; line-height: 1.6; margin: 0 0 0.75rem 0;">
                        ${product.careInstructions || "Store downloaded PDF and EPUB files in your preferred cloud reader (Apple Books, Google Play Books, or Kindle). Files are DRM-free for your personal devices with lifetime revision access."}
                      </p>
                      <p style="font-size: 0.82rem; color: var(--color-red); font-weight: 700; margin: 0;">
                        100% Satisfaction Guarantee: If you experience any technical format incompatibility, our concierge will personally assist you or provide a full refund.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- BOTTOM SECTION: COMPLETE YOUR SYSTEM -->
          <div class="tamyiz-pdp-related-section mt-16 md:mt-24 pt-12 border-t border-gray-200">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-8">
              <div>
                <span class="text-xs uppercase tracking-widest text-red-600 font-bold">The Ecosystem</span>
                <h3 class="text-2xl md:text-3xl font-black uppercase font-display tracking-tight mt-1">
                  Complete Your System
                </h3>
              </div>
              <button class="tamyiz-btn-nav-outline" onclick="window.tamyizApp.navigateTo('/editions')">
                <span>View Full Catalog</span>
                <span>→</span>
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
              ${related.map(r => renderProductCardHtml(r, appInstance)).join('')}
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}
