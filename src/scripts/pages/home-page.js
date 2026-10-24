/**
 * TAMYIZ™ Home Page (Editorial Flagship)
 * Route: /
 */

import { products, isAvailable, anyAvailable, buyLabel } from '../../data/products.js';
import { foundersData } from '../../data/content.js';
import { siteConfig } from '../../data/site-config.js';
import { store } from '../store.js';
import { principlesSection, formatGuideSection } from './sections.js';

export function renderHomePage(appInstance) {
  // Newest 3 ebooks (the list from /admin is newest first)
  const featuredProducts = products.slice(0, 3);

  return `
    <div class="tamyiz-page-home">
      <!-- 1. HERO: the TAMYIZ logo, large. The dome rises from a horizon line, its grain drifts (canvas), the wordmark sits under it. -->
      <section class="tmz-hero" id="hero">
        <div class="tmz-hero-inner">
          <div class="tmz-hero-top">
            <div class="tamyiz-hero-badge-pill">
              <span class="tamyiz-hero-badge-dot"></span>
              <span>PRACTICAL E-BOOKS • BY SAHIL &amp; BASIT</span>
            </div>
            <a href="/atelier" class="tmz-glass tmz-hero-about" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/atelier')">
              <span class="tmz-hero-faces" aria-hidden="true">
                ${foundersData.founders.map((f) => `<img src="${f.image}" alt="" width="40" height="40" loading="lazy" decoding="async" />`).join('')}
              </span>
              <span>About us</span>
            </a>
          </div>

          <div class="tmz-hero-band">
            <div class="tmz-hero-left">
              ${featuredProducts.length ? `<a href="/editions" class="tmz-glass tmz-hero-count tmz-hero-count-wide" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/editions')">
                <strong>${products.length} e-book${products.length === 1 ? '' : 's'}</strong>
                <span>${products.map((p) => p.name).join(' · ')}</span>
              </a>` : ''}
              <p class="tmz-hero-sub">
                Short, practical e-books on AI and the digital world, written for beginners. Download the PDF and start reading in a minute.
              </p>
            </div>

            <div class="tmz-logo-block">
              <div class="tmz-logo-stage">
                <img class="tmz-logo-dome" src="/assets/brand/tamyiz-dome-red.webp" alt="" width="847" height="248" fetchpriority="high" />
                <canvas id="tamyiz-logo-sparks-canvas" class="tmz-logo-sparks" data-zone="0.50,0.95,0.06,0.85" aria-hidden="true"></canvas>
              </div>
              <div class="tmz-horizon" aria-hidden="true"></div>
              <h1 class="tmz-hero-word"><img src="/assets/brand/tamyiz-wordmark.svg" alt="TAMYIZ" width="442" height="74" /></h1>
            </div>

            <div class="tmz-hero-actions">
              <button class="tamyiz-hero-btn-primary" onclick="window.tamyizApp.navigateTo('/editions')">
                <span>SEE THE E-BOOKS</span>
                <span>↓</span>
              </button>
              <span class="tmz-hero-spec">${anyAvailable() ? 'INSTANT PDF DOWNLOAD • READ ON ANY DEVICE' : 'FIRST EDITIONS COMING SOON • PRE-ORDER ON WHATSAPP'}</span>
            </div>
          </div>
          ${featuredProducts.length ? `<a href="/editions" class="tmz-glass tmz-hero-count tmz-hero-count-narrow" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/editions')">
                <strong>${products.length} e-book${products.length === 1 ? '' : 's'}</strong>
                <span>${products.map((p) => p.name).join(' · ')}</span>
              </a>` : ''}
        </div>
      </section>

      <!-- 2. BRAND PROMISE / VALUE STRIP -->
      <div class="tamyiz-promise-strip w-full">
        <div class="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-8 pr-20 lg:pr-28">
          <div class="tamyiz-promise-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-neutral-800 gap-8 lg:gap-0 items-start w-full">
            <div class="tamyiz-promise-item lg:px-8 first:lg:pl-0 last:lg:pr-0">
              <span class="tamyiz-promise-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </span>
              <div>
                <strong>Instant download</strong>
                <p>Your PDF download appears on screen the moment you pay.</p>
              </div>
            </div>
            <div class="tamyiz-promise-item lg:px-8 first:lg:pl-0 last:lg:pr-0">
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
                <strong>Reads anywhere</strong>
                <p>Phone, tablet, laptop or Kindle. Nothing to install.</p>
              </div>
            </div>
            <div class="tamyiz-promise-item lg:px-8 first:lg:pl-0 last:lg:pr-0">
              <span class="tamyiz-promise-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18.178 8c5.096 0 5.096 8 0 8-2.67 0-4.67-2.67-6.178-5.333C10.5 8 8.5 8 5.822 8c-5.096 0-5.096 8 0 8 2.67 0 4.67-2.67 6.178-5.333C13.5 16 15.5 16 18.178 16z"></path>
                </svg>
              </span>
              <div>
                <strong>Plain English</strong>
                <p>Written for beginners, built around real examples.</p>
              </div>
            </div>
            <div class="tamyiz-promise-item lg:px-8 first:lg:pl-0 last:lg:pr-0">
              <span class="tamyiz-promise-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <path d="M9 12l2 2 4-4"></path>
                </svg>
              </span>
              <div>
                <strong>Real people</strong>
                <p>Questions? WhatsApp the founders directly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. FEATURED CURATED EDITIONS -->
      <section id="editions" class="tamyiz-section py-14 md:py-24 scroll-mt-24" style="background: var(--color-offwhite);">
        <div class="container">
          <div class="tamyiz-shop-header" style="align-items: flex-end; margin-bottom: 2.5rem;">
            <div>
              <span style="color: var(--color-red-ink); font-family: var(--font-sub); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; display: inline-block; margin-bottom: 0.5rem;">The shop</span>
              <h2 style="font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 900; text-transform: uppercase;">Latest e-books</h2>
            </div>
            ${products.length > 3 ? `<button class="tamyiz-btn-nav-outline" onclick="window.tamyizApp.navigateTo('/editions')">
              <span>View all ${products.length} e-books</span>
              <span>→</span>
            </button>` : ''}
          </div>

          <!-- 3-Card Equal-Height Grid -->
          <div class="tamyiz-product-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
            ${featuredProducts.length ? featuredProducts.map(p => renderProductCardHtml(p, appInstance)).join('') : `
              <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1.5rem; background: #FFFFFF; border: 1px dashed var(--color-border); border-radius: 6px;">
                <div style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; text-transform: uppercase; margin-bottom: 0.5rem;">
                  First e-books on the way
                </div>
                <p style="color: var(--color-grey); font-size: 0.95rem; margin: 0 auto 1.5rem; max-width: 30rem;">
                  We are writing them now. Message us on WhatsApp and we will tell you the day the first one is out.
                </p>
                <a class="tamyiz-btn-nav-outline" href="${siteConfig.whatsappUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex;">
                  Tell me when it's out ↗
                </a>
              </div>`}
          </div>

          ${products.length > 3 ? `<div style="text-align: center; margin-top: 3.5rem;">
            <button class="tamyiz-btn-primary-large" onclick="window.tamyizApp.navigateTo('/editions')">
              <span>SEE ALL ${products.length} E-BOOKS</span>
              <span>→</span>
            </button>
          </div>` : ''}
        </div>
      </section>

      <!-- 4. HOW WE WRITE -->
${principlesSection({ id: 'philosophy' })}

      <!-- 5. ARCHITECTS TEASER (CO-FOUNDERS BANNER) -->
      <section id="origin" class="tamyiz-section py-14 md:py-24 scroll-mt-24" style="background: var(--color-offwhite); border-bottom: 1px solid var(--color-border);">
        <div class="container">
          <div class="tamyiz-founders-teaser-card">
            <div class="tamyiz-founders-teaser-content">
              <span style="font-family: var(--font-sub); font-size: 0.78rem; font-weight: 700; color: var(--color-red-ink); text-transform: uppercase; letter-spacing: 0.12em; display: inline-block; margin-bottom: 0.5rem;">
                About us // Est. 2025
              </span>
              <h2 style="font-family: var(--font-display); font-size: clamp(2rem, 3.5vw, 2.8rem); font-weight: 900; text-transform: uppercase; line-height: 1.15; margin-bottom: 1rem;">
                Who makes TAMYIZ
              </h2>
              <p style="font-size: 0.95rem; color: #444; line-height: 1.6; margin-bottom: 1.75rem; max-width: 580px;">
                Founded in late 2025 by <strong>Basit Majeed</strong> (Security &amp; Research) and <strong>Sahil</strong> (AI/ML &amp; Build). Together they write the practical guides they wish they'd had when they started.
              </p>
              <div class="flex flex-wrap gap-3">
                <button class="tamyiz-hero-btn-primary" style="padding: 0.85rem 1.75rem; font-size: 0.82rem;" onclick="window.tamyizApp.navigateTo('/atelier')">
                  <span>Our story</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            <div class="tamyiz-founders-teaser-duo">
              <!-- Basit Mini Card -->
              <div class="tamyiz-founder-mini-card">
                <div class="tamyiz-founder-mini-portrait">
                  <img src="/assets/images/founders/basit.webp" alt="Basit Majeed — Co-Founder" loading="lazy" />
                </div>
                <div class="tamyiz-founder-mini-info">
                  <strong class="tamyiz-founder-mini-name">BASIT MAJEED</strong>
                  <span class="tamyiz-founder-mini-role">Security &amp; Research</span>
                  <div class="tamyiz-mini-socials">
                    <a href="${siteConfig.founders.basit.socials.instagram}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();">Instagram ↗</a>
                    <a href="${siteConfig.founders.basit.socials.linkedin}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();">LinkedIn ↗</a>
                    <a href="${siteConfig.founders.basit.socials.x}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();">X ↗</a>
                    ${siteConfig.founders.basit.email ? `<a href="mailto:${siteConfig.founders.basit.email}" onclick="event.stopPropagation();">Email ↗</a>` : ''}
                  </div>
                </div>
              </div>

              <!-- Sahil Mini Card -->
              <div class="tamyiz-founder-mini-card">
                <div class="tamyiz-founder-mini-portrait">
                  <img src="/assets/images/founders/sahil.webp" alt="Sahil — Co-Founder" loading="lazy" />
                </div>
                <div class="tamyiz-founder-mini-info">
                  <strong class="tamyiz-founder-mini-name">SAHIL</strong>
                  <span class="tamyiz-founder-mini-role">AI/ML &amp; Build</span>
                  <div class="tamyiz-mini-socials">
                    <a href="${siteConfig.founders.sahil.socials.instagram}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();">Instagram ↗</a>
                    <a href="${siteConfig.founders.sahil.socials.linkedin}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();">LinkedIn ↗</a>
                    <a href="${siteConfig.founders.sahil.socials.x}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();">X ↗</a>
                    ${siteConfig.founders.sahil.email ? `<a href="mailto:${siteConfig.founders.sahil.email}" onclick="event.stopPropagation();">Email ↗</a>` : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 5B. FORMAT GUIDE -->
${formatGuideSection()}

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
    <div class="tamyiz-product-card flex flex-col h-full" id="card-${p.id}" data-product-card="${p.id}">
      <div class="tamyiz-product-thumb" onclick="window.tamyizApp.navigateTo('/edition/${slug}')">
        <img src="${p.images[0]}" alt="${p.name}" class="tamyiz-img-primary" loading="lazy" />
        <img src="${p.images[1] || p.images[0]}" alt="" aria-hidden="true" class="tamyiz-img-hover" loading="lazy" />

        <span class="tamyiz-badge-digital">${isAvailable(p) ? p.badge : 'COMING SOON'}</span>

        <button class="tamyiz-btn-wishlist ${store.isInWishlist(p.id) ? 'active' : ''}" data-id="${p.id}" onclick="event.stopPropagation(); window.tamyizApp.toggleWishlist('${p.id}')" aria-label="Wishlist">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${store.isInWishlist(p.id) ? 'var(--color-red)' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      <div class="tamyiz-product-info flex flex-col flex-1 justify-between">
        <div>
          <span class="tamyiz-product-cat">${p.category}</span>
          ${isAvailable(p) ? '' : '<span class="tamyiz-card-status">Coming soon</span>'}
          <h3 class="tamyiz-product-name"><a href="/edition/${slug}" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/edition/${slug}')">${p.name}</a></h3>

          <div class="tamyiz-product-pricing flex items-baseline gap-2" id="pricing-${p.id}" aria-label="Price: ₹${currentPrice.toLocaleString('en-IN')}${currentOrigPrice ? `, original price ₹${currentOrigPrice.toLocaleString('en-IN')}` : ''}">
            <span class="tamyiz-price-cur font-bold text-black" id="price-${p.id}">₹${currentPrice.toLocaleString('en-IN')}</span>
            <span class="tamyiz-price-orig line-through" id="orig-price-${p.id}" style="${currentOrigPrice ? '' : 'display:none;'}">${currentOrigPrice ? `₹${currentOrigPrice.toLocaleString('en-IN')}` : ''}</span>
          </div>

          ${hasVariants ? `
            <div class="tamyiz-size-selector-wrap" onclick="event.stopPropagation()">
              <div class="tamyiz-size-selector-label font-mono text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span class="text-gray-500 font-semibold">FORMAT:</span>
                <span style="color: var(--color-black); font-weight: 800;" id="size-label-${p.id}" class="tamyiz-size-label">${currentSelectedOption}</span>
              </div>
              <div class="tamyiz-size-pills-row" role="group" aria-label="Format selection">
                ${p.variants.options.map(opt => `
                  <button class="tamyiz-size-pill-btn ${opt === currentSelectedOption ? 'active' : ''}" 
                          aria-pressed="${opt === currentSelectedOption ? 'true' : 'false'}"
                          data-variant="${opt}"
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
            ${buyLabel(p, currentPrice, 'card')}
          </button>
          <a class="tamyiz-btn-preview-trigger" href="/edition/${slug}" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/edition/${slug}')">
            <span>See what's inside →</span>
          </a>
        </div>
      </div>
    </div>
  `;
}
