// dynamic.js — Page initialisation, campaign data loading, and UI enhancements

(function () {
    'use strict';

    // ---- Loading Screen ----
    function hideLoadingScreen() {
        const screen = document.getElementById('loading-screen');
        if (!screen) return;
        screen.style.transition = 'opacity 0.4s ease';
        screen.style.opacity = '0';
        setTimeout(() => { screen.style.display = 'none'; }, 420);
    }

    // ---- Apply Campaign Data to DOM ----
    function applyCampaignData(data) {
        if (!data) return;

        const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };
        const attr = (id, attr, val) => { const el = document.getElementById(id); if (el && val) el.setAttribute(attr, val); };

        set('campaign-name',   data.campaign_name  || data.name);
        set('candidate-name',  data.candidate_name || data.candidate);
        set('page-title',      data.seo_title);
        set('firm-name',       'Blue Ocean Strategies');

        attr('page-description', 'content', data.seo_description);
        attr('page-keywords',    'content', data.seo_keywords);
        attr('og-title',         'content', data.seo_title);
        attr('og-description',   'content', data.seo_description);
        attr('canonical-url',    'href',    window.location.href);

        // Apply brand colours
        if (data.primary_color || (data.colors && data.colors.primary)) {
            const root = document.documentElement;
            root.style.setProperty('--primary-blue',   data.primary_color   || data.colors.primary   || '#1e3a8a');
            root.style.setProperty('--secondary-blue', data.secondary_color || data.colors.secondary || '#3b82f6');
            root.style.setProperty('--accent-red',     data.accent_color    || data.colors.accent    || '#dc2626');
        }
    }

    // ---- Load Campaign from API ----
    async function loadCampaign() {
        // Try AppConfig helper first (it also patches AppConfig.CAMPAIGN)
        if (window.AppConfig && typeof AppConfig.loadCampaignConfig === 'function') {
            try {
                const data = await AppConfig.loadCampaignConfig(1);
                if (data) { applyCampaignData(data); return; }
            } catch (e) { /* fall through */ }
        }

        // Fallback: raw fetch
        try {
            const res = await fetch('/api/campaign/1');
            if (res.ok) {
                const data = await res.json();
                applyCampaignData(data);
            }
        } catch (e) { /* ignore — static defaults remain */ }
    }

    // ---- Animated Counters ----
    function initCounters() {
        const counters = document.querySelectorAll('[data-count]');
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    entry.target.dataset.animated = 'true';
                    const target = parseInt(entry.target.dataset.count, 10) || 0;
                    const duration = 1500;
                    const increment = target / (duration / 16);
                    let current = 0;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) { current = target; clearInterval(timer); }
                        entry.target.textContent = Math.floor(current).toLocaleString();
                    }, 16);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(el => observer.observe(el));
    }

    // ---- Smooth Scroll ----
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', function (e) {
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // ---- Sticky Navbar ----
    function initNavbar() {
        const navbar = document.querySelector('.navbar, .header, nav');
        if (!navbar) return;
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });
    }

    // ---- Mobile Nav Toggle ----
    function initMobileNav() {
        const toggle = document.getElementById('nav-toggle');
        const menu   = document.getElementById('main-nav');
        if (!toggle || !menu) return;
        toggle.addEventListener('click', () => {
            menu.classList.toggle('open');
            toggle.classList.toggle('active');
        });
        // Close on nav link click
        menu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('open');
                toggle.classList.remove('active');
            });
        });
    }

    // ---- Main Init ----
    async function init() {
        // Always hide the loading screen — whether data loads or not
        const campaignPromise = loadCampaign();

        // Hide screen after campaign load, but no longer than 1.5s
        const timeout = new Promise(resolve => setTimeout(resolve, 1500));
        await Promise.race([campaignPromise, timeout]);

        hideLoadingScreen();

        // Secondary UI setup (non-blocking)
        initCounters();
        initSmoothScroll();
        initNavbar();
        initMobileNav();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

