/**
 * TAMYIZ™ Editions Catalog Page
 * Route: /editions
 */

import { products } from '../../data/products.js';
import { renderProductCardHtml } from './home-page.js';

export function renderEditionsPage(appInstance) {
  const filteredList = appInstance.getFilteredAndSortedProducts();

  return `
    <div class="tamyiz-page-editions">
      <!-- DEDICATED HEADER BANNER -->
      <section class="tamyiz-page-header py-10 md:py-12">
        <div class="container">
          <div class="tamyiz-page-header-inner">
            <span class="tamyiz-page-badge mb-2">
              CURATED PUBLICATIONS &amp; DIGITAL SYSTEMS // EDITION 01
            </span>
            <h1 class="tamyiz-page-title mb-2.5">
              The Digital Archive
            </h1>
            <p class="tamyiz-page-description leading-relaxed mb-0">
              Authoritative e-books, Notion operating frameworks, and architectural UI design systems. 100% digital, instant download, lifetime updates.
            </p>
          </div>
        </div>
      </section>

      <!-- CATALOG CONTROLS & PRODUCT GRID -->
      <section id="editions-catalog" class="tamyiz-section pt-6 pb-16 scroll-mt-24" style="background: var(--color-offwhite);">
        <div class="container">
          <!-- Compact Filter, Search, and Counter Toolbar Wrapper -->
          <div class="space-y-3.5 mb-6">
            <!-- Row 1: Category Filter Pills Row -->
            <div class="tamyiz-filter-pills flex flex-wrap items-center gap-2 m-0 p-0" role="group" aria-label="Category filters">
              <button class="tamyiz-filter-pill py-2 px-4 text-xs ${appInstance.activeCategory === 'all' ? 'active' : ''}" onclick="window.tamyizApp.filterCategory('all', this)">
                All Digital Editions (8)
              </button>
              <button class="tamyiz-filter-pill py-2 px-4 text-xs ${appInstance.activeCategory === 'ebooks' ? 'active' : ''}" onclick="window.tamyizApp.filterCategory('ebooks', this)">
                E-Books &amp; Monographs
              </button>
              <button class="tamyiz-filter-pill py-2 px-4 text-xs ${appInstance.activeCategory === 'notion' ? 'active' : ''}" onclick="window.tamyizApp.filterCategory('notion', this)">
                Notion &amp; Productivity Templates
              </button>
              <button class="tamyiz-filter-pill py-2 px-4 text-xs ${appInstance.activeCategory === 'design' ? 'active' : ''}" onclick="window.tamyizApp.filterCategory('design', this)">
                UI/UX &amp; Design Systems
              </button>
            </div>

            <!-- Row 2: Search & Sort Row -->
            <div class="tamyiz-collection-toolbar flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full m-0 p-0">
              <div class="tamyiz-search-box relative flex-1 w-full sm:min-w-[240px] sm:max-w-md">
                <span class="tamyiz-search-icon absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
                <input
                  type="text"
                  id="artifact-search-input"
                  class="tamyiz-search-input w-full pl-10 pr-9 py-2 px-4 bg-white border border-gray-300 rounded-full text-sm text-black placeholder-gray-400 transition-all focus:ring-2 focus:ring-black focus:outline-none focus:border-transparent"
                  placeholder="Search publications, chapters, materials, or keywords..."
                  value="${appInstance.searchQuery}"
                  oninput="window.tamyizApp.handleSearch(this.value)"
                  aria-label="Search publications and templates"
                />
                <button
                  id="artifact-search-clear"
                  class="tamyiz-search-clear ${appInstance.searchQuery ? 'visible' : ''}"
                  onclick="window.tamyizApp.clearSearch()"
                  aria-label="Clear search"
                >✕</button>
              </div>

              <div class="tamyiz-sort-box flex items-center gap-2">
                <label for="artifact-sort-select" class="tamyiz-sort-label">Sort:</label>
                <select id="artifact-sort-select" class="tamyiz-sort-select py-2 px-4 text-sm" onchange="window.tamyizApp.handleSort(this.value)">
                  <option value="featured" ${appInstance.sortBy === 'featured' ? 'selected' : ''}>Curated Archive</option>
                  <option value="price-asc" ${appInstance.sortBy === 'price-asc' ? 'selected' : ''}>Price: Low to High</option>
                  <option value="price-desc" ${appInstance.sortBy === 'price-desc' ? 'selected' : ''}>Price: High to Low</option>
                </select>
              </div>
            </div>

            <!-- Row 3: Results Counter -->
            <div class="tamyiz-collection-status pt-2 border-t border-neutral-200/80 mb-0" id="collection-status">
              ${appInstance.getCollectionStatusText()}
            </div>
          </div>

          <!-- Product Grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6) -->
          <div class="tamyiz-product-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="product-grid">
            ${filteredList.length === 0 ? `
              <div style="grid-column: 1 / -1; text-align: center; padding: 4.5rem 1.5rem; background: #FFFFFF; border: 1px dashed var(--color-border); border-radius: 6px;">
                <div style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; text-transform: uppercase; margin-bottom: 0.5rem;">
                  No Editions Found
                </div>
                <p style="color: var(--color-grey); font-size: 0.88rem; margin-bottom: 1.5rem;">
                  No publications or systems match your current search criteria.
                </p>
                <button class="tamyiz-btn-nav-outline" onclick="window.tamyizApp.resetAllFilters()">
                  Reset All Filters
                </button>
              </div>
            ` : filteredList.map(p => renderProductCardHtml(p, appInstance)).join('')}
          </div>
        </div>
      </section>
    </div>
  `;
}
