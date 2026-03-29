<template>
  <!-- HERO -->
  <section class="about-hero">
    <div class="container">
      <div class="row justify-content-center text-center">
        <div class="col-lg-8" data-aos="fade-up">
          <span class="section-label" style="background:rgba(244,168,50,.15);color:#f4a832;">Our Services</span>
          <h1 class="mt-3 mb-4" style="font-size:clamp(2rem,5vw,3.2rem);font-weight:900;line-height:1.15;">Political Marketing Tools &amp; Services</h1>
          <p class="fs-5" style="opacity:.85;max-width:620px;margin:0 auto;">Full-service election marketing: PR, social media automation, voter analytics, digital ads, email &amp; SMS, and internal campaign management. Win your election with data.</p>
          <div class="mt-4">
            <a href="#contact" class="btn btn-warning btn-lg fw-bold rounded-pill px-5 me-3" style="color:#0d2a52;">Get Started</a>
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
      <h2 class="fw-bold mb-3" style="font-size:clamp(1.8rem,4vw,2.8rem);">Ready to Build Your Winning Machine?</h2>
      <p class="fs-5 mb-5" style="opacity:.9;max-width:560px;margin:0 auto 40px;">One integrated team. Every channel covered. Total campaign accountability.</p>
      <a href="#contact" class="btn btn-light btn-lg fw-bold rounded-pill px-5" style="color:#e63946;">Request a Strategy Call</a>
    </div>
  </section>
</template>

<script setup>
const serviceDetails = [
  {
    id: 'pr-media', category: 'Communications', title: 'PR & Media Relations',
    icon: 'fas fa-satellite-dish fa-2x', iconStyle: 'background:rgba(13,42,82,.08);color:#0d2a52;',
    desc: 'We shape your candidate\'s public narrative through strategic earned media, editorial placement, and proactive crisis communications — keeping you on offense, never on defense.',
    features: ['Daily media monitoring & sentiment tracking', 'Press release writing & distribution', 'Editorial board meeting prep', 'Crisis communications 24/7 hotline', 'Earned media placement in local & national outlets'],
    subServices: [
      { title: 'Media Monitoring', desc: 'Real-time tracking of coverage across print, broadcast, and online.' },
      { title: 'Press Release Distribution', desc: 'Targeted wire distribution to relevant political media.' },
      { title: 'Spokesmanship Training', desc: 'On-camera and interview prep for candidates and surrogates.' },
      { title: 'Crisis Response', desc: '24/7 rapid response team for negative stories or opposition attacks.' }
    ]
  },
  {
    id: 'social-media', category: 'Digital Presence', title: 'Social Media Management',
    icon: 'fas fa-share-nodes fa-2x', iconStyle: 'background:rgba(29,161,242,.1);color:#1da1f2;',
    desc: 'Multi-platform social media operations from content calendars to community management and bot-powered engagement automation.',
    features: ['Daily content creation & scheduling', 'Engagement automation & monitoring', 'Real-time sentiment analysis', 'Competitor research & benchmarking', 'Cross-platform analytics dashboard'],
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
