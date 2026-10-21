/**
 * TAMYIZ™ Home Page (Editorial Flagship)
 * Route: /
 */

import { products } from '../../data/products.js';
import { foundersData } from '../../data/content.js';
import { siteConfig } from '../../data/site-config.js';
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
                  <source srcset="/assets/images/tamyiz-globe-horizon.png" type="image/png" />
                  <img
                    src="/assets/images/tamyiz-globe-horizon.png"
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
      <div class="tamyiz-promise-strip py-6 md:py-8 px-6">
        <div class="container mx-auto px-6">
          <div class="tamyiz-promise-grid">
            <div class="tamyiz-promise-item">
              <span class="tamyiz-promise-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </span>
              <div>
                <strong>Instant Digital Delivery</strong>
                <p>Unlocked immediately on-screen &amp; dispatched to email/WhatsApp</p>
              </div>
            </div>
            <div class="tamyiz-promise-item">
              <span class="tamyiz-promise-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 22h20"></path>
                  <path d="M3 22L19 6a3 3 0 0 0-4.24-4.24L2 14.5V22z"></path>
                  <path d="M7 17l2-2"></path>
                  <path d="M10 14l2-2"></path>
                  <path d="M13 11l2-2"></path>
                </svg>
              </span>
              <div>
                <strong>Architectural Precision</strong>
                <p>Swiss typographic layouts, 300DPI plates &amp; Notion formulas</p>
              </div>
            </div>
            <div class="tamyiz-promise-item">
              <span class="tamyiz-promise-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18.178 8c5.096 0 5.096 8 0 8-2.67 0-4.67-2.67-6.178-5.333C10.5 8 8.5 8 5.822 8c-5.096 0-5.096 8 0 8 2.67 0 4.67-2.67 6.178-5.333C13.5 16 15.5 16 18.178 16z"></path>
                </svg>
              </span>
              <div>
                <strong>Lifetime Updates</strong>
                <p>All future revisions and upgraded templates included free</p>
              </div>
            </div>
            <div class="tamyiz-promise-item">
              <span class="tamyiz-promise-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <path d="M9 12l2 2 4-4"></path>
                </svg>
              </span>
              <div>
                <strong>Atelier Guarantee</strong>
                <p>100% personal &amp; commercial single-operator license</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. FEATURED CURATED EDITIONS (BESTSELLERS SPOTLIGHT) -->
      <section id="editions" class="tamyiz-section py-14 md:py-24 scroll-mt-24" style="background: var(--color-offwhite);">
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
      <section id="philosophy" class="tamyiz-section py-14 md:py-24 scroll-mt-24" style="background: #FFFFFF; border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border);">
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
                Zero shipping waits. 1-click Notion duplication links, DRM-free multi-format files (PDF, EPUB, Kindle EPUB), and lifetime async version upgrades.
              </p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 3rem;">
            <button class="tamyiz-btn-nav-outline" onclick="window.tamyizApp.navigateTo('/#format-guide')">
              <span>EXPLORE FORMAT &amp; COMPATIBILITY GUIDE</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      <!-- 5. ARCHITECTS TEASER (CO-FOUNDERS BANNER) -->
      <section id="origin" class="tamyiz-section py-14 md:py-24 scroll-mt-24" style="background: var(--color-offwhite); border-bottom: 1px solid var(--color-border);">
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
                Founded in late 2025 by <strong>Basit Majeed</strong> (Security &amp; Research) and <strong>Sahil</strong> (AI/ML &amp; Build). Together, they fuse Himalayan heritage with modern technical precision.
              </p>
              <div class="flex flex-wrap gap-3">
                <button class="tamyiz-hero-btn-primary" style="padding: 0.85rem 1.75rem; font-size: 0.82rem;" onclick="window.tamyizApp.navigateTo('/atelier')">
                  <span>Explore Atelier &amp; Story</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            <div class="tamyiz-founders-teaser-duo">
              <!-- Basit Mini Card -->
              <div class="tamyiz-founder-mini-card">
                <div class="tamyiz-founder-mini-portrait">
                  <img src="/assets/images/founders/basit.jpg" alt="Basit Majeed — Co-Founder" loading="lazy" />
                </div>
                <div class="tamyiz-founder-mini-info">
                  <strong class="tamyiz-founder-mini-name">BASIT MAJEED</strong>
                  <span class="tamyiz-founder-mini-role">Security &amp; Research</span>
                  <div class="tamyiz-mini-socials">
                    <a href="${siteConfig.founders.basit.socials.instagram}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();">Instagram ↗</a>
                    <a href="${siteConfig.founders.basit.socials.linkedin}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();">LinkedIn ↗</a>
                    <a href="${siteConfig.founders.basit.socials.x}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();">X ↗</a>
                  </div>
                </div>
              </div>

              <!-- Sahil Mini Card -->
              <div class="tamyiz-founder-mini-card">
                <div class="tamyiz-founder-mini-portrait">
                  <img src="/assets/images/founders/sahil.jpg" alt="Sahil — Co-Founder" loading="lazy" />
                </div>
                <div class="tamyiz-founder-mini-info">
                  <strong class="tamyiz-founder-mini-name">SAHIL</strong>
                  <span class="tamyiz-founder-mini-role">AI/ML &amp; Build</span>
                  <div class="tamyiz-mini-socials">
                    <a href="${siteConfig.founders.sahil.socials.instagram}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();">Instagram ↗</a>
                    <a href="${siteConfig.founders.sahil.socials.linkedin}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();">LinkedIn ↗</a>
                    <a href="${siteConfig.founders.sahil.socials.x}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();">X ↗</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 5B. FORMAT GUIDE / COMPATIBILITY MATRIX -->
      <section id="format-guide" class="tamyiz-section py-14 md:py-24 scroll-mt-24" style="background: var(--color-offwhite); border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border);">
        <div class="container">
          <div style="text-align: center; max-width: 680px; margin: 0 auto 3rem auto;">
            <span style="color: var(--color-red); font-family: var(--font-sub); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; display: inline-block; margin-bottom: 0.5rem;">Digital Standards &amp; Readers</span>
            <h2 style="font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3rem); font-weight: 900; text-transform: uppercase; line-height: 1.1;">Digital Format Guide</h2>
            <p style="color: #666; font-size: 0.95rem; margin-top: 0.75rem; line-height: 1.55;">
              Every publication, Notion workspace, and UI system is engineered for zero DRM friction across Apple, Kindle, and modern web environments.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="tamyiz-matrix-card" style="background:#FFF; padding:1.75rem; border:1px solid var(--color-border); border-radius:4px;">
              <div class="matrix-card-header" style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem;">
                <span class="matrix-icon" aria-hidden="true" style="display:inline-flex; align-items:center; color:var(--color-black);">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                </span>
                <div>
                  <h4 style="font-family:var(--font-display); font-weight:700; font-size:1.05rem; text-transform:uppercase;">Interactive PDF</h4>
                  <span class="matrix-sub" style="font-size:0.75rem; color:#888;">300DPI Retina Vector Edition</span>
                </div>
              </div>
              <p class="matrix-desc" style="font-size:0.86rem; color:#555; line-height:1.6; margin-bottom:1rem;">
                Full-bleed architectural spreads, linked citations, margin notes, and vector typography optimized for iPads and desktop reading.
              </p>
              <div class="matrix-compatibility-tags" style="display:flex; flex-wrap:wrap; gap:0.4rem;">
                <span class="comp-tag active" style="font-size:0.7rem; background:#F0F0EE; padding:0.25rem 0.5rem; border-radius:2px; font-weight:600;">Apple Books ✓</span>
                <span class="comp-tag active" style="font-size:0.7rem; background:#F0F0EE; padding:0.25rem 0.5rem; border-radius:2px; font-weight:600;">Adobe Acrobat ✓</span>
              </div>
            </div>

            <div class="tamyiz-matrix-card" style="background:#FFF; padding:1.75rem; border:1px solid var(--color-border); border-radius:4px;">
              <div class="matrix-card-header" style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem;">
                <span class="matrix-icon" aria-hidden="true" style="display:inline-flex; align-items:center; color:var(--color-black);">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                    <line x1="12" y1="18" x2="12.01" y2="18" stroke-width="2"></line>
                    <line x1="8" y1="6" x2="16" y2="6"></line>
                  </svg>
                </span>
                <div>
                  <h4 style="font-family:var(--font-display); font-weight:700; font-size:1.05rem; text-transform:uppercase;">Kindle &amp; EPUB 3</h4>
                  <span class="matrix-sub" style="font-size:0.75rem; color:#888;">Reflowable E-Ink &amp; Mobile</span>
                </div>
              </div>
              <p class="matrix-desc" style="font-size:0.86rem; color:#555; line-height:1.6; margin-bottom:1rem;">
                Compatible with Amazon Kindle Paperwhite/Oasis, Kobo, and smartphones with customizable font sizes, night modes, and whispersync.
              </p>
              <div class="matrix-compatibility-tags" style="display:flex; flex-wrap:wrap; gap:0.4rem;">
                <span class="comp-tag active" style="font-size:0.7rem; background:#F0F0EE; padding:0.25rem 0.5rem; border-radius:2px; font-weight:600;">Kindle Scribe/Paperwhite ✓</span>
                <span class="comp-tag active" style="font-size:0.7rem; background:#F0F0EE; padding:0.25rem 0.5rem; border-radius:2px; font-weight:600;">Google Play Books ✓</span>
              </div>
            </div>

            <div class="tamyiz-matrix-card" style="background:#FFF; padding:1.75rem; border:1px solid var(--color-border); border-radius:4px;">
              <div class="matrix-card-header" style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem;">
                <span class="matrix-icon" aria-hidden="true" style="display:inline-flex; align-items:center; color:var(--color-red);">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                </span>
                <div>
                  <h4 style="font-family:var(--font-display); font-weight:700; font-size:1.05rem; text-transform:uppercase;">Notion &amp; Figma</h4>
                  <span class="matrix-sub" style="font-size:0.75rem; color:#888;">1-Click Duplication Vault</span>
                </div>
              </div>
              <p class="matrix-desc" style="font-size:0.86rem; color:#555; line-height:1.6; margin-bottom:1rem;">
                Instant 1-click duplication into your personal Notion workspace (Free &amp; Plus) and full vector components in Figma.
              </p>
              <div class="matrix-compatibility-tags" style="display:flex; flex-wrap:wrap; gap:0.4rem;">
                <span class="comp-tag active" style="font-size:0.7rem; background:#F0F0EE; padding:0.25rem 0.5rem; border-radius:2px; font-weight:600;">Notion App ✓</span>
                <span class="comp-tag active" style="font-size:0.7rem; background:#F0F0EE; padding:0.25rem 0.5rem; border-radius:2px; font-weight:600;">Figma Desktop/Web ✓</span>
              </div>
            </div>
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
  
  // Calculate dynamic variant pricing
  let currentPrice = p.price;
  let currentOrigPrice = p.originalPrice;
  if (p.variants?.prices && p.variants.prices[currentSelectedOption]) {
    currentPrice = p.variants.prices[currentSelectedOption].price;
    currentOrigPrice = p.variants.prices[currentSelectedOption].originalPrice;
  }

  return `
    <div class="tamyiz-product-card flex flex-col h-full" id="card-${p.id}">
      <div class="tamyiz-product-thumb" onclick="window.tamyizApp.navigateTo('/edition/${slug}')">
        <img src="${p.images[0]}" alt="${p.name}" class="tamyiz-img-primary" loading="lazy" />
        <img src="${p.images[1] || p.images[0]}" alt="" aria-hidden="true" class="tamyiz-img-hover" loading="lazy" />

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

          <div class="tamyiz-product-pricing flex items-baseline gap-2" id="pricing-${p.id}" aria-label="Price: ₹${currentPrice.toLocaleString('en-IN')}${currentOrigPrice ? `, original price ₹${currentOrigPrice.toLocaleString('en-IN')}` : ''}">
            <span class="tamyiz-price-cur font-bold text-black" id="price-${p.id}">₹${currentPrice.toLocaleString('en-IN')}</span>
            <span class="tamyiz-price-orig text-gray-400 line-through" id="orig-price-${p.id}" style="${currentOrigPrice ? '' : 'display:none;'}">${currentOrigPrice ? `₹${currentOrigPrice.toLocaleString('en-IN')}` : ''}</span>
          </div>

          ${hasVariants ? `
            <div class="tamyiz-size-selector-wrap" onclick="event.stopPropagation()">
              <div class="tamyiz-size-selector-label">
                <span>FORMAT:</span>
                <span style="color: var(--color-black); font-weight: 800;" id="size-label-${p.id}">${currentSelectedOption}</span>
              </div>
              <div class="tamyiz-size-pills-row" role="group" aria-label="Format selection">
                ${p.variants.options.map(opt => `
                  <button class="tamyiz-size-pill-btn ${opt === currentSelectedOption ? 'active' : ''}" 
                          aria-pressed="${opt === currentSelectedOption ? 'true' : 'false'}"
                          onclick="window.tamyizApp.selectProductSize('${p.id}', '${opt}', this)">
                    ${opt}
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <div class="tamyiz-card-actions-row">
          <button class="tamyiz-btn-quick-add" id="btn-quick-${p.id}" style="background: var(--color-red); font-size: 0.82rem; padding: 0.82rem; border: none; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;" onclick="window.tamyizApp.quickAddToCart('${p.id}')">
            Instant Access • ₹${currentPrice.toLocaleString('en-IN')}
          </button>
          <button class="tamyiz-btn-preview-trigger" onclick="event.stopPropagation(); window.tamyizApp.openProductPreview('${p.id}')">
            <span>Preview Edition ↗</span>
          </button>
        </div>
      </div>
    </div>
  `;
}
