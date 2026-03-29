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
    name: 'Starter', tagline: 'Local races, first-time candidates', price: '2,500', scale: 'Best for city council, school board, and local races',
    badge: null, featured: false, delay: 0,
    features: ['Dedicated campaign manager', 'Social media management (3 platforms)', 'Email marketing (up to 2,500 contacts)', 'Basic voter analytics', 'Weekly reporting dashboard', 'Canvassing app access']
  },
  {
    name: 'Growth', tagline: 'Competitive district races', price: '5,000', scale: 'Best for state house, county commissioner, and DA races',
    badge: null, featured: false, delay: 80,
    features: ['Everything in Starter', 'Digital ad management ($2k/mo ad budget included)', 'PR & media relations', 'SMS campaign blasts', 'Voter file analysis & targeting', 'A/B testing on all channels']
  },
  {
    name: 'Pro', tagline: 'Statewide & major races', price: '12,000', scale: 'Best for state senate, mayor, and congressional races',
    badge: 'Most Popular', featured: true, delay: 160,
    features: ['Everything in Growth', 'Full digital advertising suite', 'Video ad production', 'Advanced voter analytics & modeling', 'Crisis communications coverage', 'Phone banking management', 'Field operations dashboard', 'Bi-weekly strategy calls']
  },
  {
    name: 'Enterprise', tagline: 'Federal & major statewide campaigns', price: 'Custom', scale: 'Senate, governor, and presidential primary races',
    badge: null, featured: false, delay: 240,
    features: ['Everything in Pro', 'Unlimited ad spend management', 'Full campaign management team on-site', 'Fundraising email strategy', 'Opposition research integration', 'National media relations', 'Daily strategy briefings']
  }
]

const techStack = [
  { category: 'Ad Platforms', icon: 'fas fa-rectangle-ad', iconStyle: 'background:rgba(230,57,70,.1);color:#e63946;',
    desc: 'Certified managers on all major political advertising platforms.', tools: ['Meta Ads', 'Google DV360', 'The Trade Desk', 'Pandora', 'Spotify', 'YouTube'] },
  { category: 'Voter Data', icon: 'fas fa-database', iconStyle: 'background:rgba(156,39,176,.1);color:#9c27b0;',
    desc: 'Licensed access to the nation\'s most complete voter intelligence databases.', tools: ['NGP VAN', 'TargetSmart', 'L2 Political', 'Catalist', 'Statewide voter files'] },
  { category: 'Email & SMS', icon: 'fas fa-envelope-open-text', iconStyle: 'background:rgba(39,174,96,.1);color:#27ae60;',
    desc: 'Enterprise email and text messaging at campaign scale.', tools: ['ActionNetwork', 'Mailchimp', 'Twilio', 'EverTrue', 'MailerLite'] },
  { category: 'Social Media Tools', icon: 'fas fa-share-nodes', iconStyle: 'background:rgba(29,161,242,.1);color:#1da1f2;',
    desc: 'Professional publishing, listening, and automation tools.', tools: ['Sprout Social', 'Hootsuite', 'Brandwatch', 'Buffer', 'Canva Pro'] },
  { category: 'Analytics & Reporting', icon: 'fas fa-chart-line', iconStyle: 'background:rgba(244,168,50,.12);color:#d4890a;',
    desc: 'Real-time campaign performance tracking and custom dashboards.', tools: ['Google Analytics 4', 'Looker Studio', 'Tableau', 'BOS Campaign Dashboard'] },
  { category: 'Field Operations', icon: 'fas fa-map-marked-alt', iconStyle: 'background:rgba(13,42,82,.08);color:#0d2a52;',
    desc: 'Mobile-first field tools for canvassing, phone banking, and GOTV.', tools: ['MiniVAN', 'Organizer', 'ThruText', 'CallHub', 'BOS Field App'] }
]

const results = [
  { num: '500+', label: 'Campaigns Won' },
  { num: '87%',  label: 'Overall Win Rate' },
  { num: '38',   label: 'States Operated In' },
  { num: '$50M+', label: 'In Ad Spend Managed' }
]
</script>
