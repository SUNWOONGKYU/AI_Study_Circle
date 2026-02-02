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

// ========== Google Apps Script Form Endpoints ==========
// TODO: 아래 URL을 실제 Google Apps Script 배포 URL로 교체하세요
const SCRIPT_URL = '';

// ========== Form Submission ==========
function setStatus(el, message, type) {
    el.textContent = message;
    el.className = 'form-status ' + type;
}

function handleFormSubmit(form, statusEl, formType) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!SCRIPT_URL) {
            // Google Apps Script 미연동 시 localStorage에 임시 저장
            const data = Object.fromEntries(new FormData(form));

            // 체크박스 (interests) 복수값 처리
            if (formType === 'membership') {
                const checked = form.querySelectorAll('input[name="interests"]:checked');
                data.interests = Array.from(checked).map(c => c.value).join(', ');
            }

            data.formType = formType;
            data.submittedAt = new Date().toISOString();

            // localStorage에 저장
            const key = 'aisc_' + formType;
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            existing.push(data);
            localStorage.setItem(key, JSON.stringify(existing));

            setStatus(statusEl, '신청이 완료되었습니다! 감사합니다.', 'success');
            form.reset();
            return;
        }

        // Google Apps Script 연동
        setStatus(statusEl, '제출 중...', 'loading');
        const submitBtn = form.querySelector('.form-submit');
        submitBtn.disabled = true;

        try {
            const data = Object.fromEntries(new FormData(form));

            if (formType === 'membership') {
                const checked = form.querySelectorAll('input[name="interests"]:checked');
                data.interests = Array.from(checked).map(c => c.value).join(', ');
            }

            data.formType = formType;

            const res = await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            setStatus(statusEl, '신청이 완료되었습니다! 감사합니다.', 'success');
            form.reset();
        } catch (err) {
            setStatus(statusEl, '제출 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
        } finally {
            submitBtn.disabled = false;
        }
    });
}

const membershipForm = document.getElementById('membership-form');
const attendForm = document.getElementById('attend-form');

if (membershipForm) {
    handleFormSubmit(membershipForm, document.getElementById('membership-status'), 'membership');
}

if (attendForm) {
    handleFormSubmit(attendForm, document.getElementById('attend-status'), 'attend');
}

// ========== Attend toggle (show form under event) ==========
document.querySelectorAll('.attend-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
        const form = btn.nextElementSibling;
        if (form.style.display === 'none') {
            form.style.display = 'block';
            btn.textContent = '접기 ▲';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
        } else {
            form.style.display = 'none';
            btn.textContent = '이 모임 참여 신청하기 →';
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');
        }
    });
});
