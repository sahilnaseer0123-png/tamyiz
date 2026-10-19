/**
 * TAMYIZ™ Particle Horizon Canvas Engine
 * Simulates a rising horizon disc that disintegrates into floating black and signal-red particles
 * on the right side, dynamically responding to mouse interaction.
 */

export class ParticleHorizon {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.particles = [];
    this.particleCount = 140;
    this.mouse = { x: -1000, y: -1000, radius: 120 };
    this.animationFrameId = null;
    this.isRunning = false;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    this.setupEvents();
    this.start();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(this.dpr, this.dpr);

    // Horizon center & radius
    this.centerX = this.width > 768 ? this.width * 0.45 : this.width * 0.5;
    this.centerY = this.height * 0.72;
    this.radius = Math.min(this.width * 0.32, 280);
  }

  createParticles() {
    this.particles = [];
    // Adjust density based on screen width
    const count = this.width < 640 ? 80 : 160;

    for (let i = 0; i < count; i++) {
      this.particles.push(this.generateParticle());
    }
  }

  generateParticle(startFromEdge = false) {
    // Generate particle near the right hemisphere of the horizon
    const angle = (Math.PI * 0.9) + Math.random() * (Math.PI * 1.1); // right arc
    const dist = startFromEdge 
      ? this.radius * (0.85 + Math.random() * 0.3)
      : this.radius * (0.8 + Math.random() * 0.85);

    const x = this.centerX + Math.cos(angle) * dist + (Math.random() * 60);
    const y = this.centerY + Math.sin(angle) * (dist * 0.7) - (Math.random() * 30);

    // 70% black, 30% Signal Red (#E1251B)
    const isRed = Math.random() < 0.32;
    const color = isRed ? '#E1251B' : '#0B0B0B';
    const size = isRed ? (Math.random() * 2.8 + 1.2) : (Math.random() * 3.5 + 1.2);

    return {
      x,
      y,
      originX: x,
      originY: y,
      vx: (Math.random() * 0.8 + 0.3) * (isRed ? 1.3 : 1.0),
      vy: (Math.random() * -0.7 - 0.2),
      size,
      alpha: Math.random() * 0.7 + 0.3,
      maxAlpha: Math.random() * 0.8 + 0.2,
      color,
      isRed,
      life: 0,
      maxLife: Math.random() * 180 + 120
    };
  }

  setupEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
    }, { passive: true });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    }, { passive: true });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    }, { passive: true });

    // IntersectionObserver to pause when hero is scrolled out
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.start();
        } else {
          this.stop();
        }
      });
    }, { threshold: 0.1 });

    observer.observe(this.canvas);
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.loop();
    }
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  loop() {
    if (!this.isRunning) return;

    this.update();
    this.render();
    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  update() {
    const pLen = this.particles.length;
    for (let i = 0; i < pLen; i++) {
      const p = this.particles[i];

      p.life++;
      p.x += p.vx;
      p.y += p.vy;

      // Mouse repulsion
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.mouse.radius) {
        const force = (1 - dist / this.mouse.radius) * 2;
        p.x += (dx / dist) * force;
        p.y += (dy / dist) * force;
      }

      // Fade out near end of life
      if (p.life > p.maxLife * 0.7) {
        p.alpha -= 0.015;
      }

      // Respawn when dead or drifted away
      if (p.life >= p.maxLife || p.alpha <= 0.05 || p.x > this.width + 40 || p.y < -40) {
        this.particles[i] = this.generateParticle(true);
      }
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw subtle background dotted grid
    this.drawDotGrid();

    // 2. Draw rising horizon arc (black solid semi-crescent on the left)
    this.drawHorizonArc();

    // 3. Draw disintegrating particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  drawDotGrid() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(138, 138, 138, 0.12)';
    const spacing = 36;
    for (let x = spacing / 2; x < this.width; x += spacing) {
      for (let y = spacing / 2; y < this.height; y += spacing) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 0.8, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    this.ctx.restore();
  }

  drawHorizonArc() {
    this.ctx.save();

    // Left hemisphere: solid rising semi-circle silhouette
    this.ctx.beginPath();
    // Arc from PI (left) to 1.6 * PI (top)
    this.ctx.arc(this.centerX, this.centerY, this.radius, Math.PI, 1.62 * Math.PI, false);
    // Line down to baseline and close
    this.ctx.lineTo(this.centerX, this.centerY);
    this.ctx.lineTo(this.centerX - this.radius, this.centerY);
    this.ctx.closePath();
    this.ctx.fillStyle = '#0B0B0B';
    this.ctx.fill();

    // Transition area: subtle fading particles density along the disintegration line
    const grad = this.ctx.createRadialGradient(
      this.centerX, this.centerY, this.radius * 0.7,
      this.centerX + 40, this.centerY - 40, this.radius * 1.05
    );
    grad.addColorStop(0, 'rgba(11, 11, 11, 0.95)');
    grad.addColorStop(0.65, 'rgba(11, 11, 11, 0.5)');
    grad.addColorStop(1, 'rgba(225, 37, 27, 0)');

    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius, 1.62 * Math.PI, 1.88 * Math.PI, false);
    this.ctx.lineTo(this.centerX, this.centerY);
    this.ctx.closePath();
    this.ctx.fillStyle = grad;
    this.ctx.fill();

    this.ctx.restore();
  }
}
