/**
 * TAMYIZ™ 3D Horizon & Particle Sculpture Engine
 * 
 * - Full-bleed unbounded canvas: No rectangular clipping or hard boundaries.
 * - Architectural rising horizon dome with deep obsidian finish and Signal Red inner core.
 * - Sculptural chrome ribbon sweeping around the dome (inspired by reference design).
 * - Graceful orbital wire loops (polished titanium & glowing Signal Red).
 * - Disintegrating particle field streaming out to the right (honoring TAMYIZ logo).
 * - Naturally integrates with editorial typography.
 */

import * as THREE from 'three';

export class TamyizHero3D {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.group = null;

    this.horizonMesh = null;
    this.ribbonMesh = null;
    this.innerCore = null;
    this.ring1 = null;
    this.ring2 = null;
    this.particles = null;

    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotX = 0;
    this.targetRotY = 0;
    this.isDragging = false;
    this.prevPointerX = 0;
    this.prevPointerY = 0;

    this.lastTime = performance.now();
    this.animId = null;

    this.init();
  }

  createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.85)');
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.25)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }

  init() {
    const width = this.container.clientWidth || 300;
    const height = this.container.clientHeight || 300;

    this.scene = new THREE.Scene();
    
    // Perspective camera with wide frustum and ample depth
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 9.8);

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.container.appendChild(this.renderer.domElement);

    // STUDIO LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    this.scene.add(ambientLight);

    // Key light: Crisp white specular from top-left
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(-6, 9, 8);
    this.scene.add(keyLight);

    // Fill light: Soft cool ambient fill from bottom-left
    const fillLight = new THREE.DirectionalLight(0xdde5ed, 1.5);
    fillLight.position.set(5, -6, 5);
    this.scene.add(fillLight);

    // Signal Red Rim / Accent Light from right (illuminates particle break & edge)
    const redAccentLight = new THREE.DirectionalLight(0xE1251B, 4.0);
    redAccentLight.position.set(8, 2, 4);
    this.scene.add(redAccentLight);

    // Secondary subtle red bounce from below
    const redBounce = new THREE.PointLight(0xE1251B, 2.0, 15);
    redBounce.position.set(0, -3, 2);
    this.scene.add(redBounce);

    // Main 3D Sculpture Group — positioned in lower half, below the giant title
    this.group = new THREE.Group();
    this.group.position.set(0, 0, 0);
    this.scene.add(this.group);

    this.createSculpture();
    this.applyLayout();
    this.setupEvents();
    this.animate();
  }

  createSculpture() {
    // 1. RISING HORIZON DOME (Tactile Obsidian Shell)
    // Modeled as a rising hemisphere (thetaLength = PI * 0.52)
    const horizonGeo = new THREE.SphereGeometry(1.65, 64, 48, 0, Math.PI * 2, 0, Math.PI * 0.52);
    const horizonMat = new THREE.MeshPhysicalMaterial({
      color: 0x121212,
      roughness: 0.28,
      metalness: 0.75,
      clearcoat: 0.35,
      clearcoatRoughness: 0.2,
      side: THREE.DoubleSide
    });
    this.horizonMesh = new THREE.Mesh(horizonGeo, horizonMat);
    this.horizonMesh.rotation.x = Math.PI * 0.5;
    this.group.add(this.horizonMesh);

    // 2. INNER LUMINOUS SIGNAL RED CORE (#E1251B)
    const coreGeo = new THREE.SphereGeometry(1.25, 32, 32);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0xE1251B,
      emissive: 0xE1251B,
      emissiveIntensity: 0.55,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85
    });
    this.innerCore = new THREE.Mesh(coreGeo, coreMat);
    this.group.add(this.innerCore);

    // 3. ARCHITECTURAL FLOWING CHROME RIBBON (Reference Design Aesthetic)
    // A sculpted curved ribbon looping gracefully around the dome
    const ribbonCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.1, 0.4, 0.5),
      new THREE.Vector3(-1.2, 1.3, -0.6),
      new THREE.Vector3(0.6, 1.4, 0.8),
      new THREE.Vector3(1.9, 0.1, -0.4),
      new THREE.Vector3(1.2, -1.2, 0.9),
      new THREE.Vector3(-0.8, -1.3, -0.5),
      new THREE.Vector3(-2.1, 0.4, 0.5)
    ], true);

    const ribbonGeo = new THREE.TubeGeometry(ribbonCurve, 80, 0.08, 16, true);
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0xF5F5F5,
      metalness: 0.98,
      roughness: 0.08,
      envMapIntensity: 1.5
    });
    this.ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    this.group.add(this.ribbonMesh);

    // 4. ORBITAL WIRE LOOP 1: Polished Titanium Ring
    const ring1Geo = new THREE.TorusGeometry(2.65, 0.024, 16, 140);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.95,
      roughness: 0.12
    });
    this.ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    this.ring1.rotation.x = Math.PI * 0.38;
    this.ring1.rotation.y = Math.PI * 0.14;
    this.group.add(this.ring1);

    // 5. ORBITAL WIRE LOOP 2: Laser Signal Red (#E1251B) Ring
    const ring2Geo = new THREE.TorusGeometry(2.85, 0.020, 16, 140);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0xE1251B
    });
    this.ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    this.ring2.rotation.x = -Math.PI * 0.32;
    this.ring2.rotation.z = Math.PI * 0.25;
    this.group.add(this.ring2);

    // 6. DISINTEGRATING PARTICLES (Signal Red & Ink Black from TAMYIZ Logo)
    const particleCount = 240;
    const pGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    const cols = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Stream towards +X (right side, exactly matching the TAMYIZ logo)
      const radius = 1.35 + Math.pow(Math.random(), 1.4) * 2.6;
      const angle = (Math.random() - 0.25) * Math.PI * 1.15; // Centered to the right hemisphere

      const px = radius * Math.cos(angle) + (Math.random() * 0.6);
      const py = (Math.random() - 0.5) * 2.8;
      const pz = (Math.random() - 0.5) * 1.8;

      pos[i * 3] = px;
      pos[i * 3 + 1] = py;
      pos[i * 3 + 2] = pz;

      // 45% Signal Red (#E1251B), 55% Deep Ink Black (#0B0B0B)
      const isRed = Math.random() < 0.45;
      cols[i * 3] = isRed ? 0.88 : 0.06;
      cols[i * 3 + 1] = isRed ? 0.14 : 0.06;
      cols[i * 3 + 2] = isRed ? 0.10 : 0.06;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(cols, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.12,
      map: this.createParticleTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    this.particles = new THREE.Points(pGeo, pMat);
    this.group.add(this.particles);
  }

  setupEvents() {
    this.applyLayout();
    this.resizeHandler = () => this.onResize();
    window.addEventListener('resize', this.resizeHandler, { passive: true });

    if (window.ResizeObserver && this.container) {
      this.resizeObserver = new ResizeObserver(() => this.onResize());
      this.resizeObserver.observe(this.container);
    }

    window.addEventListener('mousemove', (e) => {
      const halfX = window.innerWidth / 2;
      const halfY = window.innerHeight / 2;
      this.mouseX = (e.clientX - halfX) / halfX;
      this.mouseY = (e.clientY - halfY) / halfY;

      if (!this.isDragging) {
        this.targetRotY = this.mouseX * 0.35;
        this.targetRotX = this.mouseY * 0.20;
      }
    }, { passive: true });

    // Drag to rotate on canvas
    const dom = this.renderer.domElement;
    dom.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.prevPointerX;
      const dy = e.clientY - this.prevPointerY;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;

      this.group.rotation.y += dx * 0.006;
      this.group.rotation.x += dy * 0.006;
    });

    // Touch support for mobile devices
    dom.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.prevPointerX = e.touches[0].clientX;
        this.prevPointerY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - this.prevPointerX;
      const dy = e.touches[0].clientY - this.prevPointerY;
      this.prevPointerX = e.touches[0].clientX;
      this.prevPointerY = e.touches[0].clientY;

      this.group.rotation.y += dx * 0.006;
      this.group.rotation.x += dy * 0.006;
    }, { passive: true });
  }

  // Centered inside dedicated sculpture container on both desktop grid and mobile stack
  applyLayout() {
    const aspect = this.camera ? this.camera.aspect : 1;
    this.group.position.set(0, 0, 0);
    this.group.scale.setScalar(aspect > 1.05 ? 1.05 : 0.98);
  }

  onResize() {
    const w = this.container.clientWidth || 300;
    const h = this.container.clientHeight || 300;
    if (w === 0 || h === 0) return;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.applyLayout();
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  animate() {
    this.animId = requestAnimationFrame(() => this.animate());

    const now = performance.now();
    const delta = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    // Smooth inertia dampening toward target rotation when not dragging
    if (!this.isDragging) {
      this.group.rotation.y += (this.targetRotY - this.group.rotation.y) * 0.04;
      this.group.rotation.x += (this.targetRotX - this.group.rotation.x) * 0.04;
    }

    // Gentle continuous dynamic animations
    if (this.ring1) this.ring1.rotation.z += delta * 0.22;
    if (this.ring2) this.ring2.rotation.z -= delta * 0.28;
    if (this.ribbonMesh) this.ribbonMesh.rotation.y += delta * 0.15;
    if (this.particles) this.particles.rotation.y += delta * 0.09;

    // Subtle inner core breathing pulse
    if (this.innerCore) {
      const pulse = 1.0 + Math.sin(now * 0.002) * 0.04;
      this.innerCore.scale.set(pulse, pulse, pulse);
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
