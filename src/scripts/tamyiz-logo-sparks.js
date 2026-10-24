/**
 * TAMYIZ™ Live Horizon Sparks Engine
 *
 * Simulates living incandescent sparks and embers drifting organically
 * from the disintegrating particle dispersion of the official TAMYIZ horizon emblem.
 *
 * - Zero boundary clipping: Sparks drift out freely into the open hero space.
 * - Multi-hue ruby/crimson/ember particle palette (#E1251B, #FF3333, #FF6B4A, #FFA07A, #FFE4B5).
 * - Organic turbulence: Gentle upward draft with lateral air currents and soft flickering.
 * - Interactive response: Cursor hover & movement emits trailing sparks; click creates a radiant burst.
 * - Battery & GPU optimized: Auto-throttles when off-screen or tab hidden.
 */

export class TamyizLogoSparks {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.isRunning = false;
    this.animId = null;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = 0;
    this.height = 0;
    this.lastTime = performance.now();
    this.spawnTimer = 0;
    this.isVisible = true;
    // Where the grain is, as fractions of the canvas: "x0,x1,y0,y1" (set on the canvas as data-zone).
    const z = (canvas.dataset.zone || '0.46,0.86,0.20,0.58').split(',').map(Number);
    this.zone = { x0: z[0], x1: z[1], y0: z[2], y1: z[3] };
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.init();
  }

  init() {
    this.resize();
    setTimeout(() => this.resize(), 100);
    this.bindEvents();
    this.setupObserver();

    // Immediately seed living ambient sparks on mount
    for (let i = 0; i < 22; i++) {
      this.spawnEmblemSpark();
    }

    this.start();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(rect.width, 320);
    this.height = Math.max(rect.height, 160);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.resetTransform();
    this.ctx.scale(this.dpr, this.dpr);
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize(), { passive: true });

    const parent = this.canvas.parentElement;
    if (parent) {
      // Interactive mouse sparks trail
      parent.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        if (mx >= 0 && mx <= this.width && my >= 0 && my <= this.height) {
          for (let i = 0; i < 2; i++) {
            this.spawnParticle(
              mx + (Math.random() - 0.5) * 16,
              my + (Math.random() - 0.5) * 16,
              true
            );
          }
        }
      }, { passive: true });

      // Click burst
      parent.addEventListener('click', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        this.burst(mx, my, 14);
      });

      // Hover warm burst
      parent.addEventListener('mouseenter', () => {
        for (let i = 0; i < 6; i++) {
          this.spawnEmblemSpark(true);
        }
      });
    }

    // Tab visibility handling
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else if (this.isVisible) {
        this.start();
      }
    });
  }

  setupObserver() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          this.isVisible = entry.isIntersecting;
          if (this.isVisible) {
            this.start();
          } else {
            this.pause();
          }
        });
      }, { threshold: 0.1 });

      this.observer.observe(this.canvas);
    }
  }

  // Spawns a spark from the red particle explosion zone of the original TAMYIZ logo
  spawnEmblemSpark(boost = false) {
    // In the original 1024x640 logo, the disintegrating particles occupy:
    // X: 45% to 88% of width
    // Y: 18% to 58% of height
    const x = this.width * (this.zone.x0 + Math.random() * (this.zone.x1 - this.zone.x0));
    const y = this.height * (this.zone.y0 + Math.random() * (this.zone.y1 - this.zone.y0));
    this.spawnParticle(x, y, boost);
  }

  spawnParticle(x, y, boost = false) {
    if (this.particles.length > 75) return;

    // Upward and rightward drift angle (-45° to -15° range)
    const angle = -Math.PI * (0.12 + Math.random() * 0.28);
    const speed = (boost ? 1.4 : 0.6) + Math.random() * (boost ? 2.2 : 1.3);

    const colorPalette = [
      { r: 225, g: 37, b: 27 },   // Signature TAMYIZ Red
      { r: 255, g: 46, b: 46 },   // Bright Ruby
      { r: 255, g: 82, b: 52 },   // Hot Amber-Red
      { r: 255, g: 120, b: 70 },  // Incandescent Ember
      { r: 255, g: 175, b: 110 }  // Golden Spark Core
    ];

    const chosenColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];

    this.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed + (0.3 + Math.random() * 0.4),
      vy: Math.sin(angle) * speed - (0.3 + Math.random() * 0.6),
      size: 1.1 + Math.random() * 2.6,
      baseAlpha: 0.75 + Math.random() * 0.25,
      alpha: 0.75 + Math.random() * 0.25,
      decay: 0.006 + Math.random() * 0.012,
      color: chosenColor,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.04 + Math.random() * 0.07,
      sparkleSpeed: 0.12 + Math.random() * 0.18,
      age: 0
    });
  }

  burst(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 2.8;
      const colorPalette = [
        { r: 225, g: 37, b: 27 },
        { r: 255, g: 60, b: 40 },
        { r: 255, g: 140, b: 80 },
        { r: 255, g: 220, b: 150 }
      ];
      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.4,
        size: 1.2 + Math.random() * 2.2,
        baseAlpha: 0.9,
        alpha: 0.9,
        decay: 0.015 + Math.random() * 0.02,
        color: col,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.08,
        sparkleSpeed: 0.2,
        age: 0
      });
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();

    const loop = (now) => {
      if (!this.isRunning) return;

      const dt = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;

      this.ctx.clearRect(0, 0, this.width, this.height);

      // Ambient spark generation
      this.spawnTimer += dt;
      if (this.spawnTimer >= 0.07) {
        this.spawnTimer = 0;
        this.spawnEmblemSpark();
        if (Math.random() > 0.4) {
          this.spawnEmblemSpark();
        }
      }

      // Update & render particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.age += dt * 60;
        p.x += p.vx + Math.sin(p.wobble) * 0.35;
        p.y += p.vy;
        p.wobble += p.wobbleSpeed;
        p.alpha -= p.decay;

        // Micro sparkle modulation
        const twinkle = 0.85 + Math.sin(p.age * p.sparkleSpeed) * 0.15;
        const currentAlpha = Math.max(0, p.alpha * twinkle);

        // Remove if faded or out of visible envelope
        if (currentAlpha <= 0 || p.x > this.width + 50 || p.y < -50 || p.y > this.height + 50) {
          this.particles.splice(i, 1);
          continue;
        }

        const rgbStr = `${p.color.r}, ${p.color.g}, ${p.color.b}`;

        this.ctx.save();
        this.ctx.beginPath();
        const renderRadius = Math.max(0.6, p.size * (0.6 + currentAlpha * 0.4));
        this.ctx.arc(p.x, p.y, renderRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${rgbStr}, ${currentAlpha})`;
        this.ctx.shadowColor = `rgba(225, 37, 27, ${currentAlpha * 0.85})`;
        this.ctx.shadowBlur = 8 + p.size * 2;
        this.ctx.fill();

        // Hot incandescent core for larger particles
        if (p.size > 2.0 && currentAlpha > 0.35) {
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, renderRadius * 0.45, 0, Math.PI * 2);
          this.ctx.fillStyle = `rgba(255, 250, 240, ${currentAlpha * 0.85})`;
          this.ctx.shadowBlur = 0;
          this.ctx.fill();
        }
        this.ctx.restore();
      }

      this.animId = requestAnimationFrame(loop);
    };

    this.animId = requestAnimationFrame(loop);
  }

  pause() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  destroy() {
    this.pause();
    this.particles = [];
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
