/**
 * TAMYIZ™ State Management & Storage
 * Handles Cart, Wishlist, Coupons, Orders, and Toast Notifications with localStorage persistence.
 */

import { findProductBySlugOrId, isAvailable } from '../data/products.js';

const STORAGE_KEYS = {
  CART: 'tamyiz_atelier_bag',
  LEGACY_CART: 'tamyiz_cart_v1',
  WISHLIST: 'tamyiz_wishlist_v1',
  USER: 'tamyiz_user_v1',
  ORDERS: 'tamyiz_orders_v1',
  COUPON: 'tamyiz_coupon_v1'
};

const AVAILABLE_COUPONS = {
  'DISTINCT10': { type: 'percent', value: 10, label: '10% Off First Order' },
  'DISTINCT': { type: 'percent', value: 10, label: '10% Off First Order' },
  'WELCOME10': { type: 'percent', value: 10, label: '10% Off Welcome Privilege' },
  'TAMYIZ15': { type: 'percent', value: 15, label: '15% Off VIP Circle' },
  'HORIZON500': { type: 'flat', value: 500, label: '₹500 Flat Discount (Min ₹3000)' }
};

class Store {
  constructor() {
    const rawCart = this.load(STORAGE_KEYS.CART, null) || this.load(STORAGE_KEYS.LEGACY_CART, []);
    this.cart = Array.isArray(rawCart) ? rawCart : [];
    this.wishlist = this.load(STORAGE_KEYS.WISHLIST, []);
    this.user = this.load(STORAGE_KEYS.USER, { isLoggedIn: false });
    this.orders = this.load(STORAGE_KEYS.ORDERS, []);
    this.coupon = this.load(STORAGE_KEYS.COUPON, null);
    this.listeners = [];
  }

  load(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn(`Failed reading ${key} from localStorage:`, e);
      return fallback;
    }
  }

  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`Failed saving ${key} to localStorage:`, e);
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(event, payload) {
    this.listeners.forEach(cb => {
      try {
        cb(event, payload, this);
      } catch (err) {
        console.error("Store listener error:", err);
      }
    });
  }

  /** After the ebooks load: drop bag items that can't be bought now (removed, or back to "coming soon"). */
  pruneUnavailable() {
    const before = this.cart.length;
    this.cart = this.cart.filter((i) => isAvailable(findProductBySlugOrId(i.productId || i.id)));
    if (this.cart.length !== before || this.load(STORAGE_KEYS.CART, null) === null) this.save(STORAGE_KEYS.CART, this.cart);
  }

  // Cart operations
  addToCart(product, variantOption, quantity = 1, customPrice = null, customOriginalPrice = null) {
    if (!isAvailable(product)) return;
    const variant = variantOption || (product.variants ? product.variants.options[0] : "Standard");
    const cartItemId = `${product.id}-${variant}`;
    
    // Resolve variant price
    let itemPrice = customPrice;
    let itemOrigPrice = customOriginalPrice;
    if (itemPrice === null || itemPrice === undefined) {
      if (product.variants && product.variants.prices && product.variants.prices[variant]) {
        itemPrice = product.variants.prices[variant].price;
        itemOrigPrice = product.variants.prices[variant].originalPrice;
      } else {
        itemPrice = product.price;
        itemOrigPrice = product.originalPrice;
      }
    }

    const existingIndex = this.cart.findIndex(item => item.cartItemId === cartItemId);

    if (existingIndex > -1) {
      // Digital products are single-license: lock quantity to 1
      this.cart[existingIndex].quantity = 1;
      this.cart[existingIndex].price = itemPrice;
      this.cart[existingIndex].originalPrice = itemOrigPrice;
    } else {
      this.cart.push({
        cartItemId,
        productId: product.id,
        name: product.name,
        price: itemPrice,
        originalPrice: itemOrigPrice,
        image: product.images[0],
        variant,
        quantity: 1, // Locked to 1 for digital publications
        isDigital: Boolean(product.isDigital !== false)
      });
    }

    this.save(STORAGE_KEYS.CART, this.cart);
    this.notify('cart_updated', { cart: this.cart });
    this.showToast(`Added to bag: ${product.name} (${variant})`, 'success');
  }

  removeFromCart(cartItemId) {
    const item = this.cart.find(i => i.cartItemId === cartItemId);
    this.cart = this.cart.filter(i => i.cartItemId !== cartItemId);
    this.save(STORAGE_KEYS.CART, this.cart);
    this.notify('cart_updated', { cart: this.cart });
    if (item) {
      this.showToast(`Removed from cart: ${item.name}`, 'info');
    }
  }

  updateQuantity(cartItemId, delta) {
    const item = this.cart.find(i => i.cartItemId === cartItemId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeFromCart(cartItemId);
    } else {
      this.save(STORAGE_KEYS.CART, this.cart);
      this.notify('cart_updated', { cart: this.cart });
    }
  }

  clearCart() {
    this.cart = [];
    this.coupon = null;
    this.save(STORAGE_KEYS.CART, this.cart);
    this.save(STORAGE_KEYS.COUPON, null);
    this.notify('cart_updated', { cart: this.cart });
  }

  getCartCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getSubtotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getShippingFee() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    // Digital publications always enjoy zero shipping (instant digital delivery)
    const hasPhysical = this.cart.some(item => !item.isDigital);
    if (!hasPhysical) return 0;
    return subtotal >= 4999 ? 0 : 250;
  }

  getDiscount() {
    if (!this.coupon) return 0;
    const subtotal = this.getSubtotal();
    const c = AVAILABLE_COUPONS[this.coupon.code];
    if (!c) return 0;

    if (c.type === 'percent') {
      return Math.round((subtotal * c.value) / 100);
    }
    if (c.type === 'flat') {
      return subtotal >= 3000 ? Math.min(subtotal, c.value) : 0;
    }
    return 0;
  }

  getTotal() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    const shipping = this.getShippingFee();
    const discount = this.getDiscount();
    return Math.max(0, subtotal + shipping - discount);
  }

  applyCoupon(code) {
    if (this.cart.length === 0) {
      this.showToast('Please add items to your atelier bag first.', 'error');
      return false;
    }

    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) {
      this.showToast('Please enter a coupon code.', 'error');
      return false;
    }

    const couponData = AVAILABLE_COUPONS[cleanCode];
    if (!couponData) {
      this.showToast(`Invalid promo or atelier code "${cleanCode}". Please verify and try again.`, 'error');
      return false;
    }

    if (couponData.type === 'flat' && this.getSubtotal() < 3000) {
      this.showToast('Code HORIZON500 requires minimum order of ₹3,000.', 'error');
      return false;
    }

    this.coupon = { code: cleanCode, ...couponData };
    this.save(STORAGE_KEYS.COUPON, this.coupon);
    this.notify('coupon_applied', { coupon: this.coupon });
    this.showToast(`Coupon applied! ${couponData.label}`, 'success');
    return true;
  }

  removeCoupon() {
    this.coupon = null;
    this.save(STORAGE_KEYS.COUPON, null);
    this.notify('coupon_removed', null);
    this.showToast('Coupon removed.', 'info');
  }

  // Wishlist operations
  toggleWishlist(productId, productName = "Product") {
    const exists = this.wishlist.includes(productId);
    if (exists) {
      this.wishlist = this.wishlist.filter(id => id !== productId);
      this.showToast(`Removed from wishlist: ${productName}`, 'info');
    } else {
      this.wishlist.push(productId);
      this.showToast(`Added to wishlist: ${productName}`, 'success');
    }
    this.save(STORAGE_KEYS.WISHLIST, this.wishlist);
    this.notify('wishlist_updated', { wishlist: this.wishlist });
    return !exists;
  }

  isInWishlist(productId) {
    return this.wishlist.includes(productId);
  }

  // User & Order operations
  createOrder(checkoutData) {
    const orderId = `TMZ-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder = {
      orderId,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      items: [...this.cart],
      subtotal: this.getSubtotal(),
      shipping: this.getShippingFee(),
      discount: this.getDiscount(),
      total: this.getTotal(),
      status: "Confirmed",
      carrier: "Blue Dart Express",
      trackingId: `BLU-${Math.floor(100000000 + Math.random() * 900000000)}`,
      shippingAddress: checkoutData.address,
      paymentMethod: checkoutData.paymentMethod
    };

    this.orders.unshift(newOrder);
    this.save(STORAGE_KEYS.ORDERS, this.orders);
    this.clearCart();
    this.notify('order_created', { order: newOrder });
    return newOrder;
  }

  showToast(message, type = 'info') {
    let container = document.getElementById('tamyiz-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'tamyiz-toast-container';
      container.className = 'tamyiz-toast-container';
      // Screen readers announce new messages.
      container.setAttribute('role', 'status');
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }

    // The same message again (e.g. the button pressed twice) replaces the old one instead of stacking.
    for (const old of container.querySelectorAll('.tamyiz-toast')) {
      if (old.querySelector('.toast-message')?.textContent === String(message)) old.remove();
    }

    const toast = document.createElement('div');
    toast.className = `tamyiz-toast tamyiz-toast-${type}`;
    const dot = document.createElement('span');
    dot.className = `toast-dot ${type === 'success' ? 'toast-dot-red' : ''}`;
    const text = document.createElement('span');
    text.className = 'toast-message';
    text.textContent = String(message); // text, not HTML: messages can contain server or product text
    toast.append(dot, text);

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('toast-show');
    });

    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 300);
    }, Math.min(8000, Math.max(3200, String(message).length * 60))); // longer messages stay long enough to read
  }
}

export const store = new Store();
