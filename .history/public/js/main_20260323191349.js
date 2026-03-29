// main.js — Page initialisation entry point
// Runs after all other scripts (config, api, analytics, dynamic) have loaded

(function () {
    'use strict';

    function init() {
        // Track page view via analytics module
        if (window.Analytics) {
            Analytics.trackPageView();
        }

        // Restore UTM data from URL into session storage for downstream use
        try {
            const params = new URLSearchParams(window.location.search);
            const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
            const utmData = {};
            let hasUtm = false;

            utmKeys.forEach(key => {
                const val = params.get(key);
                if (val) { utmData[key] = val; hasUtm = true; }
            });

            if (hasUtm && window.AppConfig && AppConfig.utils) {
                AppConfig.utils.setSessionStorage('utmData', utmData);
            }
        } catch (e) { /* ignore */ }

        // Newsletter quick-subscribe forms (if present on page)
        document.querySelectorAll('[data-newsletter-form]').forEach(form => {
            form.addEventListener('submit', async function (e) {
                e.preventDefault();
                const emailEl = form.querySelector('input[type="email"]');
                if (!emailEl || !emailEl.value) return;

                try {
                    if (window.API) {
                        await API.subscribeNewsletter(emailEl.value);
                    }
                    emailEl.value = '';
                    const msg = form.querySelector('[data-success]');
                    if (msg) msg.style.display = 'block';
                } catch (err) {
                    const errEl = form.querySelector('[data-error]');
                    if (errEl) { errEl.textContent = err.message; errEl.style.display = 'block'; }
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
