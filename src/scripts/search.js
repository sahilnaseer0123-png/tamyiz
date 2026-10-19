import { products } from '../data/products.js';

export class LiveSearch {
  constructor(modalElement, inputElement, resultsContainer) {
    this.modal = modalElement;
    this.input = inputElement;
    this.resultsContainer = resultsContainer;
    this.setupEvents();
  }

  setupEvents() {
    this.input.addEventListener('input', (e) => {
      this.handleSearch(e.target.value.trim());
    });

    // Keyboard shortcut Cmd+K or Ctrl+K or '/'
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.open();
      } else if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });

    const closeBtn = this.modal.querySelector('[data-close-search]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    const backdrop = this.modal.querySelector('.search-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => this.close());
    }

    // Quick tag clicks
    this.modal.querySelectorAll('.search-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const query = tag.getAttribute('data-query');
        this.input.value = query;
        this.handleSearch(query);
      });
    });
  }

  isOpen() {
    return this.modal.classList.contains('active');
  }

  open() {
    this.modal.classList.add('active');
    document.body.classList.add('modal-open');
    setTimeout(() => this.input.focus(), 50);
  }

  close() {
    this.modal.classList.remove('active');
    document.body.classList.remove('modal-open');
    this.input.value = '';
    this.renderDefault();
  }

  handleSearch(query) {
    if (!query) {
      this.renderDefault();
      return;
    }

    const q = query.toLowerCase();
    const matches = products.filter(p => {
      return p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.highlights.some(h => h.toLowerCase().includes(q));
    });

    this.renderResults(matches, query);
  }

  renderDefault() {
    this.resultsContainer.innerHTML = `
      <div class="search-empty-state">
        <p class="search-hint">Type product name, category, or material (e.g. "Hoodie", "Chronograph", "Parfum", "Cargo").</p>
      </div>
    `;
  }

  renderResults(results, query) {
    if (results.length === 0) {
      this.resultsContainer.innerHTML = `
        <div class="search-no-results">
          <p class="no-res-title">No distinct items found for "${query}"</p>
          <p class="no-res-subtitle">Try searching for "480GSM", "Ripstop", "Chronograph", or browse all products.</p>
          <a href="#shop" class="btn btn-primary btn-sm" onclick="window.tamyizApp.closeSearch()">Explore Catalog</a>
        </div>
      `;
      return;
    }

    this.resultsContainer.innerHTML = `
      <div class="search-count-label">${results.length} distinct item${results.length > 1 ? 's' : ''} found</div>
      <div class="search-results-grid">
        ${results.map(product => `
          <div class="search-item" data-product-id="${product.id}">
            <img src="${product.images[0]}" alt="${product.name}" class="search-item-thumb" />
            <div class="search-item-info">
              <span class="search-item-category">${product.category}</span>
              <h4 class="search-item-title">${product.name}</h4>
              <div class="search-item-pricing">
                <span class="price-current">₹${product.price.toLocaleString('en-IN')}</span>
                ${product.originalPrice ? `<span class="price-original">₹${product.originalPrice.toLocaleString('en-IN')}</span>` : ''}
                ${product.isSale ? `<span class="tag-sale">SALE</span>` : ''}
              </div>
            </div>
            <button class="btn-icon-link" aria-label="View product details">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        `).join('')}
      </div>
    `;

    // Attach click listeners
    this.resultsContainer.querySelectorAll('.search-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-product-id');
        this.close();
        window.location.hash = `#product/${id}`;
      });
    });
  }
}
