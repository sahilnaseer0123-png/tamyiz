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

import { TamyizHero3D } from './tamyiz-hero-3d.js';
import { TamyizLogoSparks } from './tamyiz-logo-sparks.js';
import { products, findProductBySlugOrId } from '../data/products.js';
import { foundersData, brandInfo, policies } from '../data/content.js';
import { store } from './store.js';

import { renderHomePage } from './pages/home-page.js';
import { renderEditionsPage } from './pages/editions-page.js';
import { renderProductDetailPage } from './pages/product-detail-page.js';
import { renderPhilosophyPage } from './pages/philosophy-page.js';
import { renderAtelierPage } from './pages/atelier-page.js';
import { renderCheckoutPage } from './pages/checkout-page.js';

export class TamyizUnifiedApp {
  constructor() {
    this.currentPage = 'home';
    this.currentSlug = null;
    this.confirmedOrder = null;

    this.hero3D = null;
    this.logoSparks = null;
    this.activeCategory = 'all'; // 'all' | 'ebooks' | 'notion' | 'design'
    this.searchQuery = '';
    this.sortBy = 'featured'; // 'featured' | 'price-asc' | 'price-desc' | 'rating'
    this.selectedSizes = {}; // { [productId]: formatOptionString }
    this.activePdpImageIndex = 0;
    this.mobileMenuOpen = false;

    this.init();
  }

  init() {
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

    // 6. Check deep-link query parameter: ?cat=...
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('cat');
    if (catParam) {
      this.activeCategory = catParam;
    }
  }

  // Parse path & hash for zero-crash routing
  parseRoute(locationPath, locationHash) {
    let cleanPath = (locationPath || window.location.pathname || '/').toLowerCase();
    const hash = (locationHash || window.location.hash || '');

    // Support hash-based fallback (e.g. #/editions, #/edition/slug)
    if (hash.startsWith('#/')) {
      cleanPath = hash.slice(1).toLowerCase();
    }

    // Remove index.html suffix if present
    cleanPath = cleanPath.replace(/\/index\.html$/, '').replace(/\/$/, '') || '/';

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

    // Default fallback to home
    return { page: 'home', slug: null, anchor: hash };
  }

  handleLocationChange(isUserNav = true) {
    const route = this.parseRoute(window.location.pathname, window.location.hash);
    this.currentPage = route.page;
    this.currentSlug = route.slug;

    // Reset PDP image index on page change
    this.activePdpImageIndex = 0;

    // Critical Stability Rule 2: Auto Scroll-to-Top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Render active page view
    this.renderCurrentPage();

    // Handle hash anchors (e.g. #formats)
    if (route.anchor && route.anchor.startsWith('#') && !route.anchor.startsWith('#/')) {
      const targetId = route.anchor.slice(1);
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }

  navigateTo(path, replace = false) {
    this.closeMobileMenu();

    // Route path calculation
    const url = (window.location.protocol === 'file:') ? '#' + path : path;

    if (replace) {
      window.history.replaceState({ path }, '', url);
    } else {
      window.history.pushState({ path }, '', url);
    }

    const route = this.parseRoute(path, '');
    this.currentPage = route.page;
    this.currentSlug = route.slug;
    this.activePdpImageIndex = 0;

    // Critical Stability Rule 2: Auto Scroll-to-Top
    window.scrollTo({ top: 0, behavior: 'instant' });

    this.renderCurrentPage();

    // Handle hash if in path (e.g., /philosophy#formats)
    if (path.includes('#')) {
      const anchor = path.split('#')[1];
      if (anchor) {
        setTimeout(() => {
          const el = document.getElementById(anchor);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
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
      if (window.scrollY >= 120) {
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
      <header class="tamyiz-header" id="navbar">
        <div class="tamyiz-header-inner">
          <div class="tamyiz-header-left">
            <button class="tamyiz-header-menu-btn" onclick="window.tamyizApp.toggleMobileMenu()" aria-label="Open Navigation Menu">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
              <span>Menu</span>
            </button>

            <!-- Desktop Left Brand (lg:flex, hidden on mobile) -->
            <a href="/" class="tamyiz-header-brand tamyiz-header-brand-desktop" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/')" aria-label="TAMYIZ Home">
              <span class="tamyiz-header-brand-top">
                <span class="tamyiz-top-meta">EST. 2025 • SOPORE</span>
              </span>
              <span class="tamyiz-header-brand-scrolled">
                TAMYIZ<span class="tamyiz-brand-dot text-red-600">•</span>
              </span>
            </a>
          </div>

          <!-- Mobile Centered Brand Mark (visible on < 1024px, hidden on desktop) -->
          <a href="/" class="tamyiz-header-brand-mobile" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/')" aria-label="TAMYIZ Home">
            TAMYIZ<span class="tamyiz-brand-dot text-red-600">•</span>
          </a>

          <!-- Desktop Centered Navigation with Active States -->
          <nav class="tamyiz-header-nav" id="desktop-nav" aria-label="Primary Navigation">
            <a href="/" class="tamyiz-header-nav-link" id="nav-link-home" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/')">Home</a>
            <a href="/editions" class="tamyiz-header-nav-link" id="nav-link-editions" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/editions')">Editions</a>
            <a href="/philosophy" class="tamyiz-header-nav-link" id="nav-link-philosophy" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/philosophy')">Philosophy</a>
            <a href="/atelier" class="tamyiz-header-nav-link" id="nav-link-atelier" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/atelier')">Atelier Origin</a>
            <a href="/philosophy#formats" class="tamyiz-header-nav-link" id="nav-link-formats" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/philosophy#formats')">Format Guide</a>
          </nav>

          <div class="tamyiz-header-right">
            <button class="tamyiz-cart-btn" onclick="window.tamyizApp.openCart()" aria-label="Open Shopping Bag">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span>Bag</span>
              <span class="tamyiz-cart-badge" id="header-cart-badge">0</span>
            </button>
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
              <li><a href="/" class="tamyiz-mobile-nav-link" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/')">Home <span>→</span></a></li>
              <li><a href="/editions" class="tamyiz-mobile-nav-link" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/editions')">The Editions <span>→</span></a></li>
              <li><a href="/philosophy" class="tamyiz-mobile-nav-link" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/philosophy')">Three Pillars &amp; Philosophy <span>→</span></a></li>
              <li><a href="/atelier" class="tamyiz-mobile-nav-link" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/atelier')">Atelier Origin &amp; Founders <span>→</span></a></li>
              <li><a href="/philosophy#formats" class="tamyiz-mobile-nav-link" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/philosophy#formats')">Digital Format Guide <span>→</span></a></li>
              <li><a href="/checkout" class="tamyiz-mobile-nav-link" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/checkout')" style="color: var(--color-red);">Instant Checkout <span>→</span></a></li>
            </ul>
          </div>

          <div>
            <div class="tamyiz-mobile-nav-group-title">Digital Editions Categories</div>
            <div class="tamyiz-mobile-cat-grid">
              <button class="tamyiz-mobile-cat-btn" onclick="window.tamyizApp.filterCategoryAndNavigate('all')">
                <span>All Digital Editions (8)</span> <span>→</span>
              </button>
              <button class="tamyiz-mobile-cat-btn" onclick="window.tamyizApp.filterCategoryAndNavigate('ebooks')">
                <span>E-Books &amp; Monographs</span> <span>→</span>
              </button>
              <button class="tamyiz-mobile-cat-btn" onclick="window.tamyizApp.filterCategoryAndNavigate('notion')">
                <span>Notion &amp; Productivity Templates</span> <span>→</span>
              </button>
              <button class="tamyiz-mobile-cat-btn" onclick="window.tamyizApp.filterCategoryAndNavigate('design')">
                <span>UI/UX &amp; Design Systems</span> <span>→</span>
              </button>
            </div>
          </div>

          <div>
            <div class="tamyiz-mobile-nav-group-title">Customer Care</div>
            <ul class="tamyiz-footer-links">
              <li><a href="#" class="tamyiz-footer-link" onclick="event.preventDefault(); window.tamyizApp.closeMobileMenu(); window.tamyizApp.navigateTo('/philosophy#formats')">Digital Format &amp; Template Guide</a></li>
              <li><a href="#" class="tamyiz-footer-link" onclick="event.preventDefault(); window.tamyizApp.closeMobileMenu(); window.tamyizApp.openPolicyModal('shipping')">Instant Digital Delivery Protocol</a></li>
              <li><a href="#" class="tamyiz-footer-link" onclick="event.preventDefault(); window.tamyizApp.closeMobileMenu(); window.tamyizApp.openPolicyModal('returns')">Atelier Guarantee &amp; License</a></li>
              <li><a href="https://wa.me/${brandInfo.whatsappNumber}" target="_blank" rel="noopener" style="color: #278838; font-weight: 700;">WhatsApp Concierge (+91 98765 43210) ↗</a></li>
            </ul>
          </div>
        </div>
      </aside>

      <!-- PERSISTENT SLIDE-OUT CART (BAG) DRAWER -->
      <div class="tamyiz-drawer-backdrop" id="cart-backdrop" onclick="window.tamyizApp.closeCart()"></div>
      <aside class="tamyiz-drawer" id="cart-drawer" aria-label="Atelier Bag">
        <div class="tamyiz-drawer-head">
          <div class="tamyiz-drawer-title">Atelier Bag</div>
          <button style="font-size: 1.25rem; background: none; border: none; cursor: pointer; padding: 0.25rem;" onclick="window.tamyizApp.closeCart()" aria-label="Close bag">✕</button>
        </div>

        <!-- Free digital shipping tracker -->
        <div class="tamyiz-shipping-tracker">
          <div class="tamyiz-shipping-msg">
            <span style="color: #278838; font-weight: 800;">⚡</span>
            <span id="shipping-msg-text" style="color: #278838; font-weight: 700;">Instant Digital Dispatch: FREE On All Editions</span>
          </div>
          <div class="tamyiz-shipping-progress-bg">
            <div class="tamyiz-shipping-progress-fill" style="width: 100%; background: #278838;"></div>
          </div>
        </div>

        <!-- Scrollable items area -->
        <div class="tamyiz-drawer-items" id="cart-items-container"></div>

        <!-- Cart drawer footer (Hidden on empty cart) -->
        <div class="tamyiz-drawer-foot" id="cart-foot-container" style="display: none;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
            <span>Subtotal</span>
            <strong id="cart-subtotal">₹0</strong>
          </div>

          <div id="cart-discount-row" style="display: none; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.88rem; color: #278838;">
            <span id="cart-discount-label">Coupon Discount</span>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <strong id="cart-discount-val">-₹0</strong>
              <button onclick="store.removeCoupon()" style="background: none; border: none; color: #888; font-size: 0.75rem; cursor: pointer;" title="Remove coupon">✕</button>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
            <span>Digital Delivery</span>
            <span id="cart-shipping" style="color: #278838; font-weight: 700;">FREE (INSTANT)</span>
          </div>

          <div style="display: flex; justify-content: space-between; margin: 0.8rem 0 1.25rem 0; font-family: var(--font-display); font-size: 1.2rem; font-weight: 800; border-top: 1px solid var(--color-border); padding-top: 0.8rem;">
            <span>Total Payable</span>
            <span id="cart-total">₹0</span>
          </div>

          <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
            <input type="text" id="coupon-input" placeholder="Coupon Code (DISTINCT10)" style="flex-grow: 1; padding: 0.65rem 0.85rem; border: 1px solid var(--color-border); border-radius: 4px; text-transform: uppercase; font-size: 16px;" />
            <button style="background: var(--color-black); color: #FFF; padding: 0 1.1rem; border-radius: 4px; font-size: 0.75rem; font-weight: 800; cursor: pointer; letter-spacing: 0.05em; text-transform: uppercase;" onclick="window.tamyizApp.applyCoupon()">Apply</button>
          </div>

          <button class="tamyiz-btn-quick-add" style="background: var(--color-red); font-size: 0.88rem; padding: 0.95rem; border: none;" onclick="window.tamyizApp.closeCart(); window.tamyizApp.navigateTo('/checkout');">
            PROCEED TO INSTANT ACCESS →
          </button>

          <div class="tamyiz-trust-bar">
            <span>Instant UPI</span>
            <span class="tamyiz-trust-bar-dot">•</span>
            <span>Cards</span>
            <span class="tamyiz-trust-bar-dot">•</span>
            <span>Direct Download Vault</span>
          </div>
        </div>
      </aside>

      <!-- 2. DYNAMIC MAIN CONTENT CONTAINER -->
      <main id="main-content" class="tamyiz-main-content"></main>

      <!-- 3. GLOBAL FOOTER -->
      <footer class="tamyiz-footer" id="contact">
        <div class="container">
          <div class="tamyiz-trust-bar" style="margin-bottom: 3.5rem; padding-bottom: 2rem; border-bottom: 1px solid rgba(255, 255, 255, 0.12); font-size: 0.78rem; color: #BBB;">
            <span>Instant Digital Access</span>
            <span class="tamyiz-trust-bar-dot">•</span>
            <span>PDF, EPUB &amp; Notion Systems</span>
            <span class="tamyiz-trust-bar-dot">•</span>
            <span>UPI &amp; Instant Download</span>
            <span class="tamyiz-trust-bar-dot">•</span>
            <span>Lifetime Digital Updates</span>
          </div>

          <div class="tamyiz-footer-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div class="tamyiz-footer-brand">
              <h3>TAMYIZ™</h3>
              <p>
                "Tamyiz" translates to distinction. Designed for those who stand apart.<br/>
                Digital Publishing &amp; Design Systems Studio: Sopore, Kashmir 193201, India.<br/>
                Concierge: <a href="mailto:${brandInfo.email}" style="color: #FFF; text-decoration: underline;">${brandInfo.email}</a> • <a href="https://wa.me/${brandInfo.whatsappNumber}" target="_blank" rel="noopener" style="color: var(--color-red); font-weight: 700;">${brandInfo.phone}</a>
              </p>
            </div>

            <div class="tamyiz-footer-col">
              <h4>Navigation</h4>
              <ul class="tamyiz-footer-links">
                <li><a href="/" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/')">Home</a></li>
                <li><a href="/editions" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/editions')">The Editions</a></li>
                <li><a href="/philosophy" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/philosophy')">Three Pillars &amp; Philosophy</a></li>
                <li><a href="/atelier" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/atelier')">Atelier Origin &amp; Founders</a></li>
                <li><a href="/philosophy#formats" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/philosophy#formats')">Digital Format Guide</a></li>
                <li><a href="/checkout" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/checkout')" style="color: var(--color-red); font-weight: 700;">Instant Checkout →</a></li>
              </ul>
            </div>

            <div class="tamyiz-footer-col">
              <h4>Digital Editions</h4>
              <ul class="tamyiz-footer-links">
                <li><a href="/editions" onclick="event.preventDefault(); window.tamyizApp.filterCategoryAndNavigate('all')">All Digital Editions (8)</a></li>
                <li><a href="/editions" onclick="event.preventDefault(); window.tamyizApp.filterCategoryAndNavigate('ebooks')">E-Books &amp; Monographs</a></li>
                <li><a href="/editions" onclick="event.preventDefault(); window.tamyizApp.filterCategoryAndNavigate('notion')">Notion &amp; Productivity Templates</a></li>
                <li><a href="/editions" onclick="event.preventDefault(); window.tamyizApp.filterCategoryAndNavigate('design')">UI/UX &amp; Design Systems</a></li>
              </ul>
            </div>

            <div class="tamyiz-footer-col">
              <h4>Customer Care</h4>
              <ul class="tamyiz-footer-links">
                <li><a href="/philosophy#formats" onclick="event.preventDefault(); window.tamyizApp.navigateTo('/philosophy#formats')">Digital Format &amp; Template Guide</a></li>
                <li><a href="#" onclick="event.preventDefault(); window.tamyizApp.openPolicyModal('shipping')">Instant Digital Delivery Protocol</a></li>
                <li><a href="#" onclick="event.preventDefault(); window.tamyizApp.openPolicyModal('returns')">Atelier Guarantee &amp; License</a></li>
                <li><a href="#" onclick="event.preventDefault(); window.tamyizApp.openPolicyModal('privacy')">Privacy &amp; Data Security</a></li>
                <li><a href="#" onclick="event.preventDefault(); window.tamyizApp.openPolicyModal('terms')">Terms of Service</a></li>
                <li><a href="https://wa.me/${brandInfo.whatsappNumber}" target="_blank" rel="noopener" style="color: #278838; font-weight: 700;">WhatsApp Concierge ↗</a></li>
              </ul>
            </div>
          </div>

          <div class="tamyiz-footer-bottom pb-24 md:pb-12">
            <div>
              &copy; ${new Date().getFullYear()} TAMYIZ Digital Publishing &amp; Design Systems Studio. Crafted in Sopore, Kashmir.
            </div>
            <div>
              Engineered with High-Contrast Monospace Precision.
            </div>
          </div>
        </div>
      </footer>

      <!-- 4. CHECKOUT / WAITLIST & POLICY MODAL OVERLAY -->
      <div class="tamyiz-modal" id="tamyiz-modal" onclick="if(event.target === this) window.tamyizApp.closeModal();">
        <div class="tamyiz-modal-box" id="tamyiz-modal-content"></div>
      </div>

      <!-- 5. COMPACT WHATSAPP CONCIERGE BUTTON -->
      <a href="https://wa.me/${brandInfo.whatsappNumber}?text=Hi%20TAMYIZ%20concierge%2C%20I%20have%20an%20inquiry%20about%20your%20digital%20publications%20and%20design%20systems." target="_blank" rel="noopener" class="tamyiz-whatsapp-fab" aria-label="WhatsApp Concierge">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      </a>
    `;

    this.renderDrawerItems();
  }

  // Render active page inside #main-content
  renderCurrentPage() {
    const mainEl = document.getElementById('main-content');
    if (!mainEl) return;

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

      default:
        mainEl.innerHTML = renderHomePage(this);
        break;
    }

    // Update active nav links in header
    this.updateActiveNavIndicators();
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

    if (this.currentPage === 'home') {
      links.home && links.home.classList.add('active');
    } else if (this.currentPage === 'editions' || this.currentPage === 'edition') {
      links.editions && links.editions.classList.add('active');
    } else if (this.currentPage === 'philosophy') {
      links.philosophy && links.philosophy.classList.add('active');
    } else if (this.currentPage === 'atelier') {
      links.atelier && links.atelier.classList.add('active');
    }
  }

  initHero3D() {
    const container = document.getElementById('tamyiz-3d-canvas-container');
    if (container) {
      if (this.hero3D) this.hero3D.destroy();
      this.hero3D = new TamyizHero3D(container);
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
    } else if (this.sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }

  getCollectionStatusText() {
    const count = this.getFilteredAndSortedProducts().length;
    let catLabel = 'All Digital Editions (8)';
    if (this.activeCategory === 'ebooks') catLabel = 'E-Books & Monographs';
    if (this.activeCategory === 'notion') catLabel = 'Notion & Productivity Templates';
    if (this.activeCategory === 'design') catLabel = 'UI/UX & Design Systems';

    const searchPart = this.searchQuery ? ` matching "${this.searchQuery}"` : '';
    const hasFilter = this.searchQuery || this.activeCategory !== 'all' || this.sortBy !== 'featured';

    const clearButton = hasFilter
      ? `<button onclick="window.tamyizApp.resetAllFilters()" style="background:none; border:none; color:var(--color-red); font-family:var(--font-sub); font-size:0.75rem; font-weight:800; cursor:pointer; text-decoration:underline;">Reset All Filters</button>`
      : '';

    return `
      <span>Showing ${count} of ${products.length} Digital Editions (${catLabel}${searchPart})</span>
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
    if (this.currentPage === 'editions') {
      this.renderCurrentPage();
    } else {
      this.navigateTo('/editions');
    }
  }

  filterCategoryAndNavigate(cat) {
    this.closeMobileMenu();
    this.activeCategory = cat;
    this.navigateTo('/editions');
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
    if (btn) {
      const parent = btn.closest('.tamyiz-pdp-format-pills') || btn.closest('.tamyiz-size-pills-row') || btn.parentElement;
      if (parent) {
        parent.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    }
    const label = document.getElementById(`size-label-${productId}`);
    if (label) label.textContent = size;
    const pdpLabel = document.getElementById('pdp-selected-size-label');
    if (pdpLabel) pdpLabel.textContent = size;
  }

  quickAddToCart(id) {
    const product = findProductBySlugOrId(id);
    if (!product) return;

    const hasVariants = product.variants && product.variants.options && product.variants.options.length > 0;
    const selectedVariant = this.selectedSizes[product.id] || (hasVariants ? product.variants.options[0] : "Standard");

    store.addToCart(product, selectedVariant, 1);
    this.openCart();
  }

  buyNowDirect(id) {
    const product = findProductBySlugOrId(id);
    if (!product) return;

    const hasVariants = product.variants && product.variants.options && product.variants.options.length > 0;
    const selectedVariant = this.selectedSizes[product.id] || (hasVariants ? product.variants.options[0] : "Standard");

    store.addToCart(product, selectedVariant, 1);
    this.closeCart();
    this.navigateTo('/checkout');
  }

  toggleWishlist(id) {
    const product = findProductBySlugOrId(id);
    store.toggleWishlist(id, product ? product.name : "Edition");
  }

  // Cart Drawer
  openCart() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer && backdrop) {
      drawer.classList.add('active');
      backdrop.classList.add('active');
      document.body.classList.add('modal-open');
      this.renderDrawerItems();
    }
  }

  closeCart() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer && backdrop) {
      drawer.classList.remove('active');
      backdrop.classList.remove('active');
      document.body.classList.remove('modal-open');
    }
  }

  renderDrawerItems() {
    const container = document.getElementById('cart-items-container');
    const foot = document.getElementById('cart-foot-container');
    if (!container) return;

    if (store.cart.length === 0) {
      container.innerHTML = `
        <div class="tamyiz-cart-empty-state">
          <div style="font-size: 2.25rem; margin-bottom: 0.75rem; color: #BBB;">🛍️</div>
          <div style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 800; text-transform: uppercase; margin-bottom: 0.4rem;">
            Your Bag Is Empty
          </div>
          <p style="font-size: 0.82rem; color: var(--color-grey); text-align: center; max-width: 240px; margin-bottom: 1.5rem; line-height: 1.5;">
            Explore our architectural e-books, Notion systems, and Swiss UI kits.
          </p>
          <button class="tamyiz-btn-nav-outline" onclick="window.tamyizApp.closeCart(); window.tamyizApp.navigateTo('/editions')">
            Explore Editions →
          </button>
        </div>
      `;
      if (foot) foot.style.display = 'none';
      return;
    }

    if (foot) foot.style.display = 'block';

    container.innerHTML = store.cart.map(item => `
      <div class="tamyiz-cart-item">
        <img src="${item.image}" alt="${item.name}" class="tamyiz-cart-thumb" />
        <div class="tamyiz-cart-info">
          <div class="tamyiz-cart-name">${item.name}</div>
          <div class="tamyiz-cart-size">Format: <strong>${item.variant}</strong></div>
          <div class="tamyiz-cart-row">
            <div class="tamyiz-cart-qty">
              <button onclick="store.updateQuantity('${item.cartItemId}', -1)">−</button>
              <span>${item.quantity}</span>
              <button onclick="store.updateQuantity('${item.cartItemId}', 1)">+</button>
            </div>
            <span class="tamyiz-cart-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
          </div>
        </div>
        <button class="tamyiz-cart-del" onclick="store.removeFromCart('${item.cartItemId}')" title="Remove item">✕</button>
      </div>
    `).join('');

    // Update Totals
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    if (subtotalEl) subtotalEl.textContent = `₹${store.getSubtotal().toLocaleString('en-IN')}`;
    if (totalEl) totalEl.textContent = `₹${store.getTotal().toLocaleString('en-IN')}`;

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
  }

  applyCoupon() {
    const input = document.getElementById('coupon-input');
    if (!input) return;
    const success = store.applyCoupon(input.value);
    if (success) input.value = '';
  }

  // Mobile Menu Drawer
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    const drawer = document.getElementById('mobile-drawer');
    const backdrop = document.getElementById('mobile-drawer-backdrop');
    if (drawer && backdrop) {
      drawer.classList.toggle('active', this.mobileMenuOpen);
      backdrop.classList.toggle('active', this.mobileMenuOpen);
      document.body.classList.toggle('modal-open', this.mobileMenuOpen);
    }
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
    const drawer = document.getElementById('mobile-drawer');
    const backdrop = document.getElementById('mobile-drawer-backdrop');
    if (drawer && backdrop) {
      drawer.classList.remove('active');
      backdrop.classList.remove('active');
      document.body.classList.remove('modal-open');
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

  // Checkout Actions
  submitCheckout() {
    if (store.cart.length === 0) {
      store.showToast('Your atelier bag is empty.', 'error');
      return;
    }

    const name = document.getElementById('chk-name')?.value || 'Collector';
    const email = document.getElementById('chk-email')?.value || 'collector@tamyiz.in';
    const phone = document.getElementById('chk-phone')?.value || brandInfo.phone;
    const payment = document.querySelector('input[name="checkout-payment"]:checked')?.value || 'upi';

    const order = store.createOrder({
      address: {
        name,
        email,
        phone,
        city: "Digital Dispatch",
        state: "Online",
        pincode: "193201"
      },
      paymentMethod: payment.toUpperCase()
    });

    this.confirmedOrder = order;
    store.showToast('Order confirmed! Access unlocked in Digital Vault.', 'success');
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.renderCurrentPage();
  }

  applyCouponFromCheckout() {
    const input = document.getElementById('checkout-coupon-input');
    if (!input) return;
    const success = store.applyCoupon(input.value);
    if (success) {
      this.renderCurrentPage();
    }
  }

  removeCouponFromCheckout() {
    store.removeCoupon();
    this.renderCurrentPage();
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
    link.href = '/assets/images/tamyiz-logo.png';
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
    const name = document.getElementById('contact-name')?.value || 'Friend';
    store.showToast(`Thank you, ${name}. Your message has been dispatched to Basit & Sahil.`, 'success');
    const form = document.querySelector('.tamyiz-contact-form');
    if (form) form.reset();
  }

  // Policy Modal
  openPolicyModal(policyKey) {
    const policy = policies[policyKey];
    if (!policy) return;

    this.openModalContent(`
      <div style="padding: 0.5rem 0;">
        <span style="font-family: var(--font-sub); font-size: 0.72rem; font-weight: 800; color: var(--color-red); letter-spacing: 0.12em; text-transform: uppercase;">TAMYIZ™ Protocol</span>
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
      document.body.classList.add('modal-open');
    }
  }

  closeModal() {
    const modal = document.getElementById('tamyiz-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.classList.remove('modal-open');
    }
  }
}

// Instantiate and expose globally
document.addEventListener('DOMContentLoaded', () => {
  window.tamyizApp = new TamyizUnifiedApp();
});
