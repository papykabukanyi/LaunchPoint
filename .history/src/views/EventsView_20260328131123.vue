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
          <h2 class="section-title mt-2 mb-3">On-Demand Webinar Library</h2>
          <p class="text-muted mb-4">Access our full library of recorded campaign strategy webinars — covering digital advertising, voter messaging, fundraising tactics, and more.</p>
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
            <p style="opacity:.85;font-size:.95rem;">Interested in hosting a BOS campaign workshop in your district? We bring our team and tools to you.</p>
            <ul class="list-unstyled" style="opacity:.85;">
              <li class="mb-2 small"><i class="fas fa-check me-2" style="color:#f4a832;"></i>Custom agenda for your candidate's needs</li>
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
      <p class="fs-5 mb-5" style="opacity:.9;max-width:560px;margin:0 auto 40px;">Subscribe to the Campaign Intelligence Brief and get first access to new events, workshops, and exclusive strategy content.</p>
      <a href="/#newsletter-section" class="btn btn-light btn-lg fw-bold rounded-pill px-5" style="color:#e63946;">Subscribe Free</a>
    </div>
  </section>
</template>

<script setup>
const events = [
  { mon: 'APR', day: '8',  type: 'Workshop',  tagStyle: 'background:rgba(230,57,70,.1);color:#e63946;',   title: 'Digital Advertising Bootcamp',             desc: 'Hands-on training on Facebook Ads, Google Search, and programmatic political advertising for campaign staff.',        time: '9:00 AM – 1:00 PM EST', location: 'Virtual (Zoom)', free: false },
  { mon: 'APR', day: '17', type: 'Webinar',   tagStyle: 'background:rgba(13,42,82,.08);color:#0d2a52;',   title: 'Voter Analytics Deep Dive',                desc: 'How to read, model, and act on voter file data to build winning turnout strategies for 2026.',                       time: '2:00 PM EST',           location: 'Virtual (Zoom)', free: true  },
  { mon: 'MAY', day: '2',  type: 'Networking',tagStyle: 'background:rgba(244,168,50,.12);color:#d4890a;', title: 'Campaign Manager Roundtable — DC',         desc: 'Exclusive in-person networking event for campaign managers and political consultants in the DC metro area.',          time: '6:00 PM – 9:00 PM EST', location: 'Washington, DC', free: false },
  { mon: 'MAY', day: '14', type: 'Workshop',  tagStyle: 'background:rgba(230,57,70,.1);color:#e63946;',   title: 'Fundraising Email Masterclass',            desc: 'Proven frameworks for writing fundraising emails that convert. Includes live copy critique session.',                 time: '11:00 AM – 2:00 PM EST',location: 'Virtual (Zoom)', free: false },
  { mon: 'MAY', day: '28', type: 'Webinar',   tagStyle: 'background:rgba(13,42,82,.08);color:#0d2a52;',   title: 'Social Media for the 2026 Midterms',       desc: 'Platform-by-platform playbook for what\'s working in political social media in 2026.',                              time: '1:00 PM EST',           location: 'Virtual (Zoom)', free: true  },
  { mon: 'JUN', day: '10', type: 'Conference',tagStyle: 'background:rgba(39,174,96,.1);color:#27ae60;',  title: 'BOS Annual Campaign Strategy Summit',       desc: 'Our flagship annual event featuring keynotes, workshops, and networking with 200+ political marketing professionals.', time: 'Full Day 9 AM – 6 PM',  location: 'Chicago, IL',    free: false }
]

const webinars = [
  'How to Build a Winning Digital Ad Strategy in 30 Days',
  'Voter Messaging Frameworks That Move Independents',
  'Crisis Communications: What to Do When Attacks Hit',
  'GOTV Playbook: The Final 72 Hours',
  'Email Fundraising: $0 to $100k in 60 Days'
]
</script>
