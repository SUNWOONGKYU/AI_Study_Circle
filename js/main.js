// ========== Scroll Reveal ==========
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

reveals.forEach(el => observer.observe(el));

// ========== Stagger children animations ==========
document.querySelectorAll('.activities-grid .activity-card, .member-types .member-type').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.08}s`;
});

// ========== Nav background on scroll ==========
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.style.background = 'var(--bg-nav-scroll)';
    } else {
        nav.style.background = 'var(--bg-nav)';
    }
});

// ========== Mobile menu toggle ==========
document.querySelector('.mobile-menu-btn').addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('show');
});
