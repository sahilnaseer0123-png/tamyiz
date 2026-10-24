/**
 * TAMYIZ™ Unified Application Controller
 * Multi-Page Digital Flagship Store with Persistent Global State
 * Routes:
 *   /              -> Home Page (Editorial Flagship)
 *   /editions      -> Full Digital Catalog Page
 *   /edition/:slug -> Dedicated Product Detail Page (Full Page PDP)
 *   /philosophy    -> Philosophy & Digital Format Guide Page
 *   /atelier       -> Atelier Origin & Co-Founders Page
 *   /checkout      -> Dedicated Instant Digital Checkout Page
 */

import { TamyizLogoSparks } from './tamyiz-logo-sparks.js';
import { pageMeta, SITE_URL } from '../data/seo.js';
import { renderNotFoundPage } from './pages/not-found-page.js';
import { products, loadProducts, findProductBySlugOrId, isAvailable, anyAvailable, buyLabel } from '../data/products.js';
import { foundersData, brandInfo, policies } from '../data/content.js';
import { siteConfig, preorderWhatsAppUrl } from '../data/site-config.js';
import { store } from './store.js';

import { renderHomePage } from './pages/home-page.js';
import { renderEditionsPage } from './pages/editions-page.js';
import { renderProductDetailPage } from './pages/product-detail-page.js';
import { renderPhilosophyPage } from './pages/philosophy-page.js';
import { renderAtelierPage } from './pages/atelier-page.js';
import { renderCheckoutPage } from './pages/checkout-page.js';
import { renderLegalPage, legalDocs } from './pages/legal-page.js';

export const escapeText = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

class TamyizUnifiedApp {
  constructor() {
    this.currentPage = 'home';
    this.currentSlug = null;
    this.confirmedOrder = null;

    this.hero3D = null;
    this.logoSparks = null;
    this.activeCategory = 'all'; // 'all' | 'ebooks' | 'notion' | 'design'
    this.searchQuery = '';
    this.sortBy = 'featured'; // 'featured' | 'price-asc' | 'price-desc'
    this.selectedSizes = {}; // { [productId]: formatOptionString }
    this.activePdpImageIndex = 0;
    this.mobileMenuOpen = false;
    this.activePreviewProduct = null;
    this.activePreviewTab = 0;

    this.init();
  }

  async init() {
    // 0. Expose global store instance for inline HTML event reliability
    window.store = store;

    // Ebooks come from /admin (Cloudflare storage). Load them before drawing anything that lists them.
    await loadProducts();
    store.pruneUnavailable();

    // 1. Initial shell render (Header, Drawer, Shell, Footer, Modals)
    this.renderShell();

    // 2. Parse initial route from URL
    this.handleLocationChange(false);

    // 3. Listen for browser Back/Forward (Zero-crash navigation)
    window.addEventListener('popstate', () => this.handleLocationChange(true));
    window.addEventListener('hashchange', () => this.handleLocationChange(true));

    // 4. Bind persistent store events
    this.bindStore();

    // 5. Header scroll listener
    this.bindScrollHeader();

    // 6. Check deep-link query parameter: ?category=... or ?cat=...
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category') || params.get('cat');
    if (catParam) {
      this.activeCategory = 'all';
    }
  }

  // Parse path & hash for zero-crash routing
  parseRoute(locationPath, locationHash) {
    let raw = (locationPath || window.location.pathname || '/').toLowerCase();
    let hash = (locationHash || window.location.hash || '');

    // If raw contains hash, extract it
    if (raw.includes('#') && !raw.startsWith('#/')) {
      const parts = raw.split('#');
      raw = parts[0];
      hash = '#' + parts[1];
    }

    // Support hash-based fallback (e.g. #/editions, #/edition/slug)
    if (hash.startsWith('#/')) {
      raw = hash.slice(1).toLowerCase();
    }

    // Split search query if present
    const [rawPath, rawQuery] = raw.split('?');
    let cleanPath = (rawPath || '/').replace(/\/index\.html$/, '').replace(/\/$/, '') || '/';

    // Parse category from query param if available
    const searchStr = rawQuery ? `?${rawQuery}` : window.location.search;
    if (searchStr && (cleanPath === '/editions' || cleanPath === '')) {
      const params = new URLSearchParams(searchStr);
      const cat = params.get('category') || params.get('cat');
      if (cat) {
        this.activeCategory = 'all'; // every product is an e-book for now
      } else {
        this.activeCategory = 'all';
      }
    } else if (cleanPath === '/editions') {
      this.activeCategory = 'all';
    }

    if (cleanPath === '' || cleanPath === '/') {
      return { page: 'home', slug: null, anchor: hash };
    }
    if (cleanPath === '/editions') {
      return { page: 'editions', slug: null, anchor: hash };
    }
    if (cleanPath.startsWith('/edition/')) {
      const slug = cleanPath.replace('/edition/', '').split('/')[0];
      return { page: 'edition', slug, anchor: hash };
    }
    if (cleanPath === '/philosophy') {
      return { page: 'philosophy', slug: null, anchor: hash };
    }
    if (cleanPath === '/atelier') {
      return { page: 'atelier', slug: null, anchor: hash };
    }
    if (cleanPath === '/checkout') {
      return { page: 'checkout', slug: null, anchor: hash };
    }
    if (cleanPath === '/legal') {
      return { page: 'legal', slug: 'delivery-protocol', anchor: hash };
    }
    if (cleanPath.startsWith('/legal/')) {
      const slug = cleanPath.replace('/legal/', '').split('/')[0] || 'delivery-protocol';
      return { page: 'legal', slug, anchor: hash };
    }

    // Unknown address: a proper "page not found" (the server also answers 404 for it)
    return { page: 'notfound', slug: null, anchor: hash };
  }

  handleLocationChange(isUserNav = true) {
    const route = this.parseRoute(window.location.pathname, window.location.hash);
    const previousPage = this.currentPage;
    this.currentPage = route.page;
    this.currentSlug = route.slug;
    this.activePdpImageIndex = 0;

    const anchor = route.anchor ? route.anchor.replace(/^#/, '') : null;

    if (!anchor) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    this.renderCurrentPage();

    if (anchor) {
      setTimeout(() => {
        let el = document.getElementById(anchor);
        if (!el && (anchor === 'formats' || anchor === 'format-guide')) {
          el = document.getElementById('format-guide') || document.getElementById('formats');
        }
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }

  navigateTo(path, replace = false) {
    this.closeMobileMenu();

    const hasAnchor = path.includes('#');
    const anchor = hasAnchor ? path.split('#')[1] : null;

    // Route path calculation
    const url = (window.location.protocol === 'file:') ? '#' + path : path;

    if (replace) {
      window.history.replaceState({ path }, '', url);
    } else {
      window.history.pushState({ path }, '', url);
    }

    const previousPage = this.currentPage;
    const route = this.parseRoute(path, '');
    this.currentPage = route.page;
    this.currentSlug = route.slug;
    this.activePdpImageIndex = 0;

    // Only auto-scroll to top if not navigating to a specific hash anchor
    if (!anchor) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    // Render if template changed or if on editions, legal tabs, or edition detail
    if (previousPage !== this.currentPage || this.currentPage === 'editions' || this.currentPage === 'legal' || this.currentPage === 'edition') {
      this.renderCurrentPage();
    } else {
      this.updateActiveNavIndicators();
    }

    // Handle hash smooth scrolling
    if (anchor) {
      setTimeout(() => {
        let el = document.getElementById(anchor);
        if (!el && (anchor === 'formats' || anchor === 'format-guide')) {
          el = document.getElementById('format-guide') || document.getElementById('formats');
        }
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 80);
    }
  }

  bindStore() {
    store.subscribe((event) => {
      this.updateCartBadge();
      if (event === 'cart_updated' || event === 'coupon_applied' || event === 'coupon_removed') {
        this.renderDrawerItems();
        // If user is currently on the checkout page, refresh summary
        if (this.currentPage === 'checkout') {
          this.renderCurrentPage();
        }
      }
      if (event === 'wishlist_updated') {
        this.updateWishlistIcons();
      }
    });
    this.updateCartBadge();
  }

  updateCartBadge() {
    const badge = document.getElementById('header-cart-badge');
    if (badge) {
      badge.textContent = store.getCartCount();
    }
  }

  updateWishlistIcons() {
    document.querySelectorAll('.tamyiz-btn-wishlist').forEach(btn => {
      const id = btn.getAttribute('data-id');
      const inWish = store.isInWishlist(id);
      btn.classList.toggle('active', inWish);
      const svg = btn.querySelector('svg');
      if (svg) svg.style.fill = inWish ? 'var(--color-red)' : 'none';
    });
  }

  bindScrollHeader() {
    const header = document.getElementById('navbar');
    if (!header) return;
    const update = () => {
      if (window.scrollY >= 70) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // Render Shell once (Header, Bag Drawer, Mobile Drawer, Main Container, Footer, Modals)
  renderShell() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
      <!-- 1. FULL-WIDTH STICKY GLASSMORPHISM HEADER -->
      <header class="tamyiz-header is-home-page" id="navbar">
        <div class="tamyiz-header-inner">
          <div class="tamyiz-header-left">
            <button class="tamyiz-header-menu-btn" onclick="window.tamyizApp.toggleMobileMenu()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <line x1="3" y1="8" x2="21" y2="8"></line>
                <line x1="3" y1="16" x2="21" y2="16"></line>
              </svg>
              <span class="tamyiz-menu-text-desktop">INDEX / MENU</span>
              <span class="tamyiz-menu-text-mobile">MENU</span>
            </button>

            <!-- Desktop Left Brand -->
            <a href="/" class="tamyiz-header-brand tamyiz-header-brand-desktop" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/')">
              <span class="tamyiz-top-meta">EST. 2025</span><span class="sr-only"> · TAMYIZ home</span>
            </a>
          </div>

          <!-- Desktop Centered Navigation with Active States -->
          <nav class="tamyiz-header-nav" id="desktop-nav" aria-label="Primary Navigation">
            <a href="/" class="tamyiz-header-nav-link" id="nav-link-home" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/')">Home</a>
            <a href="/editions" class="tamyiz-header-nav-link" id="nav-link-editions" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/editions')">Editions</a>
            <a href="/#philosophy" class="tamyiz-header-nav-link" id="nav-link-philosophy" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/#philosophy')">Philosophy</a>
            <a href="/#origin" class="tamyiz-header-nav-link" id="nav-link-atelier" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/#origin')">About us</a>
            <a href="/#format-guide" class="tamyiz-header-nav-link" id="nav-link-formats" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/#format-guide')">Format Guide</a>
          </nav>

          <div class="tamyiz-header-right">
            ${anyAvailable() ? `<button class="tamyiz-cart-btn" onclick="window.tamyizApp.openCart()">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span>Bag</span>
              <span class="tamyiz-cart-badge" id="header-cart-badge">0</span><span class="sr-only"> items</span>
            </button>` : ''}
          </div>
        </div>
      </header>

      <!-- MOBILE NAVIGATION DRAWER -->
      <div class="tamyiz-mobile-drawer-backdrop" id="mobile-drawer-backdrop" onclick="window.tamyizApp.closeMobileMenu()"></div>
      <aside class="tamyiz-mobile-drawer" id="mobile-drawer" aria-label="Mobile Navigation">
        <div class="tamyiz-mobile-drawer-head">
          <span class="tamyiz-header-brand-text">
            TAMYIZ<span class="tamyiz-brand-dot">•</span>
          </span>
          <button style="font-size: 1.25rem; background: none; border: none; cursor: pointer; padding: 0.25rem;" onclick="window.tamyizApp.closeMobileMenu()" aria-label="Close menu">✕</button>
        </div>
        <div class="tamyiz-mobile-drawer-body">
          <div>
            <div class="tamyiz-mobile-nav-group-title">Navigation</div>
            <ul class="tamyiz-mobile-nav-list">
              <li><a href="/" class="tamyiz-mobile-nav-link" onclick="event.preventDefault(); window.tamyizApp.closeMobileMenu(); window.tamyizApp.navigateTo('/')">Home <span>→</span></a></li>
              <li><a href="/editions" class="tamyiz-mobile-nav-link" onclick="event.preventDefault(); window.tamyizApp.closeMobileMenu(); window.tamyizApp.navigateTo('/editions')">The Editions <span>→</span></a></li>
              <li><a href="/#philosophy" class="tamyiz-mobile-nav-link" onclick="event.preventDefault(); window.tamyizApp.closeMobileMenu(); window.tamyizApp.navigateTo('/#philosophy')">Three Pillars &amp; Philosophy <span>→</span></a></li>
              <li><a href="/#origin" class="tamyiz-mobile-nav-link" onclick="event.preventDefault(); window.tamyizApp.closeMobileMenu(); window.tamyizApp.navigateTo('/#origin')">Atelier Origin &amp; Founders <span>→</span></a></li>
              <li><a href="/#format-guide" class="tamyiz-mobile-nav-link" onclick="event.preventDefault(); window.tamyizApp.closeMobileMenu(); window.tamyizApp.scrollToFormatGuide()">Digital Format Guide <span>→</span></a></li>
              <li>${anyAvailable() ? `<a href="#cart" class="tamyiz-mobile-nav-link" onclick="event.preventDefault(); window.tamyizApp.handleInstantCheckoutNav()" style="color: var(--color-red-on-dark); font-weight: 700;">Instant Checkout <span>→</span></a>` : `<a href="${siteConfig.whatsappUrl}" target="_blank" rel="noopener noreferrer" class="tamyiz-mobile-nav-link" style="color: var(--color-red-on-dark); font-weight: 700;">Pre-order on WhatsApp <span>↗</span></a>`}</li>
            </ul>
          </div>

          <div>
            <div class="tamyiz-mobile-nav-group-title">The Shop</div>
            <div class="tamyiz-mobile-cat-grid">
              <a href="/editions" class="tamyiz-mobile-cat-btn" onclick="event.preventDefault(); window.tamyizApp.closeMobileMenu(); window.tamyizApp.navigateTo('/editions')">
                <span>All e-books${products.length ? ` (${products.length})` : ''}</span> <span>→</span>
              </a>
            </div>
          </div>

          <div>
            <div class="tamyiz-mobile-nav-group-title">Customer Care</div>
            <ul class="tamyiz-footer-links">
              <li><a href="/#format-guide" class="tamyiz-footer-link" onclick="event.preventDefault(); window.tamyizApp.closeMobileMenu(); window.tamyizApp.scrollToFormatGuide()">How to read our e-books</a></li>
              <li><a href="/legal/delivery-protocol" class="tamyiz-footer-link" onclick="event.preventDefault(); window.tamyizApp.closeMobileMenu(); window.tamyizApp.openLegalModal('delivery-protocol')">Instant Digital Delivery Protocol</a></li>
              <li><a href="/legal/license" class="tamyiz-footer-link" onclick="event.preventDefault(); window.tamyizApp.closeMobileMenu(); window.tamyizApp.openLegalModal('license')">Refund &amp; Cancellation Policy</a></li>
              <li><a href="/legal/privacy" class="tamyiz-footer-link" onclick="event.preventDefault(); window.tamyizApp.closeMobileMenu(); window.tamyizApp.openLegalModal('privacy')">Privacy &amp; Data Security</a></li>
              <li><a href="/legal/terms" class="tamyiz-footer-link" onclick="event.preventDefault(); window.tamyizApp.closeMobileMenu(); window.tamyizApp.openLegalModal('terms')">Terms of Service</a></li>
              <li><a href="/legal/contact" class="tamyiz-footer-link" onclick="event.preventDefault(); window.tamyizApp.closeMobileMenu(); window.tamyizApp.openLegalModal('contact')">Contact Us</a></li>
              <li><a href="${siteConfig.whatsappUrl}" target="_blank" rel="noopener noreferrer" style="color: #1E7B2E; font-weight: 700;">WhatsApp Concierge (<span style="white-space: nowrap;">${siteConfig.phone}</span>) ↗</a></li>
            </ul>
          </div>
        </div>
      </aside>

      <!-- PERSISTENT SLIDE-OUT CART (BAG) DRAWER -->
      <div class="tamyiz-drawer-backdrop" id="cart-backdrop" onclick="window.tamyizApp.closeCart()"></div>
      <aside class="tamyiz-drawer" id="cart-drawer" aria-label="Your bag">
        <div class="tamyiz-drawer-head">
          <div class="tamyiz-drawer-title">Your bag</div>
          <button style="font-size: 1.25rem; background: none; border: none; cursor: pointer; padding: 0.25rem;" onclick="window.tamyizApp.closeCart()" aria-label="Close bag">✕</button>
        </div>

        <!-- Free digital shipping tracker -->
        <div class="tamyiz-shipping-tracker">
          <div class="tamyiz-shipping-msg">
            <span style="color: #1E7B2E; font-weight: 800; display: inline-flex; align-items: center;" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </span>
            <span id="shipping-msg-text" style="color: #1E7B2E; font-weight: 700;">Instant PDF download after payment</span>
          </div>
          <div class="tamyiz-shipping-progress-bg">
            <div class="tamyiz-shipping-progress-fill" style="width: 100%; background: #1E7B2E;"></div>
          </div>
        </div>

        <!-- Scrollable items area -->
        <div class="tamyiz-drawer-items" id="cart-items-container"></div>

        <!-- Cart drawer footer (Hidden on empty cart) -->
        <div class="tamyiz-drawer-foot" id="cart-foot-container" style="display: none;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem; font-family: monospace; font-size: 0.78rem; text-transform: uppercase;">
            <span style="color: #666;">Subtotal</span>
            <strong id="cart-subtotal" style="color: #000;">₹0</strong>
          </div>

          <div id="cart-discount-row" style="display: none; justify-content: space-between; margin-bottom: 0.4rem; font-family: monospace; font-size: 0.78rem; text-transform: uppercase; color: #1E7B2E;">
            <span id="cart-discount-label">Coupon Discount</span>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <strong id="cart-discount-val">-₹0</strong>
              <button onclick="window.tamyizApp.removeCoupon()" style="background: none; border: none; color: #888; font-size: 0.72rem; cursor: pointer;" title="Remove coupon">✕</button>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-family: monospace; font-size: 0.78rem; text-transform: uppercase;">
            <span style="color: #666;">Instant Digital Dispatch</span>
            <span id="cart-shipping" style="color: #1E7B2E; font-weight: 800;">FREE</span>
          </div>

          <div style="display: flex; justify-content: space-between; margin: 0.6rem 0 0.8rem 0; font-family: var(--font-display); font-size: 1.15rem; font-weight: 900; border-top: 1px solid var(--color-border); padding-top: 0.6rem;">
            <span>TOTAL</span>
            <span id="cart-total">₹0</span>
          </div>

          <!-- Promo code row -->
          <div style="display: flex; gap: 0.4rem; margin-bottom: 0.4rem;">
            <input type="text" id="coupon-input" placeholder="PROMO / ATELIER CODE" style="flex-grow: 1; padding: 0.55rem 0.75rem; border: 1px solid var(--color-border); border-radius: 0; text-transform: uppercase; font-family: monospace; font-size: 14px;" onkeydown="if(event.key==='Enter') window.tamyizApp.applyCoupon();" />
            <button id="btn-apply-drawer-coupon" style="background: var(--color-black); color: #FFF; padding: 0 0.95rem; border-radius: 0; font-family: monospace; font-size: 0.72rem; font-weight: 800; cursor: pointer; letter-spacing: 0.05em; text-transform: uppercase;" onclick="window.tamyizApp.applyCoupon()">Apply</button>
          </div>
          <div id="drawer-coupon-feedback" style="display: none; font-size: 0.72rem; font-family: monospace; margin-bottom: 0.6rem; font-weight: 600;"></div>

          <!-- Buyer Dispatch Form -->
          <div class="tamyiz-bag-dispatch-section">
            <div class="tamyiz-dispatch-section-header">
              <span>Instant Digital Dispatch Coordinates</span>
              <span class="required-tag">Required *</span>
            </div>
            
            <div class="tamyiz-dispatch-input-row" style="margin-bottom: 0.6rem;">
              <label class="tamyiz-form-label-mono" for="bag-dispatch-email">DISPATCH EMAIL ADDRESS *</label>
              <input type="email" id="bag-dispatch-email" class="tamyiz-dispatch-input" placeholder="name@domain.com" autocomplete="email" required oninput="window.tamyizApp.validateDispatchField('email')" />
              <div id="bag-email-error" class="tamyiz-input-error-msg" style="display: none;">Valid email required for digital files dispatch</div>
            </div>

            <div class="tamyiz-dispatch-input-row" style="margin-bottom: 0.6rem;">
              <label class="tamyiz-form-label-mono" for="bag-dispatch-phone">MOBILE NUMBER (+91) *</label>
              <input type="tel" id="bag-dispatch-phone" class="tamyiz-dispatch-input" placeholder="10-digit mobile number" autocomplete="tel" required oninput="window.tamyizApp.validateDispatchField('phone')" />
              <div id="bag-phone-error" class="tamyiz-input-error-msg" style="display: none;">Valid 10-digit mobile or international number required</div>
            </div>

            <div style="font-family: monospace; font-size: 0.64rem; color: #666; line-height: 1.4; margin-bottom: 0.75rem;">
              ● YOUR DOWNLOAD LINK APPEARS ON SCREEN AND IS EMAILED TO YOU
            </div>

            <!-- Primary Checkout CTA -->
            <button id="btn-bag-checkout" class="tamyiz-btn-checkout-primary" onclick="window.tamyizApp.handleBagCheckout()">
              <span id="btn-checkout-label">PROCEED TO UPI / CARD CHECKOUT • ₹0 →</span>
            </button>
          </div>

          <div class="tamyiz-trust-bar" style="margin-top: 0.75rem;">
            <span>Instant UPI</span>
            <span class="tamyiz-trust-bar-dot">•</span>
            <span>Cards</span>
            <span class="tamyiz-trust-bar-dot">•</span>
            <span>Direct Vault Access</span>
          </div>
        </div>
      </aside>

      <!-- 2. DYNAMIC MAIN CONTENT CONTAINER -->
      <main id="main-content" class="tamyiz-main-content"></main>

      <!-- 3. GLOBAL FOOTER -->
      <footer class="tamyiz-footer" id="contact">
        <div class="container">
          <div class="tamyiz-trust-bar tamyiz-footer-trust-bar">
            <span>Instant PDF download</span>
            <span class="tamyiz-trust-bar-dot">•</span>
            <span>Reads on any device</span>
            <span class="tamyiz-trust-bar-dot">•</span>
            <span>WhatsApp support</span>
          </div>

          <div class="tamyiz-footer-grid">
            <div class="tamyiz-footer-brand">
              <h2>TAMYIZ™</h2>
              <p>
                Practical e-books by Sahil &amp; Basit.<br/>
                Concierge: <a href="mailto:${siteConfig.email}" style="color: #FFF; text-decoration: underline; white-space: nowrap;">${siteConfig.email}</a><br/>
                WhatsApp: <a href="${siteConfig.whatsappUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--color-red-on-dark); font-weight: 700; white-space: nowrap;">${siteConfig.phone}</a>
              </p>
            </div>

            <div class="tamyiz-footer-col">
              <h3>Navigation</h3>
              <ul class="tamyiz-footer-links">
                <li><a href="/" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/')">Home</a></li>
                <li><a href="/editions" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/editions')">The Editions</a></li>
                <li><a href="/#philosophy" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/#philosophy')">How we write</a></li>
                <li><a href="/#origin" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/#origin')">About us</a></li>
                <li>${anyAvailable() ? `<a href="#cart" onclick="event.preventDefault(); window.tamyizApp.handleInstantCheckoutNav()" style="color: var(--color-red-on-dark); font-weight: 700;">Instant Checkout →</a>` : `<a href="${siteConfig.whatsappUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--color-red-on-dark); font-weight: 700;">Pre-order on WhatsApp ↗</a>`}</li>
              </ul>
            </div>

            <div class="tamyiz-footer-col">
              <h3>Digital Editions</h3>
              <ul class="tamyiz-footer-links">
                <li><a href="/editions" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/editions')">All e-books${products.length ? ` (${products.length})` : ''}</a></li>
              </ul>
            </div>

            <div class="tamyiz-footer-col tamyiz-footer-col-full-mobile">
              <h3>Customer Care &amp; Compliance</h3>
              <ul class="tamyiz-footer-links">
                <li><a href="/#format-guide" onclick="event.preventDefault(); window.tamyizApp.scrollToFormatGuide()">How to read our e-books</a></li>
                <li><a href="/legal/delivery-protocol" onclick="event.preventDefault(); window.tamyizApp.openLegalModal('delivery-protocol')">Instant Delivery Protocol</a></li>
                <li><a href="/legal/license" onclick="event.preventDefault(); window.tamyizApp.openLegalModal('license')">Refund &amp; Cancellation Policy</a></li>
                <li><a href="/legal/privacy" onclick="event.preventDefault(); window.tamyizApp.openLegalModal('privacy')">Privacy &amp; Data Security</a></li>
                <li><a href="/legal/terms" onclick="event.preventDefault(); window.tamyizApp.openLegalModal('terms')">Terms of Service</a></li>
                <li><a href="/legal/contact" onclick="event.preventDefault(); window.tamyizApp.openLegalModal('contact')">Contact Us</a></li>
                <li><a href="${siteConfig.whatsappUrl}" target="_blank" rel="noopener noreferrer" style="color: #4CC764; font-weight: 700;">WhatsApp Concierge ↗</a></li>
              </ul>
            </div>
          </div>

          <div class="tamyiz-footer-bottom">
            <div>
              &copy; ${new Date().getFullYear()} TAMYIZ™ Studio
            </div>
          </div>
        </div>
      </footer>

      <!-- 4. CHECKOUT / WAITLIST & POLICY MODAL OVERLAY -->
      <div class="tamyiz-modal" id="tamyiz-modal" onclick="if(event.target === this) window.tamyizApp.closeModal();">
        <div class="tamyiz-modal-box" id="tamyiz-modal-content"></div>
      </div>

      <!-- 4B. LOOK INSIDE / PRODUCT PREVIEW MODAL OVERLAY (Task 3) -->
      <div class="tamyiz-modal-backdrop" id="preview-modal-backdrop" onclick="if(event.target === this) window.tamyizApp.closeProductPreview();">
        <div class="tamyiz-preview-modal" id="preview-modal-container" role="dialog" aria-modal="true"></div>
      </div>

      <!-- 5. COMPACT WHATSAPP CONCIERGE BUTTON -->
      <aside aria-label="WhatsApp chat"><a href="${siteConfig.whatsappUrl}" target="_blank" rel="noopener noreferrer" class="tamyiz-whatsapp-fab" aria-label="Chat with TAMYIZ WhatsApp Concierge" title="WhatsApp Concierge">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      </a></aside>
    `;

    this.renderDrawerItems();
  }

  // Render active page inside #main-content
  renderCurrentPage() {
    const mainEl = document.getElementById('main-content');
    const header = document.getElementById('navbar');
    if (!mainEl) return;

    // Synchronize page state for styling (e.g. hiding duplicate hero brand in header)
    document.body.dataset.page = this.currentPage;
    if (header) {
      header.classList.toggle('is-home-page', this.currentPage === 'home');
    }

    // Clean up 3D and sparks if moving away from home
    if (this.currentPage !== 'home') {
      if (this.hero3D) {
        this.hero3D.destroy();
        this.hero3D = null;
      }
      if (this.logoSparks) {
        this.logoSparks.destroy();
        this.logoSparks = null;
      }
    }

    // Render corresponding page
    switch (this.currentPage) {
      case 'home':
        mainEl.innerHTML = renderHomePage(this);
        // Mount 3D and sparks on home
        setTimeout(() => {
          this.initHero3D();
          this.initLogoSparks();
        }, 50);
        break;

      case 'editions':
        mainEl.innerHTML = renderEditionsPage(this);
        break;

      case 'edition':
        mainEl.innerHTML = renderProductDetailPage(this.currentSlug, this);
        break;

      case 'philosophy':
        mainEl.innerHTML = renderPhilosophyPage(this);
        break;

      case 'atelier':
        mainEl.innerHTML = renderAtelierPage(this);
        break;

      case 'checkout':
        mainEl.innerHTML = renderCheckoutPage(this);
        break;

      case 'legal':
        mainEl.innerHTML = renderLegalPage(this.currentSlug || 'delivery-protocol', this);
        break;

      default:
        mainEl.innerHTML = renderNotFoundPage();
        break;
    }

    // Tab title, description and share tags for this page (same data the build uses for each page's HTML)
    this.applyPageMeta();

    // Update active nav links in header
    this.updateActiveNavIndicators();
  }

  applyPageMeta() {
    let meta = pageMeta(this.currentPage, this.currentSlug);
    if (this.currentPage === 'edition' && !meta.product) meta = pageMeta('notfound');
    document.title = meta.title;
    const set = (selector, attr, value) => {
      const el = document.head.querySelector(selector);
      if (el && value) el.setAttribute(attr, value);
    };
    set('meta[name="description"]', 'content', meta.description);
    set('meta[property="og:title"]', 'content', meta.title);
    set('meta[property="og:description"]', 'content', meta.description);
    if (meta.path) {
      set('link[rel="canonical"]', 'href', SITE_URL + meta.path);
      set('meta[property="og:url"]', 'content', SITE_URL + meta.path);
    }
  }

  updateActiveNavIndicators() {
    const links = {
      'home': document.getElementById('nav-link-home'),
      'editions': document.getElementById('nav-link-editions'),
      'philosophy': document.getElementById('nav-link-philosophy'),
      'atelier': document.getElementById('nav-link-atelier'),
      'formats': document.getElementById('nav-link-formats')
    };

    // Remove active from all
    Object.values(links).forEach(el => el && el.classList.remove('active'));

    const isFormatsHash = window.location.hash === '#formats';

    if (this.currentPage === 'home') {
      links.home && links.home.classList.add('active');
    } else if (this.currentPage === 'editions' || this.currentPage === 'edition') {
      links.editions && links.editions.classList.add('active');
    } else if (this.currentPage === 'philosophy') {
      if (isFormatsHash) {
        links.formats && links.formats.classList.add('active');
      } else {
        links.philosophy && links.philosophy.classList.add('active');
      }
    } else if (this.currentPage === 'atelier') {
      links.atelier && links.atelier.classList.add('active');
    }
  }

  initHero3D() {
    const container = document.getElementById('tamyiz-3d-canvas-container');
    if (container) {
      // three.js is large, so it is only downloaded when a page actually has the 3D canvas.
      import('./tamyiz-hero-3d.js').then(({ TamyizHero3D }) => {
        if (!document.body.contains(container)) return;
        if (this.hero3D) this.hero3D.destroy();
        this.hero3D = new TamyizHero3D(container);
      });
    }
  }

  initLogoSparks() {
    const canvas = document.getElementById('tamyiz-logo-sparks-canvas');
    if (canvas) {
      if (this.logoSparks) this.logoSparks.destroy();
      this.logoSparks = new TamyizLogoSparks(canvas);
    }
  }

  // Filter, Search & Price Sort calculation for /editions
  getFilteredAndSortedProducts() {
    let list = [...products];

    // 1. Filter by Category
    if (this.activeCategory === 'ebooks') {
      list = list.filter(p => p.categoryCode === 'ebooks' || p.category.toLowerCase().includes('book') || p.category.toLowerCase().includes('monograph'));
    } else if (this.activeCategory === 'notion') {
      list = list.filter(p => p.categoryCode === 'notion' || p.category.toLowerCase().includes('notion'));
    } else if (this.activeCategory === 'design') {
      list = list.filter(p => p.categoryCode === 'design' || p.category.toLowerCase().includes('design') || p.category.toLowerCase().includes('ui'));
    } else if (this.activeCategory !== 'all') {
      list = list.filter(p => p.categoryCode === this.activeCategory || p.category === this.activeCategory);
    }

    // 2. Filter by Search Query
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p => {
        const inName = p.name.toLowerCase().includes(q);
        const inDesc = p.description.toLowerCase().includes(q);
        const inCat = p.category.toLowerCase().includes(q);
        const inBadge = p.badge && p.badge.toLowerCase().includes(q);
        const inTagline = p.tagline && p.tagline.toLowerCase().includes(q);
        const inSpecs = p.specifications && p.specifications.some(s => s.value.toLowerCase().includes(q) || s.label.toLowerCase().includes(q));
        const inToc = p.tableOfContents && p.tableOfContents.some(t => t.toLowerCase().includes(q));
        return inName || inDesc || inCat || inBadge || inTagline || inSpecs || inToc;
      });
    }

    // 3. Sort Order
    if (this.sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }

  getCollectionStatusText() {
    const count = this.getFilteredAndSortedProducts().length;
    const searchPart = this.searchQuery ? ` matching "${escapeText(this.searchQuery)}"` : '';
    const hasFilter = this.searchQuery || this.activeCategory !== 'all' || this.sortBy !== 'featured';

    const clearButton = hasFilter
      ? `<button onclick="window.tamyizApp.resetAllFilters()" style="background:none; border:none; color: var(--color-red-ink); font-family:var(--font-sub); font-size:0.75rem; font-weight:800; cursor:pointer; text-decoration:underline;">Reset All Filters</button>`
      : '';

    return `
      <span>Showing ${count} of ${products.length} e-book${products.length === 1 ? '' : 's'}${searchPart}</span>
      ${clearButton}
    `;
  }

  filterCategory(cat, btn) {
    this.activeCategory = cat;
    if (btn) {
      const parent = btn.parentElement;
      if (parent) {
        parent.querySelectorAll('.tamyiz-filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    }
    const catCode = cat === 'design' ? 'ui-ux' : cat;
    const searchParam = cat === 'all' ? '' : `?category=${catCode}`;
    const newUrl = `/editions${searchParam}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    if (this.currentPage === 'editions') {
      this.renderCurrentPage();
    } else {
      this.navigateTo(newUrl);
    }
  }

  filterCategoryAndNavigate(cat) {
    this.closeMobileMenu();
    this.activeCategory = cat === 'ui-ux' ? 'design' : cat;
    const catCode = cat === 'design' ? 'ui-ux' : cat;
    const searchParam = cat === 'all' ? '' : `?category=${catCode}`;
    this.navigateTo(`/editions${searchParam}`);
  }

  handleSearch(query) {
    this.searchQuery = (query || '').trim();
    const clearBtn = document.getElementById('artifact-search-clear');
    if (clearBtn) {
      clearBtn.classList.toggle('visible', this.searchQuery.length > 0);
    }
    this.updateProductGrid();
  }

  clearSearch() {
    this.searchQuery = '';
    const input = document.getElementById('artifact-search-input');
    if (input) input.value = '';
    const clearBtn = document.getElementById('artifact-search-clear');
    if (clearBtn) clearBtn.classList.remove('visible');
    this.updateProductGrid();
  }

  handleSort(sortBy) {
    this.sortBy = sortBy;
    this.updateProductGrid();
  }

  updateProductGrid() {
    if (this.currentPage === 'editions') {
      this.renderCurrentPage();
    }
  }

  resetAllFilters() {
    this.searchQuery = '';
    this.sortBy = 'featured';
    this.activeCategory = 'all';
    this.updateProductGrid();
  }

  selectProductSize(productId, size, btn) {
    this.selectedSizes[productId] = size;

    // Dynamically calculate and update variant prices across card, PDP and modal
    const product = findProductBySlugOrId(productId);
    if (!product) return;

    let price = product.price;
    let origPrice = product.originalPrice;
    if (product.variants?.prices && product.variants.prices[size]) {
      price = product.variants.prices[size].price;
      origPrice = product.variants.prices[size].originalPrice;
    }

    // 1. Update all matching product cards across Home, Editions, and Related lists
    const cards = document.querySelectorAll(`[id="card-${productId}"], [data-product-card="${productId}"]`);
    cards.forEach(card => {
      // Update active pill and aria-pressed
      card.querySelectorAll('.tamyiz-size-pill-btn').forEach(b => {
        const isSelected = b.textContent.trim() === size;
        b.classList.toggle('active', isSelected);
        b.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      });
      // Update format label
      const label = card.querySelector(`#size-label-${productId}, .tamyiz-size-label`);
      if (label) label.textContent = size;
      // Update displayed price
      const priceEl = card.querySelector(`#price-${productId}, .tamyiz-price-cur`);
      if (priceEl) priceEl.textContent = `₹${price.toLocaleString('en-IN')}`;
      // Update strikethrough original price
      const origPriceEl = card.querySelector(`#orig-price-${productId}, .tamyiz-price-orig`);
      if (origPriceEl) {
        origPriceEl.textContent = origPrice ? `₹${origPrice.toLocaleString('en-IN')}` : '';
        origPriceEl.style.display = origPrice ? 'inline' : 'none';
      }
      // Update aria pricing
      const pricingContainer = card.querySelector(`#pricing-${productId}, .tamyiz-product-pricing`);
      if (pricingContainer) {
        pricingContainer.setAttribute('aria-label', `Price: ₹${price.toLocaleString('en-IN')}${origPrice ? `, original price ₹${origPrice.toLocaleString('en-IN')}` : ''}`);
      }
      // Update CTA button label
      const quickBtn = card.querySelector(`#btn-quick-${productId}, .tamyiz-btn-quick-add`);
      if (quickBtn) {
        quickBtn.innerHTML = buyLabel(product, price, 'card');
      }
    });

    // Also update any standalone elements outside card wrapper
    const standaloneLabel = document.getElementById(`size-label-${productId}`);
    if (standaloneLabel) standaloneLabel.textContent = size;
    const standalonePrice = document.getElementById(`price-${productId}`);
    if (standalonePrice) standalonePrice.textContent = `₹${price.toLocaleString('en-IN')}`;
    const standaloneOrigPrice = document.getElementById(`orig-price-${productId}`);
    if (standaloneOrigPrice) {
      standaloneOrigPrice.textContent = origPrice ? `₹${origPrice.toLocaleString('en-IN')}` : '';
      standaloneOrigPrice.style.display = origPrice ? 'inline' : 'none';
    }
    const standaloneQuickBtn = document.getElementById(`btn-quick-${productId}`);
    if (standaloneQuickBtn) {
      standaloneQuickBtn.innerHTML = buyLabel(product, price, 'card');
    }

    // 2. Update PDP Price & Button
    const pdpLabel = document.getElementById('pdp-selected-size-label');
    if (pdpLabel) pdpLabel.textContent = size;
    document.querySelectorAll('#pdp-size-pills .tamyiz-size-pill-btn, .tamyiz-pdp-sizes .tamyiz-size-pill-btn, .tamyiz-pdp-format-pill').forEach(b => {
      const isSelected = b.textContent.trim() === size;
      b.classList.toggle('active', isSelected);
      b.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });
    const pdpPriceEl = document.getElementById('pdp-price') || document.querySelector('.tamyiz-pdp-price-cur');
    if (pdpPriceEl) pdpPriceEl.textContent = `₹${price.toLocaleString('en-IN')}`;
    const pdpOrigPriceEl = document.getElementById('pdp-orig-price') || document.querySelector('.tamyiz-pdp-price-orig');
    if (pdpOrigPriceEl) {
      pdpOrigPriceEl.textContent = origPrice ? `₹${origPrice.toLocaleString('en-IN')}` : '';
      pdpOrigPriceEl.style.display = origPrice ? 'inline' : 'none';
    }
    const pdpAddBtn = document.getElementById('pdp-add-btn') || document.querySelector('.tamyiz-pdp-btn-add');
    if (pdpAddBtn) {
      pdpAddBtn.innerHTML = buyLabel(product, price, 'pdp');
    }
    const pdpBuyBtn = document.getElementById('pdp-buy-btn') || document.querySelector('.tamyiz-pdp-btn-buy-now');
    if (pdpBuyBtn) {
      pdpBuyBtn.innerHTML = `<span>Buy Now • Direct Checkout →</span>`;
    }

    // 3. Update Modal Price & Button (if open)
    document.querySelectorAll('#modal-preview-size-pills .tamyiz-size-pill-btn, .tamyiz-preview-modal .tamyiz-size-pill-btn').forEach(b => {
      const isSelected = b.textContent.trim() === size;
      b.classList.toggle('active', isSelected);
      b.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });
    const modalPriceEl = document.getElementById(`modal-price-${productId}`);
    if (modalPriceEl) modalPriceEl.textContent = `₹${price.toLocaleString('en-IN')}`;
    const modalBuyBtn = document.getElementById(`modal-buy-btn-${productId}`);
    if (modalBuyBtn) {
      modalBuyBtn.innerHTML = buyLabel(product, price, 'modal');
    }
  }

  quickAddToCart(id) {
    const product = findProductBySlugOrId(id);
    if (!product) return;
    if (!isAvailable(product)) return this.preorder(product.id);

    const hasVariants = product.variants && product.variants.options && product.variants.options.length > 0;
    const selectedVariant = this.selectedSizes[product.id] || (hasVariants ? product.variants.options[0] : "Standard");
    let price = product.price;
    let origPrice = product.originalPrice;
    if (product.variants?.prices && product.variants.prices[selectedVariant]) {
      price = product.variants.prices[selectedVariant].price;
      origPrice = product.variants.prices[selectedVariant].originalPrice;
    }

    store.addToCart(product, selectedVariant, 1, price, origPrice);
    this.openCart();
    setTimeout(() => {
      const emailInput = document.getElementById('bag-dispatch-email');
      if (emailInput && !emailInput.value) emailInput.focus();
    }, 250);
  }

  buyNowDirect(id) {
    const product = findProductBySlugOrId(id);
    if (!product) return;
    if (!isAvailable(product)) return this.preorder(product.id);

    const hasVariants = product.variants && product.variants.options && product.variants.options.length > 0;
    const selectedVariant = this.selectedSizes[product.id] || (hasVariants ? product.variants.options[0] : "Standard");
    let price = product.price;
    let origPrice = product.originalPrice;
    if (product.variants?.prices && product.variants.prices[selectedVariant]) {
      price = product.variants.prices[selectedVariant].price;
      origPrice = product.variants.prices[selectedVariant].originalPrice;
    }

    store.addToCart(product, selectedVariant, 1, price, origPrice);
    this.closeCart();
    this.navigateTo('/checkout');
  }

  // "Coming soon" products: open WhatsApp with a pre-order message naming the product and format.
  preorder(id) {
    const product = findProductBySlugOrId(id);
    if (!product) return;
    const hasVariants = product.variants && product.variants.options && product.variants.options.length > 0;
    const variant = this.selectedSizes[product.id] || (hasVariants ? product.variants.options[0] : '');
    window.open(preorderWhatsAppUrl(product.name, variant), '_blank', 'noopener');
  }

  toggleWishlist(id) {
    const product = findProductBySlugOrId(id);
    const inWish = store.toggleWishlist(id, product ? product.name : "Edition");
    document.querySelectorAll(`.tamyiz-btn-wishlist[data-id="${id}"]`).forEach(btn => {
      btn.classList.toggle('active', inWish);
      const svg = btn.querySelector('svg');
      if (svg) {
        svg.setAttribute('fill', inWish ? 'var(--color-red)' : 'none');
        svg.style.fill = inWish ? 'var(--color-red)' : 'none';
      }
    });
  }

  setScrollLock(locked) {
    if (locked) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
    } else {
      const cartOpen = document.getElementById('cart-drawer')?.classList.contains('active');
      const mobileOpen = document.getElementById('mobile-drawer')?.classList.contains('active');
      const modalOpen = document.getElementById('tamyiz-modal')?.classList.contains('active');
      const previewOpen = document.getElementById('preview-modal-backdrop')?.classList.contains('active');
      if (!cartOpen && !mobileOpen && !modalOpen && !previewOpen) {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
      }
    }
  }

  // Cart Drawer
  openCart() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer && backdrop) {
      drawer.classList.add('active');
      backdrop.classList.add('active');
      this.setScrollLock(true);
      this.renderDrawerItems();
    }
  }

  closeCart() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer && backdrop) {
      drawer.classList.remove('active');
      backdrop.classList.remove('active');
      this.setScrollLock(false);
    }
  }

  renderDrawerItems() {
    const container = document.getElementById('cart-items-container');
    const foot = document.getElementById('cart-foot-container');
    if (!container) return;

    if (store.cart.length === 0) {
      container.innerHTML = `
        <div class="tamyiz-cart-empty-state">
          <div class="tamyiz-cart-empty-icon" aria-hidden="true">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <div class="tamyiz-cart-empty-title">
            Your bag is empty
          </div>
          <p class="tamyiz-cart-empty-desc">
            Add an e-book from the shop and it will appear here.
          </p>
          <button class="tamyiz-btn-explore-artifacts" onclick="window.tamyizApp.closeCart(); window.tamyizApp.scrollToEditions()">
            Explore Digital Editions →
          </button>
        </div>
      `;
      if (foot) foot.style.display = 'none';
      return;
    }

    if (foot) foot.style.display = 'block';

    // Lock digital quantities to 1: clean single license display with direct remove button
    container.innerHTML = store.cart.map(item => `
      <div class="tamyiz-cart-item" data-cart-id="${item.cartItemId}">
        <img src="${item.image}" alt="${item.name}" class="tamyiz-cart-thumb" />
        <div class="tamyiz-cart-info">
          <div class="tamyiz-cart-name">${item.name}</div>
          <div class="tamyiz-cart-size">PDF e-book • 1 copy</div>
          <div class="tamyiz-cart-row" style="margin-top: 0.35rem;">
            <span class="tamyiz-cart-price" style="font-size: 1.05rem; font-weight: 800; color: #000;">₹${item.price.toLocaleString('en-IN')}</span>
            ${item.originalPrice ? `<span style="font-size: 0.8rem; color: #888; text-decoration: line-through; margin-left: 0.4rem;">₹${item.originalPrice.toLocaleString('en-IN')}</span>` : ''}
          </div>
        </div>
        <button class="tamyiz-cart-del" onclick="window.tamyizApp.removeFromBag('${item.cartItemId}')" title="Remove item from bag">✕</button>
      </div>
    `).join('');

    // Update Totals
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const totalAmount = store.getTotal();
    if (subtotalEl) subtotalEl.textContent = `₹${store.getSubtotal().toLocaleString('en-IN')}`;
    if (totalEl) totalEl.textContent = `₹${totalAmount.toLocaleString('en-IN')}`;

    // Coupon discount row
    const discountRow = document.getElementById('cart-discount-row');
    const discountVal = document.getElementById('cart-discount-val');
    if (discountRow && discountVal) {
      const discount = store.getDiscount();
      if (discount > 0) {
        discountRow.style.display = 'flex';
        discountVal.textContent = `-₹${discount.toLocaleString('en-IN')}`;
      } else {
        discountRow.style.display = 'none';
      }
    }

    // Update primary CTA button text with total
    const checkoutBtnLabel = document.getElementById('btn-checkout-label');
    const checkoutBtn = document.getElementById('btn-bag-checkout');
    if (checkoutBtnLabel) {
      checkoutBtnLabel.textContent = `PROCEED TO UPI / CARD CHECKOUT • ₹${totalAmount.toLocaleString('en-IN')} →`;
    } else if (checkoutBtn) {
      checkoutBtn.innerHTML = `PROCEED TO UPI / CARD CHECKOUT • ₹${totalAmount.toLocaleString('en-IN')} →`;
    }

    // Restore saved buyer coordinates if fields are empty
    try {
      const emailInput = document.getElementById('bag-dispatch-email');
      const phoneInput = document.getElementById('bag-dispatch-phone');
      if (emailInput && !emailInput.value) {
        const savedEmail = localStorage.getItem('tamyiz_buyer_email');
        if (savedEmail) emailInput.value = savedEmail;
      }
      if (phoneInput && !phoneInput.value) {
        const savedPhone = localStorage.getItem('tamyiz_buyer_phone');
        if (savedPhone) phoneInput.value = savedPhone;
      }
    } catch (_) {}
  }

  removeFromBag(cartItemId) {
    store.removeFromCart(cartItemId);
    this.renderDrawerItems();
    if (this.currentPage === 'checkout') {
      this.renderCurrentPage();
    }
  }

  applyCoupon() {
    const input = document.getElementById('coupon-input');
    const feedback = document.getElementById('drawer-coupon-feedback');
    if (!input) return;

    const val = (input.value || '').trim();
    if (!val) {
      if (feedback) {
        feedback.textContent = 'Please enter a coupon code.';
        feedback.style.color = 'var(--color-red)';
        feedback.style.display = 'block';
      }
      input.classList.remove('shake-anim');
      void input.offsetWidth;
      input.classList.add('shake-anim');
      store.showToast('Please enter a coupon code.', 'error');
      return;
    }

    const success = store.applyCoupon(val);
    if (success) {
      input.value = '';
      if (feedback) {
        feedback.textContent = `✓ Coupon ${val.toUpperCase()} applied!`;
        feedback.style.color = '#1E7B2E';
        feedback.style.display = 'block';
      }
    } else {
      if (feedback) {
        feedback.textContent = `✕ Invalid promo or atelier code "${val.toUpperCase()}". Please verify and try again.`;
        feedback.style.color = 'var(--color-red)';
        feedback.style.display = 'block';
      }
      input.classList.remove('shake-anim');
      void input.offsetWidth;
      input.classList.add('shake-anim');
    }

    this.renderDrawerItems();
    if (this.currentPage === 'checkout') {
      this.renderCurrentPage();
    }
  }

  removeCoupon() {
    store.removeCoupon();
    this.renderDrawerItems();
    if (this.currentPage === 'checkout') {
      this.renderCurrentPage();
    }
  }

  // ==========================================
  // Look Inside / Product Preview Modal (Task 3)
  // ==========================================
  openProductPreview(productId) {
    const product = findProductBySlugOrId(productId);
    if (!product) return;

    this.activePreviewProduct = product;
    this.activePreviewTab = 0;

    const modalBackdrop = document.getElementById('preview-modal-backdrop');
    const modalContainer = document.getElementById('preview-modal-container');
    if (!modalBackdrop || !modalContainer) return;

    this.renderPreviewModalContent();
    modalBackdrop.classList.add('active');
    this.setScrollLock(true);
  }

  closeProductPreview() {
    const modalBackdrop = document.getElementById('preview-modal-backdrop');
    if (modalBackdrop) {
      modalBackdrop.classList.remove('active');
    }
    this.activePreviewProduct = null;
    this.setScrollLock(false);
  }

  setPreviewTab(tabIndex) {
    this.activePreviewTab = tabIndex;
    this.renderPreviewModalContent();
  }

  selectModalFormat(productId, opt) {
    this.selectProductSize(productId, opt, null);
    this.renderPreviewModalContent();
  }

  quickBuyFromModal(productId) {
    const product = findProductBySlugOrId(productId);
    if (!product) return;
    if (!isAvailable(product)) return this.preorder(product.id);

    const hasVariants = product.variants && product.variants.options && product.variants.options.length > 0;
    const selectedVariant = this.selectedSizes[product.id] || (hasVariants ? product.variants.options[0] : "Standard");
    let price = product.price;
    let origPrice = product.originalPrice;
    if (product.variants?.prices && product.variants.prices[selectedVariant]) {
      price = product.variants.prices[selectedVariant].price;
      origPrice = product.variants.prices[selectedVariant].originalPrice;
    }

    store.addToCart(product, selectedVariant, 1, price, origPrice);
    this.closeProductPreview();
    this.openCart();
    setTimeout(() => {
      const emailInput = document.getElementById('bag-dispatch-email');
      if (emailInput && !emailInput.value) emailInput.focus();
    }, 250);
  }

  renderPreviewModalContent() {
    const modalContainer = document.getElementById('preview-modal-container');
    const product = this.activePreviewProduct;
    if (!modalContainer || !product) return;

    const hasVariants = product.variants && product.variants.options && product.variants.options.length > 0;
    const selectedVariant = this.selectedSizes[product.id] || (hasVariants ? product.variants.options[0] : "Standard");
    let price = product.price;
    let origPrice = product.originalPrice;
    if (product.variants?.prices && product.variants.prices[selectedVariant]) {
      price = product.variants.prices[selectedVariant].price;
      origPrice = product.variants.prices[selectedVariant].originalPrice;
    }

    const currentTab = this.activePreviewTab;

    let bodyContent = '';
    if (currentTab === 0) {
      // Samples & Spreads
      bodyContent = `
        <div class="tamyiz-modal-spreads-grid">
          <div class="tamyiz-modal-spread-item">
            <img src="${product.images[0]}" alt="${product.name} Plate 01" loading="lazy" />
            <div class="tamyiz-modal-spread-caption">FIG. 01 — ARCHITECTURAL COVER &amp; SPECIFICATION RATIO</div>
          </div>
          <div class="tamyiz-modal-spread-item">
            <img src="${product.images[1] || product.images[0]}" alt="${product.name} Spread 02" loading="lazy" />
            <div class="tamyiz-modal-spread-caption">FIG. 02 — RETINA 300DPI INTERIOR SPREAD / WORKSPACE VIEW</div>
          </div>
        </div>

        ${product.sampleExcerpt ? `
          <div class="tamyiz-modal-excerpt-box">
            <div class="tamyiz-modal-excerpt-title">${product.sampleExcerpt.chapter} • ${product.sampleExcerpt.subtitle || 'Selected Excerpt'}</div>
            <p class="tamyiz-modal-excerpt-text">"${product.sampleExcerpt.text}"</p>
          </div>
        ` : `
          <div class="tamyiz-modal-excerpt-box">
            <div class="tamyiz-modal-excerpt-title">System Overview</div>
            <p class="tamyiz-modal-excerpt-text">"${product.description}"</p>
          </div>
        `}
      `;
    } else if (currentTab === 1) {
      // Chapters & Modules / TOC
      bodyContent = `
        <div style="margin-bottom: 1.25rem;">
          <h4 style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.35rem;">
            Curriculum &amp; System Architecture
          </h4>
          <p style="font-size: 0.85rem; color: #666; margin-bottom: 1rem;">
            Every section engineered with rigorous intellectual depth and practical execution frameworks.
          </p>
        </div>

        <ul class="tamyiz-modal-toc-list">
          ${product.tableOfContents && product.tableOfContents.length > 0 ? product.tableOfContents.map((item, idx) => `
            <li class="tamyiz-modal-toc-item">
              <span class="tamyiz-modal-toc-num">0${idx + 1}</span>
              <span style="font-weight: 600; color: #111;">${item}</span>
            </li>
          `).join('') : `
            <li class="tamyiz-modal-toc-item">
              <span class="tamyiz-modal-toc-num">01</span>
              <span>Complete architectural files, formulas, and verified frameworks included.</span>
            </li>
          `}
        </ul>

        ${product.highlights && product.highlights.length > 0 ? `
          <div style="margin-top: 1.5rem; background: #F9F9F8; padding: 1.25rem; border: 1px solid var(--color-border); border-radius: 4px;">
            <div style="font-family: var(--font-sub); font-size: 0.72rem; font-weight: 800; color: var(--color-red-ink); text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.08em;">
              Included Assets &amp; Deliverables
            </div>
            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.82rem; color: #444;">
              ${product.highlights.map(h => `<li>✓ ${h}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      `;
    } else {
      // Technical Specifications
      bodyContent = `
        <div style="margin-bottom: 1.25rem;">
          <h4 style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.35rem;">
            Technical Specifications &amp; License
          </h4>
          <p style="font-size: 0.85rem; color: #666; margin-bottom: 1rem;">
            Hardware, reader, and software compatibility metrics verified by the TAMYIZ atelier.
          </p>
        </div>

        <table class="tamyiz-modal-specs-table">
          <tbody>
            ${product.specifications ? product.specifications.map(s => `
              <tr>
                <td>${s.label}</td>
                <td><strong>${s.value}</strong></td>
              </tr>
            `).join('') : ''}
            <tr>
              <td>License Scope</td>
              <td><strong>100% Personal &amp; Commercial Single-Operator License</strong></td>
            </tr>
            <tr>
              <td>Guarantee</td>
              <td><strong>7-Day Technical Compatibility Guarantee (Full Refund)</strong></td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 1.5rem; padding: 1rem 1.25rem; background: #F4F4F2; border-left: 3px solid var(--color-black); font-size: 0.82rem; color: #444; line-height: 1.55;">
          ${product.careInstructions || 'DRM-free digital files delivered immediately upon order clearance. Redundant link copies dispatched to verified Email and WhatsApp.'}
        </div>
      `;
    }

    modalContainer.innerHTML = `
      <div class="tamyiz-modal-header">
        <div>
          <span class="tamyiz-modal-meta-tag">ARCHITECTURAL LOOK INSIDE // ${product.category.toUpperCase()}</span>
          <h3 class="tamyiz-modal-title">${product.name}</h3>
        </div>
        <button class="tamyiz-modal-close-btn" onclick="window.tamyizApp.closeProductPreview()" aria-label="Close Preview Modal">✕</button>
      </div>

      <div class="tamyiz-modal-tabs">
        <button class="tamyiz-modal-tab-btn ${currentTab === 0 ? 'active' : ''}" onclick="window.tamyizApp.setPreviewTab(0)">
          01 Samples &amp; Plates
        </button>
        <button class="tamyiz-modal-tab-btn ${currentTab === 1 ? 'active' : ''}" onclick="window.tamyizApp.setPreviewTab(1)">
          02 Chapters &amp; Modules
        </button>
        <button class="tamyiz-modal-tab-btn ${currentTab === 2 ? 'active' : ''}" onclick="window.tamyizApp.setPreviewTab(2)">
          03 Technical Specs
        </button>
      </div>

      <div class="tamyiz-modal-body">
        ${bodyContent}
      </div>

      <div class="tamyiz-modal-footer">
        <div class="tamyiz-modal-format-choice">
          ${hasVariants ? `
            <span style="font-size: 0.75rem; font-weight: 800; font-family: var(--font-sub); text-transform: uppercase; color: #555;">${product.variants.type || 'Format'}:</span>
            ${product.variants.options.map(opt => `
              <button class="tamyiz-size-pill-btn ${opt === selectedVariant ? 'active' : ''}" onclick="window.tamyizApp.selectModalFormat('${product.id}', '${opt}')">
                ${opt}
              </button>
            `).join('')}
          ` : `
            <span style="font-size: 0.78rem; font-weight: 800; font-family: var(--font-sub); color: #555;">DRM-FREE DIGITAL EDITION</span>
          `}
        </div>

        <div class="tamyiz-modal-action-group">
          <div style="text-align: right;">
            <span style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-display); color: #000;" id="modal-price-${product.id}">₹${price.toLocaleString('en-IN')}</span>
            ${origPrice ? `<span style="font-size: 0.88rem; color: #999; text-decoration: line-through; margin-left: 0.35rem;">₹${origPrice.toLocaleString('en-IN')}</span>` : ''}
          </div>
          <button class="tamyiz-btn-quick-add" id="modal-buy-btn-${product.id}" style="background: var(--color-red); font-size: 0.84rem; padding: 0.85rem 1.4rem; border: none; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;" onclick="window.tamyizApp.quickBuyFromModal('${product.id}')">
            ${buyLabel(product, price, 'modal')}
          </button>
        </div>
      </div>
    `;
  }

  // Mobile Menu Drawer
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    const drawer = document.getElementById('mobile-drawer');
    const backdrop = document.getElementById('mobile-drawer-backdrop');
    if (drawer && backdrop) {
      drawer.classList.toggle('active', this.mobileMenuOpen);
      backdrop.classList.toggle('active', this.mobileMenuOpen);
      this.setScrollLock(this.mobileMenuOpen);
    }
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
    const drawer = document.getElementById('mobile-drawer');
    const backdrop = document.getElementById('mobile-drawer-backdrop');
    if (drawer && backdrop) {
      drawer.classList.remove('active');
      backdrop.classList.remove('active');
      this.setScrollLock(false);
    }
  }

  // PDP Interactive Actions
  setPdpImage(index) {
    this.activePdpImageIndex = index;
    const product = findProductBySlugOrId(this.currentSlug);
    if (!product) return;

    const mainImg = document.getElementById('pdp-main-image');
    if (mainImg && product.images[index]) {
      mainImg.src = product.images[index];
    }

    const thumbs = document.querySelectorAll('.tamyiz-pdp-thumb-btn');
    thumbs.forEach((thumb, idx) => {
      thumb.classList.toggle('active', idx === index);
    });
  }

  toggleSampleViewer() {
    const content = document.getElementById('pdp-sample-content');
    const text = document.getElementById('sample-toggle-text');
    const icon = document.getElementById('sample-toggle-icon');
    if (content) {
      const isOpen = content.classList.contains('open');
      content.classList.toggle('open', !isOpen);
      if (text) text.textContent = isOpen ? 'Expand Preview' : 'Collapse Preview';
      if (icon) icon.textContent = isOpen ? '↓' : '↑';
    }
  }

  toggleAccordion(id) {
    const item = document.getElementById(id);
    if (item) {
      item.classList.toggle('open');
      const icon = item.querySelector('.tamyiz-pdp-acc-icon');
      if (icon) {
        icon.textContent = item.classList.contains('open') ? '−' : '+';
      }
    }
  }

  toggleFaq(id) {
    const item = document.getElementById(id);
    if (item) {
      item.classList.toggle('open');
      const icon = item.querySelector('.tamyiz-faq-icon');
      if (icon) {
        icon.textContent = item.classList.contains('open') ? '−' : '+';
      }
    }
  }

  // Dedicated Checkout Actions
  async submitCheckout() {
    if (store.cart.length === 0) {
      store.showToast('Your atelier bag is empty. Please select an edition.', 'error');
      this.navigateTo('/editions');
      return;
    }

    const nameInput = document.getElementById('chk-name');
    const emailInput = document.getElementById('chk-email');
    const phoneInput = document.getElementById('chk-phone');

    const name = nameInput?.value?.trim() || '';
    const email = emailInput?.value?.trim() || '';
    const phone = phoneInput?.value?.trim() || '';

    if (!name) {
      store.showToast('Please enter your full name for order issuance.', 'error');
      nameInput?.focus();
      return;
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
      store.showToast('Please enter a valid email address for digital download dispatch.', 'error');
      emailInput?.focus();
      return;
    }
    const cleanDigits = phone.replace(/\D/g, '');
    if (!phone || cleanDigits.length < 8) {
      store.showToast('Please enter a valid WhatsApp number for instant delivery archiving.', 'error');
      phoneInput?.focus();
      return;
    }

    // Persist buyer coordinates in localStorage
    localStorage.setItem('tamyiz_buyer_name', name);
    localStorage.setItem('tamyiz_buyer_email', email);
    localStorage.setItem('tamyiz_buyer_phone', phone);

    const submitBtn = document.querySelector('.tamyiz-btn-submit-order');
    const submitLabel = document.getElementById('checkout-submit-label');
    if (submitBtn) submitBtn.disabled = true;
    if (submitLabel) submitLabel.textContent = 'CREATING SECURE ORDER...';

    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: store.cart,
          email,
          phone,
          couponCode: (store.coupon ? store.coupon.code : null)
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();

      if (data.mode === 'razorpay') {
        this.launchRazorpayCheckout(data, email, phone);
      } else if (data.mode === 'atelier_sandbox') {
        this.openSandboxModal(data, email, phone);
      } else {
        throw new Error('Unsupported checkout protocol response.');
      }
    } catch (err) {
      console.error('TAMYIZ Dedicated Checkout Error:', err);
      store.showToast(err.message || 'Payment initiation failed. Please check your network and try again.', 'error');
      if (submitBtn) submitBtn.disabled = false;
      if (submitLabel) submitLabel.textContent = 'Pay & Access Editions →';
    }
  }

  applyCouponFromCheckout() {
    const input = document.getElementById('checkout-coupon-input');
    const feedback = document.getElementById('checkout-coupon-feedback');
    if (!input) return;

    const val = (input.value || '').trim();
    if (!val) {
      if (feedback) {
        feedback.textContent = 'Please enter a coupon code.';
        feedback.style.color = 'var(--color-red)';
        feedback.style.display = 'block';
      }
      input.classList.remove('shake-anim');
      void input.offsetWidth;
      input.classList.add('shake-anim');
      store.showToast('Please enter a coupon code.', 'error');
      return;
    }

    const success = store.applyCoupon(val);
    if (success) {
      this.renderCurrentPage();
    } else {
      if (feedback) {
        feedback.textContent = `✕ Invalid promo or atelier code "${val.toUpperCase()}". Please verify and try again.`;
        feedback.style.color = 'var(--color-red)';
        feedback.style.display = 'block';
      }
      input.classList.remove('shake-anim');
      void input.offsetWidth;
      input.classList.add('shake-anim');
    }
  }

  removeCouponFromCheckout() {
    store.removeCoupon();
    this.renderCurrentPage();
  }

  downloadInvoice(orderId) {
    const order = this.confirmedOrder || (store.orders && store.orders.find(o => o.orderId === orderId)) || {
      orderId: orderId || 'TMZ-SAMPLE',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      total: 899,
      subtotal: 899,
      discount: 0,
      items: [
        { name: 'TAMYIZ Monograph 01: The Horizon of Distinction', variant: 'Interactive PDF + EPUB', price: 899 }
      ],
      shippingAddress: {
        fullName: 'Valued Patron',
        email: 'tamyiz.co@gmail.com',
        phone: siteConfig.phone
      }
    };

    const invoiceNumber = `INV-TMZ-${order.orderId}`;
    const invoiceDate = order.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const authToken = `TMZ-AUTH-${order.orderId}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const itemsHtml = order.items.map((item) => `
      <tr>
        <td style="padding: 12px 10px; border-bottom: 1px solid #E5E5E5;">
          <strong style="font-size: 13px;">${item.name}</strong>
          <div style="font-size: 11px; color: #666; margin-top: 3px;">Single-Seat Lifetime Commercial License</div>
        </td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #E5E5E5;">${item.variant || 'Standard Digital Edition'}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #E5E5E5; text-align: center;">1</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #E5E5E5; text-align: right;">₹${item.price.toLocaleString('en-IN')}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #E5E5E5; text-align: right; font-weight: bold;">₹${item.price.toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const invoiceDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TAMYIZ™ — Receipt #${invoiceNumber}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111; margin: 0; padding: 25px; background: #FFF; line-height: 1.5; font-size: 13px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #000; }
    .brand h1 { font-size: 28px; font-weight: 900; letter-spacing: 2px; margin: 0; text-transform: uppercase; }
    .brand-sub { font-size: 11px; color: #444; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-top: 4px; }
    .meta { text-align: right; font-size: 12px; }
    .badge { display: inline-block; background: #000; color: #FFF; font-size: 10px; font-weight: 800; padding: 4px 8px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
    .parties { display: flex; justify-content: space-between; margin: 24px 0; font-size: 12px; }
    .party-title { font-size: 10px; font-weight: 800; color: #E1251B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }
    th { background: #F4F4F4; padding: 10px; text-align: left; font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; border-top: 1px solid #000; border-bottom: 1px solid #000; }
    .totals { width: 300px; margin-left: auto; margin-top: 20px; }
    .totals-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; }
    .totals-total { display: flex; justify-content: space-between; padding: 8px 0; font-size: 15px; font-weight: 800; border-top: 2px solid #000; margin-top: 6px; }
    .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #DDD; font-size: 11px; color: #666; display: flex; justify-content: space-between; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <h1>TAMYIZ™</h1>
      <div class="brand-sub">Digital Publishing &amp; Systems Architecture Atelier</div>
      <div style="font-size: 11px; color: #666; margin-top: 6px;">
        Atelier Sopore, Kashmir 193201, India<br/>
        Phone / WhatsApp: ${siteConfig.phone} • Email: ${siteConfig.email}
      </div>
    </div>
    <div class="meta">
      <div class="badge">PAYMENT RECEIPT</div>
      <div><strong>INVOICE:</strong> ${invoiceNumber}</div>
      <div><strong>ORDER ID:</strong> #${order.orderId}</div>
      <div><strong>DATE:</strong> ${invoiceDate}</div>
      <div><strong>STATUS:</strong> <span style="color: #1E7B2E; font-weight: 800;">PAID (CONFIRMED)</span></div>
    </div>
  </div>

  <div class="parties">
    <div>
      <div class="party-title">BILLED TO (LICENSEE)</div>
      <div style="font-size: 13px; font-weight: 700;">${order.shippingAddress?.fullName || order.shippingAddress?.name || 'Valued Patron'}</div>
      <div>Email: ${order.shippingAddress?.email || '—'}</div>
      ${order.shippingAddress?.phone ? `<div>WhatsApp: ${order.shippingAddress.phone}</div>` : ''}
    </div>
    <div style="text-align: right;">
      <div class="party-title">DELIVERY PROTOCOL</div>
      <div style="font-size: 13px; font-weight: 700;">Instant Digital Dispatch</div>
      <div>Single-Seat Lifetime Commercial License</div>
      <div>Auth Token: <code>${authToken}</code></div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 45%;">EDITION / TITLE</th>
        <th style="width: 25%;">SPECIFICATION</th>
        <th style="text-align: center; width: 8%;">QTY</th>
        <th style="text-align: right; width: 11%;">PRICE</th>
        <th style="text-align: right; width: 11%;">AMOUNT</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span style="color: #666;">Subtotal:</span>
      <span>₹${order.subtotal.toLocaleString('en-IN')}</span>
    </div>
    ${order.discount ? `
      <div class="totals-row" style="color: #E1251B; font-weight: 700;">
        <span>Coupon Discount:</span>
        <span>−₹${order.discount.toLocaleString('en-IN')}</span>
      </div>
    ` : ''}
    <div class="totals-row">
      <span style="color: #666;">Digital Delivery:</span>
      <span style="color: #1E7B2E; font-weight: 700;">₹0 (Free)</span>
    </div>
    <div class="totals-total">
      <span>Total Paid:</span>
      <span style="color: #E1251B;">₹${order.total.toLocaleString('en-IN')}</span>
    </div>
  </div>

  <div class="footer">
    <div>
      <strong>TAMYIZ™ Digital Publishing Atelier • Sopore, Kashmir</strong><br/>
      Authentic single-seat lifetime license. Zero DRM friction.
    </div>
    <div style="text-align: right;">
      Verification Token: <strong>${authToken}</strong>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([invoiceDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TAMYIZ-Invoice-${order.orderId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    store.showToast(`Invoice downloaded for Order #${order.orderId}`, 'success');
  }

  updateSummaryQty(cartItemId, delta) {
    store.updateQuantity(cartItemId, delta);
    this.renderCurrentPage();
  }

  removeSummaryItem(cartItemId) {
    store.removeFromCart(cartItemId);
    this.renderCurrentPage();
  }

  triggerDownloadSim(productName) {
    store.showToast(`Downloading files for "${productName}"...`, 'success');
    // Simulated instant file delivery trigger
    const link = document.createElement('a');
    link.href = '/assets/images/tamyiz-logo-256.png';
    link.download = `${productName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-tamyiz-edition.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  resetOrderAndReturnHome() {
    this.confirmedOrder = null;
    this.navigateTo('/editions');
  }

  // Contact form handler in Atelier
  handleContactSubmit() {
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');
    const submitBtn = document.getElementById('contact-submit-btn');

    const name = nameInput?.value?.trim() || '';
    const email = emailInput?.value?.trim() || '';
    const message = messageInput?.value?.trim() || '';

    if (!name) {
      store.showToast('Please provide your name.', 'error');
      nameInput?.focus();
      return;
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
      store.showToast('Please provide a valid email address.', 'error');
      emailInput?.focus();
      return;
    }
    if (!message) {
      store.showToast('Please enter your message.', 'error');
      messageInput?.focus();
      return;
    }

    // The site has no mail server: the message opens in WhatsApp, ready to send to the founders.
    const subject = document.getElementById('contact-subject')?.value || '';
    const text = `Hello TAMYIZ,\n\n${message}\n\n— ${name} (${email})${subject ? `\nTopic: ${subject}` : ''}`;
    window.open(`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    store.showToast('Your message is ready in WhatsApp. Press send there and we will reply.', 'success');
  }

  // ==========================================
  // Navigation & Smooth Scroll Helpers
  // ==========================================
  handleInstantCheckoutNav() {
    this.closeMobileMenu();
    this.openCart();
    if (store.cart.length === 0) {
      store.showToast('Your atelier bag is currently empty. Please select an edition.', 'info');
      setTimeout(() => {
        this.scrollToEditions();
      }, 400);
    } else {
      setTimeout(() => {
        const emailInput = document.getElementById('bag-dispatch-email');
        if (emailInput) emailInput.focus();
      }, 250);
    }
  }

  scrollToEditions() {
    this.closeMobileMenu();
    if (this.currentPage !== 'home') {
      this.navigateTo('/#editions');
    } else {
      const el = document.getElementById('editions');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  scrollToFormatGuide() {
    this.closeMobileMenu();
    if (this.currentPage !== 'home') {
      this.navigateTo('/#format-guide');
    } else {
      const el = document.getElementById('format-guide');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  // ==========================================
  // Buyer Dispatch Form Validation
  // ==========================================
  validateDispatchField(field) {
    if (field === 'email') {
      const emailInput = document.getElementById('bag-dispatch-email');
      const errorDiv = document.getElementById('bag-email-error');
      if (!emailInput) return true;
      const val = emailInput.value.trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (errorDiv) errorDiv.style.display = (val && !valid) ? 'block' : 'none';
      emailInput.classList.toggle('has-error', Boolean(val && !valid));
      return valid;
    }
    if (field === 'phone') {
      const phoneInput = document.getElementById('bag-dispatch-phone');
      const errorDiv = document.getElementById('bag-phone-error');
      if (!phoneInput) return true;
      const val = phoneInput.value.trim();
      const digits = val.replace(/\D/g, '');
      const valid = digits.length >= 10;
      if (errorDiv) errorDiv.style.display = (val && !valid) ? 'block' : 'none';
      phoneInput.classList.toggle('has-error', Boolean(val && !valid));
      return valid;
    }
    return true;
  }

  validateDispatchInputs() {
    const emailInput = document.getElementById('bag-dispatch-email');
    const phoneInput = document.getElementById('bag-dispatch-phone');
    const emailError = document.getElementById('bag-email-error');
    const phoneError = document.getElementById('bag-phone-error');

    const email = emailInput?.value?.trim() || '';
    const phone = phoneInput?.value?.trim() || '';
    const phoneDigits = phone.replace(/\D/g, '');

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const phoneValid = phoneDigits.length >= 10;

    if (emailInput) {
      emailInput.classList.toggle('has-error', !emailValid);
      if (emailError) emailError.style.display = !emailValid ? 'block' : 'none';
    }
    if (phoneInput) {
      phoneInput.classList.toggle('has-error', !phoneValid);
      if (phoneError) phoneError.style.display = !phoneValid ? 'block' : 'none';
    }

    if (!emailValid) {
      store.showToast('Please enter a valid email address for instant digital file dispatch.', 'error');
      emailInput?.focus();
      return { valid: false };
    }
    if (!phoneValid) {
      store.showToast('Please enter a valid 10-digit WhatsApp number (+91) for order confirmation.', 'error');
      phoneInput?.focus();
      return { valid: false };
    }

    try {
      localStorage.setItem('tamyiz_buyer_email', email);
      localStorage.setItem('tamyiz_buyer_phone', phone);
    } catch (_) {}

    return { valid: true, email, phone };
  }

  restoreCheckoutButton() {
    const btn = document.getElementById('btn-bag-checkout');
    const label = document.getElementById('btn-checkout-label');
    if (btn) btn.disabled = false;
    const totalAmount = store.getTotal();
    if (label) {
      label.textContent = `PROCEED TO UPI / CARD CHECKOUT • ₹${totalAmount.toLocaleString('en-IN')} →`;
    } else if (btn) {
      btn.innerHTML = `PROCEED TO UPI / CARD CHECKOUT • ₹${totalAmount.toLocaleString('en-IN')} →`;
    }
  }

  // ==========================================
  // Checkout & Serverless Order Creation
  // ==========================================
  async handleBagCheckout() {
    if (store.cart.length === 0) {
      store.showToast('Your atelier bag is empty. Please select an edition.', 'error');
      this.scrollToEditions();
      return;
    }

    const { valid, email, phone } = this.validateDispatchInputs();
    if (!valid) return;

    const btn = document.getElementById('btn-bag-checkout');
    const label = document.getElementById('btn-checkout-label');
    if (btn) btn.disabled = true;
    if (label) label.textContent = 'CREATING SECURE ORDER...';

    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: store.cart,
          email,
          phone,
          couponCode: (store.coupon ? store.coupon.code : null)
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();

      if (data.mode === 'razorpay') {
        this.launchRazorpayCheckout(data, email, phone);
      } else if (data.mode === 'atelier_sandbox') {
        this.openSandboxModal(data, email, phone);
      } else {
        throw new Error('Unsupported checkout protocol response.');
      }
    } catch (err) {
      console.error('TAMYIZ Order Creation Failure:', err);
      store.showToast(err.message || 'Payment initiation failed. Please check your network and try again.', 'error');
      this.restoreCheckoutButton();
    }
  }

  launchRazorpayCheckout(orderData, email, phone) {
    const initiateRazorpay = () => {
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'TAMYIZ™',
        description: 'Instant Digital Dispatch // Atelier Editions',
        image: '/assets/images/tamyiz-logo-256.png',
        order_id: orderData.orderId,
        handler: (response) => {
          this.verifyAndUnlockPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            mode: 'razorpay',
            items: store.cart,
            email,
            phone
          });
        },
        prefill: {
          email,
          contact: phone
        },
        notes: {
          dispatch_email: email,
          dispatch_whatsapp: phone
        },
        theme: {
          color: '#000000'
        },
        modal: {
          ondismiss: () => {
            this.restoreCheckoutButton();
          }
        }
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (failResp) => {
          console.error('Razorpay payment failed:', failResp);
          store.showToast(failResp.error?.description || 'Payment was cancelled or rejected.', 'error');
          this.restoreCheckoutButton();
        });
        rzp.open();
      } catch (err) {
        console.error('Razorpay instantiation failed:', err);
        store.showToast('Could not open Razorpay checkout modal. Launching sandbox verification.', 'info');
        this.openSandboxModal(orderData, email, phone);
      }
    };

    if (window.Razorpay) {
      initiateRazorpay();
    } else {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => initiateRazorpay();
      script.onerror = () => {
        store.showToast('Razorpay script could not be loaded. Launching sandbox approval.', 'info');
        this.openSandboxModal(orderData, email, phone);
      };
      document.head.appendChild(script);
    }
  }

  openSandboxModal(orderData, email, phone) {
    const totalINR = orderData.amount ? (orderData.amount / 100) : store.getTotal();
    const orderId = orderData.orderId || ('order_sandbox_' + Date.now());

    this.openModalContent(`
      <div class="tamyiz-sandbox-modal" role="dialog" aria-modal="true">
        <div class="tamyiz-sandbox-head">
          <div class="tamyiz-sandbox-pill-tag">
            <span class="tamyiz-sandbox-dot"></span>
            <span>TAMYIZ™ UPI / CARD INSTANT VERIFICATION</span>
          </div>
          <button style="background:none; border:none; font-size:1.25rem; cursor:pointer; padding: 0.2rem;" onclick="window.tamyizApp.closeSandboxModal()" aria-label="Close modal">✕</button>
        </div>

        <div class="tamyiz-sandbox-meta">
          <div>ORDER REFERENCE: <strong>#${orderId}</strong></div>
          <div>TOTAL PAYABLE: <strong>₹${totalINR.toLocaleString('en-IN')}</strong> (FREE INSTANT DISPATCH)</div>
          <div>DISPATCH COORDINATES: <strong>${email}</strong> • <strong>${phone}</strong></div>
          <div style="color: #666; font-size: 0.72rem; margin-top: 0.35rem; line-height: 1.4;">
            NOTICE: Smart Atelier Sandbox Active (No live Razorpay keys configured in environment). Test the complete purchase-to-unlock fulfillment lifecycle with one click.
          </div>
        </div>

        <div style="font-family: monospace; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; margin-bottom: 0.6rem; color: #000;">
          SELECT INSTANT APPROVAL PROTOCOL:
        </div>

        <div class="tamyiz-sandbox-methods">
          <label class="tamyiz-sandbox-method-label is-checked">
            <input type="radio" name="sandbox-method" value="upi" checked />
            <span>⚡ 1-Click Instant UPI Settlement (GPay / PhonePe / Paytm / BHIM)</span>
          </label>
          <label class="tamyiz-sandbox-method-label">
            <input type="radio" name="sandbox-method" value="card" />
            <span>💳 Instant Credit / Debit Card Clearance (Visa / Mastercard / RuPay)</span>
          </label>
          <label class="tamyiz-sandbox-method-label">
            <input type="radio" name="sandbox-method" value="netbanking" />
            <span>🏛 NetBanking Direct Authorization</span>
          </label>
        </div>

        <button id="btn-sandbox-approve" class="tamyiz-btn-checkout-primary" style="background: #1E7B2E; border-color: #1E7B2E;" onclick="window.tamyizApp.confirmSandboxPayment('${orderId}', '${email}', '${phone}')">
          SIMULATE 1-CLICK UPI CLEARANCE (₹${totalINR.toLocaleString('en-IN')}) →
        </button>

        <div style="text-align: center; margin-top: 0.75rem;">
          <button style="background:none; border:none; color:#777; font-family:monospace; font-size:0.72rem; text-decoration:underline; cursor:pointer;" onclick="window.tamyizApp.closeSandboxModal()">
            Cancel and Return to Bag
          </button>
        </div>
      </div>
    `);
  }

  closeSandboxModal() {
    this.closeModal();
    this.restoreCheckoutButton();
  }

  async confirmSandboxPayment(orderId, email, phone) {
    const approveBtn = document.getElementById('btn-sandbox-approve');
    if (approveBtn) {
      approveBtn.disabled = true;
      approveBtn.textContent = 'VERIFYING CRYPTOGRAPHIC TOKEN...';
    }

    const payload = {
      razorpay_order_id: orderId,
      razorpay_payment_id: 'pay_sandbox_' + Date.now(),
      razorpay_signature: 'sandbox_verified_signature',
      mode: 'atelier_sandbox',
      items: store.cart,
      email,
      phone
    };

    await this.verifyAndUnlockPayment(payload);
  }

  async verifyAndUnlockPayment(payload) {
    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Payment verification failed (${response.status})`);
      }

      const result = await response.json();
      if (result.verified) {
        this.onPaymentSuccess(result);
      } else {
        throw new Error('Payment verification signature mismatch.');
      }
    } catch (err) {
      console.error('Payment Verification Failure:', err);
      store.showToast(err.message || 'Payment verification failed.', 'error');
      this.restoreCheckoutButton();
    }
  }

  onPaymentSuccess(result) {
    const downloads = result.downloads || [];
    const paymentId = result.paymentId || ('PAY-TMZ-' + Date.now());
    const orderId = result.orderId || ('TMZ-' + Date.now());

    this.confirmedOrder = {
      orderId,
      referenceId: result.referenceId || paymentId,
      paymentId,
      date: new Date(result.timestamp || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      total: (result.amount ? Math.round(result.amount / 100) : (result.totalINR || store.getTotal())),
      subtotal: result.subtotalINR ?? (result.amount ? Math.round(result.amount / 100) : store.getTotal()),
      discount: result.discountINR ?? 0,
      shippingAddress: {
        email: result.email || '',
        phone: result.phone || ''
      },
      items: downloads.map(dl => {
        const prod = findProductBySlugOrId(dl.productId);
        const prodImage = (prod && prod.images && prod.images[0]) || '/assets/images/tamyiz-logo-256.png';
        return {
          name: dl.name,
          variant: dl.variant,
          downloadUrl: dl.downloadUrl,
          actionLabel: dl.actionLabel,
          specs: dl.specs,
          image: prodImage,
          price: dl.price ?? 0
        };
      })
    };

    // 1. Clear cart state & storage
    store.clearCart();
    this.closeCart();
    this.restoreCheckoutButton();

    if (this.currentPage === 'checkout') {
      this.renderCurrentPage();
    }

    // 2. Open ATELIER DISPATCH COMPLETE — EDITION UNLOCKED modal
    const formattedDate = new Date(result.timestamp || Date.now()).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const whatsappUrl = this.generateWhatsAppLogUrl(result);

    this.openModalContent(`
      <div class="tamyiz-unlock-modal" role="dialog" aria-modal="true">
        <div class="tamyiz-unlock-head">
          <div class="tamyiz-unlock-badge">
            <span style="color: #1E7B2E; font-size: 1.1rem; line-height: 1;">●</span>
            <span>EDITION UNLOCKED // INSTANT DIGITAL DISPATCH</span>
          </div>
          <button style="background:none; border:none; font-size:1.25rem; cursor:pointer; padding: 0.2rem;" onclick="window.tamyizApp.closeModal()" aria-label="Close modal">✕</button>
        </div>

        <div class="tamyiz-unlock-meta-box">
          <div>TRANSACTION REF: <strong>${paymentId}</strong></div>
          <div>ORDER IDENTIFIER: <strong>#${orderId}</strong></div>
          <div>DISPATCH EMAIL: <strong>${result.email}</strong></div>
          <div>WHATSAPP LOG: <strong>${result.phone}</strong></div>
          <div>TIMESTAMP: <strong>${formattedDate}</strong></div>
          <div>STATUS: <strong style="color: #1E7B2E;">PAID</strong></div>
        </div>

        <div style="font-family: monospace; font-size: 0.74rem; font-weight: 800; text-transform: uppercase; margin-bottom: 0.6rem; color: #000; letter-spacing: 0.05em;">
          UNLOCKED DIGITAL ASSETS &amp; DUPLICATION VAULT:
        </div>

        <div class="tamyiz-unlocked-items-list" style="margin-bottom: 1.25rem;">
          ${downloads.map(dl => `
            <div class="tamyiz-vault-item-card">
              <div>
                <div style="font-family: var(--font-display); font-size: 0.95rem; font-weight: 800; text-transform: uppercase; color: #000;">
                  ${dl.name}
                </div>
                <div style="font-family: monospace; font-size: 0.72rem; color: #555; margin-top: 0.25rem;">
                  FORMAT: <strong>${dl.variant}</strong> • Single-Operator Lifetime License
                </div>
              </div>
              <a href="${dl.downloadUrl}" target="_blank" rel="noopener noreferrer" class="tamyiz-btn-vault-dl" download>
                <span>DOWNLOAD / DUPLICATE EDITION ↗</span>
              </a>
            </div>
          `).join('')}
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.25rem;">
          <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="tamyiz-btn-whatsapp-sync">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            <span>SEND MY ORDER DETAILS TO TAMYIZ ON WHATSAPP ↗</span>
          </a>

          <button class="tamyiz-btn-checkout-primary" style="background: #FFFFFF; color: #000000; border: 1px solid #000000;" onclick="window.tamyizApp.downloadTaxInvoiceFromPayment('${paymentId}')">
            <span>PRINT / SAVE RECEIPT ↗</span>
          </button>
        </div>

        <div style="text-align: center;">
          <button style="background:none; border:none; font-family:monospace; font-size:0.74rem; font-weight:700; text-transform:uppercase; text-decoration:underline; cursor:pointer;" onclick="window.tamyizApp.closeModal(); window.tamyizApp.navigateTo('/editions');">
            Return to Atelier Catalog →
          </button>
        </div>
      </div>
    `);

    store.showToast('Order confirmed! Access unlocked in Digital Vault.', 'success');
  }

  generateWhatsAppLogUrl(result) {
    const downloads = result.downloads || [];
    const itemsText = downloads.map((d, i) => `${i + 1}. ${d.name} [${d.variant}]`).join('\n');
    const msg = `TAMYIZ™ Order Archive Log:\n` +
      `Order Ref: #${result.orderId || 'TMZ'}\n` +
      `Payment ID: ${result.paymentId || 'PAY'}\n` +
      `Dispatch Email: ${result.email}\n` +
      `WhatsApp: ${result.phone}\n` +
      `Unlocked Editions:\n${itemsText}\n` +
      `Timestamp: ${new Date(result.timestamp || Date.now()).toISOString()}\n` +
      `Atelier Sopore, Kashmir 193201`;
    return `https://wa.me/919541722379?text=${encodeURIComponent(msg)}`;
  }

  downloadTaxInvoiceFromPayment(paymentId) {
    const orderData = this.confirmedOrder ? {
      orderId: this.confirmedOrder.orderId || 'TMZ-' + Date.now(),
      date: new Date(this.confirmedOrder.timestamp || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      total: this.confirmedOrder.downloads ? this.confirmedOrder.downloads.reduce((acc, d) => acc + (d.price || 0), 0) : 499,
      subtotal: this.confirmedOrder.downloads ? this.confirmedOrder.downloads.reduce((acc, d) => acc + (d.price || 0), 0) : 499,
      discount: 0,
      items: (this.confirmedOrder.downloads || []).map(d => ({
        name: d.name,
        variant: d.variant,
        price: d.price || 499
      })),
      shippingAddress: {
        fullName: 'Valued Patron',
        email: this.confirmedOrder.email || '—',
        phone: this.confirmedOrder.phone || siteConfig.phone
      }
    } : null;

    if (orderData) {
      this.confirmedOrder = orderData;
    }
    this.downloadInvoice(paymentId || 'TMZ-INSTANT');
  }

  // ==========================================
  // Legal & Customer Care Modal System
  // ==========================================
  openLegalModal(tabKey = 'delivery-protocol') {
    const validKey = legalDocs[tabKey] ? tabKey : 'delivery-protocol';
    this.openModalContent(this.renderLegalModalContent(validKey));
  }

  switchLegalModalTab(tabKey) {
    const validKey = legalDocs[tabKey] ? tabKey : 'delivery-protocol';
    const content = document.getElementById('tamyiz-modal-content');
    if (content) {
      content.innerHTML = `
        <button style="position: absolute; top: 1.25rem; right: 1.25rem; font-size: 1.25rem; background: none; border: none; cursor: pointer; padding: 0.25rem; color: var(--color-black);" onclick="window.tamyizApp.closeModal()" aria-label="Close modal">✕</button>
        ${this.renderLegalModalContent(validKey)}
      `;
    }
  }

  renderLegalModalContent(activeKey) {
    const doc = legalDocs[activeKey] || legalDocs['delivery-protocol'];
    const tabs = [
      { key: 'delivery-protocol', label: 'Delivery Protocol', code: '01' },
      { key: 'license', label: 'Refunds & License', code: '02' },
      { key: 'privacy', label: 'Privacy & Security', code: '03' },
      { key: 'terms', label: 'Terms of Service', code: '04' },
      { key: 'contact', label: 'Contact Us', code: '05' }
    ];

    return `
      <div class="tamyiz-legal-modal-box" role="dialog" aria-modal="true">
        <div class="tamyiz-legal-modal-head">
          <div>
            <div style="font-family: monospace; font-size: 0.7rem; font-weight: 800; color: var(--color-red-ink); letter-spacing: 0.1em; text-transform: uppercase;">
              TAMYIZ™ POLICIES // ${doc.code}
            </div>
            <h3 style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 900; text-transform: uppercase; margin: 0.25rem 0 0.15rem 0; color: #000;">
              ${doc.title}
            </h3>
            <p style="font-size: 0.78rem; color: #666; font-family: monospace; margin: 0;">
              ${doc.subtitle}
            </p>
          </div>
          <button style="background:none; border:none; font-size:1.25rem; cursor:pointer; padding: 0.25rem; line-height: 1;" onclick="window.tamyizApp.closeModal()" aria-label="Close modal">✕</button>
        </div>

        <div class="tamyiz-legal-tabs-row">
          ${tabs.map(t => `
            <button class="tamyiz-legal-tab-btn ${t.key === activeKey ? 'active' : ''}" onclick="window.tamyizApp.switchLegalModalTab('${t.key}')">
              <span>${t.code}</span> ${t.label}
            </button>
          `).join('')}
        </div>

        <div class="tamyiz-legal-modal-body" style="margin-bottom: 1.5rem;">
          ${doc.sections.map(sec => `
            <div class="tamyiz-legal-section-item">
              <div class="tamyiz-legal-section-title">${sec.heading}</div>
              <div class="tamyiz-legal-section-text">
                <p>${sec.content.replace(/\n/g, '<br/>')}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Business contact details -->
        <div class="tamyiz-legal-contact-footer">
          <div style="font-weight: 800; text-transform: uppercase; margin-bottom: 0.35rem; color: #000;">
            Business Contact Details
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.5rem; font-size: 0.72rem;">
            <div>
              <strong>Operating Entity:</strong> TAMYIZ™ Digital Publishing &amp; Design Systems Studio<br/>
              <strong>Address:</strong> Sopore, Jammu &amp; Kashmir 193201, India<br/>
              <strong>Co-Founders:</strong> Basit Majeed &amp; Sahil
            </div>
            <div>
              <strong>Email:</strong> <a href="mailto:tamyiz.co@gmail.com" style="text-decoration: underline; color: #000;">tamyiz.co@gmail.com</a><br/>
              <strong>WhatsApp Concierge:</strong> <a href="${siteConfig.whatsappUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: underline; color: #000; white-space: nowrap;">${siteConfig.phone}</a><br/>
              <strong>Settlement &amp; Refund:</strong> 7-day resolution window • 5–7 business days settlement
            </div>
          </div>
        </div>

        <div style="margin-top: 1.25rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 0.75rem;">
          <span style="font-family: monospace; font-size: 0.68rem; color: #888;">
            DPDP ACT &amp; CONSUMER PROTECTION COMPLIANT
          </span>
          <button class="tamyiz-btn-vault-dl" style="padding: 0.45rem 1rem; font-size: 0.7rem;" onclick="window.tamyizApp.closeModal()">
            Close Protocol Modal
          </button>
        </div>
      </div>
    `;
  }

  // Legacy Policy Modal fallback
  openPolicyModal(policyKey) {
    if (policyKey === 'shipping' || policyKey === 'delivery') {
      this.openLegalModal('delivery-protocol');
      return;
    }
    if (policyKey === 'refund' || policyKey === 'cancellation') {
      this.openLegalModal('license');
      return;
    }
    if (policyKey === 'privacy') {
      this.openLegalModal('privacy');
      return;
    }
    if (policyKey === 'terms') {
      this.openLegalModal('terms');
      return;
    }

    const policy = policies[policyKey];
    if (!policy) return;

    this.openModalContent(`
      <div style="padding: 0.5rem 0;">
        <span style="font-family: var(--font-sub); font-size: 0.72rem; font-weight: 800; color: var(--color-red-ink); letter-spacing: 0.12em; text-transform: uppercase;">TAMYIZ™ Protocol</span>
        <h2 style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 900; margin: 0.4rem 0 1rem 0; text-transform: uppercase;">${policy.title}</h2>
        <div style="font-size: 0.92rem; color: #444; line-height: 1.7; white-space: pre-line; margin-bottom: 2rem;">
          ${policy.content}
        </div>
        <button class="tamyiz-hero-btn-primary" style="padding: 0.75rem 1.75rem; font-size: 0.8rem;" onclick="window.tamyizApp.closeModal()">
          <span>Understood</span>
        </button>
      </div>
    `);
  }

  openModalContent(html) {
    const modal = document.getElementById('tamyiz-modal');
    const content = document.getElementById('tamyiz-modal-content');
    if (modal && content) {
      content.innerHTML = `
        <button style="position: absolute; top: 1.25rem; right: 1.25rem; font-size: 1.25rem; background: none; border: none; cursor: pointer; padding: 0.25rem; color: var(--color-black);" onclick="window.tamyizApp.closeModal()" aria-label="Close modal">✕</button>
        ${html}
      `;
      modal.classList.add('active');
      this.setScrollLock(true);
    }
  }

  closeModal() {
    const modal = document.getElementById('tamyiz-modal');
    if (modal) {
      modal.classList.remove('active');
      this.setScrollLock(false);
    }
  }
}

// Safe DOM-ready instantiation
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.tamyizApp) window.tamyizApp = new TamyizUnifiedApp();
  });
} else {
  if (!window.tamyizApp) window.tamyizApp = new TamyizUnifiedApp();
}
