<template>
  <!-- HERO -->
  <section class="hero-section" id="home">
    <canvas id="hero-3d-canvas" class="hero-3d-canvas"></canvas>
    <div class="container hero-content-wrap">
      <div class="row align-items-center gy-5">
        <div class="col-lg-7" data-aos="fade-right">
          <div class="hero-badge"><i class="fas fa-rocket me-2"></i>Development &amp; Marketing Agency</div>
          <h1 class="hero-title">We Build What<br><span>Launches</span> Brands.</h1>
          <p class="hero-subtitle">LaunchPoint DM is a full-service development and marketing agency trusted by businesses ready to scale. From custom web apps to integrated digital campaigns — we build the foundation and run the strategy.</p>
          <div class="d-flex flex-wrap gap-3">
            <a href="#contact" class="btn btn-warning btn-lg fw-bold px-5 rounded-pill" style="color:#0a1628;">Launch Your Project</a>
            <RouterLink to="/about" class="btn btn-outline-light btn-lg rounded-pill px-5">Explore Services</RouterLink>
          </div>
          <div class="hero-stat-row">
            <div class="hero-stat"><span class="hs-num">200+</span><span class="hs-label">Projects Launched</span></div>
            <div class="hero-stat"><span class="hs-num">98%</span><span class="hs-label">Client Retention</span></div>
            <div class="hero-stat"><span class="hs-num">50+</span><span class="hs-label">Industries</span></div>
            <div class="hero-stat"><span class="hs-num">8+</span><span class="hs-label">Years</span></div>
          </div>
        </div>
        <div class="col-lg-5" data-aos="fade-left" data-aos-delay="120">
          <div class="hero-floating">
            <div class="hf-item">
              <div class="hf-icon"><i class="fas fa-code"></i></div>
              <div class="hf-text">
                <strong>Custom Web &amp; App Development</strong>
                <span>React, Vue, Node.js — engineered for performance, scalability, and growth</span>
              </div>
            </div>
            <div class="hf-item">
              <div class="hf-icon"><i class="fas fa-chart-line"></i></div>
              <div class="hf-text">
                <strong>Integrated Digital Marketing</strong>
                <span>Full-funnel campaigns across paid, organic, email, and social channels</span>
              </div>
            </div>
            <div class="hf-item">
              <div class="hf-icon"><i class="fas fa-palette"></i></div>
              <div class="hf-text">
                <strong>Brand Identity &amp; Design</strong>
                <span>Logo, visual system, UI/UX — cohesive identity that converts</span>
              </div>
            </div>
            <div class="hf-item">
              <div class="hf-icon"><i class="fas fa-database"></i></div>
              <div class="hf-text">
                <strong>Analytics &amp; Data Intelligence</strong>
                <span>Real-time dashboards, KPI tracking, and growth modeling across every channel</span>
              </div>
            </div>
            <div class="mt-4 text-center">
              <a href="#contact" class="btn btn-warning fw-bold rounded-pill px-4" style="color:#0a1628;">Schedule a Discovery Call <i class="fas fa-arrow-right ms-1"></i></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SERVICES -->
  <section class="py-5 bg-white" id="services" style="padding-top:80px!important;padding-bottom:80px!important;">
    <div class="container">
      <div class="row justify-content-center text-center mb-5">
        <div class="col-lg-8" data-aos="fade-up">
          <span class="section-label">What We Do</span>
          <h2 class="section-title mt-2 mb-3">Complete Solutions.<br>One Integrated Team.</h2>
          <p class="text-muted fs-5">Every service is designed to work together — your website, your marketing, and your brand all speak the same language and share the same data.</p>
        </div>
      </div>
      <div class="row g-4">
        <div v-for="(svc, i) in services" :key="svc.title" class="col-md-6 col-lg-4" data-aos="zoom-in" :data-aos-delay="(i % 3) * 60">
          <div class="card service-card p-4">
            <div class="svc-icon" :style="svc.iconStyle"><i :class="svc.icon"></i></div>
            <h5 class="fw-bold mb-2">{{ svc.title }}</h5>
            <p class="text-muted small">{{ svc.desc }}</p>
            <RouterLink :to="svc.link" class="small fw-bold text-decoration-none" style="color:#1a4b8c;">Learn more <i class="fas fa-arrow-right ms-1"></i></RouterLink>
          </div>
        </div>
      </div>
      <div class="text-center mt-5" data-aos="fade-up">
        <RouterLink to="/about" class="btn btn-outline-primary btn-lg rounded-pill px-5">See All Services</RouterLink>
      </div>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section class="py-5" id="how-it-works" style="background:#f0f4f9;padding-top:80px!important;padding-bottom:80px!important;">
    <div class="container">
      <div class="row justify-content-center text-center mb-5">
        <div class="col-lg-7" data-aos="fade-up">
          <span class="section-label">The Process</span>
          <h2 class="section-title mt-2 mb-3">From Idea to Launch to Growth</h2>
          <p class="text-muted">We plug into your business immediately and build the infrastructure to grow — tracking every metric from traffic quality to conversion rates to ROI.</p>
        </div>
      </div>
      <div class="row g-4">
        <div v-for="(step, i) in processSteps" :key="step.title" class="col-md-6 col-lg-3" data-aos="fade-up" :data-aos-delay="i * 80">
          <div class="card border-0 rounded-4 p-4 h-100" style="box-shadow:0 4px 20px rgba(0,0,0,.06);">
            <div class="d-flex align-items-center gap-3 mb-3">
              <div class="step-num" :style="step.numStyle">{{ i + 1 }}</div>
              <h6 class="fw-bold mb-0">{{ step.title }}</h6>
            </div>
            <p class="text-muted small mb-0">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- WHY LAUNCHPOINT DM -->
  <section class="py-5 bg-white" id="why-us" style="padding-top:80px!important;padding-bottom:80px!important;">
    <div class="container">
      <div class="row align-items-center gy-5">
        <div class="col-lg-5" data-aos="fade-right">
          <span class="section-label">Why Choose Us</span>
          <h2 class="section-title mt-2 mb-4">Built Different. <br>By Design.</h2>
          <p class="text-muted mb-4">Unlike traditional agencies that hand off work between siloed teams, LaunchPoint DM is fully integrated. Your developer, designer, and marketer share the same dashboard, same data, and same goal — your growth.</p>
          <div class="d-flex flex-column gap-3">
            <div v-for="pt in whyPoints" :key="pt.title" class="d-flex align-items-start gap-3">
              <div style="width:38px;height:38px;border-radius:10px;background:rgba(230,57,70,.1);display:flex;align-items:center;justify-content:center;color:#e63946;flex-shrink:0;"><i class="fas fa-check-circle"></i></div>
              <div><strong>{{ pt.title }}</strong><br><span class="text-muted small">{{ pt.desc }}</span></div>
            </div>
          </div>
        </div>
        <div class="col-lg-6 offset-lg-1" data-aos="fade-left" data-aos-delay="100">
          <div class="row g-3">
            <div v-for="stat in stats" :key="stat.num" :class="stat.col">
              <div class="card border-0 text-center p-4 rounded-4" :style="stat.cardStyle">
                <div :style="stat.numStyle">{{ stat.num }}</div>
                <div :style="stat.labelStyle">{{ stat.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

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

  <!-- CTA BANNER -->
  <section class="cta-banner text-center">
    <div class="container" data-aos="fade-up">
      <h2 class="fw-bold mb-3" style="font-size:clamp(1.8rem,4vw,2.8rem);">Ready to Launch Something Great?</h2>
      <p class="fs-5 mb-5" style="opacity:.9;max-width:560px;margin:0 auto 40px;">Tell us what you’re building. We’ll put together a custom strategy — development roadmap, marketing plan, and growth targets — within 24 hours.</p>
      <a href="#contact" class="btn btn-light btn-lg fw-bold rounded-pill px-5 me-3" style="color:#e63946;">Get a Free Strategy Call</a>
      <RouterLink to="/platform" class="btn btn-outline-light btn-lg rounded-pill px-5">View Packages</RouterLink>
    </div>
  </section>

  <!-- CONTACT -->
  <section class="contact-section" id="contact">
    <div class="container">
      <div class="row justify-content-center text-center mb-5">
        <div class="col-lg-7" data-aos="fade-up">
          <span class="section-label">Get In Touch</span>
          <h2 class="section-title mt-2 mb-3">Start Your Project Today</h2>
          <p class="text-muted">Tell us about your business and goals. We’ll put together a custom proposal within 24 hours.</p>
        </div>
      </div>
      <div class="row gy-4">
        <div class="col-lg-5" data-aos="fade-right">
          <h4 class="fw-bold mb-4" style="color:#0d2a52;">Contact Information</h4>
          <div class="d-flex align-items-center gap-3 mb-3">
            <div style="width:46px;height:46px;border-radius:12px;background:rgba(13,42,82,.08);display:flex;align-items:center;justify-content:center;color:#0d2a52;font-size:1.1rem;"><i class="fas fa-envelope"></i></div>
            <div><div class="fw-bold">Email</div><div class="text-muted small">info@launchpointdm.com</div></div>
          </div>
          <div class="d-flex align-items-center gap-3 mb-3">
            <div style="width:46px;height:46px;border-radius:12px;background:rgba(13,42,82,.08);display:flex;align-items:center;justify-content:center;color:#0d2a52;font-size:1.1rem;"><i class="fas fa-phone"></i></div>
            <div><div class="fw-bold">Phone</div><div class="text-muted small">+1 (555) 720-0100</div></div>
          </div>
          <div class="d-flex align-items-center gap-3 mb-4">
            <div style="width:46px;height:46px;border-radius:12px;background:rgba(13,42,82,.08);display:flex;align-items:center;justify-content:center;color:#0d2a52;font-size:1.1rem;"><i class="fas fa-clock"></i></div>
            <div><div class="fw-bold">Response Time</div><div class="text-muted small">Within 24 hours — usually faster</div></div>
          </div>
          <hr>
          <div class="d-flex gap-2 mt-3">
            <a href="#" class="social-btn"><i class="fab fa-facebook-f"></i></a>
            <a href="#" class="social-btn"><i class="fab fa-twitter"></i></a>
            <a href="#" class="social-btn"><i class="fab fa-linkedin-in"></i></a>
            <a href="#" class="social-btn"><i class="fab fa-instagram"></i></a>
          </div>
        </div>
        <div class="col-lg-7" data-aos="fade-left">
          <ContactWizard />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import ContactWizard from '../components/ContactWizard.vue'

// Newsletter
const nlEmail = ref('')
const nlMsg   = ref('')
const nlLoading = ref(false)

async function nlSubscribe() {
  if (!nlEmail.value) return
  nlLoading.value = true
  try {
    const res = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: nlEmail.value }) })
    const data = await res.json()
    if (res.ok) {
      nlMsg.value = "<span style='color:#4ade80;'><i class='fas fa-check-circle me-1'></i>You are subscribed! Welcome aboard.</span>"
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

const services = [
  { title: 'PR & Media Relations',    icon: 'fas fa-satellite-dish', desc: 'Press releases, media placements, editorial strategy, and crisis communications that shape your candidate\'s public narrative.', link: '/about#pr-media',           iconStyle: 'background:rgba(13,42,82,.08);color:#0d2a52;' },
  { title: 'Social Media Management', icon: 'fas fa-share-nodes',    desc: 'Multi-platform content calendars, community management, engagement tools, and real-time sentiment monitoring.',                   link: '/about#social-media',        iconStyle: 'background:rgba(29,161,242,.1);color:#1da1f2;' },
  { title: 'Digital Advertising',     icon: 'fas fa-rectangle-ad',   desc: 'Precision-targeted social ads, programmatic display, YouTube pre-roll, Google Search, and geofencing political ads.',              link: '/about#digital-advertising',  iconStyle: 'background:rgba(230,57,70,.1);color:#e63946;' },
  { title: 'Email & SMS Marketing',   icon: 'fas fa-envelope-open-text', desc: 'Automated supporter journeys, targeted broadcasts, donation appeals, GOTV sequences, and newsletter management.',             link: '/about#email-sms',            iconStyle: 'background:rgba(39,174,96,.1);color:#27ae60;' },
  { title: 'Voter Analytics & Data',  icon: 'fas fa-database',       desc: 'Voter file analysis, predictive turnout modeling, demographic targeting, and real-time polling integration.',                        link: '/about#voter-analytics',      iconStyle: 'background:rgba(156,39,176,.1);color:#9c27b0;' },
  { title: 'Campaign Management',     icon: 'fas fa-sitemap',        desc: 'Internal CRM, volunteer coordination, canvassing tools, field operations dashboards, and full reporting suite.',                     link: '/about#campaign-management',  iconStyle: 'background:rgba(244,168,50,.12);color:#d4890a;' }
]

const processSteps = [
  { title: 'Strategy & Audit',     desc: 'Full competitive audit, district analysis, and candidate positioning session to build a custom winning strategy.' },
  { title: 'Launch Infrastructure', desc: 'Website live, ads running, social channels active, email list built, and campaign dashboard ready — all in week one.' },
  { title: 'Execute & Optimize',   desc: 'Weekly reporting, A/B testing on every channel, message refinement, and budget reallocation to the highest-converting segments.' },
  { title: 'Win Election Day',     desc: 'Coordinated GOTV push, Election Day operations, real-time monitoring, and rapid-response communications.', numStyle: 'background:linear-gradient(135deg,#e63946,#b5202c);' }
]

const whyPoints = [
  { title: 'Integrated across all channels', desc: 'Every service shares data and strategy — no siloed vendors, no coordination gaps.' },
  { title: 'Real-time campaign dashboard',   desc: 'Your candidate and manager see every metric — contacts, spend, reach, donations — live.' },
  { title: 'Flat-rate campaign packages',    desc: 'Transparent monthly pricing. No hidden fees, no long-term lock-in.' }
]

const stats = [
  { num: '500+', label: 'Campaigns Managed', col: 'col-6', cardStyle: 'background:#f0f4f9;', numStyle: 'font-size:2.4rem;font-weight:800;color:#0d2a52;', labelStyle: 'color:var(--bs-secondary);font-size:.8rem;margin-top:4px;' },
  { num: '87%',  label: 'Win Rate',           col: 'col-6', cardStyle: 'background:#0d2a52;color:#fff;', numStyle: 'font-size:2.4rem;font-weight:800;color:#f4a832;', labelStyle: 'font-size:.8rem;opacity:.75;margin-top:4px;' },
  { num: '38',   label: 'States Covered',     col: 'col-6', cardStyle: 'background:#0d2a52;color:#fff;', numStyle: 'font-size:2.4rem;font-weight:800;color:#f4a832;', labelStyle: 'font-size:.8rem;opacity:.75;margin-top:4px;' },
  { num: '12+',  label: 'Years Experience',   col: 'col-6', cardStyle: 'background:#f0f4f9;', numStyle: 'font-size:2.4rem;font-weight:800;color:#0d2a52;', labelStyle: 'color:var(--bs-secondary);font-size:.8rem;margin-top:4px;' }
]
</script>
