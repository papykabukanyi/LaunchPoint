// dynamic.js — Page-specific UI enhancements
// Handles counter animations, scroll reveal, and dynamic content loading

(function () {
    'use strict';

    // Animated counter for stat elements
    function animateCounter(el, target, duration) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = Math.floor(current).toLocaleString();
        }, 16);
    }

    // Trigger counters when they scroll into view
    function initCounters() {
        const counters = document.querySelectorAll('[data-count]');
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    entry.target.dataset.animated = 'true';
                    const target = parseInt(entry.target.dataset.count, 10) || 0;
                    animateCounter(entry.target, target, 1500);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(el => observer.observe(el));
    }

    // Smooth scroll for anchor links
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

    // Sticky navbar shadow
    function initNavbar() {
        const navbar = document.querySelector('.navbar, nav');
        if (!navbar) return;
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        initCounters();
        initSmoothScroll();
        initNavbar();
    }
})();
