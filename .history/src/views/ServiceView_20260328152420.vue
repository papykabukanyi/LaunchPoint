<template>
  <!-- HERO -->
  <section class="svc-hero">
    <div class="container">
      <div class="row justify-content-center text-center">
        <div class="col-lg-8" data-aos="fade-up">
          <span class="section-label">Services &amp; Pricing</span>
          <h1 class="fw-800 mt-2 mb-3" style="font-size:clamp(2rem,5vw,3.2rem);font-weight:800;color:#0d2a52;">
            Everything You Need to Scale.
          </h1>
          <p class="text-muted fs-5 mb-0">Transparent starting prices. Custom proposals tailored to your exact goals.<br>Click any service to get started instantly.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- PRICING CARDS GRID -->
  <section class="py-5 bg-white" style="padding-top:50px!important;padding-bottom:70px!important;">
    <div class="container">
      <div class="row g-4">
        <div
          v-for="(svc, i) in services"
          :key="svc.key"
          class="col-md-6 col-lg-4"
          data-aos="fade-up"
          :data-aos-delay="(i % 3) * 60"
        >
          <div class="pricing-card" :class="{ featured: svc.featured }">
            <div v-if="svc.featured" class="pricing-badge">Most Popular</div>

            <!-- Icon -->
            <div class="pricing-icon" :style="svc.iconStyle">
              <i :class="svc.icon"></i>
            </div>

            <!-- Title & desc -->
            <h4 class="fw-bold mb-1">{{ svc.title }}</h4>
            <p class="text-muted small mb-3" style="min-height:52px;">{{ svc.desc }}</p>

            <!-- Feature list -->
            <ul class="pricing-features">
              <li v-for="f in svc.features" :key="f">
                <i class="fas fa-check-circle"></i> {{ f }}
              </li>
            </ul>

            <!-- Learn more link -->
            <RouterLink :to="svc.learnMore" class="learn-link mb-3 d-block">
              Full details <i class="fas fa-arrow-right ms-1"></i>
            </RouterLink>

            <!-- CTA button -->
            <button class="pricing-btn" :class="{ 'pricing-btn-gold': svc.featured }" @click="pickService(svc.key)">
              <i class="fas fa-rocket me-2"></i>Get This Service
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- GUARANTEE STRIP -->
  <div class="guarantee-strip">
    <div class="container">
      <div class="row justify-content-center gy-3">
        <div v-for="g in guarantees" :key="g.text" class="col-auto">
          <span class="guarantee-item"><i :class="g.icon"></i> {{ g.text }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- NEWSLETTER STRIP -->
  <div class="newsletter-strip" id="newsletter-section">
    <div class="container">
      <div class="row align-items-center gy-4">
        <div class="col-lg-6" data-aos="fade-right">
          <h3 class="fw-bold mb-2">Growth Insights Brief</h3>
          <p style="opacity:.85;" class="mb-0">Monthly deep-dives on web development trends, digital marketing tactics, and what's driving real business growth. No spam — unsubscribe anytime.</p>
        </div>
        <div class="col-lg-6" data-aos="fade-left">
          <form class="nl-wrap" @submit.prevent="nlSubscribe">
            <input type="email" class="nl-email" v-model="nlEmail" placeholder="Your email address" required>
            <button type="submit" class="nl-btn" :disabled="nlLoading"><i class="fas fa-paper-plane me-1"></i> Subscribe</button>
          </form>
          <div v-if="nlMsg" style="margin-top:10px;font-size:.875rem;" v-html="nlMsg"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- CONTACT WIZARD SECTION -->
  <section id="contact" style="padding:80px 0;background:#f8f9fb;">
    <div class="container">
      <!-- Highlighted service banner -->
      <div v-if="activeService" class="selected-banner" data-aos="fade-down">
        <i class="fas fa-check-circle me-2" style="color:#27ae60;"></i>
        <strong>{{ services.find(s => s.key === activeService)?.title }}</strong> selected — fill in the form below and we'll prepare a custom proposal.
        <button class="clear-btn" @click="activeService = ''">✕ Clear</button>
      </div>

      <div class="row justify-content-center text-center mb-5" data-aos="fade-up">
        <div class="col-lg-7">
          <span class="section-label">Get In Touch</span>
          <h2 class="section-title mt-2 mb-3">Start Your Project Today</h2>
          <p class="text-muted">Tell us what you need. We'll build a custom proposal within 24 hours.</p>
        </div>
      </div>

      <div class="row gy-4">
        <!-- Contact info panel -->
        <div class="col-lg-4" data-aos="fade-right">
          <div class="contact-info-panel">
            <h5 class="fw-bold mb-4" style="color:#0d2a52;">Contact Information</h5>
            <div class="ci-row">
              <div class="ci-icon"><i class="fas fa-envelope"></i></div>
              <div>
                <div class="ci-label">Email</div>
                <a href="mailto:hello@launchpointdm.com" class="ci-value">hello@launchpointdm.com</a>
              </div>
            </div>
            <div class="ci-row">
              <div class="ci-icon"><i class="fas fa-phone"></i></div>
              <div>
                <div class="ci-label">Phone</div>
                <span class="ci-value">+1 (555) 720-0100</span>
              </div>
            </div>
            <div class="ci-row">
              <div class="ci-icon"><i class="fas fa-clock"></i></div>
              <div>
                <div class="ci-label">Response Time</div>
                <span class="ci-value">Within 24 hrs — usually faster</span>
              </div>
            </div>
            <hr style="border-color:#f0f0f0;margin:24px 0;">
            <div class="d-flex gap-2 mt-3">
              <a href="#" class="social-btn"><i class="fab fa-facebook-f"></i></a>
              <a href="#" class="social-btn"><i class="fab fa-twitter"></i></a>
              <a href="#" class="social-btn"><i class="fab fa-linkedin-in"></i></a>
              <a href="#" class="social-btn"><i class="fab fa-instagram"></i></a>
            </div>
          </div>
        </div>

        <!-- Wizard -->
        <div class="col-lg-8" data-aos="fade-left">
          <ContactWizard :preselect="activeService" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import ContactWizard from '../components/ContactWizard.vue'

const activeService = ref('')
const nlEmail   = ref('')
const nlMsg     = ref('')
const nlLoading = ref(false)

async function nlSubscribe() {
  if (!nlEmail.value) return
  nlLoading.value = true
  try {
    const res  = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: nlEmail.value }) })
    const data = await res.json()
    if (res.ok) {
      nlMsg.value   = "<span style='color:#4ade80;'><i class='fas fa-check-circle me-1'></i>You're subscribed! Welcome aboard.</span>"
      nlEmail.value = ''
    } else {
      nlMsg.value = `<span style='color:#fca5a5;'>${data.error || 'Something went wrong.'}</span>`
    }
  } catch {
    nlMsg.value = "<span style='color:#fca5a5;'>Network error. Please try again.</span>"
  } finally {
    nlLoading.value = false
  }
}

function pickService(key) {
  activeService.value = key
  nextTick(() => {
    const el = document.getElementById('service-contact')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

const services = [
  {
    key: 'website_new',
    title: 'Web Development',
    icon: 'fas fa-code fa-2x',
    iconStyle: 'background:rgba(13,42,82,.08);color:#0d2a52;',
    desc: 'Custom high-performance websites and web applications engineered for speed, conversion, and growth.',
    learnMore: '/about#web-dev',
    features: [
      'Custom React / Vue single-page apps',
      'E-commerce & CMS integration',
      'Performance & Core Web Vitals',
      'CI/CD pipeline & deployment',
    ]
  },
  {
    key: 'app_development',
    title: 'App Development',
    icon: 'fas fa-mobile-alt fa-2x',
    iconStyle: 'background:rgba(59,130,246,.1);color:#3b82f6;',
    desc: 'Native and cross-platform mobile apps for iOS & Android with scalable cloud backends.',
    learnMore: '/about#app-dev',
    features: [
      'iOS & Android native development',
      'React Native cross-platform',
      'Backend APIs (Node.js / PostgreSQL)',
      'App Store submission & ASO',
    ]
  },
  {
    key: 'logo_design',
    title: 'Brand Identity & Design',
    icon: 'fas fa-palette fa-2x',
    iconStyle: 'background:rgba(230,57,70,.1);color:#e63946;',
    desc: 'Complete brand systems — logo, color palette, typography, UI/UX — cohesive across every touchpoint.',
    learnMore: '/about#brand-identity',
    features: [
      'Logo design + usage guidelines',
      'Brand color & typography system',
      'UI/UX wireframes & prototypes',
      'Social & print brand templates',
    ]
  },
  {
    key: 'google_ads',
    title: 'Digital Marketing',
    icon: 'fas fa-rectangle-ad fa-2x',
    iconStyle: 'background:rgba(244,168,50,.12);color:#d4890a;',
    desc: 'Full-funnel paid advertising across Meta, Google, YouTube, and programmatic display with full tracking.',
    featured: true,
    learnMore: '/about#digital-marketing',
    features: [
      'Meta & Google Ads management',
      'Programmatic & OTT/CTV advertising',
      'Full conversion tracking & attribution',
      'Monthly performance reports',
    ]
  },
  {
    key: 'social_management',
    title: 'Social Media Management',
    icon: 'fas fa-share-nodes fa-2x',
    iconStyle: 'background:rgba(29,161,242,.1);color:#1da1f2;',
    desc: 'Multi-platform social operations — content creation, community management, and growth campaigns.',
    learnMore: '/about#social-media',
    features: [
      'Daily content creation & scheduling',
      'Community management & DMs',
      'Growth campaigns & paid social',
      'Influencer identification',
    ]
  },
  {
    key: 'analytics_setup',
    title: 'Analytics & Reporting',
    icon: 'fas fa-chart-line fa-2x',
    iconStyle: 'background:rgba(39,174,96,.1);color:#27ae60;',
    desc: 'Live dashboards, conversion funnel tracking, and growth modeling that turns data into decisions.',
    learnMore: '/about#analytics',
    features: [
      'GA4 setup & event tracking',
      'Custom Looker Studio dashboards',
      'Conversion funnel analysis & CRO',
      'Monthly executive growth reports',
    ]
  },
  {
    key: 'email_marketing',
    title: 'Email & SMS Marketing',
    icon: 'fas fa-envelope-open-text fa-2x',
    iconStyle: 'background:rgba(139,92,246,.1);color:#7c3aed;',
    desc: 'Automated email sequences, SMS campaigns, and CRM setup to nurture leads and convert customers.',
    learnMore: '/about',
    features: [
      'Email automation sequences',
      'SMS campaign deployment',
      'CRM setup & integration',
      'List segmentation & A/B testing',
    ]
  },
  {
    key: 'campaign_management',
    title: 'Political & Campaign Marketing',
    icon: 'fas fa-landmark fa-2x',
    iconStyle: 'background:rgba(230,57,70,.12);color:#e63946;',
    desc: 'Full-service electoral and advocacy marketing from candidate campaigns to PACs and nonprofits.',
    learnMore: '/about#political-marketing',
    features: [
      'Voter targeting & precision digital ads',
      'Candidate website & brand identity',
      'GOTV email & SMS deployment',
      'Crisis comms & fundraising strategy',
    ]
  },
]

const guarantees = [
  { icon: 'fas fa-shield-alt', text: 'No Long-Term Contracts Required' },
  { icon: 'fas fa-file-alt', text: 'Custom Proposal Within 24 Hours' },
  { icon: 'fas fa-sync-alt', text: 'Strategy Revisions Included' },
  { icon: 'fas fa-headset', text: 'Dedicated Account Manager' },
]
</script>

<style scoped>
/* ---- Hero ---- */
.svc-hero {
  padding: 90px 0 50px;
  background: linear-gradient(135deg, #f0f4f9 0%, #e8eef8 100%);
}

/* ---- Pricing Cards ---- */
.pricing-card {
  background: #fff;
  border-radius: 18px;
  padding: 32px 28px;
  box-shadow: 0 4px 24px rgba(13,42,82,.07);
  border: 2px solid transparent;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: transform .25s, box-shadow .25s, border-color .25s;
}
.pricing-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 48px rgba(13,42,82,.13);
  border-color: rgba(13,42,82,.15);
}
.pricing-card.featured {
  border-color: #f4a832;
  box-shadow: 0 8px 36px rgba(244,168,50,.2);
}
.pricing-badge {
  position: absolute;
  top: -14px;
  right: 24px;
  background: #f4a832;
  color: #0a1628;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 16px;
  border-radius: 20px;
  letter-spacing: .05em;
  text-transform: uppercase;
}
.pricing-icon {
  width: 62px;
  height: 62px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  flex-shrink: 0;
}
.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
  flex: 1;
}
.pricing-features li {
  font-size: 13px;
  color: #444;
  padding: 5px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.pricing-features li i { color: #27ae60; font-size: 12px; flex-shrink: 0; }

.learn-link {
  font-size: 13px;
  font-weight: 600;
  color: #1a4b8c;
  text-decoration: none;
}
.learn-link:hover { color: #0d2a52; }

.pricing-btn {
  width: 100%;
  padding: 13px 24px;
  background: #0d2a52;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: background .2s, transform .15s;
  margin-top: auto;
}
.pricing-btn:hover { background: #1a4b8c; transform: translateY(-2px); }
.pricing-btn-gold { background: #f4a832; color: #0a1628; }
.pricing-btn-gold:hover { background: #e09520; }

/* ---- Guarantee Strip ---- */
.guarantee-strip {
  background: #0d2a52;
  padding: 20px 0;
}
.guarantee-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(255,255,255,.9);
  font-size: 13px;
  font-weight: 600;
  padding: 4px 20px;
}
.guarantee-item i { color: #f4a832; }

/* ---- Selected Banner ---- */
.selected-banner {
  background: #f0fdf4;
  border: 1.5px solid #86efac;
  border-radius: 12px;
  padding: 14px 20px;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  flex-wrap: wrap;
}
.clear-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 6px;
}
.clear-btn:hover { background: #f0f0f0; }

/* ---- Contact Info Panel ---- */
.contact-info-panel {
  background: #fff;
  border-radius: 16px;
  padding: 36px 28px;
  box-shadow: 0 4px 24px rgba(13,42,82,.07);
  height: 100%;
}
.ci-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 20px;
}
.ci-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(13,42,82,.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0d2a52;
  flex-shrink: 0;
}
.ci-label { font-size: 11px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 2px; }
.ci-value { font-size: 14px; font-weight: 600; color: #222; text-decoration: none; }
a.ci-value:hover { color: #0d2a52; }

.social-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(13,42,82,.07);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #0d2a52;
  font-size: 14px;
  text-decoration: none;
  transition: background .2s;
}
.social-btn:hover { background: #0d2a52; color: #fff; }

/* ---- Responsive ---- */
@media (max-width: 768px) {
  .svc-hero { padding: 60px 0 36px; }
  .pricing-card { padding: 24px 20px; }
  .price-amount { font-size: 1.7rem; }
  .guarantee-strip { display: none; }
  .selected-banner { font-size: 13px; }
}
</style>
