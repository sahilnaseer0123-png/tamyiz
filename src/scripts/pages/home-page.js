/**
 * TAMYIZ™ Home Page (Editorial Flagship)
 * Route: /
 */

import { products } from '../../data/products.js';
import { foundersData, testimonials } from '../../data/content.js';
import { store } from '../store.js';

export function renderHomePage(appInstance) {
  // 3 Bestseller Spotlight products
  const featuredIds = ['tmz-dig-001', 'tmz-dig-004', 'tmz-dig-007'];
  const featuredProducts = featuredIds
    .map(id => products.find(p => p.id === id))
    .filter(Boolean);

  return `
    <div class="tamyiz-page-home">
      <!-- 1. HIGH-IMPACT EDITORIAL HERO SECTION -->
      <section class="tamyiz-hero-section" id="hero">
        <div class="tamyiz-hero-container">
          <div class="tamyiz-hero-editorial-stack">
            <div class="tamyiz-hero-badge-pill">
              <span class="tamyiz-hero-badge-dot"></span>
              <span>EDITION 01 • DIGITAL PUBLICATIONS &amp; TEMPLATES</span>
            </div>

            <h1 class="tamyiz-hero-giant-title">
              TAMYIZ
            </h1>

            <p class="tamyiz-hero-subheadline">
              Authoritative e-books, Notion operating systems, and architectural design templates. Crafted in Sopore, Kashmir.
            </p>

            <div class="tamyiz-hero-actions">
              <button class="tamyiz-hero-btn-primary" onclick="window.tamyizApp.navigateTo('/editions')">
                <span>EXPLORE EDITIONS</span>
                <span>↓</span>
              </button>
              <span class="tamyiz-hero-spec-tag">INSTANT DIGITAL ACCESS • PDF, EPUB &amp; NOTION SYSTEMS</span>
            </div>
          </div>

          <!-- Unbounded Horizon Installation -->
          <div class="tamyiz-hero-sculpture-wrap" id="hero-3d-wrap">
            <div class="tamyiz-hero-horizon-assembly">
              <div class="tamyiz-hero-dome-cropper">
                <picture class="w-full flex items-start justify-center">
                  <source srcset="/assets/images/tamyiz-logo-transparent.png" type="image/png" />
                  <img
                    src="/assets/images/tamyiz-logo.png"
                    alt="TAMYIZ Horizon Emblem"
                    class="tamyiz-hero-logo-img"
                    loading="eager"
                    fetchpriority="high"
                  />
                </picture>
              </div>

              <!-- Subtle 1px full-width Horizon Line -->
              <div class="tamyiz-horizon-line"></div>

              <!-- Live Horizon Sparks Engine Canvas -->
              <canvas id="tamyiz-logo-sparks-canvas" class="tamyiz-hero-sparks-canvas" aria-hidden="true"></canvas>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. BRAND PROMISE / VALUE STRIP -->
      <div class="tamyiz-promise-strip py-12 md:py-16 px-6">
        <div class="container mx-auto px-6">
          <div class="tamyiz-promise-grid">
            <div class="tamyiz-promise-item">
              <span class="tamyiz-promise-icon">⚡</span>
              <div>
                <strong>Instant Digital Delivery</strong>
                <p>Unlocked immediately on-screen &amp; dispatched to email/WhatsApp</p>
              </div>
            </div>
            <div class="tamyiz-promise-item">
              <span class="tamyiz-promise-icon">📐</span>
              <div>
                <strong>Architectural Precision</strong>
                <p>Swiss typographic layouts, 300DPI plates &amp; Notion formulas</p>
              </div>
            </div>
            <div class="tamyiz-promise-item">
              <span class="tamyiz-promise-icon">♾️</span>
              <div>
                <strong>Lifetime Updates</strong>
                <p>All future revisions and upgraded templates included free</p>
              </div>
            </div>
            <div class="tamyiz-promise-item">
              <span class="tamyiz-promise-icon">🛡️</span>
              <div>
                <strong>Atelier Guarantee</strong>
                <p>100% personal &amp; commercial single-operator license</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. FEATURED CURATED EDITIONS (BESTSELLERS SPOTLIGHT) -->
      <section class="tamyiz-section py-14 md:py-24" style="background: var(--color-offwhite);">
        <div class="container">
          <div class="tamyiz-shop-header" style="align-items: flex-end; margin-bottom: 2.5rem;">
            <div>
              <span style="color: var(--color-red); font-family: var(--font-sub); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; display: inline-block; margin-bottom: 0.5rem;">Curated Publications // Bestsellers</span>
              <h2 style="font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 900; text-transform: uppercase;">Featured Editions</h2>
            </div>
            <button class="tamyiz-btn-nav-outline" onclick="window.tamyizApp.navigateTo('/editions')">
              <span>View All 8 Digital Editions</span>
              <span>→</span>
            </button>
          </div>

          <!-- 3-Card Equal-Height Grid -->
          <div class="tamyiz-product-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
            ${featuredProducts.map(p => renderProductCardHtml(p, appInstance)).join('')}
          </div>

          <div style="text-align: center; margin-top: 3.5rem;">
            <button class="tamyiz-btn-primary-large" onclick="window.tamyizApp.navigateTo('/editions')">
              <span>EXPLORE ALL 8 DIGITAL EDITIONS &amp; SYSTEMS</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      <!-- 4. PHILOSOPHY SNAPSHOT (THE THREE PILLARS) -->
      <section class="tamyiz-section py-14 md:py-24" style="background: #FFFFFF; border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border);">
        <div class="container">
          <div style="text-align: center; max-width: 680px; margin: 0 auto 3rem auto;">
            <span style="color: var(--color-red); font-family: var(--font-sub); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; display: inline-block; margin-bottom: 0.5rem;">Atelier Philosophy</span>
            <h2 style="font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3rem); font-weight: 900; text-transform: uppercase; line-height: 1.1;">The Three Pillars of Distinction</h2>
            <p style="color: #666; font-size: 0.95rem; margin-top: 0.75rem; line-height: 1.55;">
              Every publication, Notion system, and design framework is guided by three non-negotiable principles engineered in Sopore, Kashmir.
            </p>
          </div>

          <div class="tamyiz-values-grid grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8" style="margin-top: 0;">
            <div class="tamyiz-value-card">
              <div class="tamyiz-value-num">01</div>
              <h3 class="tamyiz-value-title">Intellectual Depth</h3>
              <p class="tamyiz-value-desc">
                We reject content mill superficiality. Every e-book is written with deep philosophical rigor, academic density, and actionable execution frameworks.
              </p>
            </div>

            <div class="tamyiz-value-card">
              <div class="tamyiz-value-num">02</div>
              <h3 class="tamyiz-value-title">Swiss Editorial Precision</h3>
              <p class="tamyiz-value-desc">
                Crafted with brutalist typographic hierarchy, high-contrast monochrome layouts, and 300DPI architectural book plates designed for focused contemplation.
              </p>
            </div>

            <div class="tamyiz-value-card">
              <div class="tamyiz-value-num">03</div>
              <h3 class="tamyiz-value-title">Instant Frictionless Systems</h3>
              <p class="tamyiz-value-desc">
                Zero shipping waits. 1-click Notion duplication links, DRM-free multi-format files (PDF, EPUB, MOBI), and lifetime async version upgrades.
              </p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 3rem;">
            <button class="tamyiz-btn-nav-outline" onclick="window.tamyizApp.navigateTo('/philosophy')">
              <span>READ FULL MANIFESTO &amp; FORMAT GUIDE</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      <!-- 5. ARCHITECTS TEASER (CO-FOUNDERS BANNER) -->
      <section class="tamyiz-section py-14 md:py-24" style="background: var(--color-offwhite); border-bottom: 1px solid var(--color-border);">
        <div class="container">
          <div class="tamyiz-founders-teaser-card">
            <div class="tamyiz-founders-teaser-content">
              <span style="font-family: var(--font-sub); font-size: 0.78rem; font-weight: 700; color: var(--color-red); text-transform: uppercase; letter-spacing: 0.12em; display: inline-block; margin-bottom: 0.5rem;">
                Atelier Origin // Sopore, Kashmir
              </span>
              <h2 style="font-family: var(--font-display); font-size: clamp(2rem, 3.5vw, 2.8rem); font-weight: 900; text-transform: uppercase; line-height: 1.15; margin-bottom: 1rem;">
                Architects of the Archive
              </h2>
              <p style="font-size: 0.95rem; color: #444; line-height: 1.6; margin-bottom: 1.75rem; max-width: 580px;">
                Founded in late 2025 by <strong>Basit</strong> (Islamic studies, research &amp; ethical philosophy) and <strong>Sahil</strong> (software engineering, UI/UX architecture &amp; full-stack systems). Together, they fuse Himalayan heritage with modern digital precision.
              </p>
              <div class="flex flex-wrap gap-3">
                <button class="tamyiz-hero-btn-primary" style="padding: 0.85rem 1.75rem; font-size: 0.82rem;" onclick="window.tamyizApp.navigateTo('/atelier')">
                  <span>EXPLORE ATELIER ORIGIN &amp; FOUNDERS</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            <div class="tamyiz-founders-teaser-duo">
              <div class="tamyiz-founder-mini-portrait">
                <img src="/assets/images/founders/basit.jpg" alt="Basit — Co-Founder" loading="lazy" />
                <div class="tamyiz-founder-mini-label">
                  <strong>BASIT</strong>
                  <span>Islamic Field &amp; Ethics</span>
                </div>
              </div>
              <div class="tamyiz-founder-mini-portrait">
                <img src="/assets/images/founders/sahil.jpg" alt="Sahil — Co-Founder" loading="lazy" />
                <div class="tamyiz-founder-mini-label">
                  <strong>SAHIL</strong>
                  <span>Full-Stack Architecture</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. INSIDE THE ATELIER / EARLY READER NOTES -->
      <section class="tamyiz-section py-14 md:py-24" style="background: #FFFFFF;">
        <div class="container">
          <div style="text-align: center; max-width: 680px; margin: 0 auto 3.5rem auto;">
            <span style="font-family: var(--font-sub); font-size: 0.8rem; font-weight: 700; color: var(--color-red); text-transform: uppercase; letter-spacing: 0.12em;">Inside The Atelier</span>
            <h2 style="font-family: var(--font-display); font-size: clamp(2rem, 3.5vw, 2.8rem); font-weight: 900; margin-top: 0.4rem; text-transform: uppercase;">Early Reader Notes.</h2>
            <p style="color: #666; font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.5;">
              Reflections on writing clarity, Swiss typographic discipline, and architectural philosophy from verified readers and design leaders.
            </p>
          </div>

          <div class="tamyiz-reviews-grid grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            ${testimonials.map(t => `
              <div class="tamyiz-review-card">
                <div>
                  <div style="display: flex; gap: 4px; color: var(--color-red); margin-bottom: 1.25rem; font-size: 0.95rem;">
                    ${Array(t.rating).fill('★').join('')}
                  </div>
                  <p style="font-size: 0.95rem; color: #222; line-height: 1.6; margin-bottom: 1.75rem;">"${t.text}"</p>
                </div>
                <div style="border-top: 1px solid var(--color-border); padding-top: 1rem; font-size: 0.82rem;">
                  <strong>${t.author}</strong> — ${t.location}
                  <div style="color: var(--color-grey); font-size: 0.75rem; margin-top: 0.2rem;">${t.product}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    </div>
  `;
}

/**
 * Reusable Equal-Height Product Card Renderer (Rule 4)
 */
export function renderProductCardHtml(p, appInstance) {
  const slug = p.slug || p.id;
  const hasVariants = p.variants && p.variants.options && p.variants.options.length > 0;
  const currentSelectedOption = appInstance.selectedSizes[p.id] || (hasVariants ? p.variants.options[0] : "Standard");

  return `
    <div class="tamyiz-product-card flex flex-col h-full" id="card-${p.id}">
      <div class="tamyiz-product-thumb" onclick="window.tamyizApp.navigateTo('/edition/${slug}')">
        <img src="${p.images[0]}" alt="${p.name}" class="tamyiz-img-primary" loading="lazy" />
        <img src="${p.images[1] || p.images[0]}" alt="${p.name} preview" class="tamyiz-img-hover" loading="lazy" />

        <span class="tamyiz-badge-digital">${p.badge}</span>

        <button class="tamyiz-btn-wishlist ${store.isInWishlist(p.id) ? 'active' : ''}" data-id="${p.id}" onclick="event.stopPropagation(); window.tamyizApp.toggleWishlist('${p.id}')" aria-label="Wishlist">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${store.isInWishlist(p.id) ? 'var(--color-red)' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      <div class="tamyiz-product-info flex flex-col flex-1 justify-between">
        <div>
          <span class="tamyiz-product-cat">${p.category}</span>
          <h4 class="tamyiz-product-name" onclick="window.tamyizApp.navigateTo('/edition/${slug}')">${p.name}</h4>

          <div class="tamyiz-product-pricing flex items-baseline gap-2" aria-label="Price: ₹${p.price.toLocaleString('en-IN')}${p.originalPrice ? `, original price ₹${p.originalPrice.toLocaleString('en-IN')}` : ''}">
            <span class="tamyiz-price-cur font-bold text-black">₹${p.price.toLocaleString('en-IN')}</span>
            ${p.originalPrice ? `<span class="tamyiz-price-orig text-gray-400 line-through">₹${p.originalPrice.toLocaleString('en-IN')}</span>` : ''}
          </div>

          ${hasVariants ? `
            <div class="tamyiz-size-selector-wrap" onclick="event.stopPropagation()">
              <div class="tamyiz-size-selector-label">
                <span>${p.variants.type || 'Format'}:</span>
                <span style="color: var(--color-black); font-weight: 800;" id="size-label-${p.id}">${currentSelectedOption}</span>
              </div>
              <div class="tamyiz-size-pills-row">
                ${p.variants.options.map(opt => `
                  <button class="tamyiz-size-pill-btn ${opt === currentSelectedOption ? 'active' : ''}" onclick="window.tamyizApp.selectProductSize('${p.id}', '${opt}', this)">
                    ${opt}
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <div class="tamyiz-card-actions-row">
          <button class="tamyiz-btn-quick-add" style="background: var(--color-red); font-size: 0.82rem; padding: 0.82rem; border: none; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;" onclick="window.tamyizApp.quickAddToCart('${p.id}')">
            INSTANT ACCESS • ₹${p.price.toLocaleString('en-IN')}
          </button>
          <button class="tamyiz-btn-preview-trigger" onclick="window.tamyizApp.navigateTo('/edition/${slug}')">
            <span>📖</span>
            <span>PREVIEW / DEMO</span>
            <span>↗</span>
          </button>
        </div>
      </div>
    </div>
  `;
}
