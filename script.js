// Political Marketing Website - JavaScript
// Contact Form Validation and Interactive Features

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = 80; // Account for fixed header
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Contact Form Validation and Submission
    const contactForm = document.getElementById('contactForm');
    const formFeedback = document.getElementById('formFeedback');
    
    if (contactForm) {
        // Form validation rules
        const validators = {
            firstName: {
                required: true,
                minLength: 2,
                pattern: /^[a-zA-Z\s-']+$/,
                message: 'First name must be at least 2 characters and contain only letters, spaces, hyphens, and apostrophes.'
            },
            lastName: {
                required: true,
                minLength: 2,
                pattern: /^[a-zA-Z\s-']+$/,
                message: 'Last name must be at least 2 characters and contain only letters, spaces, hyphens, and apostrophes.'
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address.'
            },
            phone: {
                required: false,
                pattern: /^[\+]?[1-9][\d]{0,15}$/,
                message: 'Please enter a valid phone number (digits, spaces, hyphens, and + allowed).'
            },
            message: {
                required: true,
                minLength: 10,
                maxLength: 1000,
                message: 'Message must be between 10 and 1000 characters.'
            }
        };
        
        // Validate individual field
        function validateField(fieldName, value) {
            const rules = validators[fieldName];
            if (!rules) return { isValid: true };
            
            // Check required
            if (rules.required && (!value || value.trim() === '')) {
                return { 
                    isValid: false, 
                    message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required.` 
                };
            }
            
            // If field is empty and not required, it's valid
            if (!value || value.trim() === '') {
                return { isValid: true };
            }
            
            // Check minimum length
            if (rules.minLength && value.length < rules.minLength) {
                return { 
                    isValid: false, 
                    message: rules.message || `Must be at least ${rules.minLength} characters.` 
                };
            }
            
            // Check maximum length
            if (rules.maxLength && value.length > rules.maxLength) {
                return { 
                    isValid: false, 
                    message: rules.message || `Must be no more than ${rules.maxLength} characters.` 
                };
            }
            
            // Check pattern
            if (rules.pattern && !rules.pattern.test(value)) {
                return { 
                    isValid: false, 
                    message: rules.message || 'Invalid format.' 
                };
            }
            
            return { isValid: true };
        }
        
        // Show field error
        function showFieldError(fieldName, message) {
            const field = document.getElementById(fieldName);
            const errorElement = document.getElementById(fieldName + 'Error');
            const formGroup = field.closest('.form-group');
            
            if (field && errorElement && formGroup) {
                formGroup.classList.add('error');
                errorElement.textContent = message;
                field.setAttribute('aria-invalid', 'true');
            }
        }
        
        // Clear field error
        function clearFieldError(fieldName) {
            const field = document.getElementById(fieldName);
            const errorElement = document.getElementById(fieldName + 'Error');
            const formGroup = field.closest('.form-group');
            
            if (field && errorElement && formGroup) {
                formGroup.classList.remove('error');
                errorElement.textContent = '';
                field.removeAttribute('aria-invalid');
            }
        }
        
        // Real-time validation on blur
        Object.keys(validators).forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                field.addEventListener('blur', function() {
                    const validation = validateField(fieldName, this.value);
                    if (!validation.isValid) {
                        showFieldError(fieldName, validation.message);
                    } else {
                        clearFieldError(fieldName);
                    }
                });
                
                // Clear error on input
                field.addEventListener('input', function() {
                    if (this.closest('.form-group').classList.contains('error')) {
                        clearFieldError(fieldName);
                    }
                });
            }
        });
        
        // Form submission
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = {};
            let isFormValid = true;
            
            // Validate all fields
            Object.keys(validators).forEach(fieldName => {
                const value = formData.get(fieldName) || '';
                data[fieldName] = value;
                
                const validation = validateField(fieldName, value);
                if (!validation.isValid) {
                    showFieldError(fieldName, validation.message);
                    isFormValid = false;
                } else {
                    clearFieldError(fieldName);
                }
            });
            
            // Show form feedback
            if (isFormValid) {
                // Simulate form submission (replace with actual form submission logic)
                showFormFeedback('success', 'Thank you for your message! We\'ll get back to you soon.');
                
                // Reset form after successful submission
                setTimeout(() => {
                    contactForm.reset();
                    hideFormFeedback();
                }, 5000);
                
                // In a real implementation, you would submit the data to your server here
                console.log('Form data to be submitted:', data);
                
                // Example of how you might submit to a server:
                /*
                try {
                    const response = await fetch('/api/contact', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });
                    
                    if (response.ok) {
                        showFormFeedback('success', 'Thank you for your message! We\'ll get back to you soon.');
                        contactForm.reset();
                    } else {
                        throw new Error('Server error');
                    }
                } catch (error) {
                    showFormFeedback('error', 'Sorry, there was an error sending your message. Please try again later.');
                }
                */
                
            } else {
                showFormFeedback('error', 'Please correct the errors above and try again.');
            }
        });
        
        // Show form feedback message
        function showFormFeedback(type, message) {
            formFeedback.className = `form-feedback ${type}`;
            formFeedback.textContent = message;
            formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        // Hide form feedback message
        function hideFormFeedback() {
            formFeedback.className = 'form-feedback';
            formFeedback.textContent = '';
        }
    }
    
    // Fade-in animation for elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for fade-in animation
    document.querySelectorAll('.platform-item, .achievement, .contact-info, .contact-form').forEach(el => {
        observer.observe(el);
    });
    
    // Active navigation link highlighting
    function highlightActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = '';
        const scrollPosition = window.scrollY + 100; // Offset for fixed header
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Throttled scroll event for performance
    let ticking = false;
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(function() {
                highlightActiveNav();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', onScroll);
    
    // Initialize active nav on page load
    highlightActiveNav();
    
    // Keyboard accessibility for custom checkbox
    document.querySelectorAll('.checkbox-label input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.checked = !this.checked;
            }
        });
    });
    
    // Form accessibility - announce errors to screen readers
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.textContent = message;
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
    
    // Add ARIA attributes for better accessibility
    contactForm?.setAttribute('novalidate', 'true'); // We handle validation with JavaScript
    
    // Platform items hover effect enhancement
    document.querySelectorAll('.platform-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Handle window resize for mobile navigation
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navMenu?.classList.remove('active');
            navToggle?.classList.remove('active');
        }
    });
    
    // Escape key to close mobile menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu?.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle?.classList.remove('active');
        }
    });
    
    console.log('Political Marketing Website initialized successfully!');
});