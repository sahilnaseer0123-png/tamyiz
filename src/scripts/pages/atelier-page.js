/**
 * TAMYIZ™ Atelier Origin & Co-Founders Page
 * Route: /atelier
 */

import { foundersData, brandInfo } from '../../data/content.js';

export function renderAtelierPage(appInstance) {
  return `
    <div class="tamyiz-page-atelier">
      <!-- DEDICATED HEADER BANNER -->
      <section class="tamyiz-page-header">
        <div class="container">
          <div class="tamyiz-page-header-inner">
            <span class="tamyiz-page-badge">
              ATELIER ORIGIN // 34.28° N, 74.46° E • SOPORE, KASHMIR
            </span>
            <h1 class="tamyiz-page-title">
              Atelier Origin &amp; Architects
            </h1>
            <p class="tamyiz-page-description">
              Born from the conviction that digital craftsmanship should be as rigorous, permanent, and ethically rooted as architectural stone.
            </p>
          </div>
        </div>
      </section>

      <!-- THE SOPORE STORY & MANIFESTO -->
      <section class="tamyiz-section py-14 md:py-24" style="background: #FFFFFF;">
        <div class="container">
          <div class="tamyiz-origin-story-grid">
            <div class="tamyiz-origin-text-col">
              <span style="font-family: var(--font-sub); font-size: 0.8rem; font-weight: 700; color: var(--color-red); text-transform: uppercase; letter-spacing: 0.12em; display: inline-block; margin-bottom: 0.5rem;">
                The Sopore Manifesto
              </span>
              <h2 style="font-family: var(--font-display); font-size: clamp(2.2rem, 4vw, 3.2rem); font-weight: 900; text-transform: uppercase; line-height: 1.15; margin-bottom: 1.5rem;">
                Rooted in Solitude. Engineered for the World.
              </h2>
              <div class="tamyiz-manifesto-paragraphs">
                <p>
                  In late 2025 in Sopore, Kashmir, Basit and Sahil united their shared passion for technology, design, and uncompromising craftsmanship. Both hailing from technical backgrounds—Basit specializing in the Islamic field, ethics, and research, and Sahil in software development and full-stack architecture—they founded TAMYIZ to build digital publications and design systems for people who refuse to blend into the background.
                </p>
                <p>
                  The Arabic root of <em>Tamyiz</em> (تمييز) denotes the capacity to distinguish, to elevate, and to discern between the superfluous and the essential. Surrounded by the serene waters of the Jhelum and the alpine majesty of northern Kashmir, we established a quiet atelier that treats e-books, Notion operating frameworks, and UI systems with the permanence of classical architecture.
                </p>
                <p>
                  We believe that the future of independent work belongs to solitary craftspeople and focused thinkers who value intellectual depth over vanity metrics. Every release is our contribution to that standard.
                </p>
              </div>

              <div class="tamyiz-origin-meta-strip mt-8">
                <div class="meta-item">
                  <strong>LOCATION</strong>
                  <span>Sopore, Kashmir 193201, India</span>
                </div>
                <div class="meta-item">
                  <strong>COORDINATES</strong>
                  <span>34.28° N, 74.46° E</span>
                </div>
                <div class="meta-item">
                  <strong>FOUNDED</strong>
                  <span>Late 2025</span>
                </div>
              </div>
            </div>

            <div class="tamyiz-origin-imagery-col">
              <div class="tamyiz-origin-photo-frame">
                <img src="/assets/images/founders/basit.jpg" alt="TAMYIZ Sopore Atelier Inspiration" class="tamyiz-origin-photo" />
                <div class="tamyiz-origin-photo-caption">
                  <span>FIG. 01 — SOPORE RESEARCH ATELIER</span>
                  <span>EST. 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- DEDICATED CO-FOUNDER PROFILES -->
      <section class="tamyiz-section py-14 md:py-24" style="background: var(--color-offwhite); border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border);">
        <div class="container">
          <div style="text-align: center; max-width: 680px; margin: 0 auto 3.5rem auto;">
            <span style="font-family: var(--font-sub); font-size: 0.8rem; font-weight: 700; color: var(--color-red); text-transform: uppercase; letter-spacing: 0.12em;">The Architects</span>
            <h2 style="font-family: var(--font-display); font-size: clamp(2rem, 3.5vw, 2.8rem); font-weight: 900; margin-top: 0.4rem; text-transform: uppercase;">
              Co-Founders &amp; Leads
            </h2>
            <p style="color: #666; font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.5;">
              Two complementary disciplines: ethical philosophy and full-stack software architecture.
            </p>
          </div>

          <div class="tamyiz-founders-dual-grid grid grid-cols-1 lg:grid-cols-2 gap-8">
            ${(foundersData.founders || []).map(f => `
              <div class="tamyiz-founder-card">
                <div class="tamyiz-founder-portrait-wrap">
                  <img src="${f.image}" alt="${f.name} — ${f.role}" class="tamyiz-founder-portrait-img" loading="lazy" />
                  <div class="tamyiz-founder-portrait-badge">
                    <span>${f.tagline || f.role}</span>
                  </div>
                </div>

                <div class="tamyiz-founder-info">
                  <div class="tamyiz-founder-name-row">
                    <h3 class="tamyiz-founder-title">${f.name}</h3>
                    <span style="font-family: var(--font-sub); font-size: 0.72rem; font-weight: 800; color: var(--color-red); text-transform: uppercase;">Co-Founder</span>
                  </div>

                  <div class="tamyiz-founder-speciality-pill">${f.speciality || f.role}</div>

                  <p class="tamyiz-founder-bio">${f.bio}</p>

                  <div class="tamyiz-founder-quote">
                    "${f.quote}"
                  </div>

                  <div class="tamyiz-founder-socials flex flex-wrap gap-2 mt-4">
                    <a href="${f.socials.linkedin}" target="_blank" rel="noopener" class="tamyiz-founder-social-link">LinkedIn ↗</a>
                    <a href="${f.socials.x}" target="_blank" rel="noopener" class="tamyiz-founder-social-link">X (Twitter) ↗</a>
                    <a href="${f.socials.instagram}" target="_blank" rel="noopener" class="tamyiz-founder-social-link">Instagram ↗</a>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- DIRECT CONCIERGE CONTACT FORM -->
      <section class="tamyiz-section py-14 md:py-24" style="background: #FFFFFF;" id="contact-form-section">
        <div class="container">
          <div class="max-w-2xl mx-auto">
            <div style="text-align: center; margin-bottom: 2.5rem;">
              <span style="color: var(--color-red); font-family: var(--font-sub); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;">Concierge Access</span>
              <h2 style="font-family: var(--font-display); font-size: clamp(2rem, 3.5vw, 2.8rem); font-weight: 900; text-transform: uppercase; margin-top: 0.4rem;">
                Connect With The Atelier
              </h2>
              <p style="color: #666; font-size: 0.95rem; margin-top: 0.5rem;">
                Have questions about our digital editions, license customization, or technical support? We answer personally.
              </p>
            </div>

            <form class="tamyiz-contact-form" onsubmit="event.preventDefault(); window.tamyizApp.handleContactSubmit();">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="tamyiz-form-label">Your Name *</label>
                  <input type="text" id="contact-name" required placeholder="Full name" class="tamyiz-form-input" />
                </div>
                <div>
                  <label class="tamyiz-form-label">Email Address *</label>
                  <input type="email" id="contact-email" required placeholder="name@domain.com" class="tamyiz-form-input" />
                </div>
              </div>

              <div class="mb-4">
                <label class="tamyiz-form-label">Subject *</label>
                <select id="contact-subject" class="tamyiz-form-input">
                  <option value="Product Inquiry">Product Inquiry / Format Compatibility</option>
                  <option value="Enterprise License">Enterprise / Studio Team License</option>
                  <option value="Feedback">Feedback on Digital Edition</option>
                  <option value="Other">Direct Founder Correspondence</option>
                </select>
              </div>

              <div class="mb-6">
                <label class="tamyiz-form-label">Message *</label>
                <textarea id="contact-message" rows="4" required placeholder="How can the TAMYIZ atelier assist your creative or technical work?" class="tamyiz-form-input" style="border-radius: 8px;"></textarea>
              </div>

              <div class="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <button type="submit" class="tamyiz-hero-btn-primary w-full sm:w-auto">
                  <span>DISPATCH MESSAGE TO FOUNDERS</span>
                  <span>→</span>
                </button>

                <a href="https://wa.me/${brandInfo.whatsappNumber}" target="_blank" rel="noopener" class="tamyiz-btn-nav-outline w-full sm:w-auto text-center" style="display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; color: #278838; border-color: #278838;">
                  <span>💬 Instant WhatsApp Concierge</span>
                  <span>↗</span>
                </a>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  `;
}
