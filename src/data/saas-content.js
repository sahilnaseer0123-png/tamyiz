/**
 * SAPFORCE SaaS Platform Content & Data Models
 */

export const saasBrand = {
  name: "SAPFORCE.",
  tagline: "The design software that keeps your flow with AI tools and built-in graphics",
  badgeUsers: "2M+",
  badgeSubtext: "World active user",
  pillars: [
    { id: "01", label: "Web based", detail: "Zero install. Runs at 120FPS directly in any modern browser powered by WebGPU." },
    { id: "02", label: "Collaborative", detail: "Multiplayer flow. Conflict-free CRDT engine allows 50+ designers on one canvas." },
    { id: "03", label: "Real-time", detail: "Sub-millisecond neural vector synthesis with streaming bezier curve generation." }
  ]
};

export const services = [
  {
    id: "neural-vector",
    num: "01",
    title: "Neural Vector Synthesis",
    tagline: "Generative vector art with pristine mathematical precision.",
    description: "Type natural language prompts to generate clean, scalable SVGs with optimal node counts. No messy auto-tracing—pure, editable bezier handles.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    stats: "0.2s generation latency • 100% SVG standard"
  },
  {
    id: "webgpu-3d",
    num: "02",
    title: "Real-Time 3D Mesh Engine",
    tagline: "Parametric chrome, glass, and liquid shaders on your artboard.",
    description: "Render complex organic geometry, PBR physical reflections, and subsurface scattering directly alongside 2D UI designs without leaving your flow.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>`,
    stats: "60 FPS rendering • PBR metallic & dielectric"
  },
  {
    id: "multiplayer-crdt",
    num: "03",
    title: "Zero-Latency Multiplayer",
    tagline: "Collaborative presence with instant state synchronization.",
    description: "Experience peer-to-peer WebRTC synchronization with automated conflict resolution. Edit simultaneously with your global team with zero stutter.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    stats: "< 12ms global latency • E2E encrypted"
  },
  {
    id: "code-export",
    num: "04",
    title: "Automated Code Synthesis",
    tagline: "From canvas artwork to production React, Vue & Tailwind.",
    description: "Every shape, gradient, and 3D mesh is automatically translated into clean, tree-shakable TypeScript components, CSS tokens, and Three.js scenes.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
    stats: "Next.js, Vite, Tailwind & Three.js ready"
  }
];

export const pricingPlans = [
  {
    id: "starter",
    name: "Starter",
    badge: "Free Forever",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Ideal for individual designers and creative hobbyists exploring AI-powered tools.",
    features: [
      "Up to 3 active canvas artboards",
      "50 Neural AI generations per month",
      "Standard WebGPU 3D rendering",
      "SVG and PNG asset export (up to 2K)",
      "Community Discord support"
    ],
    cta: "Start Free",
    popular: false
  },
  {
    id: "pro",
    name: "Pro Studio",
    badge: "Most Popular",
    monthlyPrice: 24,
    annualPrice: 19,
    description: "Designed for professional product designers and fast-moving studio teams.",
    features: [
      "Unlimited infinite artboards",
      "Unlimited Neural AI generations",
      "Real-time 4K 3D PBR materials & HDRI",
      "Multiplayer collaboration (up to 10 peers)",
      "Instant React, Tailwind & Three.js export",
      "Priority GPU cluster allocation"
    ],
    cta: "Upgrade to Pro",
    popular: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    badge: "Scale & Security",
    monthlyPrice: 79,
    annualPrice: 64,
    description: "Dedicated private cloud infrastructure and custom AI model fine-tuning for enterprises.",
    features: [
      "Everything in Pro Studio",
      "Custom brand AI fine-tuning & style guides",
      "Dedicated high-speed edge GPU instances",
      "SAML 2.0 / Okta SSO & SOC2 Type II compliance",
      "Unlimited team seats & audit logs",
      "24/7 dedicated solutions architect"
    ],
    cta: "Request Demo",
    popular: false
  }
];

export const testimonials = [
  {
    quote: "SAPFORCE replaced three disconnected tools in our workflow. The ability to prompt a 3D organic sculpture and immediately tweak its bezier handles in the same canvas is pure sorcery.",
    author: "Elena Rostova",
    role: "Head of Product Design, Linear",
    avatar: "/assets/images/avatars/user1.jpg"
  },
  {
    quote: "The zero-latency multiplayer and WebGPU engine feel faster than native desktop apps. Our team's design-to-production velocity increased by 3.4x in the first quarter.",
    author: "Marcus Chen",
    role: "Staff Creative Technologist, Vercel",
    avatar: "/assets/images/avatars/user2.jpg"
  },
  {
    quote: "The aesthetic, the typography, and the seamless code export make SAPFORCE the sharpest design software on the market today. It's built for craftsmen.",
    author: "Aria Sterling",
    role: "Design System Lead, Stripe",
    avatar: "/assets/images/avatars/user3.jpg"
  }
];

export const insightsArticles = [
  {
    tag: "Engineering",
    title: "How We Built a 120FPS Parametric 3D Engine in Browser WebGPU",
    summary: "A deep technical dive into WebAssembly shaders, memory virtualization, and sub-pixel antialiasing.",
    date: "Oct 14, 2026 • 6 min read"
  },
  {
    tag: "Design Theory",
    title: "The Death of Static UI: Embracing Organic Spatial Motion",
    summary: "Why leading SaaS platforms are moving from flat rectangles to kinetic chrome and fluid light aesthetics.",
    date: "Oct 08, 2026 • 4 min read"
  },
  {
    tag: "Case Study",
    title: "Scaling Multiplayer CRDTs for 2 Million Concurrent Creators",
    summary: "How our distributed edge cluster maintains sub-12ms sync without merge conflicts across continents.",
    date: "Sep 28, 2026 • 8 min read"
  }
];
