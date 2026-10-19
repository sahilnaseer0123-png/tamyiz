/**
 * SAPFORCE SaaS Application Controller
 * Manages 3D Hero Sculpture, Interactive Studio Canvas, Multiplayer Cursors,
 * Pricing calculator, and Modals.
 */

import { SaasOrb } from './saas-orb.js';
import { saasBrand, services, pricingPlans, testimonials, insightsArticles } from '../data/saas-content.js';

export class SaasApp {
  constructor() {
    this.orb = null;
    this.isAnnualPricing = false;
    this.activeStudioTool = 'select';
    this.simulatedCursors = [];
    this.cursorAnimId = null;

    this.init();
  }

  init() {
    this.renderPage();
    this.init3DHero();
    this.setupStudioPlayground();
    this.setupMultiplayerSimulation();
    this.setupModals();
    this.setupSmoothScroll();
  }

  renderPage() {
    const appRoot = document.getElementById('app');
    if (!appRoot) return;

    appRoot.innerHTML = `
      <!-- Fixed Header with Pill Navigation -->
      <header class="saas-header">
        <div class="saas-header-inner">
          <nav class="saas-nav-pill" aria-label="Main Navigation">
            <a href="#services" class="saas-nav-link">Services</a>
            <a href="#pricing" class="saas-nav-link">Pricing</a>
            <a href="#about" class="saas-nav-link">About</a>
            <a href="#insights" class="saas-nav-link">Insights</a>
            <a href="#contact" class="saas-nav-link">Contact</a>
          </nav>

          <div class="saas-header-right">
            <a href="javascript:void(0)" class="saas-login-link" onclick="window.saasApp.openModal('auth-login')">Login</a>
            <button class="saas-btn-get-started" onclick="window.saasApp.openModal('auth-signup')">
              <span>Get Started</span>
              <span class="arrow">→</span>
            </button>
          </div>
        </div>
      </header>

      <!-- HERO SECTION (Matching User's Attached Screenshot) -->
      <section class="saas-hero-section" id="hero">
        <!-- Giant Bold Hero Header -->
        <h1 class="saas-hero-giant-title">${saasBrand.name}</h1>

        <!-- Central 3D Sculpture with Three.js WebGL & Reference Backdrop -->
        <div class="saas-hero-sculpture-wrap" id="sculpture-wrap">
          <img src="/assets/images/sculpture-crop.png" alt="3D Sculpture Reference Texture" class="saas-sculpture-ref-overlay" />
          <div id="saas-3d-canvas-container" class="saas-3d-canvas-container"></div>
        </div>

        <!-- Bottom Grid: Left (Users + Value Prop) & Right (01/02/03 + Circular Button) -->
        <div class="saas-hero-bottom-grid">
          <!-- Left Block -->
          <div class="saas-hero-left">
            <div class="saas-users-badge">
              <div class="saas-avatars-cluster">
                <img src="/assets/images/avatars/user1.jpg" alt="Active user" class="saas-avatar-img" />
                <img src="/assets/images/avatars/user2.jpg" alt="Active user" class="saas-avatar-img" />
                <img src="/assets/images/avatars/user3.jpg" alt="Active user" class="saas-avatar-img" />
              </div>
              <div class="saas-users-meta">
                <span class="saas-users-count">${saasBrand.badgeUsers}</span>
                <span class="saas-users-label">${saasBrand.badgeSubtext}</span>
              </div>
            </div>

            <p class="saas-hero-value-prop">
              ${saasBrand.tagline}
            </p>

            <div class="saas-dotted-underline">
              ••••••••••••••••••••••••••••••••••••••••
            </div>
          </div>

          <!-- Right Block -->
          <div class="saas-hero-right">
            <div class="saas-features-list">
              ${saasBrand.pillars.map(p => `
                <div class="saas-feature-item">
                  <span>${p.label}</span>
                  <span class="saas-feature-num">/${p.id}</span>
                </div>
              `).join('')}
            </div>

            <!-- Glowing Neon Lime Circular "How it works?" Button -->
            <button class="saas-btn-how-it-works" id="btn-how-it-works" onclick="window.saasApp.openModal('how-it-works')">
              <span class="play-icon"></span>
              <span>How it works?</span>
            </button>
          </div>
        </div>
      </section>

      <!-- INTERACTIVE IN-BROWSER SAAS STUDIO ("THE SOFTWARE") -->
      <section class="saas-studio-section" id="studio">
        <div class="saas-studio-container">
          <div class="saas-studio-header">
            <span style="color: var(--saas-lime); font-family: var(--saas-font-sub); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block; margin-bottom: 0.75rem;">Interactive Studio Canvas</span>
            <h2>Experience The Flow.</h2>
            <p>Try the real-time AI design software directly in your browser. Move shapes, generate 3D elements, and see live multiplayer sync in action.</p>
          </div>

          <!-- Studio App Window -->
          <div class="saas-app-window">
            <!-- Studio Window Topbar -->
            <div class="saas-app-topbar">
              <div class="saas-app-dots">
                <div class="saas-app-dot red"></div>
                <div class="saas-app-dot yellow"></div>
                <div class="saas-app-dot green"></div>
              </div>

              <div class="saas-doc-title">
                <span>Untitled_Design_01.sap</span>
                <span class="saas-live-badge">● LIVE WEBGPU 120FPS</span>
              </div>

              <div class="saas-app-actions">
                <div class="saas-collaborators-row">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: #27C93F; display: inline-block;"></span>
                  <span>4 Peers Online</span>
                </div>
                <button class="saas-btn-synthesize" style="padding: 0.35rem 0.9rem; font-size: 0.75rem;" onclick="window.saasApp.exportDesignCode()">Export Code</button>
              </div>
            </div>

            <!-- Studio Window Body -->
            <div class="saas-app-body">
              <!-- Left Toolbar -->
              <aside class="saas-tools-bar">
                <button class="saas-tool-btn active" title="Select (V)" onclick="window.saasApp.selectTool('select', this)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7 18 3-7 7-3L3 3z"/></svg>
                </button>
                <button class="saas-tool-btn" title="AI Generate (A)" onclick="window.saasApp.selectTool('ai', this)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </button>
                <button class="saas-tool-btn" title="3D Mesh (3D)" onclick="window.saasApp.selectTool('3d', this)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                </button>
                <button class="saas-tool-btn" title="Vector Pen (P)" onclick="window.saasApp.selectTool('pen', this)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>
                </button>
                <button class="saas-tool-btn" title="Color Swatch (C)" onclick="window.saasApp.toggleColorSwatch(this)">
                  <span style="width: 14px; height: 14px; border-radius: 50%; background: var(--saas-lime); display: inline-block;"></span>
                </button>
              </aside>

              <!-- Center Interactive Artboard Canvas -->
              <div class="saas-artboard-canvas" id="saas-artboard">
                <!-- Draggable Interactive Design Card 1 -->
                <div class="saas-canvas-card active" id="canvas-card-1" style="top: 15%; left: 18%;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <span style="font-size: 0.72rem; color: var(--saas-lime); font-family: var(--saas-font-sub); font-weight: 700; text-transform: uppercase;">Node #894 • 3D Mesh</span>
                    <span style="font-size: 0.75rem; color: #888;">Live</span>
                  </div>
                  <h4 style="font-family: var(--saas-font-display); font-size: 1.2rem; color: #FFFFFF; margin-bottom: 0.5rem;">Organic Chrome Sphere</h4>
                  <p style="font-size: 0.8rem; color: #A0A5B0; line-height: 1.5; margin-bottom: 1.25rem;">Parametric liquid lime core with PBR metallic reflections rendered at 120FPS.</p>
                  <div style="display: flex; gap: 0.5rem;">
                    <span style="background: rgba(212, 246, 61, 0.2); color: var(--saas-lime); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700;">GLTF 3D</span>
                    <span style="background: rgba(255, 255, 255, 0.1); color: #FFF; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.7rem;">Shader PBR</span>
                  </div>
                </div>

                <!-- Draggable Interactive Design Card 2 -->
                <div class="saas-canvas-card" id="canvas-card-2" style="top: 35%; right: 12%;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <span style="font-size: 0.72rem; color: #27C93F; font-family: var(--saas-font-sub); font-weight: 700; text-transform: uppercase;">Component • Button</span>
                    <span style="font-size: 0.75rem; color: #888;">CSS Token</span>
                  </div>
                  <div style="background: var(--saas-lime); color: #000; padding: 0.75rem 1.25rem; border-radius: 9999px; font-family: var(--saas-font-display); font-weight: 800; font-size: 0.85rem; text-align: center; margin-bottom: 0.8rem; cursor: pointer;">
                    ▶ How it works?
                  </div>
                  <div style="font-size: 0.72rem; color: #777;">Auto-synced to Figma Tokens & Next.js</div>
                </div>

                <!-- Simulated Multiplayer Cursors will be injected here -->
                <div id="sim-cursors-layer"></div>

                <!-- Floating AI Prompt Bar -->
                <div class="saas-canvas-ai-bar">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--saas-lime)" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  <input type="text" id="ai-prompt-input" class="saas-prompt-input" placeholder="Generate with AI: e.g. 'Liquid chrome button', 'Neon lime dashboard card'..." value="Metallic organic ring with glowing lime core" />
                  <button class="saas-btn-synthesize" onclick="window.saasApp.generateAiElement()">Synthesize</button>
                </div>
              </div>

              <!-- Right Inspector Panel -->
              <aside class="saas-inspector-panel">
                <div class="saas-inspector-group">
                  <h4>Transform</h4>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 0.4rem 0.6rem; border-radius: 4px;">
                      <span style="color: #666; font-size: 0.7rem;">X:</span> <strong id="inspect-x">520px</strong>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 0.4rem 0.6rem; border-radius: 4px;">
                      <span style="color: #666; font-size: 0.7rem;">Y:</span> <strong id="inspect-y">180px</strong>
                    </div>
                  </div>
                </div>

                <div class="saas-inspector-group">
                  <h4>Material Shading</h4>
                  <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #AAA; margin-bottom: 0.2rem;">
                        <span>Metalness (Chrome)</span>
                        <span id="metal-val">0.96</span>
                      </div>
                      <input type="range" min="0" max="1" step="0.05" value="0.96" style="width: 100%; accent-color: var(--saas-lime);" oninput="document.getElementById('metal-val').textContent = this.value;" />
                    </div>

                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #AAA; margin-bottom: 0.2rem;">
                        <span>Neon Lime Emission</span>
                        <span id="glow-val">0.85</span>
                      </div>
                      <input type="range" min="0" max="1" step="0.05" value="0.85" style="width: 100%; accent-color: var(--saas-lime);" oninput="document.getElementById('glow-val').textContent = this.value;" />
                    </div>
                  </div>
                </div>

                <div class="saas-inspector-group">
                  <h4>Multiplayer Stream</h4>
                  <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.75rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <span style="width: 6px; height: 6px; border-radius: 50%; background: #FFBD2E;"></span>
                      <span>Elena (Tokyo) editing Node #894</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <span style="width: 6px; height: 6px; border-radius: 50%; background: #27C93F;"></span>
                      <span>Kenji (SF) added button token</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <!-- SERVICES / CORE CAPABILITIES -->
      <section class="saas-services-section" id="services">
        <div class="saas-section-header">
          <div>
            <span style="color: var(--saas-grey-text); font-family: var(--saas-font-sub); font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; display: inline-block; margin-bottom: 0.5rem;">Core Architecture</span>
            <h2>Services & Flow Engine</h2>
          </div>
          <button class="saas-btn-get-started" onclick="window.saasApp.openModal('how-it-works')">View Architecture Specs →</button>
        </div>

        <div class="saas-services-grid">
          ${services.map(s => `
            <div class="saas-service-card">
              <div class="saas-service-card-top">
                <div class="saas-service-icon">${s.icon}</div>
                <span class="saas-service-num">/${s.num}</span>
              </div>
              <h3 class="saas-service-title">${s.title}</h3>
              <div class="saas-service-tagline">${s.tagline}</div>
              <p class="saas-service-desc">${s.description}</p>
              <div class="saas-service-stats">${s.stats}</div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- PRICING SECTION -->
      <section class="saas-pricing-section" id="pricing">
        <div class="saas-pricing-header">
          <span style="font-family: var(--saas-font-sub); font-size: 0.82rem; font-weight: 700; text-transform: uppercase; color: var(--saas-grey-text); letter-spacing: 0.08em;">Predictable Scale</span>
          <h2>Transparent Pricing</h2>
          <p>Deploy SAPFORCE across your design organization with zero seat lock-in.</p>

          <!-- Monthly / Annual Toggle -->
          <div class="saas-toggle-wrap">
            <button class="saas-toggle-btn ${!this.isAnnualPricing ? 'active' : ''}" id="toggle-monthly" onclick="window.saasApp.setPricing(false)">Monthly</button>
            <button class="saas-toggle-btn ${this.isAnnualPricing ? 'active' : ''}" id="toggle-annual" onclick="window.saasApp.setPricing(true)">Annual (Save 20%)</button>
          </div>
        </div>

        <div class="saas-pricing-grid" id="pricing-grid">
          ${this.renderPricingCardsHtml()}
        </div>
      </section>

      <!-- ABOUT & CUSTOMER TESTIMONIALS -->
      <section class="saas-insights-section" id="about">
        <div class="saas-section-header">
          <div>
            <span style="color: var(--saas-grey-text); font-family: var(--saas-font-sub); font-size: 0.85rem; font-weight: 700; text-transform: uppercase;">Loved by 2,000,000+ Designers</span>
            <h2>Global Proof</h2>
          </div>
        </div>

        <div class="saas-testimonials-grid">
          ${testimonials.map(t => `
            <div class="saas-test-card">
              <p class="saas-test-quote">"${t.quote}"</p>
              <div class="saas-test-author">
                <img src="${t.avatar}" alt="${t.author}" class="saas-test-avatar" />
                <div>
                  <div style="font-family: var(--saas-font-display); font-weight: 800; font-size: 0.95rem;">${t.author}</div>
                  <div style="font-size: 0.75rem; color: var(--saas-grey-text);">${t.role}</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Insights / Tech Blog -->
        <div class="saas-section-header" id="insights" style="margin-top: 5rem;">
          <div>
            <span style="color: var(--saas-grey-text); font-family: var(--saas-font-sub); font-size: 0.85rem; font-weight: 700; text-transform: uppercase;">Engineering & Theory</span>
            <h2>Latest Insights</h2>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem;">
          ${insightsArticles.map(a => `
            <div style="background: #FFFFFF; border: 1px solid var(--saas-border); border-radius: 14px; padding: 2rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <span style="font-family: var(--saas-font-sub); font-size: 0.75rem; font-weight: 700; color: var(--saas-black); background: var(--saas-lime); padding: 0.2rem 0.5rem; border-radius: 4px; display: inline-block; margin-bottom: 1rem;">${a.tag}</span>
                <h4 style="font-family: var(--saas-font-display); font-size: 1.15rem; font-weight: 800; margin-bottom: 0.75rem; line-height: 1.35;">${a.title}</h4>
                <p style="font-size: 0.85rem; color: #555; line-height: 1.6; margin-bottom: 1.5rem;">${a.summary}</p>
              </div>
              <div style="font-size: 0.75rem; color: var(--saas-grey-text); border-top: 1px solid var(--saas-border); padding-top: 1rem;">${a.date}</div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- FOOTER -->
      <footer class="saas-footer" id="contact">
        <div class="saas-footer-inner">
          <div class="saas-footer-top">
            <div class="saas-footer-brand">
              <h3>${saasBrand.name}</h3>
              <p>${saasBrand.tagline}. Designed for craft, engineered for zero latency.</p>
              <div style="margin-top: 1.5rem;">
                <button class="saas-btn-get-started" style="background: var(--saas-lime); color: #000;" onclick="window.saasApp.openModal('auth-signup')">
                  <span>Start Creating Free</span>
                  <span class="arrow">→</span>
                </button>
              </div>
            </div>

            <div style="display: flex; gap: 4rem; flex-wrap: wrap;">
              <div>
                <h4 style="font-family: var(--saas-font-sub); font-size: 0.85rem; text-transform: uppercase; margin-bottom: 1rem; color: #FFF;">Product</h4>
                <div style="display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.85rem; color: #888;">
                  <a href="#studio" style="color: inherit; text-decoration: none;">Interactive Studio</a>
                  <a href="#services" style="color: inherit; text-decoration: none;">Neural Vectorizer</a>
                  <a href="#services" style="color: inherit; text-decoration: none;">WebGPU 3D Engine</a>
                  <a href="#pricing" style="color: inherit; text-decoration: none;">Pricing Plans</a>
                </div>
              </div>

              <div>
                <h4 style="font-family: var(--saas-font-sub); font-size: 0.85rem; text-transform: uppercase; margin-bottom: 1rem; color: #FFF;">Company</h4>
                <div style="display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.85rem; color: #888;">
                  <a href="#about" style="color: inherit; text-decoration: none;">About SAPFORCE</a>
                  <a href="#insights" style="color: inherit; text-decoration: none;">Engineering Blog</a>
                  <a href="javascript:void(0)" onclick="window.saasApp.openModal('contact-modal')" style="color: inherit; text-decoration: none;">Contact Sales</a>
                </div>
              </div>
            </div>
          </div>

          <div class="saas-footer-bottom">
            <div>© 2026 SAPFORCE Inc. All rights reserved. Built with WebGPU & Three.js.</div>
            <div>Web based /01 · Collaborative /02 · Real-time /03</div>
          </div>
        </div>
      </footer>

      <!-- MODALS: HOW IT WORKS & AUTH -->
      <div class="saas-modal-backdrop" id="saas-modal">
        <div class="saas-modal-card" id="saas-modal-content">
          <!-- Dynamic modal content -->
        </div>
      </div>
    `;
  }

  // 3D Hero Sculpture using Three.js
  init3DHero() {
    const container = document.getElementById('saas-3d-canvas-container');
    if (container) {
      if (this.orb) this.orb.destroy();
      this.orb = new SaasOrb(container);
    }
  }

  // Interactive Studio Setup
  setupStudioPlayground() {
    // Draggable card 1
    const card1 = document.getElementById('canvas-card-1');
    const card2 = document.getElementById('canvas-card-2');
    const artboard = document.getElementById('saas-artboard');

    this.makeDraggable(card1, artboard, 'inspect-x', 'inspect-y');
    this.makeDraggable(card2, artboard);
  }

  makeDraggable(el, container, coordXId = null, coordYId = null) {
    if (!el || !container) return;

    let isDragging = false;
    let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;

    el.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialLeft = el.offsetLeft;
      initialTop = el.offsetTop;
      document.querySelectorAll('.saas-canvas-card').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const newLeft = Math.max(10, Math.min(container.clientWidth - el.clientWidth - 10, initialLeft + dx));
      const newTop = Math.max(10, Math.min(container.clientHeight - el.clientHeight - 10, initialTop + dy));

      el.style.left = `${newLeft}px`;
      el.style.top = `${newTop}px`;

      if (coordXId) {
        const xEl = document.getElementById(coordXId);
        if (xEl) xEl.textContent = `${Math.round(newLeft)}px`;
      }
      if (coordYId) {
        const yEl = document.getElementById(coordYId);
        if (yEl) yEl.textContent = `${Math.round(newTop)}px`;
      }
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  // Simulated Multiplayer Cursors (Elena & Kenji)
  setupMultiplayerSimulation() {
    const container = document.getElementById('sim-cursors-layer');
    if (!container) return;

    this.simulatedCursors = [
      { id: 'c1', name: 'Elena (Tokyo)', color: '#FFBD2E', x: 220, y: 140, tx: 350, ty: 220 },
      { id: 'c2', name: 'Kenji (SF)', color: '#27C93F', x: 480, y: 300, tx: 380, ty: 180 }
    ];

    container.innerHTML = this.simulatedCursors.map(c => `
      <div class="saas-sim-cursor" id="${c.id}" style="top: ${c.y}px; left: ${c.x}px;">
        <svg class="saas-cursor-pointer" viewBox="0 0 24 24" fill="${c.color}">
          <path d="M3 3l7 18 3-7 7-3L3 3z"/>
        </svg>
        <span class="saas-cursor-tag" style="background: ${c.color};">${c.name}</span>
      </div>
    `).join('');

    // Animate cursor wandering organically
    setInterval(() => {
      const artboard = document.getElementById('saas-artboard');
      if (!artboard) return;

      this.simulatedCursors.forEach(c => {
        c.tx = Math.random() * (artboard.clientWidth - 160) + 40;
        c.ty = Math.random() * (artboard.clientHeight - 120) + 40;

        const el = document.getElementById(c.id);
        if (el) {
          el.style.transform = `translate(${c.tx - c.x}px, ${c.ty - c.y}px)`;
        }
      });
    }, 3200);
  }

  // AI Generation on Artboard
  generateAiElement() {
    const input = document.getElementById('ai-prompt-input');
    const prompt = input ? input.value.trim() : "Custom Element";
    const artboard = document.getElementById('saas-artboard');

    const newCard = document.createElement('div');
    newCard.className = 'saas-canvas-card active';
    newCard.style.top = `${Math.random() * 180 + 100}px`;
    newCard.style.left = `${Math.random() * 220 + 80}px`;
    newCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
        <span style="font-size: 0.7rem; color: var(--saas-lime); font-family: var(--saas-font-sub); font-weight: 700;">AI SYNTHESIZED</span>
        <button style="color: #888; background: none; border: none; cursor: pointer;" onclick="this.parentElement.parentElement.remove()">✕</button>
      </div>
      <h4 style="font-family: var(--saas-font-display); font-size: 1.05rem; color: #FFF; margin-bottom: 0.4rem;">${prompt.slice(0, 26)}...</h4>
      <div style="height: 60px; background: radial-gradient(circle, #D4F63D 0%, transparent 70%); border-radius: 8px; margin-bottom: 0.75rem; opacity: 0.65;"></div>
      <span style="font-size: 0.7rem; color: #AAA;">PBR Shader • WebGPU Ready</span>
    `;

    artboard.appendChild(newCard);
    this.makeDraggable(newCard, artboard);
    this.showToast(`Synthesized "${prompt}" in 0.18s!`);
  }

  exportDesignCode() {
    this.openModal('export-code');
  }

  selectTool(toolName, btn) {
    this.activeStudioTool = toolName;
    document.querySelectorAll('.saas-tool-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this.showToast(`Active Tool: ${toolName.toUpperCase()}`);
  }

  toggleColorSwatch(btn) {
    this.showToast('Color set to #D4F63D (Neon Lime)');
  }

  // Pricing Switch
  setPricing(isAnnual) {
    this.isAnnualPricing = isAnnual;
    const btnM = document.getElementById('toggle-monthly');
    const btnA = document.getElementById('toggle-annual');
    if (btnM && btnA) {
      btnM.classList.toggle('active', !isAnnual);
      btnA.classList.toggle('active', isAnnual);
    }
    const grid = document.getElementById('pricing-grid');
    if (grid) grid.innerHTML = this.renderPricingCardsHtml();
  }

  renderPricingCardsHtml() {
    return pricingPlans.map(p => {
      const price = this.isAnnualPricing ? p.annualPrice : p.monthlyPrice;
      return `
        <div class="saas-plan-card ${p.popular ? 'popular' : ''}">
          <span class="saas-plan-badge">${p.badge}</span>
          <h3 style="font-family: var(--saas-font-display); font-size: 1.6rem; font-weight: 900; margin-bottom: 0.5rem;">${p.name}</h3>
          <p style="font-size: 0.85rem; color: ${p.popular ? '#AAA' : '#666'}; min-height: 40px; margin-bottom: 1.5rem;">${p.description}</p>
          <div class="saas-plan-price">
            $${price}<span>/month</span>
          </div>
          ${this.isAnnualPricing && price > 0 ? `<div style="font-size: 0.75rem; color: var(--saas-lime); font-weight: 700; margin-top: -0.5rem; margin-bottom: 1rem;">Billed annually ($${price * 12}/yr)</div>` : ''}

          <ul class="saas-plan-features">
            ${p.features.map(f => `
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${p.popular ? 'var(--saas-lime)' : 'var(--saas-black)'}" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>${f}</span>
              </li>
            `).join('')}
          </ul>

          <button class="${p.popular ? 'saas-btn-how-it-works' : 'saas-btn-get-started'}" style="${p.popular ? 'width: 100%; height: 50px; border-radius: 9999px; font-size: 0.9rem;' : 'width: 100%; justify-content: center;'}" onclick="window.saasApp.selectPlan('${p.id}')">
            ${p.cta}
          </button>
        </div>
      `;
    }).join('');
  }

  selectPlan(planId) {
    this.openModal('checkout-plan', { planId });
  }

  // Modals management
  setupModals() {
    const backdrop = document.getElementById('saas-modal');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.closeModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }

  openModal(type, data = {}) {
    const backdrop = document.getElementById('saas-modal');
    const content = document.getElementById('saas-modal-content');
    if (!backdrop || !content) return;

    if (type === 'how-it-works') {
      content.innerHTML = `
        <button class="saas-modal-close-btn" onclick="window.saasApp.closeModal()">✕</button>
        <div style="padding: 2.75rem;">
          <span style="font-family: var(--saas-font-sub); font-size: 0.78rem; font-weight: 700; color: var(--saas-black); background: var(--saas-lime); padding: 0.25rem 0.65rem; border-radius: 9999px; display: inline-block; margin-bottom: 1rem;">HOW IT WORKS</span>
          <h2 style="font-family: var(--saas-font-display); font-size: 2.2rem; font-weight: 900; margin-bottom: 1rem; line-height: 1.2;">Design at the Speed of Thought.</h2>
          <p style="font-size: 0.95rem; color: #555; line-height: 1.6; margin-bottom: 2rem;">SAPFORCE combines WebGPU 3D parametric geometry with generative vector synthesis to eliminate the boundary between concept and code.</p>

          <div style="display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2rem;">
            <div style="display: flex; gap: 1rem; align-items: flex-start;">
              <div style="width: 36px; height: 36px; border-radius: 50%; background: #000; color: var(--saas-lime); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; flex-shrink: 0;">01</div>
              <div>
                <h4 style="font-family: var(--saas-font-display); font-size: 1.05rem; font-weight: 800; margin-bottom: 0.25rem;">Prompt & Parametric Shaping</h4>
                <p style="font-size: 0.85rem; color: #666; line-height: 1.5;">Type your desired design tokens or manipulate physical 3D vertices directly on the artboard.</p>
              </div>
            </div>

            <div style="display: flex; gap: 1rem; align-items: flex-start;">
              <div style="width: 36px; height: 36px; border-radius: 50%; background: #000; color: var(--saas-lime); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; flex-shrink: 0;">02</div>
              <div>
                <h4 style="font-family: var(--saas-font-display); font-size: 1.05rem; font-weight: 800; margin-bottom: 0.25rem;">Multiplayer Co-Creation</h4>
                <p style="font-size: 0.85rem; color: #666; line-height: 1.5;">Invite your team with instant live cursors, zero merge conflicts, and millisecond state sync.</p>
              </div>
            </div>

            <div style="display: flex; gap: 1rem; align-items: flex-start;">
              <div style="width: 36px; height: 36px; border-radius: 50%; background: #000; color: var(--saas-lime); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; flex-shrink: 0;">03</div>
              <div>
                <h4 style="font-family: var(--saas-font-display); font-size: 1.05rem; font-weight: 800; margin-bottom: 0.25rem;">Direct Production Code Delivery</h4>
                <p style="font-size: 0.85rem; color: #666; line-height: 1.5;">1-click export to React, Tailwind CSS tokens, SVG vectors, and Three.js WebGL scenes.</p>
              </div>
            </div>
          </div>

          <button class="saas-btn-how-it-works" style="width: 100%; height: 50px; border-radius: 9999px;" onclick="window.saasApp.closeModal(); document.getElementById('studio').scrollIntoView({behavior:'smooth'});">
            Launch Interactive Canvas Demo
          </button>
        </div>
      `;
    } else if (type === 'auth-login' || type === 'auth-signup') {
      const isSignup = type === 'auth-signup';
      content.innerHTML = `
        <button class="saas-modal-close-btn" onclick="window.saasApp.closeModal()">✕</button>
        <div style="padding: 2.75rem;">
          <h2 style="font-family: var(--saas-font-display); font-size: 2rem; font-weight: 900; margin-bottom: 0.5rem;">
            ${isSignup ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <p style="color: #666; font-size: 0.9rem; margin-bottom: 1.75rem;">
            Join over 2,000,000 creators designing at the speed of thought.
          </p>

          <form onsubmit="event.preventDefault(); window.saasApp.handleAuthSubmit();">
            ${isSignup ? `
              <div style="margin-bottom: 1rem;">
                <label style="display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.4rem;">Full Name</label>
                <input type="text" required placeholder="Sahil Sharma" style="width: 100%; padding: 0.8rem 1rem; border: 1px solid #DDD; border-radius: 8px; font-size: 0.9rem; outline: none;" />
              </div>
            ` : ''}

            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.4rem;">Email Address</label>
              <input type="email" required placeholder="sahil@sapforce.design" value="creator@sapforce.design" style="width: 100%; padding: 0.8rem 1rem; border: 1px solid #DDD; border-radius: 8px; font-size: 0.9rem; outline: none;" />
            </div>

            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.4rem;">Password</label>
              <input type="password" required value="••••••••••••" style="width: 100%; padding: 0.8rem 1rem; border: 1px solid #DDD; border-radius: 8px; font-size: 0.9rem; outline: none;" />
            </div>

            <button type="submit" class="saas-btn-how-it-works" style="width: 100%; height: 48px; border-radius: 9999px; font-size: 0.9rem;">
              ${isSignup ? 'Get Started Free' : 'Sign In To Studio'}
            </button>
          </form>
        </div>
      `;
    } else if (type === 'export-code') {
      content.innerHTML = `
        <button class="saas-modal-close-btn" onclick="window.saasApp.closeModal()">✕</button>
        <div style="padding: 2.5rem;">
          <span style="font-family: var(--saas-font-sub); font-size: 0.75rem; font-weight: 700; color: var(--saas-lime); background: #000; padding: 0.2rem 0.6rem; border-radius: 4px; display: inline-block; margin-bottom: 0.8rem;">READY FOR PRODUCTION</span>
          <h3 style="font-family: var(--saas-font-display); font-size: 1.6rem; font-weight: 900; margin-bottom: 1rem;">Export Generated React Code</h3>
          <pre style="background: #111; color: #D4F63D; padding: 1.25rem; border-radius: 10px; font-size: 0.78rem; overflow-x: auto; max-height: 260px; line-height: 1.5;"><code>import { MeshStandardMaterial } from 'three';

export function SapforceSphereComponent() {
  return (
    &lt;mesh geometry={torusGeometry}&gt;
      &lt;meshStandardMaterial
        color="#E8ECF0"
        metalness={0.96}
        roughness={0.18}
      /&gt;
    &lt;/mesh&gt;
  );
}</code></pre>
          <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
            <button class="saas-btn-how-it-works" style="flex-grow: 1; height: 46px; border-radius: 9999px; font-size: 0.85rem;" onclick="window.saasApp.copyCodeToClipboard()">
              Copy Component Code
            </button>
            <button class="saas-btn-get-started" onclick="window.saasApp.closeModal()">Done</button>
          </div>
        </div>
      `;
    } else if (type === 'checkout-plan') {
      content.innerHTML = `
        <button class="saas-modal-close-btn" onclick="window.saasApp.closeModal()">✕</button>
        <div style="padding: 2.75rem; text-align: center;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--saas-lime); color: #000; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem auto;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 style="font-family: var(--saas-font-display); font-size: 1.8rem; font-weight: 900; margin-bottom: 0.5rem;">Plan Activated!</h2>
          <p style="color: #666; font-size: 0.95rem; margin-bottom: 2rem;">Your workspace has been provisioned with WebGPU hardware acceleration and unlimited AI synthesis tokens.</p>
          <button class="saas-btn-how-it-works" style="width: 100%; height: 48px; border-radius: 9999px;" onclick="window.saasApp.closeModal(); document.getElementById('studio').scrollIntoView({behavior:'smooth'});">
            Launch Studio Workspace
          </button>
        </div>
      `;
    }

    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    const backdrop = document.getElementById('saas-modal');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  handleAuthSubmit() {
    this.closeModal();
    this.showToast("Signed in successfully! Welcome to SAPFORCE.");
  }

  copyCodeToClipboard() {
    this.showToast("Code copied to clipboard!");
    this.closeModal();
  }

  showToast(message) {
    let t = document.getElementById('saas-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'saas-toast';
      t.style.cssText = 'position: fixed; bottom: 2rem; right: 2rem; z-index: 9999; background: #0A0A0A; color: #FFFFFF; border-left: 3px solid #D4F63D; padding: 0.9rem 1.4rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; box-shadow: 0 16px 40px rgba(0,0,0,0.3); transition: all 0.3s ease; opacity: 0; transform: translateY(16px);';
      document.body.appendChild(t);
    }
    t.textContent = message;
    t.style.opacity = '1';
    t.style.transform = 'translateY(0)';
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(16px)';
    }, 2800);
  }

  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').slice(1);
        const el = document.getElementById(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  window.saasApp = new SaasApp();
});
