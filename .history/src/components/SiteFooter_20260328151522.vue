<template>
  <footer class="bos-footer">
    <div class="container">
      <div class="row gy-4 pb-4">
        <div class="col-lg-4">
          <h5 class="text-white fw-bold mb-3"><i class="fas fa-rocket me-2" style="color:#f4a832;"></i>LaunchPoint <em>DM</em></h5>
          <p class="small mb-3">Full-service development &amp; marketing agency. We build brands, launch products, and drive measurable growth through strategy, design, and technology.</p>
          <div class="d-flex gap-2">
            <a href="#" class="social-btn"><i class="fab fa-facebook-f"></i></a>
            <a href="#" class="social-btn"><i class="fab fa-twitter"></i></a>
            <a href="#" class="social-btn"><i class="fab fa-linkedin-in"></i></a>
            <a href="#" class="social-btn"><i class="fab fa-instagram"></i></a>
          </div>
        </div>
        <div class="col-lg-2 col-sm-6">
          <h6 class="text-white fw-bold mb-3">Company</h6>
          <ul class="list-unstyled small">
            <li class="mb-2"><RouterLink to="/">Home</RouterLink></li>
            <li class="mb-2"><RouterLink to="/service">Services &amp; Pricing</RouterLink></li>
            <li class="mb-2"><RouterLink to="/about">About Us</RouterLink></li>
          </ul>
        </div>
        <div class="col-lg-2 col-sm-6">
          <h6 class="text-white fw-bold mb-3">Solutions</h6>
          <ul class="list-unstyled small">
            <li class="mb-2"><RouterLink to="/about#web-dev">Web Development</RouterLink></li>
            <li class="mb-2"><RouterLink to="/about#app-dev">App Development</RouterLink></li>
            <li class="mb-2"><RouterLink to="/about#social-media">Social Media</RouterLink></li>
            <li class="mb-2"><RouterLink to="/about#digital-marketing">Digital Marketing</RouterLink></li>
            <li class="mb-2"><RouterLink to="/about#analytics">Analytics &amp; Data</RouterLink></li>
          </ul>
        </div>
        <div class="col-lg-4">
          <h6 class="text-white fw-bold mb-3">Get In Touch</h6>
          <p class="small mb-1"><i class="fas fa-envelope me-2" style="color:#f4a832;"></i>info@launchpointdm.com</p>
          <p class="small mb-3"><i class="fas fa-phone me-2" style="color:#f4a832;"></i>+1 (555) 720-0100</p>
          <a href="#contact" class="btn btn-warning btn-sm fw-bold rounded-pill px-4" style="color:#0d2a52;">Start Your Project</a>
        </div>
      </div>
      <hr style="border-color:rgba(255,255,255,.1);">
      <div class="d-flex flex-wrap justify-content-between align-items-center pt-2">
        <small>&copy; {{ year }} LaunchPoint DM. All rights reserved.</small>
        <div class="d-flex gap-3">
          <RouterLink to="/" class="small">Home</RouterLink>
          <RouterLink to="/service" class="small">Services</RouterLink>
          <RouterLink to="/about" class="small">About</RouterLink>
        </div>
      </div>
    </div>
  </footer>

  <!-- Newsletter Float Badge -->
  <a href="#newsletter-section" id="nl-float-btn"
     style="position:fixed;bottom:28px;right:28px;z-index:999;background:#0d2a52;color:#fff;border-radius:50px;padding:11px 22px;font-size:.85rem;font-weight:700;text-decoration:none;box-shadow:0 4px 18px rgba(0,0,0,.25);display:flex;align-items:center;gap:8px;transition:transform .2s,box-shadow .2s;"
     @mouseover="e => { e.target.style.transform='translateY(-3px)'; e.target.style.boxShadow='0 8px 28px rgba(0,0,0,.3)'; }"
     @mouseout="e => { e.target.style.transform=''; e.target.style.boxShadow='0 4px 18px rgba(0,0,0,.25)'; }">
     <i class="fas fa-envelope" style="color:#f4a832;"></i> Growth Insights Brief
  </a>
</template>

<script setup>
const year = new Date().getFullYear()
</script>
