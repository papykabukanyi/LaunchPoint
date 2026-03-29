<template>
  <!-- HERO -->
  <section class="platform-hero">
    <div class="container">
      <div class="row justify-content-center text-center">
        <div class="col-lg-8" data-aos="fade-up">
          <span class="section-label" style="background:rgba(244,168,50,.15);color:#f4a832;">Platform & Packages</span>
          <h1 class="mt-3 mb-4" style="font-size:clamp(2rem,5vw,3.2rem);font-weight:900;line-height:1.15;">Everything Your Business Needs to Scale</h1>
          <p class="fs-5" style="opacity:.85;max-width:620px;margin:0 auto;">Transparent pricing. Integrated development &amp; marketing. No vendor chaos — one team, one strategy, one goal: your growth.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- PACKAGES -->
  <section class="py-5 bg-white" style="padding-top:80px!important;padding-bottom:80px!important;">
    <div class="container">
      <div class="row justify-content-center text-center mb-5">
        <div class="col-lg-7" data-aos="fade-up">
          <span class="section-label">Campaign Packages</span>
          <h2 class="section-title mt-2 mb-3">Choose Your Growth Level</h2>
          <p class="text-muted">All packages include a dedicated project manager, weekly reporting, and access to our full technology stack.</p>
        </div>
      </div>
      <div class="row g-4 align-items-stretch justify-content-center">
        <div v-for="pkg in packages" :key="pkg.name" class="col-md-6 col-xl-3" data-aos="fade-up" :data-aos-delay="pkg.delay">
          <div class="pkg-card" :class="{ featured: pkg.featured }">
            <div v-if="pkg.badge" class="badge mb-3" style="background:#f4a832;color:#0d2a52;font-size:.75rem;font-weight:700;padding:5px 12px;border-radius:20px;">{{ pkg.badge }}</div>
            <h4 class="fw-bold mb-1" :style="pkg.featured ? 'color:#fff;' : 'color:#0d2a52;'">{{ pkg.name }}</h4>
            <p class="small mb-3" :style="pkg.featured ? 'color:rgba(255,255,255,.7);' : 'color:#6c757d;'">{{ pkg.tagline }}</p>
            <div class="pkg-price mb-1">${{ pkg.price }}<span style="font-size:.9rem;font-weight:400;opacity:.6;">/mo</span></div>
            <p class="small mb-4" :style="pkg.featured ? 'color:rgba(255,255,255,.6);' : 'color:#6c757d;'">{{ pkg.scale }}</p>
            <div class="mb-4">
              <div v-for="f in pkg.features" :key="f" class="pkg-feature">
                <i class="fas fa-check"></i>
                <span :style="pkg.featured ? 'color:rgba(255,255,255,.85);' : ''">{{ f }}</span>
              </div>
            </div>
            <a href="#contact" class="btn w-100 rounded-pill fw-bold" :class="pkg.featured ? 'btn-warning' : 'btn-outline-primary'" :style="pkg.featured ? 'color:#0d2a52;' : 'border-color:#0d2a52;color:#0d2a52;'">Get Started</a>
          </div>
        </div>
      </div>
      <p class="text-center text-muted small mt-4">All packages include setup & onboarding. Need something custom? <a href="#contact" style="color:#0d2a52;font-weight:600;">Request a quote →</a></p>
    </div>
  </section>

  <!-- TECH STACK -->
  <section class="py-5" style="background:#f0f4f9;padding-top:80px!important;padding-bottom:80px!important;">
    <div class="container">
      <div class="row justify-content-center text-center mb-5">
        <div class="col-lg-7" data-aos="fade-up">
          <span class="section-label">Technology</span>
          <h2 class="section-title mt-2 mb-3">Built on Best-in-Class Technology</h2>
          <p class="text-muted">We use and integrate the best-in-class tools for development and marketing — and layer in our own proprietary client intelligence platform on top.</p>
        </div>
      </div>
      <div class="row g-4">
        <div v-for="tech in techStack" :key="tech.category" class="col-md-6 col-lg-4" data-aos="zoom-in">
          <div class="card border-0 rounded-4 p-4 h-100" style="box-shadow:0 4px 20px rgba(0,0,0,.06);">
            <div class="svc-icon mb-3" :style="tech.iconStyle"><i :class="tech.icon"></i></div>
            <h6 class="fw-bold mb-2">{{ tech.category }}</h6>
            <p class="text-muted small mb-3">{{ tech.desc }}</p>
            <div class="d-flex flex-wrap gap-1">
              <span v-for="tool in tech.tools" :key="tool" class="badge" style="background:#e8f0fb;color:#0d2a52;font-weight:600;font-size:.72rem;padding:5px 10px;border-radius:20px;">{{ tool }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- RESULTS -->
  <section class="py-5 bg-white" style="padding-top:80px!important;padding-bottom:80px!important;">
    <div class="container">
      <div class="row justify-content-center text-center mb-5">
        <div class="col-lg-7" data-aos="fade-up">
          <span class="section-label">Track Record</span>
          <h2 class="section-title mt-2 mb-3">Results That Speak for Themselves</h2>
        </div>
      </div>
      <div class="row g-4 justify-content-center">
        <div v-for="result in results" :key="result.num" class="col-6 col-md-3" data-aos="zoom-in">
          <div class="text-center">
            <div style="font-size:2.8rem;font-weight:900;color:#0d2a52;">{{ result.num }}</div>
            <div class="text-muted small">{{ result.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-banner text-center">
    <div class="container" data-aos="fade-up">
      <h2 class="fw-bold mb-3" style="font-size:clamp(1.8rem,4vw,2.8rem);">Pick Your Package. Let's Launch.</h2>
      <p class="fs-5 mb-5" style="opacity:.9;max-width:560px;margin:0 auto 40px;">Schedule a discovery call — we'll match you to the right package and start building your growth engine today.</p>
      <a href="#contact" class="btn btn-light btn-lg fw-bold rounded-pill px-5" style="color:#e63946;">Book a Free Consultation</a>
    </div>
  </section>
</template>

<script setup>
const packages = [
  {
    name: 'Starter', tagline: 'Small businesses & startups', price: '1,997', scale: 'Best for lean teams establishing their digital presence',
    badge: null, featured: false, delay: 0,
    features: ['Dedicated project manager', 'Landing page or 5-page website', 'Social media management (2 platforms)', 'Basic Google Analytics setup', 'Monthly reporting dashboard', 'Email support & Slack channel']
  },
  {
    name: 'Growth', tagline: 'Growing companies scaling up', price: '3,997', scale: 'Best for businesses with products ready to market aggressively',
    badge: null, featured: false, delay: 80,
    features: ['Everything in Starter', 'Custom web or app development (up to 15 pages)', 'Paid ads management (Meta + Google)', 'SEO foundation setup', 'Email marketing (up to 5,000 contacts)', 'A/B testing on landing pages']
  },
  {
    name: 'Pro', tagline: 'Established brands ready to dominate', price: '7,997', scale: 'Best for companies with proven products and real growth ambitions',
    badge: 'Most Popular', featured: true, delay: 160,
    features: ['Everything in Growth', 'Full-stack web or mobile app development', 'Full digital advertising suite', 'Social media across 4 platforms', 'Advanced analytics & custom dashboards', 'Brand identity refresh or full design system', 'Conversion rate optimization (CRO)', 'Bi-weekly strategy calls']
  },
  {
    name: 'Enterprise', tagline: 'Large organizations & enterprise brands', price: 'Custom', scale: 'Full dedicated team for complex, multi-channel growth',
    badge: null, featured: false, delay: 240,
    features: ['Everything in Pro', 'Unlimited development sprints', 'Full brand identity & design system', 'Dedicated team: devs, designers, marketers', 'Multi-platform app development', 'Enterprise analytics & BI integration', 'PR & media relations', 'Daily syncs & executive reporting']
  }
]

const techStack = [
  { category: 'Frontend Development', icon: 'fas fa-code', iconStyle: 'background:rgba(13,42,82,.08);color:#0d2a52;',
    desc: 'Modern component-based frameworks built for speed and developer experience.', tools: ['React', 'Vue 3', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Vite'] },
  { category: 'Backend & APIs', icon: 'fas fa-server', iconStyle: 'background:rgba(59,130,246,.1);color:#3b82f6;',
    desc: 'Scalable server infrastructure and RESTful/GraphQL APIs.', tools: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'GraphQL', 'Railway'] },
  { category: 'Mobile Development', icon: 'fas fa-mobile-alt', iconStyle: 'background:rgba(156,39,176,.1);color:#9c27b0;',
    desc: 'Cross-platform mobile apps with native-quality performance.', tools: ['React Native', 'Expo', 'Swift (iOS)', 'Kotlin (Android)', 'Firebase'] },
  { category: 'Paid Marketing', icon: 'fas fa-rectangle-ad', iconStyle: 'background:rgba(230,57,70,.1);color:#e63946;',
    desc: 'Certified managers across every major advertising platform.', tools: ['Meta Ads', 'Google Ads', 'TikTok Ads', 'LinkedIn Ads', 'YouTube', 'DV360'] },
  { category: 'Analytics & Data', icon: 'fas fa-chart-line', iconStyle: 'background:rgba(244,168,50,.12);color:#d4890a;',
    desc: 'Real-time performance tracking and executive-grade dashboards.', tools: ['GA4', 'Looker Studio', 'Mixpanel', 'Hotjar', 'Segment', 'BigQuery'] },
  { category: 'Design & Brand', icon: 'fas fa-palette', iconStyle: 'background:rgba(39,174,96,.1);color:#27ae60;',
    desc: 'Professional design tools for every client deliverable.', tools: ['Figma', 'Adobe XD', 'Illustrator', 'Photoshop', 'Canva Pro', 'Framer'] }
]

const results = [
  { num: '200+',  label: 'Projects Delivered' },
  { num: '98%',   label: 'Client Retention Rate' },
  { num: '50+',   label: 'Industries Served' },
  { num: '$10M+', label: 'In Ad Spend Managed' }
]
</script>
