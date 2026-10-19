/**
 * SAPFORCE 3D Futuristic Organic Sculpture
 * Recreates the metallic chrome aerodynamic bone/ring with glowing neon lime-green liquid core
 * and orbital thin wire rings in WebGL using Three.js.
 */

import * as THREE from 'three';

export class SaasOrb {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.sculptureGroup = null;
    this.chromeTorus = null;
    this.limeCore = null;
    this.stoneCore = null;
    this.orbitRing1 = null;
    this.orbitRing2 = null;
    this.particles = null;

    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotationX = 0;
    this.targetRotationY = 0;
    this.animId = null;
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 500;
    const height = this.container.clientHeight || 500;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    this.camera.position.z = 8.5;

    // 3. Renderer with high DPI & Alpha
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

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.4);
    dirLight1.position.set(5, 8, 6);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xD4F63D, 2.0); // Neon lime rim light
    dirLight2.position.set(-6, -4, 4);
    this.scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xD4F63D, 3.5, 12);
    pointLight.position.set(0, 0, 1);
    this.scene.add(pointLight);

    // 5. Build Sculpture Group
    this.sculptureGroup = new THREE.Group();
    this.scene.add(this.sculptureGroup);

    this.createObjects();
    this.setupEvents();
    this.animate();
  }

  createObjects() {
    // A. Liquid Neon Lime Jelly Core
    const coreGeo = new THREE.SphereGeometry(1.65, 64, 64);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0xD4F63D,
      emissive: 0x98D800,
      emissiveIntensity: 0.45,
      roughness: 0.12,
      metalness: 0.1,
      transmission: 0.65,
      transparent: true,
      opacity: 0.92,
      ior: 1.45
    });
    this.limeCore = new THREE.Mesh(coreGeo, coreMat);
    this.sculptureGroup.add(this.limeCore);

    // B. Inner textured stone/ceramic sphere with dark marbling
    const stoneGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x55585D,
      roughness: 0.85,
      metalness: 0.25
    });
    this.stoneCore = new THREE.Mesh(stoneGeo, stoneMat);
    this.sculptureGroup.add(this.stoneCore);

    // C. Chrome Aerodynamic Metallic Bone Ring (Torus Knot)
    const torusGeo = new THREE.TorusKnotGeometry(2.1, 0.42, 160, 32, 2, 3);
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xE8ECF0,
      metalness: 0.96,
      roughness: 0.18,
      envMapIntensity: 2.0
    });
    this.chromeTorus = new THREE.Mesh(torusGeo, chromeMat);
    this.chromeTorus.scale.set(0.95, 0.95, 0.95);
    this.sculptureGroup.add(this.chromeTorus);

    // D. Orbiting Ring 1: Silver Chrome Thin Wire
    const ring1Geo = new THREE.TorusGeometry(3.2, 0.035, 16, 120);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0xD8DDE2,
      metalness: 0.98,
      roughness: 0.1
    });
    this.orbitRing1 = new THREE.Mesh(ring1Geo, ring1Mat);
    this.orbitRing1.rotation.x = Math.PI * 0.38;
    this.orbitRing1.rotation.y = Math.PI * 0.15;
    this.sculptureGroup.add(this.orbitRing1);

    // E. Orbiting Ring 2: Neon Lime Thin Wire
    const ring2Geo = new THREE.TorusGeometry(3.4, 0.028, 16, 120);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0xD4F63D,
      wireframe: false
    });
    this.orbitRing2 = new THREE.Mesh(ring2Geo, ring2Mat);
    this.orbitRing2.rotation.x = -Math.PI * 0.32;
    this.orbitRing2.rotation.z = Math.PI * 0.25;
    this.sculptureGroup.add(this.orbitRing2);

    // F. Ambient Floating Particles
    const particleCount = 70;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 3.6 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      positions[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      positions[i * 3 + 1] = radius * Math.sin(phi);
      positions[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      const isLime = Math.random() > 0.4;
      colors[i * 3] = isLime ? 0.83 : 0.85;
      colors[i * 3 + 1] = isLime ? 0.96 : 0.88;
      colors[i * 3 + 2] = isLime ? 0.24 : 0.92;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    this.particles = new THREE.Points(particleGeo, particleMat);
    this.sculptureGroup.add(this.particles);
  }

  setupEvents() {
    window.addEventListener('resize', () => this.onResize(), { passive: true });

    window.addEventListener('mousemove', (e) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      this.mouseX = (e.clientX - windowHalfX) / windowHalfX;
      this.mouseY = (e.clientY - windowHalfY) / windowHalfY;

      this.targetRotationY = this.mouseX * 0.55;
      this.targetRotationX = this.mouseY * 0.35;
    }, { passive: true });
  }

  onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    this.animId = requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    // Smooth inertia mouse tracking
    this.sculptureGroup.rotation.y += (this.targetRotationY - this.sculptureGroup.rotation.y) * 0.05;
    this.sculptureGroup.rotation.x += (this.targetRotationX - this.sculptureGroup.rotation.x) * 0.05;

    // Organic continuous rotation
    if (this.chromeTorus) {
      this.chromeTorus.rotation.y += delta * 0.22;
      this.chromeTorus.rotation.z += delta * 0.12;
    }

    // Gentle liquid pulsation
    if (this.limeCore) {
      const scale = 1.0 + Math.sin(elapsed * 1.8) * 0.035;
      this.limeCore.scale.set(scale, scale, scale);
    }

    // Orbital ring rotations
    if (this.orbitRing1) {
      this.orbitRing1.rotation.z += delta * 0.35;
    }
    if (this.orbitRing2) {
      this.orbitRing2.rotation.z -= delta * 0.45;
    }

    // Particle swirl
    if (this.particles) {
      this.particles.rotation.y += delta * 0.15;
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }
    if (this.renderer && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
