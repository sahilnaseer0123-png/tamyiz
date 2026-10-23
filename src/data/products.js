export const products = [
  // ==========================================
  // 1. E-BOOKS & MONOGRAPHS
  // ==========================================
  {
    id: "tmz-dig-001",
    slug: "tamyiz-monograph-01-the-architecture-of-distinction",
    name: "TAMYIZ Monograph 01: The Architecture of Distinction",
    tagline: "Architectural study on modern silhouette, Kashmiri material roots, and quiet luxury",
    category: "E-Books & Monographs",
    categoryCode: "ebooks",
    price: 499,
    originalPrice: 999,
    badge: "BESTSELLER • 140-PAGE E-BOOK",
    isBestSeller: true,
    isNew: false,
    isDigital: true,
    rating: 5.0,
    reviewsCount: 54,
    images: [
      "/assets/images/products/book-monograph-01.webp",
      "/assets/images/products/book-monograph-01-sample.webp"
    ],
    variants: {
      type: "Format",
      options: ["PDF + EPUB Bundle", "Kindle EPUB"],
      prices: {
        "PDF + EPUB Bundle": { price: 499, originalPrice: 999 },
        "Kindle EPUB": { price: 399, originalPrice: 799 }
      }
    },
    colors: ["Obsidian / Signal Red"],
    description: "An uncompromising 140-page editorial monograph examining the intersection of architectural minimalism, Himalayan textile heritage, and high-density garment engineering. Authored by the TAMYIZ atelier in Sopore, Kashmir. Includes detailed pattern studies, fabric density analysis, and the philosophy of distinction in an age of mass commoditization.",
    specifications: [
      { label: "Format", value: "Instant Digital Download (PDF + EPUB bundle)" },
      { label: "Pagination", value: "140 Pages (Retina Full-Color Architectural Layouts)" },
      { label: "Typography", value: "Swiss Asymmetric Grid / Print-Ready 300DPI" },
      { label: "Reader Support", value: "Apple Books, Kindle, Adobe Acrobat, iPad, Android" },
      { label: "Delivery", value: "Instant download link + permanent email backup" },
      { label: "Updates", value: "Lifetime revision updates included free" }
    ],
    tableOfContents: [
      "Chapter 01: The Monolith Silhouette — Geometry, Form & Drapery",
      "Chapter 02: Alpine Resilience — The Sopore Material Manifesto",
      "Chapter 03: The Anti-Hype Doctrine — Longevity Over Trend Cycles",
      "Chapter 04: The Tactile Archive — Micro-Details & Particle Identity",
      "Chapter 05: Building For Distinction — The TAMYIZ Manifesto"
    ],
    fileSpecs: "Instant PDF & EPUB Download • 140 Pages • Mobile & Kindle Optimized • Lifetime Updates",
    sampleExcerpt: {
      chapter: "Chapter 01 / The Monolith Silhouette",
      subtitle: "Geometry, Form & Drapery",
      text: "The silhouette defines the physical boundary where structure meets sky. In minimalist architecture, form is reductive, defined by precise geometry and light. The concrete facade stands against the landscape, a deliberate presence that shapes space and perception. It is the language of lines, planes, and the subtle dance of shadow, defining the essence of the structure's identity. Here, the silhouette becomes the narrative itself—a silent dialogue between raw material and designed space, capturing the clarity of form in a landscape of quiet contemplation. Distinction is not loud; it is undeniable weight and proportion."
    },
    careInstructions: "Store downloaded PDF and EPUB files in your preferred cloud reader (Apple Books, Google Play Books, or Kindle). Files are DRM-free for your personal devices with lifetime revision access.",
    relatedIds: ["tmz-dig-002", "tmz-dig-008"],
    highlights: [
      "Instant PDF & EPUB download sent immediately upon order",
      "140 pages of deep editorial, pattern engineering, and philosophy",
      "Includes high-resolution printable book plates",
      "Lifetime updates and revised digital editions included"
    ]
  },
  {
    id: "tmz-dig-002",
    slug: "the-solo-creator-and-digital-craft-playbook",
    name: "The Solo Creator & Digital Craft Playbook",
    tagline: "Architectural blueprint for building high-margin digital products & independent luxury brands",
    category: "E-Books & Monographs",
    categoryCode: "ebooks",
    price: 699,
    originalPrice: 1299,
    badge: "E-BOOK + WORKBOOK",
    isBestSeller: true,
    isNew: true,
    isDigital: true,
    rating: 4.9,
    reviewsCount: 42,
    images: [
      "/assets/images/products/book-playbook-02.webp",
      "/assets/images/products/book-playbook-02-sample.webp"
    ],
    variants: {
      type: "Format",
      options: ["PDF + Checklists", "EPUB"],
      prices: {
        "PDF + Checklists": { price: 699, originalPrice: 1299 },
        "EPUB": { price: 499, originalPrice: 899 }
      }
    },
    colors: ["Titanium / Signal Red"],
    description: "The tactical, non-fluff operational manual for solo engineers, designers, and brand builders. Details the end-to-end architecture used to design, code, launch, and monetize premium digital products with single-person efficiency. Includes duplicate-ready Notion workspace templates, pricing psychology models, and brand token design systems.",
    specifications: [
      { label: "Deliverables", value: "88-Page Tactical PDF Guide + Companion Interactive Workbook" },
      { label: "Focus", value: "Brand Positioning, Solo Architecture & High-Ticket Monetization" },
      { label: "Delivery", value: "Instant Direct Download + Private Invite Link" },
      { label: "License", value: "Personal & Commercial Single-Operator License" },
      { label: "Compatibility", value: "Apple Books, Kindle, Notion, Tablet & Desktop" },
      { label: "Support", value: "Direct Concierge WhatsApp Access for Implementation Q&A" }
    ],
    tableOfContents: [
      "Chapter 01: The Independent Atelier — Positioning & Philosophy",
      "Chapter 02: System Architecture — Workflows, Visual Language & Tech Stack",
      "Chapter 03: High-Ticket Digital Craft — Designing Products People Keep",
      "Chapter 04: Operations & Supply — From Zero to Frictionless Commerce",
      "Chapter 05: Audience Architecture — Cultivating Resolute Collectors"
    ],
    fileSpecs: "Instant PDF + Interactive Workbook • 88 Pages • Actionable Checklists • Lifetime Access",
    sampleExcerpt: {
      chapter: "Chapter 02 / System Architecture",
      subtitle: "Workflow Integration & Visual Language",
      text: "A scalable framework for integrated creative workflows across platforms, defining methodologies for visual consistency and collaborative execution. Discipline precedes scale. When you build as a solo operator, your tools are your team. You do not design in ad-hoc chaos; you engineer tokens, components, and constraints. Every touchpoint—from your typography hierarchy to your payment confirmation—must exude the gravitas of a century-old atelier."
    },
    careInstructions: "Open the interactive PDF in Acrobat or GoodNotes to fill out the companion worksheets. Store EPUB in Apple Books or Kindle.",
    relatedIds: ["tmz-dig-001", "tmz-dig-004"],
    highlights: [
      "Step-by-step systems to build high-margin digital products",
      "Real-world pricing and launch psychology blueprints",
      "Zero fluff—concise, architectural, actionable guidance",
      "Includes editable creator worksheets and checklists"
    ]
  },
  {
    id: "tmz-dig-003",
    slug: "ethical-technology-and-deep-research-compendium",
    name: "Ethical Technology & Deep Research: The Student's Compendium",
    tagline: "Methodologies for disciplined scholarly inquiry, Islamic ethics in tech, and rigorous knowledge synthesis",
    category: "E-Books & Monographs",
    categoryCode: "ebooks",
    price: 449,
    originalPrice: 899,
    badge: "RESEARCH MONOGRAPH • 110 PAGES",
    isBestSeller: false,
    isNew: true,
    isDigital: true,
    rating: 5.0,
    reviewsCount: 38,
    images: [
      "/assets/images/products/book-research-compendium-03.webp",
      "/assets/images/products/book-monograph-01-sample.webp"
    ],
    variants: {
      type: "Format",
      options: ["PDF + EPUB", "Annotated Edition"],
      prices: {
        "PDF + EPUB": { price: 449, originalPrice: 899 },
        "Annotated Edition": { price: 599, originalPrice: 1199 }
      }
    },
    colors: ["Slate Black / Red Foil"],
    description: "Authored from our Sopore atelier with deep roots in Islamic scholarship and modern computational systems. A 110-page master guide for students, researchers, and technologists on cultivating intellectual depth, navigating AI ethics, and synthesizing enduring knowledge systems.",
    specifications: [
      { label: "Pagination", value: "110 Pages (Annotated with Classical Citations)" },
      { label: "Format", value: "Vector PDF + Reflowable EPUB + Kindle KFX" },
      { label: "Curriculum", value: "Islamic Epistemology, Ethical Tech Boundaries, Synthesis" },
      { label: "Delivery", value: "Instant Direct Download + Email Delivery" },
      { label: "License", value: "Lifetime Personal & Academic License" }
    ],
    tableOfContents: [
      "Chapter 01: Epistemic Discipline — Beyond Algorithmic Fluff",
      "Chapter 02: Islamic Ethics in Modern Technology & AI",
      "Chapter 03: The Deep Reading Protocol — Critical Note Architecture",
      "Chapter 04: Primary Source Verification & Synthesis",
      "Chapter 05: The Long View — Building Enduring Intellectual Capital"
    ],
    fileSpecs: "Instant PDF & EPUB Download • 110 Pages • Academic Citations Included • Lifetime Updates",
    sampleExcerpt: {
      chapter: "Chapter 01 / Epistemic Discipline",
      subtitle: "Beyond Algorithmic Fluff",
      text: "Knowledge in the classical tradition was never mere information accumulation; it was spiritual and intellectual responsibility. In an age drowned in synthetic noise and ephemeral feeds, deep research requires conscious friction. You must deliberately step away from the surface feed to interrogate foundational assumptions with rigorous ethical honesty. Technology is a tool of consequence; discipline precedes discovery."
    },
    careInstructions: "Highlight and annotate directly on iPad or Kindle. Includes printable PDF cheat sheets for literature review.",
    relatedIds: ["tmz-dig-001", "tmz-dig-007"],
    highlights: [
      "Deep integration of classical Islamic scholarship and modern computing",
      "Actionable research workflows for students and scholars",
      "Proven methods to resist distraction and synthesize long-form papers",
      "Lifetime updates for academic revisions"
    ]
  },
  {
    id: "tmz-dig-004",
    slug: "zero-to-one-digital-product-launch-blueprint",
    name: "Zero-to-One Digital Product Launch Blueprint",
    tagline: "Step-by-step launch methodology from initial validation to first 1,000 paid collectors",
    category: "E-Books & Monographs",
    categoryCode: "ebooks",
    price: 549,
    originalPrice: 1099,
    badge: "FOUNDER'S E-BOOK GUIDE",
    isBestSeller: false,
    isNew: true,
    isDigital: true,
    rating: 4.8,
    reviewsCount: 31,
    images: [
      "/assets/images/products/book-launch-blueprint-04.webp",
      "/assets/images/products/book-playbook-02-sample.webp"
    ],
    variants: {
      type: "Format",
      options: ["PDF + Checklists", "EPUB"],
      prices: {
        "PDF + Checklists": { price: 549, originalPrice: 1099 },
        "EPUB": { price: 449, originalPrice: 899 }
      }
    },
    colors: ["Industrial Charcoal / Signal Red"],
    description: "A battle-tested 94-page tactical guide covering luxury brand positioning, high-converting minimal checkout UX, pricing psychology in Indian Rupees & Global Currencies, and zero-ad organic distribution.",
    specifications: [
      { label: "Pagination", value: "94 Pages of Dense, Tactical Guidance" },
      { label: "Deliverable", value: "Interactive PDF + EPUB + 12 Launch Day Checklists" },
      { label: "Core Topics", value: "Pre-Launch Teasers, Pricing Psychology, Frictionless UX" },
      { label: "Delivery", value: "Instant Download & WhatsApp Link Backup" },
      { label: "Audience", value: "Solo Developers, Digital Creators & Indie Founders" }
    ],
    tableOfContents: [
      "Chapter 01: Product Conception & Radical Differentiation",
      "Chapter 02: High-Fidelity Prototyping in Hours, Not Weeks",
      "Chapter 03: The Luxury Positioning & Pricing Matrix",
      "Chapter 04: Frictionless Single-Page Checkout Architecture",
      "Chapter 05: Launch Day Mechanics & Retaining Lifetime Collectors"
    ],
    fileSpecs: "Instant PDF & EPUB Download • 94 Pages • 12 Launch Day Checklists Included",
    sampleExcerpt: {
      chapter: "Chapter 03 / Luxury Positioning & Pricing",
      subtitle: "The Architecture of Perceived Value",
      text: "Commodity brands compete on discounts and volume. Flagship digital studios compete on clarity, craft, and unwavering discipline. When you package your insight into an uncompromisingly structured artifact, pricing ceases to be an arithmetic calculation—it becomes an alignment of respect. Never discount your standards to appease casual browsers."
    },
    careInstructions: "Compatible with all PDF and EPUB readers. Checklists can be printed or exported into your digital notebook.",
    relatedIds: ["tmz-dig-002", "tmz-dig-006"],
    highlights: [
      "Tactical playbook for launching digital goods without paid ads",
      "Includes pricing matrix tested on 1,000+ early buyers",
      "Frictionless single-page store UX patterns and wireframes",
      "Lifetime updates and revised edition rights"
    ]
  },

  // ==========================================
  // 2. NOTION & PRODUCTIVITY TEMPLATES
  // ==========================================
  {
    id: "tmz-dig-005",
    slug: "tamyiz-second-brain-and-deep-work-notion-os",
    name: "TAMYIZ Second Brain & Deep Work Notion OS",
    tagline: "All-in-one digital operating system for high-output solo founders, engineers, and creators",
    category: "Notion & Productivity Templates",
    categoryCode: "notion",
    price: 799,
    originalPrice: 1499,
    badge: "NOTION TEMPLATE SYSTEM",
    isBestSeller: true,
    isNew: true,
    isDigital: true,
    rating: 5.0,
    reviewsCount: 67,
    images: [
      "/assets/images/products/notion-second-brain-05.webp",
      "/assets/images/products/notion-second-brain-05.webp"
    ],
    variants: {
      type: "License",
      options: ["Notion Duplicate Link + Guide", "Team License"],
      prices: {
        "Notion Duplicate Link + Guide": { price: 799, originalPrice: 1499 },
        "Team License": { price: 1499, originalPrice: 2999 }
      }
    },
    colors: ["Obsidian Dark Mode"],
    description: "The exact operational system used by the TAMYIZ atelier. Features an architectural dark-mode dashboard implementing the PARA method, daily focus cockpit, weekly review cadences, long-term knowledge vaults, and automated habit matrix in a clean Swiss layout.",
    specifications: [
      { label: "Platform", value: "Notion (Works on Free & Paid Notion accounts)" },
      { label: "Architecture", value: "PARA Method (Projects, Areas, Resources, Archive)" },
      { label: "Dashboards", value: "Daily Cockpit, Active Sprints, Knowledge Vault, Habit Matrix" },
      { label: "Design", value: "Bespoke Swiss Dark Theme with Custom Minimalist Icons" },
      { label: "Setup Time", value: "1-Click Duplicate into your personal workspace" },
      { label: "Includes", value: "Full Video Walkthrough & Setup Documentation Guide" }
    ],
    tableOfContents: [
      "Module 01: The Command Center — Daily Focus & Active Sprints",
      "Module 02: PARA Project Architecture & Knowledge Base",
      "Module 03: Reading Vault & Systematic Highlight Extraction",
      "Module 04: Deep Work Time-Blocking & Energy Matrix",
      "Module 05: Financial & Subscription Overhead Tracker"
    ],
    fileSpecs: "1-Click Notion Duplicate Link • Setup Video Guide • Free & Plus Notion Compatible",
    sampleExcerpt: {
      chapter: "Module 01 / The Command Center",
      subtitle: "Daily Focus & Cognitive Clarity",
      text: "Your mind is designed for generating ideas, not storing unindexed tasks. The TAMYIZ Notion OS removes cognitive clutter by creating an airtight conduit between your daily objectives and long-term multi-year milestones. Every morning begins with zero cognitive drag: open your cockpit, view your top 3 non-negotiables, and execute in silence."
    },
    careInstructions: "Duplicate into your personal Notion workspace with one click. Works seamlessly on desktop, iPad, and mobile Notion apps.",
    relatedIds: ["tmz-dig-006", "tmz-dig-007"],
    highlights: [
      "1-Click duplication into your free or paid Notion account",
      "Eliminates mental fatigue with structured daily focus dashboards",
      "Designed with luxury Swiss typography and dark mode aesthetics",
      "Lifetime updates as Notion releases new formula and database features"
    ]
  },
  {
    id: "tmz-dig-006",
    slug: "freelance-atelier-and-client-portal-notion-workspace",
    name: "Freelance Atelier & Client Portal Notion Workspace",
    tagline: "Premium client onboarding, milestone tracker, proposal templates, and invoice dashboard",
    category: "Notion & Productivity Templates",
    categoryCode: "notion",
    price: 899,
    originalPrice: 1699,
    badge: "CREATOR TEMPLATE",
    isBestSeller: false,
    isNew: true,
    isDigital: true,
    rating: 4.9,
    reviewsCount: 28,
    images: [
      "/assets/images/products/notion-client-portal-06.webp",
      "/assets/images/products/notion-client-portal-06.webp"
    ],
    variants: {
      type: "Format",
      options: ["Notion Template + Invoice Kit", "Studio Multi-Client Pack"],
      prices: {
        "Notion Template + Invoice Kit": { price: 899, originalPrice: 1699 },
        "Studio Multi-Client Pack": { price: 1599, originalPrice: 2999 }
      }
    },
    colors: ["Architectural Dark Slate"],
    description: "Command respect from high-ticket clients with a private, branded Notion client portal. Features proposal decks, contract sign-off checklists, real-time milestone Kanban boards, file handoff chambers, and automated invoice tracking.",
    specifications: [
      { label: "Platform", value: "Notion (Duplicate ready for unlimited clients)" },
      { label: "Components", value: "Client Portal, Milestone Kanban, Invoices, Proposals" },
      { label: "Client View", value: "Clean, read-only or collaborative client sharing mode" },
      { label: "Templates", value: "Scope of Work (SOW), Design Brief, Invoice Calculator" },
      { label: "Delivery", value: "Instant Notion Duplicate Link + Private Guide" }
    ],
    tableOfContents: [
      "Module 01: Client Onboarding & Welcome Briefing Deck",
      "Module 02: Interactive Milestone Kanban & Delivery Roadmap",
      "Module 03: Asset Handoff & Version Control Repository",
      "Module 04: Automated Billing, Retainers & Tax Invoice Kit",
      "Module 05: Feedback & Post-Launch Sign-Off Protocol"
    ],
    fileSpecs: "Instant Notion Duplicate Link • Client Sharing Instructions • Unlimited Client Use",
    sampleExcerpt: {
      chapter: "Module 01 / Client Onboarding",
      subtitle: "Setting the Standard of Excellence",
      text: "First impressions dictate your leverage in every client relationship. Delivering a shared workspace with tailored branding, transparent timelines, and crisp communication establishes you not as an expendable contractor, but as a distinguished partner. Clients respect order and clarity; this portal turns project management into an effortless competitive advantage."
    },
    careInstructions: "Duplicate once for your main studio, and create infinite duplicates to invite clients with customized access permissions.",
    relatedIds: ["tmz-dig-005", "tmz-dig-008"],
    highlights: [
      "Impress enterprise and luxury clients with bespoke portals",
      "Includes contract, proposal, and invoice automation models",
      "Eliminates back-and-forth status emails with live roadmaps",
      "Commercial license included for freelance studios and agencies"
    ]
  },
  {
    id: "tmz-dig-007",
    slug: "academic-research-and-literature-tracker-notion-matrix",
    name: "Academic Research & Literature Tracker Notion Matrix",
    tagline: "Rigorous literature review matrix, Zotero sync protocol, and thesis chapter synthesizer",
    category: "Notion & Productivity Templates",
    categoryCode: "notion",
    price: 399,
    originalPrice: 799,
    badge: "STUDY & RESEARCH TEMPLATE",
    isBestSeller: false,
    isNew: true,
    isDigital: true,
    rating: 4.9,
    reviewsCount: 35,
    images: [
      "/assets/images/products/notion-research-tracker-07.webp",
      "/assets/images/products/notion-research-tracker-07.webp"
    ],
    variants: {
      type: "Format",
      options: ["Notion Template + Zotero Guide", "Student Edition"],
      prices: {
        "Notion Template + Zotero Guide": { price: 399, originalPrice: 799 },
        "Student Edition": { price: 299, originalPrice: 599 }
      }
    },
    colors: ["Deep Charcoal / Minimalist Red"],
    description: "Engineered for university scholars, independent researchers, and graduate students. Manages hundreds of academic papers, citation tags, synthesis matrices, methodology comparisons, and chapter drafting boards.",
    specifications: [
      { label: "Platform", value: "Notion (Compatible with all Notion tiers)" },
      { label: "Integrations", value: "Zotero, Mendeley & Google Scholar workflow notes" },
      { label: "Databases", value: "Papers Matrix, Concept Tagging, Quotes & Literature Synthesis" },
      { label: "Delivery", value: "Instant 1-Click Notion Template Link" }
    ],
    tableOfContents: [
      "Module 01: Literature Review Matrix & Citation Index",
      "Module 02: Zotero & Reference Manager Sync Workflow",
      "Module 03: Conceptual Synthesis & Thematic Tagging",
      "Module 04: Methodology & Quantitative Data Comparison",
      "Module 05: Thesis & Paper Drafting Outliner"
    ],
    fileSpecs: "Instant 1-Click Duplicate Link • Zotero Sync Documentation • Student-Friendly License",
    sampleExcerpt: {
      chapter: "Module 01 / Literature Review Matrix",
      subtitle: "Systematizing Scholarly Rigor",
      text: "True research begins when notes cease to be isolated quotes and become interconnected nodes. This matrix allows you to tag papers by methodology, findings, and ideological school, instantly revealing gaps in existing scholarship. Structure your literature review with effortless precision."
    },
    careInstructions: "Duplicate into Notion and start cataloging papers immediately. Fully searchable on phone and desktop.",
    relatedIds: ["tmz-dig-003", "tmz-dig-005"],
    highlights: [
      "Designed specifically for deep scholarly and academic inquiry",
      "Custom databases for paper metadata, tags, and quotes",
      "Accelerates thesis and dissertation drafting by months",
      "Lifetime updates and schema expansions"
    ]
  },

  // ==========================================
  // 3. UI/UX & DESIGN SYSTEMS
  // ==========================================
  {
    id: "tmz-dig-008",
    slug: "tamyiz-swiss-grid-and-luxury-portfolio-ui-kit",
    name: "TAMYIZ Swiss Grid & Luxury Portfolio UI Kit 2026",
    tagline: "Complete Swiss design system: 12-column asymmetric grid, luxury tokens, and copy-paste code",
    category: "UI/UX & Design Systems",
    categoryCode: "design",
    price: 999,
    originalPrice: 1999,
    badge: "FIGMA + TAILWIND TEMPLATE",
    isBestSeller: true,
    isNew: true,
    isDigital: true,
    rating: 5.0,
    reviewsCount: 46,
    images: [
      "/assets/images/products/figma-ui-kit-08.webp",
      "/assets/images/products/book-specbook-03-sample.webp"
    ],
    variants: {
      type: "Format",
      options: ["Figma + Tailwind Code", "Figma Only"],
      prices: {
        "Figma + Tailwind Code": { price: 999, originalPrice: 1999 },
        "Figma Only": { price: 699, originalPrice: 1399 }
      }
    },
    colors: ["Swiss Red / Matte Obsidian"],
    description: "The complete design system powering TAMYIZ. Includes the 12-column asymmetric grid mathematics, typography pairing ratios, Signal Red accent tokens, responsive breakpoints, accessible interactive states, and clean Tailwind/Vanilla CSS components.",
    specifications: [
      { label: "Deliverables", value: "Figma File (.fig) + Clean Tailwind / CSS Component Code" },
      { label: "Components", value: "50+ Luxury Components (PDP Sheets, Sticky Headers, Drawers)" },
      { label: "Typography", value: "Syne Display & Inter Pairing System (Variable Weights)" },
      { label: "Tokens", value: "Signal Red (Pantone 185C), Obsidian, Glassmorphism" },
      { label: "Delivery", value: "Instant Figma Community / File Link + GitHub Code Access" },
      { label: "License", value: "Unlimited Personal & Commercial Client Projects" }
    ],
    tableOfContents: [
      "Component 01: 12-Column Asymmetric Swiss Grid System",
      "Component 02: Typography Tokens (Display & Structural Body)",
      "Component 03: Signal Red (Pantone 185C) & Obsidian Color Tokens",
      "Component 04: Glassmorphic Floating Navigation & Drawers",
      "Component 05: High-Converting Minimalist Single-Page Checkout"
    ],
    fileSpecs: "Figma (.fig) Design System + Tailwind CSS Code + Responsive Viewport Layouts",
    sampleExcerpt: {
      chapter: "Component 01 / The Swiss Grid System",
      subtitle: "Asymmetric Balance & Typographic Presence",
      text: "Grid systems are not cages; they are the architectural scaffolding that permits radical creative freedom. By adhering to strict mathematical gutters and baseline tracking, your digital interface commands the same dignified authority as a centuries-old European museum. This UI kit brings that timeless Swiss gravitas directly to modern web products."
    },
    careInstructions: "Import .fig file directly into Figma. Copy components with zero configuration. Tailwind utility classes are fully documented.",
    relatedIds: ["tmz-dig-001", "tmz-dig-002"],
    highlights: [
      "The exact design system and components used to build TAMYIZ",
      "50+ responsive, meticulously crafted luxury UI components",
      "Includes Figma auto-layout tokens and copy-paste code",
      "Lifetime updates for new components and responsive patterns"
    ]
  }
];

export function findProductBySlugOrId(identifier) {
  if (!identifier) return null;
  const clean = String(identifier).toLowerCase().trim();
  return products.find(p => p.id.toLowerCase() === clean || (p.slug && p.slug.toLowerCase() === clean));
}

export function getRelatedProducts(productOrId, count = 2) {
  const prod = typeof productOrId === 'string'
    ? findProductBySlugOrId(productOrId)
    : productOrId;

  if (!prod) return products.slice(0, count);

  if (prod.relatedIds && prod.relatedIds.length > 0) {
    const list = prod.relatedIds
      .map(id => products.find(p => p.id === id))
      .filter(Boolean);
    if (list.length >= count) return list.slice(0, count);
  }

  // Fallback: items from other categories
  return products.filter(p => p.id !== prod.id).slice(0, count);
}

export function getDigitalProducts() {
  return products.filter(p => p.isDigital);
}
