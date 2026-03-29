<template>
  <!-- HERO -->
  <section class="about-hero">
    <div class="container">
      <div class="row justify-content-center text-center">
        <div class="col-lg-8" data-aos="fade-up">
          <span class="section-label" style="background:rgba(244,168,50,.15);color:#f4a832;">Our Services</span>
          <h1 class="mt-3 mb-4" style="font-size:clamp(2rem,5vw,3.2rem);font-weight:900;line-height:1.15;">Development &amp; Marketing Solutions</h1>
          <p class="fs-5" style="opacity:.85;max-width:620px;margin:0 auto;">End-to-end services from idea to launch to scale. Custom development, brand identity, digital marketing, and analytics — all under one roof.</p>
          <div class="mt-4">
            <a href="#contact" class="btn btn-warning btn-lg fw-bold rounded-pill px-5 me-3" style="color:#0d2a52;">Start Your Project</a>
            <RouterLink to="/platform" class="btn btn-outline-light btn-lg rounded-pill px-5">View Packages</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SERVICES DETAIL -->
  <section class="py-5 bg-white" style="padding-top:80px!important;padding-bottom:80px!important;">
    <div class="container">
      <div v-for="(svc, i) in serviceDetails" :key="svc.id" :id="svc.id" class="row align-items-center gy-5 mb-5 pb-5" :class="{ 'flex-lg-row-reverse': i % 2 !== 0 }" style="border-bottom:1px solid #e9ecef;">
        <div class="col-lg-5" data-aos="fade-right">
          <div class="service-icon-lg" :style="svc.iconStyle"><i :class="svc.icon"></i></div>
          <span class="section-label mb-3 d-block">{{ svc.category }}</span>
          <h2 class="section-title mb-3">{{ svc.title }}</h2>
          <p class="text-muted mb-4">{{ svc.desc }}</p>
          <ul class="list-unstyled">
            <li v-for="feature in svc.features" :key="feature" class="d-flex align-items-center gap-2 mb-2">
              <i class="fas fa-check-circle" style="color:#27ae60;font-size:.85rem;"></i>
              <span class="small">{{ feature }}</span>
            </li>
          </ul>
          <a href="#contact" class="btn btn-primary rounded-pill px-4 mt-2" style="background:#0d2a52;border-color:#0d2a52;">Get This Service</a>
        </div>
        <div class="col-lg-6" :class="i % 2 !== 0 ? 'me-auto' : 'ms-auto'" data-aos="fade-left" data-aos-delay="80">
          <div class="service-detail-card">
            <div class="row g-3">
              <div v-for="sub in svc.subServices" :key="sub.title" class="col-sm-6">
                <div style="background:#f8f9fa;border-radius:12px;padding:16px;">
                  <div class="fw-bold small mb-1">{{ sub.title }}</div>
                  <div class="text-muted" style="font-size:.78rem;">{{ sub.desc }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-banner text-center">
    <div class="container" data-aos="fade-up">
      <h2 class="fw-bold mb-3" style="font-size:clamp(1.8rem,4vw,2.8rem);">Ready to Build Something That Scales?</h2>
      <p class="fs-5 mb-5" style="opacity:.9;max-width:560px;margin:0 auto 40px;">One integrated team. Every channel covered. Total accountability from design to deployment to growth.</p>
      <a href="#contact" class="btn btn-light btn-lg fw-bold rounded-pill px-5" style="color:#e63946;">Request a Strategy Call</a>
    </div>
  </section>
</template>

<script setup>
const serviceDetails = [
  {
    id: 'web-dev', category: 'Development', title: 'Web Development',
    icon: 'fas fa-code fa-2x', iconStyle: 'background:rgba(13,42,82,.08);color:#0d2a52;',
    desc: 'We design and build high-performance websites, web applications, and e-commerce platforms custom-engineered for your business — fast, secure, and built to convert.',
    features: ['Custom React / Vue single-page applications', 'E-commerce with Shopify, WooCommerce, or custom', 'CMS integration (WordPress, Contentful, Sanity)', 'Performance optimization & Core Web Vitals', 'CI/CD pipelines and automated deployments'],
    subServices: [
      { title: 'Landing Pages',     desc: 'Conversion-focused pages built and A/B tested from day one.' },
      { title: 'Web Applications',  desc: 'Full-stack SPAs with REST/GraphQL APIs and cloud backends.' },
      { title: 'E-Commerce',        desc: 'Scalable storefronts with inventory, checkout, and analytics.' },
      { title: 'CMS & Headless',    desc: 'Editors update content independently — no dev needed.' }
    ]
  },
  {
    id: 'app-dev', category: 'Development', title: 'App Development',
    icon: 'fas fa-mobile-alt fa-2x', iconStyle: 'background:rgba(59,130,246,.1);color:#3b82f6;',
    desc: 'Native and cross-platform mobile applications with polished UI, scalable cloud backends, push notifications, and seamless third-party API integrations.',
    features: ['iOS & Android native development', 'React Native cross-platform apps', 'Backend APIs with Node.js / PostgreSQL', 'App Store submission & optimization', 'Push notifications & real-time features'],
    subServices: [
      { title: 'iOS Apps',        desc: 'Swift-based native apps optimized for Apple hardware.' },
      { title: 'Android Apps',    desc: 'Kotlin-native apps for the full Android ecosystem.' },
      { title: 'Cross-Platform',  desc: 'React Native for simultaneous iOS + Android deployment.' },
      { title: 'Backend & APIs',  desc: 'Node.js REST APIs, user auth, and cloud database hosting.' }
    ]
  },
  {
    id: 'brand-identity', category: 'Design', title: 'Brand Identity & Design',
    icon: 'fas fa-palette fa-2x', iconStyle: 'background:rgba(230,57,70,.1);color:#e63946;',
    desc: 'We create brand systems that communicate your value instantly. Logo, color palette, typography, and full UI/UX design — cohesive identity across every touchpoint.',
    features: ['Logo design with full usage guidelines', 'Brand color palette & typography system', 'UI/UX wireframes and interactive prototypes', 'Style guide & design token documentation', 'Print, digital, and social brand templates'],
    subServices: [
      { title: 'Logo & Mark',      desc: 'Primary logo, alternate versions, favicon, and usage rules.' },
      { title: 'Visual System',    desc: 'Colors, fonts, icons, and imagery style unified into one guide.' },
      { title: 'UI/UX Design',     desc: 'Figma wireframes and prototypes validated before dev starts.' },
      { title: 'Brand Templates',  desc: 'Pitch decks, social posts, email headers, and print collateral.' }
    ]
  },
  {
    id: 'digital-marketing', category: 'Marketing', title: 'Digital Marketing',
    icon: 'fas fa-rectangle-ad fa-2x', iconStyle: 'background:rgba(244,168,50,.12);color:#d4890a;',
    desc: 'Full-funnel paid advertising across Meta, Google, programmatic display, YouTube, and streaming — precision-targeted to your ideal customer with full conversion tracking.',
    features: ['Meta (Facebook & Instagram) ad management', 'Google Search, Display & Shopping campaigns', 'Programmatic & OTT/CTV advertising', 'YouTube pre-roll and video campaigns', 'Full conversion tracking & attribution'],
    subServices: [
      { title: 'Paid Social',        desc: 'Meta, TikTok, LinkedIn ad creation, targeting, and optimization.' },
      { title: 'Google Ads',         desc: 'Search intent campaigns reaching buyers at the decision moment.' },
      { title: 'Programmatic',       desc: 'Automated media buying across thousands of premium placements.' },
      { title: 'Video Advertising',  desc: 'YouTube and streaming pre-roll ads with brand-safe targeting.' }
    ]
  },
  {
    id: 'social-media', category: 'Marketing', title: 'Social Media Management',
    icon: 'fas fa-share-nodes fa-2x', iconStyle: 'background:rgba(29,161,242,.1);color:#1da1f2;',
    desc: 'Multi-platform social media operations from content calendars to community management and growth campaigns — all branded, all consistent, all driving engagement.',
    features: ['Daily content creation & scheduling', 'Community management & DM response', 'Real-time sentiment and trend monitoring', 'Influencer identification & coordination', 'Cross-platform analytics dashboard'],
    subServices: [
      { title: 'Content Creation',      desc: 'On-brand graphics, short-form video, and copy for all platforms.' },
      { title: 'Community Management', desc: 'Responding to comments and messages on behalf of your brand.' },
      { title: 'Growth Campaigns',      desc: 'Follower acquisition, viral boost campaigns, and engagement ads.' },
      { title: 'Influencer Strategy',   desc: 'Identifying and managing partnerships with aligned creators.' }
    ]
  },
  {
    id: 'analytics', category: 'Data & Intelligence', title: 'Analytics & Data Intelligence',
    icon: 'fas fa-chart-line fa-2x', iconStyle: 'background:rgba(39,174,96,.1);color:#27ae60;',
    desc: 'Live dashboards, conversion funnel tracking, user behavior analysis, and growth modeling — turning your data into decisions that compound over time.',
    features: ['Google Analytics 4 setup & event tracking', 'Custom Looker Studio dashboards', 'Conversion funnel analysis & CRO', 'A/B test design and statistical analysis', 'Monthly executive growth reports'],
    subServices: [
      { title: 'GA4 & Tag Manager', desc: 'Proper event tracking for every meaningful user action.' },
      { title: 'Custom Dashboards', desc: 'Real-time Looker Studio reports for your team and stakeholders.' },
      { title: 'CRO Sprints',       desc: 'Hypothesis-driven A/B tests on landing pages and funnels.' },
      { title: 'Growth Reporting',  desc: 'Weekly and monthly reports with insights, not just numbers.' }
    ]
  }
]
    subServices: [
      { title: 'Content Calendar', desc: 'Planned, on-brand posts across Facebook, X, Instagram, YouTube.' },
      { title: 'Community Management', desc: 'Responding to comments and DMs on behalf of the campaign.' },
      { title: 'Sentiment Analysis', desc: 'AI-powered monitoring of public opinion in real time.' },
      { title: 'Growth Campaigns', desc: 'Follower acquisition, viral boost campaigns, and engagement ads.' }
    ]
  },
  {
    id: 'digital-advertising', category: 'Paid Media', title: 'Digital Advertising',
    icon: 'fas fa-rectangle-ad fa-2x', iconStyle: 'background:rgba(230,57,70,.1);color:#e63946;',
    desc: 'Precision-targeted political advertising across every digital channel — reaching the right voters at the right moment.',
    features: ['Facebook & Instagram political ads', 'Google Search & Display campaigns', 'Programmatic & OTT/CTV advertising', 'Geofencing & IP targeting', 'YouTube pre-roll and streaming ads'],
    subServices: [
      { title: 'Social Paid Media',   desc: 'Meta, X, and TikTok political ad management and optimization.' },
      { title: 'Search Advertising',  desc: 'Google Ads targeting voters searching issue keywords.' },
      { title: 'Programmatic Display', desc: 'Automated media buying across premium news sites.' },
      { title: 'Geofencing Ads',      desc: 'Target voters by exact physical location in real time.' }
    ]
  },
  {
    id: 'email-sms', category: 'Direct Communication', title: 'Email & SMS Marketing',
    icon: 'fas fa-envelope-open-text fa-2x', iconStyle: 'background:rgba(39,174,96,.1);color:#27ae60;',
    desc: 'Automated supporter journeys, GOTV sequences, fundraising appeals, and broadcast campaigns that drive action.',
    features: ['Automated drip email sequences', 'GOTV SMS blast campaigns', 'Fundraising email series', 'Supporter segmentation & personalization', 'A/B subject line and CTA testing'],
    subServices: [
      { title: 'Email Automation', desc: 'Multi-step sequences triggered by supporter actions.' },
      { title: 'SMS Broadcasts',   desc: 'Mass text messages with high open rates for GOTV days.' },
      { title: 'Fundraising Emails', desc: 'Proven donation appeal templates with segmented targeting.' },
      { title: 'Newsletter Management', desc: 'Monthly campaign intelligence newsletter to supporters.' }
    ]
  },
  {
    id: 'voter-analytics', category: 'Data & Intelligence', title: 'Voter Analytics & Data',
    icon: 'fas fa-database fa-2x', iconStyle: 'background:rgba(156,39,176,.1);color:#9c27b0;',
    desc: 'Advanced voter file analysis, predictive turnout modeling, and district-level intelligence to focus resources where they win elections.',
    features: ['Voter file processing & enrichment', 'Turnout & persuasion score modeling', 'District-level demographic analysis', 'Real-time polling data integration', 'Canvassing priority target lists'],
    subServices: [
      { title: 'Voter File Analysis', desc: 'Enriching and segmenting the official voter rolls.' },
      { title: 'Predictive Modeling', desc: 'Machine learning scores for turnout probability and persuasibility.' },
      { title: 'Polling Integration', desc: 'Real-time data feeding back into targeting decisions.' },
      { title: 'Precinct Heatmaps',   desc: 'Visual maps of high-value voter concentration areas.' }
    ]
  },
  {
    id: 'campaign-management', category: 'Operations', title: 'Campaign & Field Management',
    icon: 'fas fa-sitemap fa-2x', iconStyle: 'background:rgba(244,168,50,.12);color:#d4890a;',
    desc: 'Internal operations platform: volunteer coordination, canvassing management, field dashboards, and full reporting.',
    features: ['Volunteer recruitment & shift scheduling', 'Door-to-door canvassing route optimization', 'Phone bank management', 'Internal CRM & contact tracking', 'Real-time field operations dashboard'],
    subServices: [
      { title: 'Volunteer CRM',      desc: 'Track, schedule, and communicate with every volunteer.' },
      { title: 'Canvassing App',     desc: 'Mobile-first door-knocking app with real-time sync.' },
      { title: 'Phone Banking',      desc: 'Integrated dialer system with call scripts and tracking.' },
      { title: 'Reporting Suite',    desc: 'Daily contact reports for candidate and campaign manager.' }
    ]
  }
]
</script>
