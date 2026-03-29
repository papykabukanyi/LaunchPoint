<template>
  <div class="contact-card">
    <!-- Step Indicators -->
    <div class="bos-steps">
      <div v-for="s in steps" :key="s.n" class="bos-step" :class="{ active: step === s.n, done: step > s.n }">
        <span>{{ s.n }}</span> {{ s.label }}
      </div>
    </div>

    <!-- Step 1: Contact Info -->
    <div v-show="step === 1">
      <h5 class="fw-bold mb-4" style="color:#0d2a52;">Tell us about yourself</h5>
      <div class="row g-3">
        <div class="col-sm-6">
          <label class="form-label fw-semibold small">First Name <span class="text-danger">*</span></label>
          <input type="text" class="form-control" v-model="form.firstName" placeholder="Jane">
        </div>
        <div class="col-sm-6">
          <label class="form-label fw-semibold small">Last Name <span class="text-danger">*</span></label>
          <input type="text" class="form-control" v-model="form.lastName" placeholder="Smith">
        </div>
        <div class="col-sm-6">
          <label class="form-label fw-semibold small">Email <span class="text-danger">*</span></label>
          <input type="email" class="form-control" v-model="form.email" placeholder="jane@campaign.com">
        </div>
        <div class="col-sm-6">
          <label class="form-label fw-semibold small">Phone</label>
          <input type="tel" class="form-control" v-model="form.phone" placeholder="(555) 000-0000">
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold small">Tell us about your campaign <span class="text-muted fw-normal">(optional)</span></label>
          <textarea class="form-control" v-model="form.message" rows="3" placeholder="Office you're running for, district, election date, current challenges..."></textarea>
        </div>
      </div>
    </div>

    <!-- Step 2: Service Selection -->
    <div v-show="step === 2">
      <h5 class="fw-bold mb-1" style="color:#0d2a52;">What do you need?</h5>
      <p class="text-muted small mb-3">Select all services that apply to your campaign goals.</p>
      <div v-for="cat in serviceCategories" :key="cat.label">
        <div class="svc-category">{{ cat.label }}</div>
        <div class="svc-grid">
          <label v-for="svc in cat.services" :key="svc.value" class="svc-item" :class="{ checked: form.services.includes(svc.value) }">
            <input type="checkbox" class="svc-cb" :value="svc.value" v-model="form.services"> {{ svc.name }}
          </label>
        </div>
      </div>
    </div>

    <!-- Step 3: Project Details -->
    <div v-show="step === 3">
      <h5 class="fw-bold mb-1" style="color:#0d2a52;">Project details</h5>
      <p class="text-muted small mb-4">Help us understand your project's scope, budget, and timeline.</p>

      <div class="bos-qualifier">
        <label>Project Scale</label>
        <div class="bos-radio-row">
          <label v-for="opt in raceOptions" :key="opt.value" class="bos-radio-btn">
            <input type="radio" :value="opt.value" v-model="form.raceScale">
            <span>{{ opt.label }}</span>
          </label>
        </div>
      </div>

      <div class="bos-qualifier">
        <label>Monthly Budget Range</label>
        <div class="bos-radio-row">
          <label v-for="opt in budgetOptions" :key="opt.value" class="bos-radio-btn">
            <input type="radio" :value="opt.value" v-model="form.budget">
            <span>{{ opt.label }}</span>
          </label>
        </div>
      </div>

      <div class="bos-qualifier">
        <label>Timeline / Urgency</label>
        <div class="bos-radio-row">
          <label v-for="opt in timelineOptions" :key="opt.value" class="bos-radio-btn">
            <input type="radio" :value="opt.value" v-model="form.timeline">
            <span>{{ opt.label }}</span>
          </label>
        </div>
      </div>

      <div class="bos-qualifier">
        <label>Primary Goal</label>
        <div class="bos-radio-row">
          <label v-for="opt in goalOptions" :key="opt.value" class="bos-radio-btn">
            <input type="radio" :value="opt.value" v-model="form.primaryGoal">
            <span>{{ opt.label }}</span>
          </label>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-sm-6">
          <div class="bos-qualifier" style="margin-bottom:0">
            <label>Estimated Contract Length</label>
            <select class="form-select" v-model="form.contractMonths">
              <option value="1">1 Month</option>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
            </select>
          </div>
        </div>
        <div class="col-sm-6">
          <div class="bos-qualifier" style="margin-bottom:0">
            <label>How did you hear about us?</label>
            <select class="form-select" v-model="form.hearAboutUs">
              <option value="">— Select —</option>
              <option value="google">Google Search</option>
              <option value="social_media">Social Media</option>
              <option value="referral">Friend / Colleague Referral</option>
              <option value="linkedin">LinkedIn</option>
              <option value="conference">Conference or Event</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div class="bos-qualifier">
        <label>Do you have an existing online presence?</label>
        <div class="bos-radio-row">
          <label v-for="opt in presenceOptions" :key="opt.value" class="bos-radio-btn">
            <input type="radio" :value="opt.value" v-model="form.existingPresence">
            <span>{{ opt.label }}</span>
          </label>
        </div>
      </div>

      <div class="form-check mt-1">
        <input class="form-check-input" type="checkbox" id="bos_newsletter" v-model="form.newsletter">
        <label class="form-check-label small text-muted" for="bos_newsletter">Subscribe me to the Growth Insights Brief newsletter</label>
      </div>
    </div>

    <!-- Step 4: Success -->
    <div v-show="step === 4">
      <div class="bos-success">
        <div class="bos-success-icon">✅</div>
        <h3>Request Received!</h3>
        <p class="mb-3">Thank you for reaching out. Our team is reviewing your campaign needs and <strong>will prepare a custom proposal</strong> for you.</p>
        <p class="small text-muted">Expect to hear from us within 24 hours — usually sooner.</p>
        <RouterLink to="/" class="btn btn-outline-primary mt-3 rounded-pill px-4" style="border-color:#0d2a52;color:#0d2a52;">Back to Home</RouterLink>
      </div>
    </div>

    <!-- Navigation -->
    <div class="bos-nav-row" v-if="step < 4">
      <button v-if="step > 1" type="button" class="btn btn-outline-secondary rounded-3" @click="step--">← Back</button>
      <div v-else></div>
      <div class="d-flex gap-2">
        <button v-if="step < 3" type="button" class="btn fw-bold px-4 rounded-3" style="background:#0d2a52;color:#fff;border:none;" @click="goNext">Next →</button>
        <button v-if="step === 3" type="button" class="btn btn-success fw-bold px-4 rounded-3" :disabled="submitting" @click="doSubmit">
          <span v-if="submitting"><i class="fas fa-spinner fa-spin me-2"></i>Sending...</span>
          <span v-else><i class="fas fa-paper-plane me-2"></i>Send Request</span>
        </button>
      </div>
    </div>

    <div v-if="errorMsg" class="alert alert-danger rounded-3 mt-3"><i class="fas fa-exclamation-circle me-2"></i>{{ errorMsg }}</div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, watch } from 'vue'

const props = defineProps({
  preselect: { type: String, default: '' }
})

// When a service is pre-selected from the /service page, add it to the form
watch(() => props.preselect, (val) => {
  if (val) {
    if (!form.services.includes(val)) {
      form.services = [val]
    }
  }
}, { immediate: true })

const step = ref(1)
const submitting = ref(false)
const errorMsg = ref('')

const steps = [
  { n: 1, label: 'Contact' },
  { n: 2, label: 'Services' },
  { n: 3, label: 'Details' },
  { n: 4, label: 'Done' }
]

const form = reactive({
  firstName: '', lastName: '', email: '', phone: '', message: '',
  services: [],
  raceScale: 'small_biz',
  timeline: 'standard',
  contractMonths: '3',
  newsletter: false,
  budget: '',
  hearAboutUs: '',
  primaryGoal: '',
  existingPresence: ''
})

const raceOptions = [
  { value: 'startup',   label: '🚀 Startup' },
  { value: 'small_biz', label: '🏘️ Small Business' },
  { value: 'regional',  label: '📍 Regional/Mid' },
  { value: 'enterprise',label: '🏢 Enterprise' },
  { value: 'political', label: '🏛️ Political Campaign' }
]
const budgetOptions = [
  { value: 'under_1k', label: '💼 Under $1K/mo' },
  { value: '1k_3k',   label: '📦 $1K–$3K/mo' },
  { value: '3k_7k',   label: '🚀 $3K–$7.5K/mo' },
  { value: '7k_15k',  label: '⭐ $7.5K–$15K/mo' },
  { value: '15k_plus',label: '👑 $15K+/mo' }
]
const goalOptions = [
  { value: 'more_leads',      label: '📈 More Leads' },
  { value: 'brand_awareness', label: '💡 Brand Awareness' },
  { value: 'launch_product',  label: '🚀 Product Launch' },
  { value: 'political',       label: '🏛️ Win Election' },
  { value: 'improve_digital', label: '🔧 Improve Digital' }
]
const presenceOptions = [
  { value: 'full',    label: '✅ Website + Social' },
  { value: 'social',  label: '📱 Social Only' },
  { value: 'none',    label: '🆕 Starting from Scratch' }
]
const timelineOptions = [
  { value: 'standard', label: '📅 Standard (4–6 wks)' },
  { value: 'fast',     label: '⚡ Fast (2–3 wks)' },
  { value: 'rush',     label: '🚀 Rush (Under 2 wks)' }
]

const serviceCategories = [
  { label: '🎨 Branding', services: [
    { value: 'logo_design',       name: 'Logo Design' },
    { value: 'brand_style_guide', name: 'Brand Style Guide' },
    { value: 'print_materials',   name: 'Print Materials' }
  ]},
  { label: '🌐 Web & Digital', services: [
    { value: 'website_new',         name: 'New Website' },
    { value: 'website_update',      name: 'Website Update / Redesign' },
    { value: 'website_maintenance', name: 'Website Maintenance' },
    { value: 'app_development',     name: 'App Development (iOS/Android)' },
    { value: 'seo',                 name: 'SEO' },
    { value: 'landing_pages',       name: 'Landing Pages' }
  ]},
  { label: '📱 Social Media', services: [
    { value: 'social_management',  name: 'Social Media Management' },
    { value: 'social_ads',         name: 'Social Media Ads' },
    { value: 'content_creation',   name: 'Content Creation' },
    { value: 'influencer_outreach',name: 'Influencer Outreach' }
  ]},
  { label: '📣 Digital Advertising', services: [
    { value: 'google_ads',        name: 'Google Ads' },
    { value: 'programmatic_ads',  name: 'Programmatic Advertising' },
    { value: 'video_ads',         name: 'Video Ad Production' }
  ]},
  { label: '📧 Email & SMS', services: [
    { value: 'email_marketing', name: 'Email Marketing' },
    { value: 'sms_campaigns',   name: 'SMS Campaigns' },
    { value: 'crm_setup',       name: 'CRM Setup' }
  ]},
  { label: '📰 PR & Media', services: [
    { value: 'pr_media_relations', name: 'PR & Media Relations' },
    { value: 'press_releases',     name: 'Press Releases' },
    { value: 'crisis_comms',       name: 'Crisis Communications' }
  ]},
  { label: '📊 Analytics & Strategy', services: [
    { value: 'analytics_setup',    name: 'Analytics & Reporting' },
    { value: 'strategy_consulting',name: 'Strategy Consulting' },
    { value: 'voter_analytics',    name: 'Voter Data Analytics' }
  ]},
  { label: '🎯 Recruitment', services: [
    { value: 'marketing_recruitment', name: 'Marketing Recruitment' },
    { value: 'workforce_recruitment', name: 'Workforce Recruitment' },
    { value: 'volunteer_management',  name: 'Volunteer Management' },
    { value: 'field_operations',      name: 'Field Operations' }
  ]},
  { label: '🏢 Campaign Management', services: [
    { value: 'campaign_management', name: 'Full Campaign Management' },
    { value: 'event_management',    name: 'Event Management' },
    { value: 'fundraising',         name: 'Fundraising Strategy' }
  ]}
]

function goNext() {
  if (step.value === 1) {
    if (!form.firstName.trim() || !form.lastName.trim()) { errorMsg.value = 'Please enter your first and last name.'; return }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { errorMsg.value = 'Please enter a valid email address.'; return }
  }
  errorMsg.value = ''
  step.value++
  nextTick(() => {
    const card = document.querySelector('.contact-card')
    if (!card) return
    const rect = card.getBoundingClientRect()
    // Only scroll if the top of the card is above the navbar (64px) or out of view
    if (rect.top < 72 || rect.top > window.innerHeight * 0.5) {
      const y = window.scrollY + rect.top - 80
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  })
}

async function doSubmit() {
  submitting.value = true
  errorMsg.value = ''
  try {
    const payload = {
      firstName: form.firstName,
      lastName:  form.lastName,
      email:     form.email,
      phone:     form.phone,
      message:   form.message || 'New service inquiry submitted via website.',
      interest:  'services',
      newsletter: form.newsletter,
      serviceNeeds: {
        services:           form.services,
        race_scale:         form.raceScale,
        timeline:           form.timeline,
        contract_months:    parseInt(form.contractMonths) || 3,
        budget:             form.budget,
        hear_about_us:      form.hearAboutUs,
        primary_goal:       form.primaryGoal,
        existing_presence:  form.existingPresence
      }
    }
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const result = await res.json()
    if (res.ok) {
      step.value = 4
    } else {
      errorMsg.value = (result.errors && result.errors.map(e => e.msg).join(', ')) || result.error || 'Something went wrong. Please try again.'
    }
  } catch {
    errorMsg.value = 'Network error. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>
