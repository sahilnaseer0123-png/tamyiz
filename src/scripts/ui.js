/**
 * TAMYIZ™ UI Renderer & View Controller
 */

import { products } from '../data/products.js';
import { categories } from '../data/categories.js';
import { brandInfo, foundersData, testimonials, faqs, policies } from '../data/content.js';
import { store } from './store.js';

export class UIController {
  constructor() {
    this.mainContent = document.getElementById('main-content');
    this.cartDrawer = document.getElementById('cart-drawer');
    this.drawerBackdrop = document.getElementById('drawer-backdrop');
    this.cartBadge = document.getElementById('cart-badge');
    this.wishlistBadge = document.getElementById('wishlist-badge');
    this.activePdpVariant = null;
    this.activePdpQty = 1;
    this.checkoutStep = 1;
    this.checkoutData = {
      address: {
        name: "Basit Khan",
        email: "basit@tamyiz.in",
        phone: "+91 98765 43210",
        address: "TAMYIZ Atelier, Main Market",
        city: "Sopore",
        state: "Jammu & Kashmir",
        pincode: "193201"
      },
      delivery: "standard",
      paymentMethod: "upi"
    };

    this.bindStore();
  }

  bindStore() {
    store.subscribe((event, payload) => {
      this.updateBadges();
      if (event === 'cart_updated' || event === 'coupon_applied' || event === 'coupon_removed') {
        this.updateCartDrawer();
        // If current view is full cart or checkout, refresh view
        const hash = window.location.hash;
        if (hash === '#cart') {
          this.renderCartPage();
        } else if (hash === '#checkout') {
          this.renderCheckoutSummary();
        }
      }
      if (event === 'wishlist_updated') {
        this.updateWishlistButtons();
      }
    });

    this.updateBadges();
  }

  updateBadges() {
    const cartCount = store.getCartCount();
    if (this.cartBadge) {
      this.cartBadge.textContent = cartCount;
      this.cartBadge.style.display = cartCount > 0 ? 'flex' : 'none';
      this.cartBadge.classList.add('pop');
      setTimeout(() => this.cartBadge.classList.remove('pop'), 200);
    }

    if (this.wishlistBadge) {
      const wishCount = store.wishlist.length;
      this.wishlistBadge.textContent = wishCount;
      this.wishlistBadge.style.display = wishCount > 0 ? 'flex' : 'none';
    }
  }

  updateWishlistButtons() {
    document.querySelectorAll('.btn-wishlist').forEach(btn => {
      const pid = btn.getAttribute('data-product-id');
      const inWish = store.isInWishlist(pid);
      btn.classList.toggle('active', inWish);
      const svg = btn.querySelector('svg');
      if (svg) {
        svg.style.fill = inWish ? 'var(--color-red)' : 'none';
        svg.style.stroke = inWish ? 'var(--color-red)' : 'currentColor';
      }
    });
  }

  // --------------------------------------------------------------------------
  // Product Card Renderer
  // --------------------------------------------------------------------------
  renderProductCard(product) {
    const isWish = store.isInWishlist(product.id);
    return `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-thumb-wrap" onclick="window.location.hash = '#product/${product.id}'">
          <img src="${product.images[0]}" alt="${product.name}" class="product-thumb-primary" loading="lazy" />
          <img src="${product.images[1] || product.images[0]}" alt="${product.name} alternate angle" class="product-thumb-hover" loading="lazy" />
          
          <div class="product-badge-wrap">
            ${product.isSale ? `<span class="tag-sale">SALE</span>` : ''}
            ${product.isBestSeller ? `<span class="tag-bestseller">BESTSELLER</span>` : ''}
            ${product.isNew ? `<span class="tag-new">NEW</span>` : ''}
          </div>

          <button class="btn-wishlist ${isWish ? 'active' : ''}" data-product-id="${product.id}" aria-label="Add to Wishlist" onclick="event.stopPropagation(); window.tamyizApp.toggleWishlist('${product.id}', '${product.name}')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWish ? 'var(--color-red)' : 'none'}" stroke="${isWish ? 'var(--color-red)' : 'currentColor'}" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>

          <button class="product-quick-add" onclick="event.stopPropagation(); window.tamyizApp.quickAddToCart('${product.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            Quick Add
          </button>
        </div>

        <div class="product-info">
          <div class="product-category-row">
            <span class="product-cat">${product.category}</span>
            <div class="product-rating-snippet">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFB800" stroke="#FFB800" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <span>${product.rating}</span>
            </div>
          </div>

          <h3 class="product-title" onclick="window.location.hash = '#product/${product.id}'">${product.name}</h3>

          <div class="product-price-row">
            <span class="price-current">₹${product.price.toLocaleString('en-IN')}</span>
            ${product.originalPrice ? `<span class="price-original">₹${product.originalPrice.toLocaleString('en-IN')}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // HOME PAGE
  // --------------------------------------------------------------------------
  renderHome() {
    document.title = "TAMYIZ™ — Be Distinct. Premium E-Commerce";
    const bestSellers = products.filter(p => p.isBestSeller).slice(0, 8);

    this.mainContent.innerHTML = `
      <!-- Hero Section with Canvas Particle Horizon -->
      <section class="hero-section" id="hero">
        <canvas id="particle-horizon-canvas" class="hero-canvas"></canvas>
        <div class="container hero-content">
          <span class="hero-tagline-badge">Autonomous Atelier • Sopore, Kashmir</span>
          <h1 class="hero-title">Be Distinct.</h1>
          <p class="hero-subtitle">Products made for people who stand apart. Architectural apparel, heavyweight fleece, and precision everyday carry engineered without compromise.</p>
          <div class="hero-cta-group">
            <a href="#shop" class="btn btn-primary btn-lg">
              <span>Shop Collection</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <a href="#about" class="btn btn-outline btn-lg">Our Story</a>
          </div>

          <div class="hero-stat-strip">
            <div class="stat-item">
              <span class="stat-num">480 GSM</span>
              <span class="stat-label">Double-Faced Fleece</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">100%</span>
              <span class="stat-label">Material Honesty</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">₹999+</span>
              <span class="stat-label">Free Express Shipping</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Brand Promise Strip -->
      <section class="brand-promise-strip">
        <div class="container promise-grid">
          <div class="promise-item">
            <svg class="promise-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            <div class="promise-text">
              <h4>Free Shipping Over ₹999</h4>
              <p>Dispatched in 24 hours across all 19,000+ PIN codes</p>
            </div>
          </div>

          <div class="promise-item">
            <svg class="promise-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
            <div class="promise-text">
              <h4>7-Day Easy Returns</h4>
              <p>Hassle-free doorstep exchanges and instant refunds</p>
            </div>
          </div>

          <div class="promise-item">
            <svg class="promise-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <div class="promise-text">
              <h4>Secure Payments</h4>
              <p>256-Bit Encrypted UPI, Cards & Net Banking</p>
            </div>
          </div>

          <div class="promise-item">
            <svg class="promise-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <div class="promise-text">
              <h4>Cash on Delivery</h4>
              <p>Pay at your doorstep after inspecting package</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Categories -->
      <section class="section">
        <div class="container">
          <div class="section-header">
            <div class="section-title-wrap">
              <h2>Featured Collections</h2>
              <p class="section-subtitle">Curated artifacts organized by discipline.</p>
            </div>
            <a href="#shop" class="btn btn-outline btn-sm">View All (12)</a>
          </div>

          <div class="categories-grid">
            ${categories.map(cat => `
              <div class="category-card" onclick="window.tamyizApp.filterByCollection('${cat.filterTag}')">
                <img src="${cat.image}" alt="${cat.name}" class="category-card-img" loading="lazy" />
                <div class="category-card-overlay">
                  <span class="category-item-count">${cat.itemCount}</span>
                  <h3 class="category-title">${cat.name}</h3>
                  <p class="category-desc">${cat.subtitle}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <div class="container"><div class="dotted-divider"></div></div>

      <!-- Best Sellers Grid (8 Products) -->
      <section class="section" style="padding-top: 0;">
        <div class="container">
          <div class="section-header">
            <div class="section-title-wrap">
              <h2>Best Sellers</h2>
              <p class="section-subtitle">Our most coveted pieces, engineered for everyday distinction.</p>
            </div>
            <a href="#shop" class="btn btn-outline btn-sm">Explore All</a>
          </div>

          <div class="product-grid">
            ${bestSellers.map(p => this.renderProductCard(p)).join('')}
          </div>
        </div>
      </section>

      <!-- Founders Section Preview -->
      <section class="founders-section">
        <div class="container">
          <div class="founders-intro">
            <span class="tag-new" style="margin-bottom: 1rem;">The Founders</span>
            <h2>${foundersData.headline}</h2>
            <p>${foundersData.subheadline}</p>
          </div>

          <div class="founders-split-container">
            <img src="${foundersData.splitImage}" alt="TAMYIZ Founders — Basit (Left) and Sahil (Right)" class="founders-split-img" />
            <div class="founders-split-labels">
              <div class="founder-side-label founder-side-left">
                <span class="founder-name-tag">BASIT</span>
                <span class="founder-role-tag">Co-Founder & Creative Director</span>
                <span class="founder-cue-tag">Left • Design & Aesthetics</span>
              </div>
              <div class="founder-side-label founder-side-right">
                <span class="founder-name-tag">SAHIL</span>
                <span class="founder-role-tag">Co-Founder & Operations</span>
                <span class="founder-cue-tag">Right • Precision & Engineering</span>
              </div>
            </div>
          </div>

          <div class="founders-cards-grid">
            ${foundersData.founders.map(f => `
              <div class="founder-card">
                <div class="founder-card-header">
                  <h3 class="founder-card-name">${f.name}</h3>
                  <div class="founder-card-role">${f.role}</div>
                </div>
                <p class="founder-card-bio">${f.bio}</p>
                <div class="founder-card-quote">"${f.quote}"</div>
                <div class="founder-socials">
                  <a href="${f.socials.instagram}" target="_blank" rel="noopener" class="social-link" aria-label="Instagram">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                  <a href="${f.socials.linkedin}" target="_blank" rel="noopener" class="social-link" aria-label="LinkedIn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  </a>
                  <a href="${f.socials.x}" target="_blank" rel="noopener" class="social-link" aria-label="X">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>
                  </a>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="text-align: center; margin-top: 3rem;">
            <a href="#about" class="btn btn-outline">Read The Full TAMYIZ Story</a>
          </div>
        </div>
      </section>

      <!-- Customer Reviews Testimonials (3 Cards) -->
      <section class="section">
        <div class="container">
          <div class="section-header">
            <div class="section-title-wrap">
              <h2>Customer Distinction</h2>
              <p class="section-subtitle">Unfiltered feedback from verified buyers across India.</p>
            </div>
            <div style="font-family: var(--font-display); font-size: 0.9rem; font-weight: 700;">
              4.9 / 5.0 RATING
            </div>
          </div>

          <div class="testimonials-grid">
            ${testimonials.map(t => `
              <div class="testimonial-card">
                <div class="testimonial-stars">
                  ${Array(t.rating).fill(`
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--color-red)" stroke="var(--color-red)"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  `).join('')}
                </div>
                <p class="testimonial-text">"${t.text}"</p>
                <div class="testimonial-author">
                  <span class="author-name">${t.author} — ${t.location}</span>
                  <span class="author-meta">${t.product} • ${t.date}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Newsletter Section -->
      <section class="newsletter-section">
        <div class="container">
          <div class="newsletter-box">
            <span class="tag-sale" style="margin-bottom: 1rem;">10% OFF FIRST ORDER</span>
            <h2>Join the TAMYIZ Circle.</h2>
            <p>Get exclusive early access to limited edition drops, material breakdowns, and 10% off your initial order.</p>
            <form class="newsletter-form" onsubmit="event.preventDefault(); window.tamyizApp.handleNewsletter(this);">
              <input type="email" placeholder="Enter your email address..." class="newsletter-input" required />
              <button type="submit" class="btn btn-red">Claim 10% Off</button>
            </form>
          </div>
        </div>
      </section>
    `;

    // Initialize particle engine on the newly rendered canvas
    const canvas = document.getElementById('particle-horizon-canvas');
    if (canvas && window.tamyizApp) {
      window.tamyizApp.initParticleEngine(canvas);
    }
  }

  // --------------------------------------------------------------------------
  // SHOP / CATALOG VIEW
  // --------------------------------------------------------------------------
  renderShop(preselectedCategory = null) {
    document.title = "Shop All Artifacts — TAMYIZ™";
    const selectedCategory = preselectedCategory || 'all';

    this.mainContent.innerHTML = `
      <div class="container catalog-layout">
        <!-- Filters Sidebar -->
        <aside class="catalog-sidebar">
          <div class="filter-group">
            <h4 class="filter-title">Collections</h4>
            <div class="filter-options-list">
              <label class="filter-option-item">
                <span>All Artifacts</span>
                <input type="radio" name="shop-category" value="all" ${selectedCategory === 'all' ? 'checked' : ''} onchange="window.tamyizApp.applyShopFilters()" />
              </label>
              <label class="filter-option-item">
                <span>Apparel (Core)</span>
                <input type="radio" name="shop-category" value="Apparel" ${selectedCategory === 'Apparel' ? 'checked' : ''} onchange="window.tamyizApp.applyShopFilters()" />
              </label>
              <label class="filter-option-item">
                <span>Modular Outerwear</span>
                <input type="radio" name="shop-category" value="Outerwear" ${selectedCategory === 'Outerwear' ? 'checked' : ''} onchange="window.tamyizApp.applyShopFilters()" />
              </label>
              <label class="filter-option-item">
                <span>EDC & Precision</span>
                <input type="radio" name="shop-category" value="EDC & Precision" ${selectedCategory === 'EDC & Precision' ? 'checked' : ''} onchange="window.tamyizApp.applyShopFilters()" />
              </label>
              <label class="filter-option-item">
                <span>Signature Fragrance & Shoes</span>
                <input type="radio" name="shop-category" value="Signature Fragrance & Footwear" ${selectedCategory === 'Signature Fragrance & Footwear' ? 'checked' : ''} onchange="window.tamyizApp.applyShopFilters()" />
              </label>
            </div>
          </div>

          <div class="filter-group">
            <h4 class="filter-title">Price Range</h4>
            <div style="margin-bottom: 0.8rem;">
              <span id="price-val-label" style="font-family: var(--font-display); font-weight: 700; font-size: 0.95rem;">Up to ₹16,000</span>
            </div>
            <input type="range" id="price-slider" min="1500" max="16000" step="500" value="16000" style="width: 100%; accent-color: var(--color-black);" oninput="window.tamyizApp.handlePriceSlider(this.value)" />
          </div>

          <div class="filter-group">
            <h4 class="filter-title">Availability</h4>
            <label class="filter-option-item">
              <span>In Stock Only</span>
              <input type="checkbox" id="stock-filter" checked onchange="window.tamyizApp.applyShopFilters()" />
            </label>
            <label class="filter-option-item">
              <span>On Sale Only</span>
              <input type="checkbox" id="sale-filter" onchange="window.tamyizApp.applyShopFilters()" />
            </label>
          </div>

          <button class="btn btn-outline btn-sm btn-full" onclick="window.tamyizApp.resetShopFilters()">Reset Filters</button>
        </aside>

        <!-- Catalog Main Area -->
        <main class="catalog-main">
          <div class="catalog-sort-bar">
            <div>
              <span id="catalog-count-text" style="font-family: var(--font-display); font-size: 0.85rem; font-weight: 700;">12 Products</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="font-size: 0.8rem; color: var(--color-grey); text-transform: uppercase;">Sort by:</span>
              <select id="sort-select" class="sort-select" onchange="window.tamyizApp.applyShopFilters()">
                <option value="featured">Featured</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
              </select>
            </div>
          </div>

          <div id="catalog-products-container" class="product-grid">
            ${products.map(p => this.renderProductCard(p)).join('')}
          </div>
        </main>
      </div>
    `;

    if (selectedCategory !== 'all') {
      this.filterProducts(selectedCategory, 16000, false, false, 'featured');
    }
  }

  filterProducts(category, maxPrice, stockOnly, saleOnly, sortBy) {
    let filtered = [...products];

    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }

    if (maxPrice) {
      filtered = filtered.filter(p => p.price <= maxPrice);
    }

    if (saleOnly) {
      filtered = filtered.filter(p => p.isSale);
    }

    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    const container = document.getElementById('catalog-products-container');
    const countLabel = document.getElementById('catalog-count-text');

    if (countLabel) {
      countLabel.textContent = `${filtered.length} Product${filtered.length === 1 ? '' : 's'}`;
    }

    if (container) {
      if (filtered.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1/-1; padding: 4rem 1rem; text-align: center;">
            <h3>No products match your filter criteria.</h3>
            <p style="color: var(--color-grey); margin-top: 0.5rem;">Try raising your maximum price or resetting filters.</p>
            <button class="btn btn-primary btn-sm" style="margin-top: 1.5rem;" onclick="window.tamyizApp.resetShopFilters()">Reset Filters</button>
          </div>
        `;
      } else {
        container.innerHTML = filtered.map(p => this.renderProductCard(p)).join('');
      }
    }
  }

  // --------------------------------------------------------------------------
  // PRODUCT DETAIL VIEW (PDP)
  // --------------------------------------------------------------------------
  renderProductDetail(productId) {
    const product = products.find(p => p.id === productId) || products[0];
    document.title = `${product.name} — TAMYIZ™`;

    this.activePdpVariant = product.variants ? product.variants.options[0] : "Standard";
    this.activePdpQty = 1;

    const related = products.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);
    const relatedProducts = related.length > 0 ? related : products.filter(p => p.id !== product.id).slice(0, 4);

    this.mainContent.innerHTML = `
      <div class="container product-detail-view">
        <div class="pdp-grid">
          <!-- Gallery with Zoom & Thumbnails -->
          <div class="pdp-gallery">
            <div class="pdp-main-image-wrap" id="pdp-zoom-container">
              <img src="${product.images[0]}" alt="${product.name}" id="pdp-main-image" class="pdp-main-img" />
            </div>

            <div class="pdp-thumbs-row">
              ${product.images.map((img, idx) => `
                <img src="${img}" alt="${product.name} angle ${idx + 1}" class="pdp-thumb ${idx === 0 ? 'active' : ''}" onclick="window.tamyizApp.changePdpImage('${img}', this)" />
              `).join('')}
            </div>
          </div>

          <!-- PDP Info & Controls -->
          <div class="pdp-info">
            <span class="pdp-cat">${product.category}</span>
            <h1 class="pdp-title">${product.name}</h1>

            <div class="product-rating-snippet" style="margin-bottom: 1rem; font-size: 0.85rem;">
              <div style="display: flex; gap: 2px;">
                ${Array(5).fill(`
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFB800" stroke="#FFB800"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                `).join('')}
              </div>
              <span>${product.rating} (${product.reviewsCount} verified reviews)</span>
            </div>

            <div class="pdp-pricing-row">
              <span class="pdp-price-current">₹${product.price.toLocaleString('en-IN')}</span>
              ${product.originalPrice ? `<span class="pdp-price-original">₹${product.originalPrice.toLocaleString('en-IN')}</span>` : ''}
              ${product.isSale ? `<span class="tag-sale">SALE — SAVE ₹${(product.originalPrice - product.price).toLocaleString('en-IN')}</span>` : ''}
            </div>

            <p class="pdp-desc">${product.description}</p>

            <!-- Variant Selector -->
            ${product.variants ? `
              <div class="variant-block">
                <label class="variant-label">Select ${product.variants.type}: <span id="active-variant-label" style="color: var(--color-red);">${this.activePdpVariant}</span></label>
                <div class="variant-options">
                  ${product.variants.options.map((opt, i) => `
                    <button class="variant-btn ${i === 0 ? 'active' : ''}" onclick="window.tamyizApp.selectVariant('${opt}', this)">${opt}</button>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Quantity & Actions -->
            <div class="pdp-actions-row">
              <div class="pdp-qty-wrap">
                <button class="pdp-qty-btn" onclick="window.tamyizApp.modifyPdpQty(-1)">−</button>
                <span class="pdp-qty-val" id="pdp-qty-val">1</span>
                <button class="pdp-qty-btn" onclick="window.tamyizApp.modifyPdpQty(1)">+</button>
              </div>

              <button class="btn btn-primary btn-lg" style="flex-grow: 1;" onclick="window.tamyizApp.addCurrentToCart('${product.id}')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                Add To Cart
              </button>

              <button class="btn btn-red btn-lg" onclick="window.tamyizApp.buyNow('${product.id}')">
                Buy Now
              </button>
            </div>

            <!-- PIN Code Delivery Checker -->
            <div class="pincode-checker-box">
              <h4>Delivery Estimate</h4>
              <div class="pincode-input-row">
                <input type="text" id="pincode-input" class="pincode-input" placeholder="Enter 6-digit PIN code (e.g. 144401)" maxlength="6" />
                <button class="btn btn-outline btn-sm" onclick="window.tamyizApp.checkPincode()">Check</button>
              </div>
              <div id="pincode-result" class="pincode-result"></div>
            </div>

            <!-- Guarantee Points -->
            <div style="display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.8rem; color: #444444; border-top: 1px solid var(--color-border); padding-top: 1.25rem;">
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-red)" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Free Express Delivery over ₹999</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-red)" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>7-Day Doorstep Returns & Exchanges</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-red)" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>100% Genuine Crafted in Sopore, Kashmir</span>
              </div>
            </div>

            <!-- Tabs: Description, Specs, Reviews -->
            <div class="pdp-tabs">
              <div class="tab-nav">
                <button class="tab-btn active" onclick="window.tamyizApp.switchTab('desc', this)">Description</button>
                <button class="tab-btn" onclick="window.tamyizApp.switchTab('specs', this)">Specifications</button>
                <button class="tab-btn" onclick="window.tamyizApp.switchTab('reviews', this)">Reviews (${product.reviewsCount})</button>
              </div>

              <div id="tab-desc" class="tab-pane active">
                <p style="margin-bottom: 1rem; line-height: 1.7;">${product.description}</p>
                <h4 style="margin: 1rem 0 0.5rem 0; font-size: 0.85rem;">Distinct Highlights:</h4>
                <ul style="padding-left: 1.25rem; font-size: 0.88rem; line-height: 1.7;">
                  ${product.highlights.map(h => `<li>${h}</li>`).join('')}
                </ul>
              </div>

              <div id="tab-specs" class="tab-pane">
                <table class="specs-table">
                  <tbody>
                    ${product.specifications.map(s => `
                      <tr>
                        <td>${s.label}</td>
                        <td>${s.value}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <div id="tab-reviews" class="tab-pane">
                <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                  <div style="background: #FAF8F6; padding: 1.25rem; border-radius: var(--radius-xs); border-left: 3px solid var(--color-red);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
                      <span style="font-weight: 700; font-size: 0.85rem;">Rohit Singhania</span>
                      <span style="color: var(--color-grey); font-size: 0.75rem;">Verified Purchase</span>
                    </div>
                    <p style="font-size: 0.85rem; color: #444444;">"Exceeded my expectations completely. The fabric density and finish are top-tier."</p>
                  </div>
                  <div style="background: #FAF8F6; padding: 1.25rem; border-radius: var(--radius-xs); border-left: 3px solid var(--color-red);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
                      <span style="font-weight: 700; font-size: 0.85rem;">Ananya Deshmukh</span>
                      <span style="color: var(--color-grey); font-size: 0.75rem;">Verified Purchase</span>
                    </div>
                    <p style="font-size: 0.85rem; color: #444444;">"Shipped to Pune in 2 days. The packaging box and particle cards are collector grade."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sticky Mobile ATC Bar -->
        <div class="mobile-sticky-atc">
          <div>
            <div style="font-family: var(--font-display); font-size: 0.75rem; font-weight: 700;">₹${product.price.toLocaleString('en-IN')}</div>
            <div style="font-size: 0.7rem; color: var(--color-grey);">${product.name.slice(0, 24)}...</div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.tamyizApp.addCurrentToCart('${product.id}')">
            Add To Cart
          </button>
        </div>

        <!-- You May Also Like Carousel -->
        <div class="dotted-divider"></div>
        <section class="section" style="padding-top: 0;">
          <div class="section-header">
            <h2>You May Also Like</h2>
            <a href="#shop" class="btn btn-outline btn-sm">Explore Collection</a>
          </div>
          <div class="product-grid">
            ${relatedProducts.map(p => this.renderProductCard(p)).join('')}
          </div>
        </section>
      </div>
    `;

    // Setup interactive image magnifier
    this.setupImageMagnifier();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setupImageMagnifier() {
    const container = document.getElementById('pdp-zoom-container');
    const img = document.getElementById('pdp-main-image');
    if (!container || !img) return;

    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      img.style.transformOrigin = `${x}% ${y}%`;
      img.style.transform = 'scale(1.75)';
    });

    container.addEventListener('mouseleave', () => {
      img.style.transform = 'scale(1)';
      img.style.transformOrigin = 'center center';
    });
  }

  // --------------------------------------------------------------------------
  // CART DRAWER & CART PAGE
  // --------------------------------------------------------------------------
  updateCartDrawer() {
    const container = document.getElementById('drawer-items-container');
    const subtotalEl = document.getElementById('drawer-subtotal');
    const shippingEl = document.getElementById('drawer-shipping');
    const discountRow = document.getElementById('drawer-discount-row');
    const discountEl = document.getElementById('drawer-discount');
    const totalEl = document.getElementById('drawer-total');
    const progressTrack = document.getElementById('shipping-progress-bar');
    const progressText = document.getElementById('shipping-progress-text');

    const subtotal = store.getSubtotal();
    const shipping = store.getShippingFee();
    const discount = store.getDiscount();
    const total = store.getTotal();

    // Free shipping threshold calculations (₹999)
    if (progressTrack && progressText) {
      if (subtotal >= 999) {
        progressTrack.style.width = '100%';
        progressText.innerHTML = `<strong>Free Express Shipping Unlocked!</strong>`;
      } else {
        const remaining = 999 - subtotal;
        const pct = Math.min(100, Math.round((subtotal / 999) * 100));
        progressTrack.style.width = `${pct}%`;
        progressText.innerHTML = `Add <strong>₹${remaining.toLocaleString('en-IN')}</strong> more for Free Shipping`;
      }
    }

    if (container) {
      if (store.cart.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 4rem 1rem; color: var(--color-grey);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem;"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            <h4 style="font-family: var(--font-display); font-size: 1rem; color: var(--color-black); margin-bottom: 0.5rem;">Your Cart is Empty</h4>
            <p style="font-size: 0.85rem; margin-bottom: 1.5rem;">Discover pieces engineered with distinction.</p>
            <a href="#shop" class="btn btn-primary btn-sm" onclick="window.tamyizApp.closeCartDrawer()">Start Shopping</a>
          </div>
        `;
      } else {
        container.innerHTML = store.cart.map(item => `
          <div class="cart-item-row">
            <img src="${item.image}" alt="${item.name}" class="cart-item-thumb" />
            <div class="cart-item-details">
              <h4 class="cart-item-title">${item.name}</h4>
              <span class="cart-item-variant">${item.variant}</span>
              <div class="cart-item-bottom">
                <div class="qty-counter">
                  <button class="qty-btn" onclick="window.tamyizApp.updateCartQty('${item.cartItemId}', -1)">−</button>
                  <span class="qty-val">${item.quantity}</span>
                  <button class="qty-btn" onclick="window.tamyizApp.updateCartQty('${item.cartItemId}', 1)">+</button>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <span class="cart-item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  <button class="btn-item-remove" onclick="window.tamyizApp.removeCartItem('${item.cartItemId}')" aria-label="Remove item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `).join('');
      }
    }

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;
    if (discountRow && discountEl) {
      if (discount > 0) {
        discountRow.style.display = 'flex';
        discountEl.textContent = `−₹${discount.toLocaleString('en-IN')}`;
      } else {
        discountRow.style.display = 'none';
      }
    }
    if (totalEl) totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
  }

  renderCartPage() {
    document.title = "Your Shopping Cart — TAMYIZ™";
    const subtotal = store.getSubtotal();
    const shipping = store.getShippingFee();
    const discount = store.getDiscount();
    const total = store.getTotal();

    this.mainContent.innerHTML = `
      <div class="container" style="padding: 3rem 0 6rem 0;">
        <h1 style="margin-bottom: 2rem; font-size: clamp(1.8rem, 3.5vw, 2.6rem);">Shopping Cart</h1>

        ${store.cart.length === 0 ? `
          <div style="background: var(--color-white); border: 1px solid var(--color-border); padding: 4rem 2rem; text-align: center; border-radius: var(--radius-xs);">
            <h3>Your Cart is Currently Empty</h3>
            <p style="color: var(--color-grey); margin: 0.75rem 0 2rem 0;">Explore the collection and elevate your wardrobe with distinct pieces.</p>
            <a href="#shop" class="btn btn-primary">Browse All Products</a>
          </div>
        ` : `
          <div class="checkout-grid">
            <div style="background: var(--color-white); border: 1px solid var(--color-border); padding: 2rem; border-radius: var(--radius-xs);">
              <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                ${store.cart.map(item => `
                  <div class="cart-item-row">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-thumb" style="width: 90px; height: 90px;" />
                    <div class="cart-item-details">
                      <h3 style="font-family: var(--font-display); font-size: 1rem; margin-bottom: 0.3rem;">${item.name}</h3>
                      <span class="cart-item-variant">${item.variant}</span>
                      <div class="cart-item-bottom">
                        <div class="qty-counter">
                          <button class="qty-btn" onclick="window.tamyizApp.updateCartQty('${item.cartItemId}', -1)">−</button>
                          <span class="qty-val">${item.quantity}</span>
                          <button class="qty-btn" onclick="window.tamyizApp.updateCartQty('${item.cartItemId}', 1)">+</button>
                        </div>
                        <div style="display: flex; align-items: center; gap: 1.5rem;">
                          <span class="cart-item-price" style="font-size: 1.15rem;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
                          <button class="btn-item-remove" onclick="window.tamyizApp.removeCartItem('${item.cartItemId}')">Remove</button>
                        </div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Sticky Cart Summary Box -->
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
              <div style="background: var(--color-white); border: 1px solid var(--color-border); padding: 2rem; border-radius: var(--radius-xs);">
                <h3 style="font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--color-border);">Order Summary</h3>

                <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; font-size: 0.9rem;">
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #666;">Subtotal</span>
                    <span style="font-family: var(--font-display); font-weight: 700;">₹${subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #666;">Estimated Shipping</span>
                    <span>${shipping === 0 ? '<strong style="color: #278838;">FREE</strong>' : `₹${shipping}`}</span>
                  </div>
                  ${discount > 0 ? `
                    <div style="display: flex; justify-content: space-between; color: var(--color-red);">
                      <span>Discount (${store.coupon.code})</span>
                      <span style="font-family: var(--font-display); font-weight: 700;">−₹${discount.toLocaleString('en-IN')}</span>
                    </div>
                  ` : ''}
                  <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--color-border); padding-top: 1rem; font-family: var(--font-display); font-size: 1.25rem; font-weight: 700;">
                    <span>Total</span>
                    <span>₹${total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <!-- Coupon Input -->
                <div style="margin-bottom: 1.5rem;">
                  <div style="display: flex; gap: 0.5rem;">
                    <input type="text" id="cart-coupon-input" placeholder="Coupon Code (e.g. DISTINCT10)" class="form-input" style="flex-grow: 1; text-transform: uppercase;" value="${store.coupon ? store.coupon.code : ''}" />
                    <button class="btn btn-outline btn-sm" onclick="window.tamyizApp.applyCouponFromInput('cart-coupon-input')">Apply</button>
                  </div>
                  <div style="margin-top: 0.5rem; font-size: 0.72rem; color: var(--color-grey);">Tip: Use <strong>DISTINCT10</strong> for 10% off</div>
                </div>

                <a href="#checkout" class="btn btn-primary btn-full btn-lg">Proceed To Checkout</a>
              </div>
            </div>
          </div>
        `}
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // CHECKOUT (3 STEPS)
  // --------------------------------------------------------------------------
  renderCheckout() {
    if (store.cart.length === 0) {
      window.location.hash = '#shop';
      store.showToast('Your cart is empty. Add products to checkout.', 'error');
      return;
    }

    document.title = "Secure Checkout — TAMYIZ™";

    this.mainContent.innerHTML = `
      <div class="container checkout-view">
        <h1 style="margin-bottom: 2rem; font-size: clamp(1.8rem, 3.5vw, 2.4rem);">Secure Checkout</h1>

        <div class="checkout-grid">
          <!-- Left: 3-Step Wizard -->
          <div style="background: var(--color-white); border: 1px solid var(--color-border); padding: 2.5rem; border-radius: var(--radius-xs);">
            <!-- Step Navigation -->
            <div class="checkout-steps-nav">
              <div class="step-indicator ${this.checkoutStep >= 1 ? 'active' : ''}">
                <span class="step-num">1</span>
                <span>Address</span>
              </div>
              <div style="width: 24px; height: 1px; background: var(--color-border);"></div>
              <div class="step-indicator ${this.checkoutStep >= 2 ? 'active' : ''}">
                <span class="step-num">2</span>
                <span>Delivery</span>
              </div>
              <div style="width: 24px; height: 1px; background: var(--color-border);"></div>
              <div class="step-indicator ${this.checkoutStep >= 3 ? 'active' : ''}">
                <span class="step-num">3</span>
                <span>Payment</span>
              </div>
            </div>

            <!-- STEP 1: Address -->
            <div id="checkout-step-1" style="display: ${this.checkoutStep === 1 ? 'block' : 'none'};">
              <h3 style="margin-bottom: 1.5rem; font-size: 1.1rem;">Shipping Details</h3>
              <form id="checkout-address-form" onsubmit="event.preventDefault(); window.tamyizApp.saveAddressAndProceed();">
                <div class="form-group-row">
                  <div class="form-field">
                    <label>Full Name *</label>
                    <input type="text" id="chk-name" class="form-input" required value="${this.checkoutData.address.name}" />
                  </div>
                  <div class="form-field">
                    <label>Phone Number *</label>
                    <input type="tel" id="chk-phone" class="form-input" required value="${this.checkoutData.address.phone}" />
                  </div>
                </div>

                <div class="form-field">
                  <label>Email Address (For Tracking & Invoice) *</label>
                  <input type="email" id="chk-email" class="form-input" required value="${this.checkoutData.address.email}" />
                </div>

                <div class="form-field">
                  <label>Street Address / Apartment *</label>
                  <input type="text" id="chk-address" class="form-input" required value="${this.checkoutData.address.address}" />
                </div>

                <div class="form-group-row">
                  <div class="form-field">
                    <label>City *</label>
                    <input type="text" id="chk-city" class="form-input" required value="${this.checkoutData.address.city}" />
                  </div>
                  <div class="form-field">
                    <label>State *</label>
                    <input type="text" id="chk-state" class="form-input" required value="${this.checkoutData.address.state}" />
                  </div>
                </div>

                <div class="form-field" style="max-width: 240px;">
                  <label>PIN Code *</label>
                  <input type="text" id="chk-pincode" class="form-input" maxlength="6" required value="${this.checkoutData.address.pincode}" />
                </div>

                <div style="display: flex; justify-content: flex-end; margin-top: 2rem;">
                  <button type="submit" class="btn btn-primary">Continue To Delivery</button>
                </div>
              </form>
            </div>

            <!-- STEP 2: Delivery -->
            <div id="checkout-step-2" style="display: ${this.checkoutStep === 2 ? 'block' : 'none'};">
              <h3 style="margin-bottom: 1.5rem; font-size: 1.1rem;">Select Shipping Speed</h3>
              
              <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;">
                <label class="payment-method-card ${this.checkoutData.delivery === 'standard' ? 'active' : ''}" style="cursor: pointer;">
                  <div style="display: flex; align-items: center; gap: 1rem;">
                    <input type="radio" name="delivery-option" value="standard" ${this.checkoutData.delivery === 'standard' ? 'checked' : ''} onchange="window.tamyizApp.selectDelivery('standard')" />
                    <div>
                      <div style="font-family: var(--font-display); font-size: 0.9rem; font-weight: 700;">Standard Insured Delivery</div>
                      <div style="font-size: 0.8rem; color: var(--color-grey);">Estimated 3–5 business days via Blue Dart / Delhivery</div>
                    </div>
                  </div>
                  <div style="font-family: var(--font-display); font-weight: 700; color: #278838;">FREE</div>
                </label>

                <label class="payment-method-card ${this.checkoutData.delivery === 'express' ? 'active' : ''}" style="cursor: pointer;">
                  <div style="display: flex; align-items: center; gap: 1rem;">
                    <input type="radio" name="delivery-option" value="express" ${this.checkoutData.delivery === 'express' ? 'checked' : ''} onchange="window.tamyizApp.selectDelivery('express')" />
                    <div>
                      <div style="font-family: var(--font-display); font-size: 0.9rem; font-weight: 700;">Priority Air Express (Next Flight Out)</div>
                      <div style="font-size: 0.8rem; color: var(--color-grey);">Guaranteed 1–2 business days delivery</div>
                    </div>
                  </div>
                  <div style="font-family: var(--font-display); font-weight: 700;">₹199</div>
                </label>
              </div>

              <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
                <button type="button" class="btn btn-outline" onclick="window.tamyizApp.goToStep(1)">Back to Address</button>
                <button type="button" class="btn btn-primary" onclick="window.tamyizApp.goToStep(3)">Continue To Payment</button>
              </div>
            </div>

            <!-- STEP 3: Payment -->
            <div id="checkout-step-3" style="display: ${this.checkoutStep === 3 ? 'block' : 'none'};">
              <h3 style="margin-bottom: 1.5rem; font-size: 1.1rem;">Payment Method</h3>

              <div class="payment-methods-grid">
                <!-- UPI -->
                <div class="payment-method-card ${this.checkoutData.paymentMethod === 'upi' ? 'active' : ''}" onclick="window.tamyizApp.selectPayment('upi')">
                  <div>
                    <div style="font-family: var(--font-display); font-size: 0.9rem; font-weight: 700;">UPI (Instant 0% Fee)</div>
                    <div style="font-size: 0.8rem; color: var(--color-grey);">Google Pay, PhonePe, Paytm, BHIM or any UPI App</div>
                  </div>
                  <span class="payment-pill">UPI</span>
                </div>

                <!-- Cards -->
                <div class="payment-method-card ${this.checkoutData.paymentMethod === 'card' ? 'active' : ''}" onclick="window.tamyizApp.selectPayment('card')">
                  <div>
                    <div style="font-family: var(--font-display); font-size: 0.9rem; font-weight: 700;">Credit / Debit Card</div>
                    <div style="font-size: 0.8rem; color: var(--color-grey);">Visa, Mastercard, RuPay, American Express</div>
                  </div>
                  <span class="payment-pill">CARDS</span>
                </div>

                <!-- Cash on Delivery -->
                <div class="payment-method-card ${this.checkoutData.paymentMethod === 'cod' ? 'active' : ''}" onclick="window.tamyizApp.selectPayment('cod')">
                  <div>
                    <div style="font-family: var(--font-display); font-size: 0.9rem; font-weight: 700;">Cash on Delivery (COD)</div>
                    <div style="font-size: 0.8rem; color: var(--color-grey);">Pay cash or UPI upon package inspection at your door</div>
                  </div>
                  <span class="payment-pill">COD</span>
                </div>
              </div>

              <!-- Payment Details Simulation Box -->
              <div id="payment-details-box" style="background: #FAFAF8; border: 1px solid var(--color-border); padding: 1.5rem; border-radius: var(--radius-xs); margin-bottom: 2rem;">
                <div id="upi-details" style="display: ${this.checkoutData.paymentMethod === 'upi' ? 'block' : 'none'};">
                  <div style="font-size: 0.85rem; margin-bottom: 0.8rem;">Enter your Virtual Payment Address (VPA) / UPI ID:</div>
                  <div style="display: flex; gap: 0.5rem;">
                    <input type="text" class="form-input" placeholder="e.g. yourname@okhdfcbank" value="sahil@upi" style="flex-grow: 1;" />
                  </div>
                  <div style="font-size: 0.72rem; color: var(--color-grey); margin-top: 0.4rem;">A payment request will be sent directly to your UPI app.</div>
                </div>

                <div id="card-details" style="display: ${this.checkoutData.paymentMethod === 'card' ? 'block' : 'none'};">
                  <div class="form-field">
                    <label>Card Number</label>
                    <input type="text" class="form-input" placeholder="4532 •••• •••• 8921" value="4532 9841 2049 8921" />
                  </div>
                  <div class="form-group-row">
                    <div class="form-field">
                      <label>Expiry (MM/YY)</label>
                      <input type="text" class="form-input" placeholder="08/29" value="08/29" />
                    </div>
                    <div class="form-field">
                      <label>CVV</label>
                      <input type="password" class="form-input" maxlength="4" placeholder="•••" value="821" />
                    </div>
                  </div>
                </div>

                <div id="cod-details" style="display: ${this.checkoutData.paymentMethod === 'cod' ? 'block' : 'none'};">
                  <p style="font-size: 0.85rem; color: #444444; line-height: 1.5;">You can inspect the sealed TAMYIZ box before paying our delivery courier via Cash or scan-to-pay QR.</p>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
                <button type="button" class="btn btn-outline" onclick="window.tamyizApp.goToStep(2)">Back to Delivery</button>
                <button type="button" class="btn btn-red btn-lg" onclick="window.tamyizApp.placeOrder()">Place Order & Pay</button>
              </div>
            </div>
          </div>

          <!-- Right: Sticky Order Summary -->
          <div id="checkout-summary-sidebar">
            ${this.renderCheckoutSummaryHtml()}
          </div>
        </div>
      </div>
    `;
  }

  renderCheckoutSummaryHtml() {
    const subtotal = store.getSubtotal();
    const deliveryFee = this.checkoutData.delivery === 'express' ? 199 : store.getShippingFee();
    const discount = store.getDiscount();
    const total = Math.max(0, subtotal + deliveryFee - discount);

    return `
      <div style="background: var(--color-white); border: 1px solid var(--color-border); padding: 2rem; border-radius: var(--radius-xs); position: sticky; top: 100px;">
        <h3 style="font-family: var(--font-display); font-size: 1rem; margin-bottom: 1.25rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.75rem;">Your Order (${store.getCartCount()} items)</h3>

        <div style="display: flex; flex-direction: column; gap: 1rem; max-height: 280px; overflow-y: auto; margin-bottom: 1.5rem; padding-right: 0.5rem;">
          ${store.cart.map(item => `
            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <img src="${item.image}" alt="${item.name}" style="width: 52px; height: 52px; object-fit: cover; border-radius: var(--radius-xs);" />
              <div style="flex-grow: 1;">
                <div style="font-family: var(--font-display); font-size: 0.78rem; font-weight: 700;">${item.name}</div>
                <div style="font-size: 0.72rem; color: var(--color-grey);">${item.variant} × ${item.quantity}</div>
              </div>
              <span style="font-family: var(--font-display); font-size: 0.85rem; font-weight: 700;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
            </div>
          `).join('')}
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.85rem; border-top: 1px solid var(--color-border); padding-top: 1rem;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #666;">Subtotal</span>
            <span style="font-family: var(--font-display); font-weight: 700;">₹${subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #666;">Delivery</span>
            <span>${deliveryFee === 0 ? '<strong style="color: #278838;">FREE</strong>' : `₹${deliveryFee}`}</span>
          </div>
          ${discount > 0 ? `
            <div style="display: flex; justify-content: space-between; color: var(--color-red);">
              <span>Discount</span>
              <span style="font-family: var(--font-display); font-weight: 700;">−₹${discount.toLocaleString('en-IN')}</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; border-top: 1px solid var(--color-border); padding-top: 0.8rem; margin-top: 0.4rem;">
            <span>Total Payable</span>
            <span>₹${total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    `;
  }

  renderCheckoutSummary() {
    const el = document.getElementById('checkout-summary-sidebar');
    if (el) el.innerHTML = this.renderCheckoutSummaryHtml();
  }

  // --------------------------------------------------------------------------
  // ORDER CONFIRMATION
  // --------------------------------------------------------------------------
  renderOrderConfirmation(order) {
    document.title = `Order Confirmed: ${order.orderId} — TAMYIZ™`;

    this.mainContent.innerHTML = `
      <div class="container" style="padding: 4rem 0 6rem 0; max-width: 800px;">
        <div style="background: var(--color-white); border: 1px solid var(--color-border); padding: 3rem; border-radius: var(--radius-xs); text-align: center;">
          <div style="width: 64px; height: 64px; background: var(--color-black); color: var(--color-white); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem auto;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>

          <span class="tag-sale" style="margin-bottom: 0.8rem;">ORDER CONFIRMED</span>
          <h1 style="font-size: 2.2rem; margin-bottom: 0.5rem;">Distinct Choice.</h1>
          <p style="color: var(--color-grey); font-size: 1rem; margin-bottom: 2rem;">Order #${order.orderId} has been secured and sent to our Sopore atelier for precision packing.</p>

          <div style="background: #FAFAF8; border: 1px solid var(--color-border); padding: 1.5rem; text-align: left; border-radius: var(--radius-xs); margin-bottom: 2rem;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--color-border); padding-bottom: 1.5rem;">
              <div>
                <span style="font-size: 0.72rem; color: var(--color-grey); text-transform: uppercase;">Tracking Number</span>
                <div style="font-family: var(--font-display); font-weight: 700; font-size: 0.95rem;">${order.trackingId}</div>
                <span style="font-size: 0.75rem; color: #278838;">Carrier: ${order.carrier}</span>
              </div>
              <div>
                <span style="font-size: 0.72rem; color: var(--color-grey); text-transform: uppercase;">Shipping To</span>
                <div style="font-weight: 600; font-size: 0.9rem;">${order.shippingAddress.name}</div>
                <div style="font-size: 0.8rem; color: #555;">${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</div>
              </div>
            </div>

            <h4 style="font-family: var(--font-display); font-size: 0.85rem; margin-bottom: 1rem;">Items In This Shipment</h4>
            <div style="display: flex; flex-direction: column; gap: 0.8rem;">
              ${order.items.map(i => `
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
                  <span>${i.name} (${i.variant}) × ${i.quantity}</span>
                  <span style="font-family: var(--font-display); font-weight: 700;">₹${(i.price * i.quantity).toLocaleString('en-IN')}</span>
                </div>
              `).join('')}
            </div>

            <div style="border-top: 1px solid var(--color-border); margin-top: 1rem; padding-top: 1rem; display: flex; justify-content: space-between; font-family: var(--font-display); font-size: 1.15rem; font-weight: 700;">
              <span>Total Paid</span>
              <span>₹${order.total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
            <a href="#shop" class="btn btn-primary">Continue Shopping</a>
            <a href="#account" class="btn btn-outline">View In My Orders</a>
          </div>
        </div>
      </div>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --------------------------------------------------------------------------
  // ABOUT US / FOUNDERS PAGE
  // --------------------------------------------------------------------------
  renderAbout() {
    document.title = "About Us & Founders — TAMYIZ™";

    this.mainContent.innerHTML = `
      <div class="container" style="padding: 4rem 0 6rem 0;">
        <div style="max-width: 800px; margin: 0 auto 4rem auto; text-align: center;">
          <span class="tag-new" style="margin-bottom: 1rem;">Atelier Origin</span>
          <h1 style="font-size: clamp(2.2rem, 5vw, 3.8rem); margin-bottom: 1.25rem;">Two Founders.<br/>One Vision.</h1>
          <p style="font-size: 1.15rem; color: #444444; line-height: 1.7;">
            ${foundersData.story.origin}
          </p>
        </div>

        <!-- Large Split Portrait Section -->
        <div class="founders-split-container">
          <img src="${foundersData.splitImage}" alt="TAMYIZ Founders — Basset (Left) and Sahil (Right)" class="founders-split-img" />
          <div class="founders-split-labels">
            <div class="founder-side-label founder-side-left">
              <span class="founder-name-tag">BASIT</span>
              <span class="founder-role-tag">Co-Founder & Creative Director</span>
              <span class="founder-cue-tag">Left • Grey Tee & Glasses • Architectural Design</span>
            </div>
            <div class="founder-side-label founder-side-right">
              <span class="founder-name-tag">SAHIL</span>
              <span class="founder-role-tag">Co-Founder & Operations</span>
              <span class="founder-cue-tag">Right • Black Polo • Engineering & Fabrication</span>
            </div>
          </div>
        </div>

        <!-- 2 Founder Cards -->
        <div class="founders-cards-grid">
          ${foundersData.founders.map(f => `
            <div class="founder-card">
              <div class="founder-card-header">
                <span style="font-size: 0.72rem; color: var(--color-grey); text-transform: uppercase;">${f.visualCue}</span>
                <h3 class="founder-card-name" style="margin-top: 0.2rem;">${f.name}</h3>
                <div class="founder-card-role">${f.role}</div>
              </div>
              <p class="founder-card-bio">${f.bio}</p>
              <div class="founder-card-quote">"${f.quote}"</div>
              <div class="founder-socials">
                <a href="${f.socials.instagram}" target="_blank" rel="noopener" class="social-link" aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="${f.socials.linkedin}" target="_blank" rel="noopener" class="social-link" aria-label="LinkedIn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
                <a href="${f.socials.x}" target="_blank" rel="noopener" class="social-link" aria-label="X">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>
                </a>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="dotted-divider"></div>

        <!-- Mission & Values -->
        <div style="max-width: 900px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 3rem;">
            <h2>The Three Pillars of TAMYIZ</h2>
            <p style="color: var(--color-grey); margin-top: 0.5rem;">${foundersData.story.mission}</p>
          </div>

          <div class="values-grid">
            ${foundersData.story.values.map(v => `
              <div class="value-card">
                <span class="value-tag">${v.tag}</span>
                <h3 class="value-title">${v.title}</h3>
                <p class="value-desc">${v.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --------------------------------------------------------------------------
  // CONTACT PAGE
  // --------------------------------------------------------------------------
  renderContact() {
    document.title = "Contact Us & Atelier Concierge — TAMYIZ™";

    this.mainContent.innerHTML = `
      <div class="container" style="padding: 4rem 0 6rem 0;">
        <div style="max-width: 700px; margin: 0 auto 3.5rem auto; text-align: center;">
          <h1 style="margin-bottom: 0.8rem; font-size: clamp(2rem, 4vw, 3rem);">Connect With Distinction</h1>
          <p style="color: #555; font-size: 1.05rem;">Questions regarding sizing, bespoke inquiries, or ongoing orders? Our concierge team in Sopore, Kashmir is at your service.</p>
        </div>

        <div class="checkout-grid" style="max-width: 1040px; margin: 0 auto;">
          <!-- Contact Form -->
          <div style="background: var(--color-white); border: 1px solid var(--color-border); padding: 2.5rem; border-radius: var(--radius-xs);">
            <h3 style="font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 1.5rem;">Send a Message</h3>
            <form onsubmit="event.preventDefault(); window.tamyizApp.handleContactSubmit(this);">
              <div class="form-group-row">
                <div class="form-field">
                  <label>Your Name *</label>
                  <input type="text" class="form-input" required placeholder="Sahil Sharma" />
                </div>
                <div class="form-field">
                  <label>Email Address *</label>
                  <input type="email" class="form-input" required placeholder="sahil@example.com" />
                </div>
              </div>

              <div class="form-field">
                <label>Order ID (Optional)</label>
                <input type="text" class="form-input" placeholder="e.g. TMZ-84920" />
              </div>

              <div class="form-field">
                <label>Your Message *</label>
                <textarea class="form-input" rows="5" required placeholder="Tell us how we can assist you..."></textarea>
              </div>

              <button type="submit" class="btn btn-primary btn-full">Dispatch Inquiry</button>
            </form>
          </div>

          <!-- Headquarters Card -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="background: var(--color-white); border: 1px solid var(--color-border); padding: 2rem; border-radius: var(--radius-xs);">
              <h4 style="font-family: var(--font-display); font-size: 0.9rem; margin-bottom: 1rem;">Headquarters & Atelier</h4>
              <p style="font-size: 0.9rem; color: #444; line-height: 1.6; margin-bottom: 1.5rem;">
                ${brandInfo.address}
              </p>

              <div style="display: flex; flex-direction: column; gap: 0.8rem; font-size: 0.85rem; border-top: 1px solid var(--color-border); padding-top: 1.25rem;">
                <div>
                  <span style="color: var(--color-grey); text-transform: uppercase; font-size: 0.72rem;">Email:</span>
                  <div style="font-family: var(--font-display); font-weight: 700;"><a href="mailto:${brandInfo.email}">${brandInfo.email}</a></div>
                </div>
                <div>
                  <span style="color: var(--color-grey); text-transform: uppercase; font-size: 0.72rem;">Direct / WhatsApp:</span>
                  <div style="font-family: var(--font-display); font-weight: 700;"><a href="https://wa.me/${brandInfo.whatsappNumber}" target="_blank">${brandInfo.phone}</a></div>
                </div>
                <div>
                  <span style="color: var(--color-grey); text-transform: uppercase; font-size: 0.72rem;">Atelier Hours:</span>
                  <div>Monday – Saturday: 10:00 AM – 7:00 PM IST</div>
                </div>
              </div>

              <div style="margin-top: 1.5rem;">
                <a href="https://wa.me/${brandInfo.whatsappNumber}?text=Hi%20TAMYIZ%20team%2C%20I%20have%20an%20inquiry%20regarding%20your%20products." target="_blank" rel="noopener" class="btn btn-red btn-full btn-sm">
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --------------------------------------------------------------------------
  // MY ACCOUNT & ORDERS
  // --------------------------------------------------------------------------
  renderAccount() {
    document.title = "My Account & Orders — TAMYIZ™";

    this.mainContent.innerHTML = `
      <div class="container" style="padding: 4rem 0 6rem 0;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; border-bottom: 1px solid var(--color-border); padding-bottom: 1.5rem;">
          <div>
            <span class="tag-bestseller" style="margin-bottom: 0.5rem;">TAMYIZ MEMBER</span>
            <h1 style="font-size: 2.2rem;">Welcome, ${store.user.name}</h1>
            <p style="color: var(--color-grey); font-size: 0.9rem;">${store.user.email} • ${store.user.phone}</p>
          </div>
          <button class="btn btn-outline btn-sm" onclick="store.showToast('Profile updated.', 'info')">Edit Details</button>
        </div>

        <div style="display: grid; grid-template-columns: 280px 1fr; gap: 3rem;">
          <!-- Account Sidebar -->
          <div>
            <div style="background: var(--color-white); border: 1px solid var(--color-border); padding: 1.5rem; border-radius: var(--radius-xs); display: flex; flex-direction: column; gap: 0.5rem;">
              <button class="btn btn-primary btn-sm btn-full" style="text-align: left; justify-content: flex-start;">Order History (${store.orders.length})</button>
              <button class="btn btn-outline btn-sm btn-full" style="text-align: left; justify-content: flex-start;" onclick="window.location.hash = '#wishlist'">My Wishlist (${store.wishlist.length})</button>
              <button class="btn btn-outline btn-sm btn-full" style="text-align: left; justify-content: flex-start;" onclick="store.showToast('Password reset link sent to your email.', 'info')">Security & Password</button>
            </div>
          </div>

          <!-- Orders List -->
          <div>
            <h3 style="font-family: var(--font-display); font-size: 1.15rem; margin-bottom: 1.5rem;">Recent Orders</h3>
            ${store.orders.length === 0 ? `
              <p style="color: var(--color-grey);">No orders placed yet.</p>
            ` : store.orders.map(o => `
              <div style="background: var(--color-white); border: 1px solid var(--color-border); border-radius: var(--radius-xs); padding: 1.75rem; margin-bottom: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); padding-bottom: 1rem; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
                  <div>
                    <span style="font-family: var(--font-display); font-weight: 700; font-size: 1rem;">Order #${o.orderId}</span>
                    <span style="font-size: 0.8rem; color: var(--color-grey); margin-left: 0.5rem;">Placed on ${o.date}</span>
                  </div>
                  <div>
                    <span class="tag-sale" style="background: #0B0B0B;">${o.status}</span>
                  </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.25rem;">
                  ${o.items.map(item => `
                    <div style="display: flex; gap: 1rem; align-items: center;">
                      <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius-xs);" />
                      <div style="flex-grow: 1;">
                        <div style="font-family: var(--font-display); font-size: 0.85rem; font-weight: 700;">${item.name}</div>
                        <div style="font-size: 0.75rem; color: var(--color-grey);">Qty: ${item.quantity} • ${item.variant}</div>
                      </div>
                      <span style="font-family: var(--font-display); font-weight: 700; font-size: 0.95rem;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  `).join('')}
                </div>

                <div style="border-top: 1px solid var(--color-border); padding-top: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                  <div style="font-size: 0.8rem; color: #555;">
                    Tracking: <strong>${o.carrier} (${o.trackingId})</strong>
                  </div>
                  <div style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 700;">
                    Total: ₹${o.total.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --------------------------------------------------------------------------
  // WISHLIST VIEW
  // --------------------------------------------------------------------------
  renderWishlist() {
    document.title = "My Wishlist — TAMYIZ™";
    const wishProducts = products.filter(p => store.wishlist.includes(p.id));

    this.mainContent.innerHTML = `
      <div class="container" style="padding: 4rem 0 6rem 0;">
        <div style="margin-bottom: 2.5rem;">
          <h1 style="font-size: 2.2rem; margin-bottom: 0.5rem;">Saved Wishlist</h1>
          <p style="color: var(--color-grey);">${wishProducts.length} distinct item${wishProducts.length === 1 ? '' : 's'} saved for later.</p>
        </div>

        ${wishProducts.length === 0 ? `
          <div style="background: var(--color-white); border: 1px solid var(--color-border); padding: 4rem 2rem; text-align: center; border-radius: var(--radius-xs);">
            <h3>Your Wishlist is Empty</h3>
            <p style="color: var(--color-grey); margin: 0.75rem 0 2rem 0;">Heart your favorite pieces to save them here.</p>
            <a href="#shop" class="btn btn-primary">Discover Products</a>
          </div>
        ` : `
          <div class="product-grid">
            ${wishProducts.map(p => this.renderProductCard(p)).join('')}
          </div>
        `}
      </div>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --------------------------------------------------------------------------
  // POLICIES & FAQ VIEW
  // --------------------------------------------------------------------------
  renderPolicies(policyKey = 'shipping') {
    document.title = "Customer Care & Policies — TAMYIZ™";

    this.mainContent.innerHTML = `
      <div class="container" style="padding: 4rem 0 6rem 0; max-width: 900px;">
        <h1 style="margin-bottom: 2rem; font-size: clamp(2rem, 4vw, 3rem);">Policies & Standards</h1>

        <div style="display: flex; gap: 1rem; border-bottom: 1px solid var(--color-border); padding-bottom: 1rem; margin-bottom: 2.5rem; flex-wrap: wrap;">
          <button class="btn ${policyKey === 'shipping' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="window.tamyizApp.showPolicy('shipping')">Shipping Policy</button>
          <button class="btn ${policyKey === 'returns' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="window.tamyizApp.showPolicy('returns')">7-Day Returns</button>
          <button class="btn ${policyKey === 'faq' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="window.tamyizApp.showPolicy('faq')">Frequently Asked Questions</button>
          <button class="btn ${policyKey === 'privacy' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="window.tamyizApp.showPolicy('privacy')">Privacy Policy</button>
          <button class="btn ${policyKey === 'terms' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="window.tamyizApp.showPolicy('terms')">Terms & Conditions</button>
        </div>

        <div style="background: var(--color-white); border: 1px solid var(--color-border); padding: 3rem; border-radius: var(--radius-xs);">
          ${policyKey === 'faq' ? `
            <h2 style="font-size: 1.4rem; margin-bottom: 2rem;">Frequently Asked Questions</h2>
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
              ${faqs.map(f => `
                <div style="border-bottom: 1px solid var(--color-border); padding-bottom: 1.25rem;">
                  <h4 style="font-family: var(--font-display); font-size: 0.95rem; margin-bottom: 0.5rem;">${f.q}</h4>
                  <p style="color: #444; font-size: 0.9rem; line-height: 1.6;">${f.a}</p>
                </div>
              `).join('')}
            </div>
          ` : `
            <h2 style="font-size: 1.4rem; margin-bottom: 1.5rem;">${policies[policyKey]?.title || "Policy"}</h2>
            <p style="color: #444; font-size: 0.98rem; line-height: 1.8;">
              ${policies[policyKey]?.content || ""}
            </p>
          `}
        </div>
      </div>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
