/**
 * TAMYIZ™ Main Application Controller
 */

import { UIController } from './ui.js';
import { ParticleHorizon } from './particles.js';
import { LiveSearch } from './search.js';
import { store } from './store.js';
import { products } from '../data/products.js';

class TamyizApp {
  constructor() {
    this.ui = new UIController();
    this.particleEngine = null;
    this.searchEngine = null;
    this.init();
  }

  init() {
    this.setupHeaderScroll();
    this.setupCartDrawer();
    this.setupSearch();
    this.setupMobileMenu();
    this.setupRouting();
  }

  // Header sticky scroll effect
  setupHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // Cart Drawer Events
  setupCartDrawer() {
    const openBtn = document.getElementById('open-cart-btn');
    const closeBtn = document.getElementById('close-cart-btn');
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('drawer-backdrop');

    if (openBtn) {
      openBtn.addEventListener('click', () => this.openCartDrawer());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeCartDrawer());
    }

    if (backdrop) {
      backdrop.addEventListener('click', () => this.closeCartDrawer());
    }

    // Escape closes drawer
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer && drawer.classList.contains('active')) {
        this.closeCartDrawer();
      }
    });
  }

  openCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (drawer && backdrop) {
      drawer.classList.add('active');
      backdrop.classList.add('active');
      document.body.classList.add('modal-open');
    }
  }

  closeCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (drawer && backdrop) {
      drawer.classList.remove('active');
      backdrop.classList.remove('active');
      document.body.classList.remove('modal-open');
    }
  }

  // Live Search Modal
  setupSearch() {
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-results-container');
    const openBtn = document.getElementById('open-search-btn');

    if (searchModal && searchInput && resultsContainer) {
      this.searchEngine = new LiveSearch(searchModal, searchInput, resultsContainer);
      if (openBtn) {
        openBtn.addEventListener('click', () => this.searchEngine.open());
      }
    }
  }

  closeSearch() {
    if (this.searchEngine) {
      this.searchEngine.close();
    }
  }

  // Mobile Navigation
  setupMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const drawer = document.getElementById('mobile-menu-drawer');
    if (!toggleBtn || !drawer) return;

    toggleBtn.addEventListener('click', () => {
      drawer.classList.toggle('active');
    });

    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('active');
      });
    });
  }

  // Particle Engine
  initParticleEngine(canvas) {
    if (this.particleEngine) {
      this.particleEngine.stop();
    }
    this.particleEngine = new ParticleHorizon(canvas);
  }

  // Hash-based Router
  setupRouting() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  }

  handleRoute() {
    const hash = window.location.hash || '#home';
    const [route, param] = hash.split('/');

    // Update active nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === route);
    });

    if (route === '#product' && param) {
      this.ui.renderProductDetail(param);
    } else if (route === '#shop') {
      this.ui.renderShop();
    } else if (route === '#cart') {
      this.ui.renderCartPage();
    } else if (route === '#checkout') {
      this.ui.renderCheckout();
    } else if (route === '#about') {
      this.ui.renderAbout();
    } else if (route === '#contact') {
      this.ui.renderContact();
    } else if (route === '#account') {
      this.ui.renderAccount();
    } else if (route === '#wishlist') {
      this.ui.renderWishlist();
    } else if (route === '#faq') {
      this.ui.renderPolicies('faq');
    } else if (route === '#shipping') {
      this.ui.renderPolicies('shipping');
    } else if (route === '#returns') {
      this.ui.renderPolicies('returns');
    } else if (route === '#privacy') {
      this.ui.renderPolicies('privacy');
    } else if (route === '#terms') {
      this.ui.renderPolicies('terms');
    } else {
      this.ui.renderHome();
    }
  }

  // Global Action Handlers called from UI
  quickAddToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const defaultVariant = product.variants ? product.variants.options[0] : "Standard";
    store.addToCart(product, defaultVariant, 1);
    this.openCartDrawer();
  }

  toggleWishlist(productId, productName) {
    store.toggleWishlist(productId, productName);
  }

  filterByCollection(category) {
    window.location.hash = '#shop';
    setTimeout(() => {
      const radio = document.querySelector(`input[name="shop-category"][value="${category}"]`);
      if (radio) {
        radio.checked = true;
      }
      this.applyShopFilters();
    }, 50);
  }

  applyShopFilters() {
    const categoryInput = document.querySelector('input[name="shop-category"]:checked');
    const category = categoryInput ? categoryInput.value : 'all';
    const slider = document.getElementById('price-slider');
    const maxPrice = slider ? parseInt(slider.value) : 16000;
    const stockInput = document.getElementById('stock-filter');
    const stockOnly = stockInput ? stockInput.checked : false;
    const saleInput = document.getElementById('sale-filter');
    const saleOnly = saleInput ? saleInput.checked : false;
    const sortSelect = document.getElementById('sort-select');
    const sortBy = sortSelect ? sortSelect.value : 'featured';

    this.ui.filterProducts(category, maxPrice, stockOnly, saleOnly, sortBy);
  }

  handlePriceSlider(val) {
    const label = document.getElementById('price-val-label');
    if (label) {
      label.textContent = `Up to ₹${parseInt(val).toLocaleString('en-IN')}`;
    }
    this.applyShopFilters();
  }

  resetShopFilters() {
    const allRadio = document.querySelector('input[name="shop-category"][value="all"]');
    if (allRadio) allRadio.checked = true;
    const slider = document.getElementById('price-slider');
    if (slider) slider.value = 16000;
    const label = document.getElementById('price-val-label');
    if (label) label.textContent = 'Up to ₹16,000';
    const stockInput = document.getElementById('stock-filter');
    if (stockInput) stockInput.checked = true;
    const saleInput = document.getElementById('sale-filter');
    if (saleInput) saleInput.checked = false;
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'featured';

    this.applyShopFilters();
  }

  // PDP Handlers
  changePdpImage(src, thumbEl) {
    const mainImg = document.getElementById('pdp-main-image');
    if (mainImg) mainImg.src = src;
    document.querySelectorAll('.pdp-thumb').forEach(t => t.classList.remove('active'));
    if (thumbEl) thumbEl.classList.add('active');
  }

  selectVariant(variant, btnEl) {
    this.ui.activePdpVariant = variant;
    const label = document.getElementById('active-variant-label');
    if (label) label.textContent = variant;
    document.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
  }

  modifyPdpQty(delta) {
    this.ui.activePdpQty = Math.max(1, this.ui.activePdpQty + delta);
    const qtyEl = document.getElementById('pdp-qty-val');
    if (qtyEl) qtyEl.textContent = this.ui.activePdpQty;
  }

  addCurrentToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    store.addToCart(product, this.ui.activePdpVariant, this.ui.activePdpQty);
    this.openCartDrawer();
  }

  buyNow(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    store.addToCart(product, this.ui.activePdpVariant, this.ui.activePdpQty);
    window.location.hash = '#checkout';
  }

  checkPincode() {
    const input = document.getElementById('pincode-input');
    const result = document.getElementById('pincode-result');
    if (!input || !result) return;

    const val = input.value.trim();
    if (val.length === 6 && /^\d+$/.test(val)) {
      result.style.display = 'block';
      result.style.color = '#278838';
      result.innerHTML = `<strong>Available!</strong> Guaranteed delivery in 2–3 business days via Blue Dart to PIN ${val}. Cash on delivery accepted.`;
    } else {
      result.style.display = 'block';
      result.style.color = 'var(--color-red)';
      result.innerHTML = 'Please enter a valid 6-digit Indian PIN code.';
    }
  }

  switchTab(tabId, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const target = document.getElementById(`tab-${tabId}`);
    if (target) target.classList.add('active');
  }

  // Cart operations
  updateCartQty(cartItemId, delta) {
    store.updateQuantity(cartItemId, delta);
  }

  removeCartItem(cartItemId) {
    store.removeFromCart(cartItemId);
  }

  applyCouponFromInput(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    store.applyCoupon(input.value);
  }

  // Checkout Operations
  saveAddressAndProceed() {
    const name = document.getElementById('chk-name').value.trim();
    const phone = document.getElementById('chk-phone').value.trim();
    const email = document.getElementById('chk-email').value.trim();
    const address = document.getElementById('chk-address').value.trim();
    const city = document.getElementById('chk-city').value.trim();
    const state = document.getElementById('chk-state').value.trim();
    const pincode = document.getElementById('chk-pincode').value.trim();

    this.ui.checkoutData.address = { name, phone, email, address, city, state, pincode };
    this.goToStep(2);
  }

  goToStep(stepNumber) {
    this.ui.checkoutStep = stepNumber;
    const s1 = document.getElementById('checkout-step-1');
    const s2 = document.getElementById('checkout-step-2');
    const s3 = document.getElementById('checkout-step-3');

    if (s1) s1.style.display = stepNumber === 1 ? 'block' : 'none';
    if (s2) s2.style.display = stepNumber === 2 ? 'block' : 'none';
    if (s3) s3.style.display = stepNumber === 3 ? 'block' : 'none';

    document.querySelectorAll('.step-indicator').forEach((ind, i) => {
      ind.classList.toggle('active', i + 1 <= stepNumber);
    });

    this.ui.renderCheckoutSummary();
    window.scrollTo({ top: 120, behavior: 'smooth' });
  }

  selectDelivery(type) {
    this.ui.checkoutData.delivery = type;
    this.ui.renderCheckoutSummary();
  }

  selectPayment(method) {
    this.ui.checkoutData.paymentMethod = method;
    document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('active'));

    const upiBox = document.getElementById('upi-details');
    const cardBox = document.getElementById('card-details');
    const codBox = document.getElementById('cod-details');

    if (upiBox) upiBox.style.display = method === 'upi' ? 'block' : 'none';
    if (cardBox) cardBox.style.display = method === 'card' ? 'block' : 'none';
    if (codBox) codBox.style.display = method === 'cod' ? 'block' : 'none';
  }

  placeOrder() {
    const order = store.createOrder(this.ui.checkoutData);
    this.ui.renderOrderConfirmation(order);
    store.showToast(`Order #${order.orderId} placed successfully!`, 'success');
  }

  // Newsletter
  handleNewsletter(form) {
    const input = form.querySelector('input');
    const email = input.value.trim();
    store.showToast(`Welcome to the TAMYIZ Circle! Code DISTINCT10 unlocked for 10% off.`, 'success');
    input.value = '';
    store.applyCoupon('DISTINCT10');
  }

  handleContactSubmit(form) {
    store.showToast("Inquiry received. A TAMYIZ concierge will respond within 2 hours.", 'success');
    form.reset();
  }

  showPolicy(key) {
    this.ui.renderPolicies(key);
  }
}

// Bootstrap once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.tamyizApp = new TamyizApp();
});
