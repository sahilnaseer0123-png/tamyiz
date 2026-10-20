/**
 * TAMYIZ™ Philosophy & Digital Format Guide Page
 * Route: /philosophy
 */

import { faqs } from '../../data/content.js';

export function renderPhilosophyPage(appInstance) {
  return `
    <div class="tamyiz-page-philosophy">
      <!-- DEDICATED HEADER BANNER -->
      <section class="tamyiz-page-header">
        <div class="container">
          <div class="tamyiz-page-header-inner">
            <span class="tamyiz-page-badge">
              ATELIER MANIFESTO // SOPORE, KASHMIR
            </span>
            <h1 class="tamyiz-page-title">
              Philosophy &amp; Format Guide
            </h1>
            <p class="tamyiz-page-description">
              The architectural principles, typographic discipline, and technical compatibility standards behind every TAMYIZ digital edition.
            </p>
          </div>
        </div>
      </section>

      <!-- SECTION 1: THE THREE PILLARS OF DISTINCTION -->
      <section class="tamyiz-section py-14 md:py-24" style="background: #FFFFFF;">
        <div class="container">
          <div style="text-align: center; max-width: 720px; margin: 0 auto 4rem auto;">
            <span style="color: var(--color-red); font-family: var(--font-sub); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;">The Core Doctrine</span>
            <h2 style="font-family: var(--font-display); font-size: clamp(2.2rem, 4vw, 3.2rem); font-weight: 900; text-transform: uppercase; margin-top: 0.5rem; line-height: 1.1;">
              The Three Pillars of Distinction
            </h2>
            <p style="color: #666; font-size: 1rem; margin-top: 0.75rem; line-height: 1.6;">
              In an era overwhelmed by AI-generated noise and mass-produced digital templates, TAMYIZ adheres to three architectural commitments.
            </p>
          </div>

          <div class="tamyiz-pillars-detailed-stack">
            <!-- Pillar 1 -->
            <div class="tamyiz-pillar-detail-card">
              <div class="tamyiz-pillar-num-badge">01</div>
              <div class="tamyiz-pillar-content">
                <span class="tamyiz-pillar-tag">Doctrine of Subtraction</span>
                <h3 class="tamyiz-pillar-heading">Intellectual Depth</h3>
                <p class="tamyiz-pillar-body">
                  True distinction begins with refusal: the refusal to publish shallow summaries, rehashed platitudes, or unverified opinions. Every TAMYIZ e-book and monograph represents months of primary synthesis, academic rigor, and real-world operational testing in Sopore.
                </p>
                <div class="tamyiz-pillar-specs-grid">
                  <div class="pillar-spec">
                    <strong>Zero-Fluff Standard</strong>
                    <span>Every chapter is dense with actionable systems and mental models.</span>
                  </div>
                  <div class="pillar-spec">
                    <strong>Himalayan Perspective</strong>
                    <span>Written from quiet contemplation rather than metropolitan social media feeds.</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pillar 2 -->
            <div class="tamyiz-pillar-detail-card">
              <div class="tamyiz-pillar-num-badge">02</div>
              <div class="tamyiz-pillar-content">
                <span class="tamyiz-pillar-tag">Brutalist Typographic Discipline</span>
                <h3 class="tamyiz-pillar-heading">Swiss Editorial Precision</h3>
                <p class="tamyiz-pillar-body">
                  A book or template is an architectural space. We construct our publications using strict asymmetric grids, mathematical typographic scales, high-contrast monochrome color palettes, and retina-resolution 300DPI architectural plates.
                </p>
                <div class="tamyiz-pillar-specs-grid">
                  <div class="pillar-spec">
                    <strong>Harmonious Proportions</strong>
                    <span>Engineered for deep reading focus on iPads, tablets, and e-ink displays.</span>
                  </div>
                  <div class="pillar-spec">
                    <strong>Architectural Plates</strong>
                    <span>Handcrafted diagrams, wireframes, and database relationship charts.</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pillar 3 -->
            <div class="tamyiz-pillar-detail-card">
              <div class="tamyiz-pillar-num-badge">03</div>
              <div class="tamyiz-pillar-content">
                <span class="tamyiz-pillar-tag">Zero-Latency Distribution</span>
                <h3 class="tamyiz-pillar-heading">Instant Frictionless Systems</h3>
                <p class="tamyiz-pillar-body">
                  We treat digital commerce as high-performance software. When you acquire a TAMYIZ edition, there are zero shipping delays, zero DRM handcuffs, and zero broken links. Files are delivered instantly on screen, in your inbox, and backed up to your WhatsApp.
                </p>
                <div class="tamyiz-pillar-specs-grid">
                  <div class="pillar-spec">
                    <strong>1-Click Duplication</strong>
                    <span>Notion operating systems copy into your workspace with databases pre-wired.</span>
                  </div>
                  <div class="pillar-spec">
                    <strong>Lifetime Async Updates</strong>
                    <span>Free revised files whenever new framework iterations are minted.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 2: DIGITAL FORMATS & COMPATIBILITY MATRIX -->
      <section class="tamyiz-section py-14 md:py-24 scroll-mt-28" style="background: var(--color-offwhite); border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); scroll-margin-top: 6rem;" id="formats">
        <div class="container">
          <div style="text-align: center; max-width: 720px; margin: 0 auto 3.5rem auto;">
            <span style="color: var(--color-red); font-family: var(--font-sub); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;">Technical Matrix</span>
            <h2 style="font-family: var(--font-display); font-size: clamp(2.2rem, 4vw, 3.2rem); font-weight: 900; text-transform: uppercase; margin-top: 0.5rem; line-height: 1.1;">
              Digital Formats &amp; Device Compatibility
            </h2>
            <p style="color: #666; font-size: 1rem; margin-top: 0.75rem; line-height: 1.6;">
              All TAMYIZ digital products are engineered to run across Apple, Android, Kindle, and modern web environments without proprietary lock-in.
            </p>
          </div>

          <!-- Compatibility Matrix Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <!-- Format 1: Interactive PDF -->
            <div class="tamyiz-matrix-card">
              <div class="matrix-card-header">
                <span class="matrix-icon" aria-hidden="true" style="display:inline-flex; align-items:center;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                </span>
                <div>
                  <h4>Interactive PDF</h4>
                  <span class="matrix-sub">300DPI Retina Print Edition</span>
                </div>
              </div>
              <p class="matrix-desc">
                High-definition vector layouts with interactive Table of Contents, linked citations, margin notes, and full-bleed architectural diagrams.
              </p>
              <div class="matrix-compatibility-tags">
                <span class="comp-tag active">Apple Books ✓</span>
                <span class="comp-tag active">Adobe Acrobat ✓</span>
                <span class="comp-tag active">iPad / Tablets ✓</span>
                <span class="comp-tag active">Remarkable ✓</span>
              </div>
            </div>

            <!-- Format 2: EPUB 3 Standard -->
            <div class="tamyiz-matrix-card">
              <div class="matrix-card-header">
                <span class="matrix-icon" aria-hidden="true" style="display:inline-flex; align-items:center;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                    <line x1="12" y1="18" x2="12.01" y2="18" stroke-width="2"></line>
                    <line x1="8" y1="6" x2="16" y2="6"></line>
                  </svg>
                </span>
                <div>
                  <h4>EPUB 3 Standard</h4>
                  <span class="matrix-sub">Fluid Mobile Typography</span>
                </div>
              </div>
              <p class="matrix-desc">
                Reflowable text layout supporting custom font sizes, night mode, sepia reading mode, and native integration on all smartphone e-readers.
              </p>
              <div class="matrix-compatibility-tags">
                <span class="comp-tag active">Apple Books ✓</span>
                <span class="comp-tag active">Google Play Books ✓</span>
                <span class="comp-tag active">Kobo ✓</span>
                <span class="comp-tag active">iOS / Android ✓</span>
              </div>
            </div>

            <!-- Format 3: Kindle EPUB / Scribe -->
            <div class="tamyiz-matrix-card">
              <div class="matrix-card-header">
                <span class="matrix-icon" aria-hidden="true" style="display:inline-flex; align-items:center;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </span>
                <div>
                  <h4>Kindle EPUB / Scribe</h4>
                  <span class="matrix-sub">E-Ink Contrast Tuned</span>
                </div>
              </div>
              <p class="matrix-desc">
                Specially calibrated for Amazon Kindle devices and the Kindle mobile app via Send-to-Kindle email with high-contrast grayscale figures.
              </p>
              <div class="matrix-compatibility-tags">
                <span class="comp-tag active">Kindle Paperwhite ✓</span>
                <span class="comp-tag active">Kindle Oasis ✓</span>
                <span class="comp-tag active">Kindle App iOS ✓</span>
                <span class="comp-tag active">Kindle Scribe ✓</span>
              </div>
            </div>

            <!-- Format 4: Notion Systems -->
            <div class="tamyiz-matrix-card">
              <div class="matrix-card-header">
                <span class="matrix-icon" aria-hidden="true" style="display:inline-flex; align-items:center;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                </span>
                <div>
                  <h4>Notion Operating Systems</h4>
                  <span class="matrix-sub">1-Click Duplication</span>
                </div>
              </div>
              <p class="matrix-desc">
                Production-ready Notion workspace templates with relational databases, automated progress bars, formula 2.0 rollups, and video setup guides.
              </p>
              <div class="matrix-compatibility-tags">
                <span class="comp-tag active">Notion Free Plan ✓</span>
                <span class="comp-tag active">Notion Plus ✓</span>
                <span class="comp-tag active">Mac / Windows App ✓</span>
                <span class="comp-tag active">Mobile App ✓</span>
              </div>
            </div>

            <!-- Format 5: Figma UI Kits -->
            <div class="tamyiz-matrix-card">
              <div class="matrix-card-header">
                <span class="matrix-icon" aria-hidden="true" style="display:inline-flex; align-items:center;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                    <path d="M2 12h20"></path>
                  </svg>
                </span>
                <div>
                  <h4>Figma &amp; Design Kits</h4>
                  <span class="matrix-sub">Auto-Layout 5.0 Components</span>
                </div>
              </div>
              <p class="matrix-desc">
                Organized component libraries featuring Figma variables, typographic scales, fluid dark mode tokens, and production Tailwind CSS styles.
              </p>
              <div class="matrix-compatibility-tags">
                <span class="comp-tag active">Figma Free / Pro ✓</span>
                <span class="comp-tag active">Tailwind CSS 3/4 ✓</span>
                <span class="comp-tag active">HTML / React ✓</span>
                <span class="comp-tag active">Design Handoff ✓</span>
              </div>
            </div>

            <!-- Format 6: All-Access Vault -->
            <div class="tamyiz-matrix-card" style="border-color: var(--color-black); background: #FFFFFF;">
              <div class="matrix-card-header">
                <span class="matrix-icon" aria-hidden="true" style="display:inline-flex; align-items:center; color:var(--color-red);">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                </span>
                <div>
                  <h4>All-Access Lifetime Vault</h4>
                  <span class="matrix-sub">Digital Atelier License</span>
                </div>
              </div>
              <p class="matrix-desc">
                Permanent access key allowing you to download all current and future editions from any browser at any time without expiry dates.
              </p>
              <div class="matrix-compatibility-tags">
                <span class="comp-tag active">Zero Expiry ✓</span>
                <span class="comp-tag active">DRM-Free ✓</span>
                <span class="comp-tag active">Direct Cloud Link ✓</span>
                <span class="comp-tag active">Concierge Support ✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 3: INTERACTIVE FAQ ACCORDION -->
      <section class="tamyiz-section py-14 md:py-24" style="background: #FFFFFF;">
        <div class="container">
          <div style="text-align: center; max-width: 680px; margin: 0 auto 3.5rem auto;">
            <span style="color: var(--color-red); font-family: var(--font-sub); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;">Concierge Inquiries</span>
            <h2 style="font-family: var(--font-display); font-size: clamp(2rem, 3.5vw, 2.8rem); font-weight: 900; text-transform: uppercase; margin-top: 0.4rem;">
              Frequently Asked Questions
            </h2>
            <p style="color: #666; font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.5;">
              Everything you need to know about instant digital delivery, licensing, and atelier support.
            </p>
          </div>

          <div class="tamyiz-faq-accordion-stack max-w-3xl mx-auto">
            ${faqs.map((faq, i) => `
              <div class="tamyiz-faq-item ${i === 0 ? 'open' : ''}" id="faq-${i}">
                <button class="tamyiz-faq-trigger" onclick="window.tamyizApp.toggleFaq('faq-${i}')">
                  <span class="tamyiz-faq-question">${faq.q}</span>
                  <span class="tamyiz-faq-icon">${i === 0 ? '−' : '+'}</span>
                </button>
                <div class="tamyiz-faq-answer">
                  <p>${faq.a}</p>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="text-align: center; margin-top: 4rem;">
            <p style="font-size: 0.9rem; color: #777; margin-bottom: 1.25rem;">
              Have a custom enterprise licensing or academic research inquiry?
            </p>
            <button class="tamyiz-btn-nav-outline" onclick="window.tamyizApp.navigateTo('/atelier')">
              <span>Message the Founders Directly</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  `;
}
