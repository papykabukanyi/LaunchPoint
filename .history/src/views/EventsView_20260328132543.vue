<template>
  <!-- HERO -->
  <section class="events-hero">
    <div class="container">
      <div class="row justify-content-center text-center">
        <div class="col-lg-8" data-aos="fade-up">
          <span class="section-label" style="background:rgba(244,168,50,.15);color:#f4a832;">Upcoming Events</span>
          <h1 class="mt-3 mb-4" style="font-size:clamp(2rem,5vw,3.2rem);font-weight:900;line-height:1.15;">Events &amp; Workshops</h1>
          <p class="fs-5" style="opacity:.85;max-width:620px;margin:0 auto;">Join our community — from live development bootcamps to digital marketing masterclasses and exclusive industry networking nights.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- EVENTS GRID -->
  <section class="py-5" style="background:#f0f4f9;padding-top:80px!important;padding-bottom:80px!important;">
    <div class="container">
      <div class="row justify-content-center text-center mb-5">
        <div class="col-lg-7" data-aos="fade-up">
          <span class="section-label">2026 Season</span>
          <h2 class="section-title mt-2 mb-3">Events &amp; Workshops</h2>
          <p class="text-muted">Reserve your spot. All events include a free 30-minute strategy session for qualified businesses.</p>
        </div>
      </div>
      <div class="row g-4">
        <div v-for="(event, i) in events" :key="event.title" class="col-md-6 col-lg-4" data-aos="fade-up" :data-aos-delay="(i % 3) * 60">
          <div class="event-card">
            <div style="padding:24px 24px 0;">
              <div class="d-flex align-items-start gap-3 mb-3">
                <div class="event-date-badge">
                  <div class="edb-mon">{{ event.mon }}</div>
                  <div class="edb-day">{{ event.day }}</div>
                </div>
                <div>
                  <span class="event-tag" :style="event.tagStyle">{{ event.type }}</span>
                  <h6 class="fw-bold mt-2 mb-0">{{ event.title }}</h6>
                </div>
              </div>
              <p class="text-muted small mb-3">{{ event.desc }}</p>
              <div class="d-flex align-items-center gap-2 small text-muted mb-1">
                <i class="fas fa-clock" style="width:14px;"></i> {{ event.time }}
              </div>
              <div class="d-flex align-items-center gap-2 small text-muted mb-3">
                <i class="fas fa-map-marker-alt" style="width:14px;"></i> {{ event.location }}
              </div>
            </div>
            <div style="padding:0 24px 24px;">
              <a href="#contact" class="btn btn-sm rounded-pill fw-bold" style="background:#0d2a52;color:#fff;border:none;padding:8px 20px;">Register Now</a>
              <span v-if="event.free" class="ms-2 small text-muted"><i class="fas fa-tag me-1"></i>Free</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- WEBINAR CTA -->
  <section class="py-5 bg-white" style="padding-top:80px!important;padding-bottom:80px!important;">
    <div class="container">
      <div class="row align-items-center gy-5">
        <div class="col-lg-6" data-aos="fade-right">
          <span class="section-label">Free Resources</span>
          <h2 class="section-title mt-2 mb-3">On-Demand Resource Library</h2>
          <p class="text-muted mb-4">Access our full library of recorded workshops and webinars — covering web development fundamentals, digital marketing strategy, brand building, and growth tactics.</p>
          <ul class="list-unstyled">
            <li v-for="webinar in webinars" :key="webinar" class="d-flex align-items-center gap-2 mb-3">
              <i class="fas fa-play-circle" style="color:#e63946;width:18px;"></i>
              <span class="small fw-semibold">{{ webinar }}</span>
            </li>
          </ul>
          <a href="#contact" class="btn btn-primary rounded-pill px-4" style="background:#0d2a52;border-color:#0d2a52;">Request Access</a>
        </div>
        <div class="col-lg-5 ms-auto" data-aos="fade-left" data-aos-delay="80">
          <div class="card border-0 rounded-4 p-4" style="background:linear-gradient(135deg,#0d2a52,#1a4b8c);color:#fff;">
            <h4 class="fw-bold mb-3"><i class="fas fa-calendar-check me-2" style="color:#f4a832;"></i>Host an Event With Us</h4>
            <p style="opacity:.85;font-size:.95rem;">Want us to run a LaunchPoint DM workshop for your team or organization? We bring our experts directly to you.</p>
            <ul class="list-unstyled" style="opacity:.85;">
              <li class="mb-2 small"><i class="fas fa-check me-2" style="color:#f4a832;"></i>Custom agenda for your team's needs</li>
              <li class="mb-2 small"><i class="fas fa-check me-2" style="color:#f4a832;"></i>Available nationwide</li>
              <li class="mb-2 small"><i class="fas fa-check me-2" style="color:#f4a832;"></i>Virtual or in-person formats</li>
            </ul>
            <a href="#contact" class="btn btn-warning fw-bold rounded-pill px-4 mt-2" style="color:#0d2a52;">Inquire About Hosting</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-banner text-center">
    <div class="container" data-aos="fade-up">
      <h2 class="fw-bold mb-3" style="font-size:clamp(1.8rem,4vw,2.8rem);">Don't Miss the Next Event</h2>
      <p class="fs-5 mb-5" style="opacity:.9;max-width:560px;margin:0 auto 40px;">Subscribe to the Growth Insights Brief and get first access to events, workshops, and exclusive content.</p>
      <a href="/#newsletter-section" class="btn btn-light btn-lg fw-bold rounded-pill px-5" style="color:#e63946;">Subscribe Free</a>
    </div>
  </section>
</template>

<script setup>
const events = [
  { mon: 'APR', day: '8',  type: 'Workshop',   tagStyle: 'background:rgba(230,57,70,.1);color:#e63946;',   title: 'Web Development Bootcamp',               desc: 'Hands-on training on React, Node.js, and deploying production-ready apps — from zero to live in one day.',          time: '9:00 AM – 5:00 PM EST', location: 'Virtual (Zoom)', free: false },
  { mon: 'APR', day: '17', type: 'Webinar',    tagStyle: 'background:rgba(13,42,82,.08);color:#0d2a52;',   title: 'Digital Marketing Deep Dive',            desc: 'A data-driven walkthrough of full-funnel marketing strategy — acquisition, retention, and growth modeling.',         time: '2:00 PM EST',           location: 'Virtual (Zoom)', free: true  },
  { mon: 'MAY', day: '2',  type: 'Networking', tagStyle: 'background:rgba(244,168,50,.12);color:#d4890a;', title: 'Tech & Marketing Mixer — Miami',          desc: 'Exclusive in-person networking event for founders, marketers, and developers in the South Florida tech scene.',     time: '6:00 PM – 9:00 PM EST', location: 'Miami, FL',      free: false },
  { mon: 'MAY', day: '14', type: 'Workshop',   tagStyle: 'background:rgba(230,57,70,.1);color:#e63946;',   title: 'Brand Identity Masterclass',             desc: 'From zero to a complete visual system. Logo, color, typography, and brand guide — with live critique sessions.',    time: '11:00 AM – 2:00 PM EST',location: 'Virtual (Zoom)', free: false },
  { mon: 'MAY', day: '28', type: 'Webinar',    tagStyle: 'background:rgba(13,42,82,.08);color:#0d2a52;',   title: 'SEO & Content Strategy in 2026',         desc: 'What\'s actually working in organic search and content marketing today — tools, frameworks, and live case studies.',  time: '1:00 PM EST',           location: 'Virtual (Zoom)', free: true  },
  { mon: 'JUN', day: '10', type: 'Conference', tagStyle: 'background:rgba(39,174,96,.1);color:#27ae60;',   title: 'LaunchPoint DM Annual Growth Summit',     desc: 'Our flagship annual event — keynotes, workshops, and networking with 200+ founders, developers, and marketers.',    time: 'Full Day 9 AM – 6 PM',  location: 'Chicago, IL',    free: false }
]

const webinars = [
  'How to Build a High-Converting Website in 30 Days',
  'Paid Ads Playbook: Meta + Google for Growing Brands',
  'Brand Identity From Scratch: The Full System',
  'Email Marketing That Drives Revenue (Not Just Opens)',
  'Analytics Deep Dive: Turning Data Into Growth Decisions'
]
</script>
