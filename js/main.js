// ========== State ==========
let currentUser = null;
let currentProfile = null;
let currentEventId = null; // 첫 번째 활성 이벤트 ID (참여 신청용)

// ========== Scroll Reveal & Nav scroll are handled by js/animations.js (GSAP) ==========

// ========== Mobile menu toggle ==========
document.querySelector('.mobile-menu-btn').addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('show');
});

// ========== Modal ==========
const authModal = document.getElementById('auth-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');

function openModal(tab) {
    authModal.classList.add('open');
    document.body.style.overflow = 'hidden';

    if (!currentUser) {
        const isLogin = tab === 'login';
        document.getElementById('signup-form').style.display = isLogin ? 'none' : 'block';
        document.getElementById('login-form').style.display = isLogin ? 'block' : 'none';
        document.getElementById('membership-title').textContent = isLogin ? '로그인' : '멤버 가입';
    }
}

function closeModal() {
    authModal.classList.remove('open');
    document.body.style.overflow = '';
}

// 모든 data-open-modal 버튼에서 모달 열기
document.querySelectorAll('[data-open-modal]').forEach(el => {
    el.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(el.getAttribute('data-open-modal') || 'signup');
    });
});

// 닫기 버튼
if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

// 배경 클릭으로 닫기
if (authModal) authModal.addEventListener('click', (e) => {
    if (e.target === authModal) closeModal();
});

// ESC 키로 닫기
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && authModal && authModal.classList.contains('open')) closeModal();
});

// ========== Status helper ==========
function setStatus(el, message, type) {
    el.textContent = message;
    el.className = 'form-status ' + type;
}

// ========== Auth State Management ==========
async function initAuth() {
    const session = await Auth.getSession();
    if (session) {
        currentUser = session.user;
        try {
            currentProfile = await DB.getProfile(currentUser.id);
        } catch (e) {
            currentProfile = null;
        }
    }
    updateUI();
    loadFirstEvent();

    Auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
            currentUser = session.user;
            try {
                currentProfile = await DB.getProfile(currentUser.id);
            } catch (e) {
                currentProfile = null;
            }
            updateUI();
            loadFirstEvent();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            currentProfile = null;
            updateUI();
        }
    });
}

function updateUI() {
    const navLoginLink = document.getElementById('nav-login-link');
    const navSignupLink = document.getElementById('nav-signup-link');
    const navUserMenu = document.getElementById('nav-user-menu');
    const navUserName = document.getElementById('nav-user-name');
    const navAdminLink = document.getElementById('nav-admin-link');
    const authContainer = document.getElementById('auth-container');
    const profileContainer = document.getElementById('profile-container');
    const membershipTitle = document.getElementById('membership-title');
    const attendLoggedIn = document.getElementById('attend-logged-in');
    const attendLoginPrompt = document.getElementById('attend-login-prompt');
    const attendGuestBtn = document.getElementById('attend-guest-btn');

    if (currentUser && currentProfile) {
        // 로그인 상태
        navLoginLink.style.display = 'none';
        navSignupLink.style.display = 'none';
        navUserMenu.style.display = 'block';
        navUserName.textContent = currentProfile.name || currentUser.email;

        // 관리자 링크
        if (currentProfile.role === 'admin') {
            navAdminLink.style.display = 'block';
        } else {
            navAdminLink.style.display = 'none';
        }

        // 멤버십 섹션 → 프로필 모드
        authContainer.style.display = 'none';
        profileContainer.style.display = 'block';
        membershipTitle.textContent = '내 프로필';

        // 프로필 폼 채우기
        fillProfileForm();

        // 참여 신청
        attendLoggedIn.style.display = 'block';
        attendLoginPrompt.style.display = 'none';
        if (attendGuestBtn) attendGuestBtn.style.display = 'none';

        // 참여 폼에 이름/전화 자동입력
        const aName = document.getElementById('a-name');
        const aContact = document.getElementById('a-contact');
        if (aName) aName.value = currentProfile.name || '';
        if (aContact) aContact.value = currentProfile.phone || '';
    } else {
        // 비로그인 상태
        navLoginLink.style.display = 'block';
        navSignupLink.style.display = 'block';
        navUserMenu.style.display = 'none';
        navAdminLink.style.display = 'none';

        authContainer.style.display = 'block';
        profileContainer.style.display = 'none';

        attendLoggedIn.style.display = 'none';
        attendLoginPrompt.style.display = 'none';
        if (attendGuestBtn) attendGuestBtn.style.display = '';
    }
}

function fillProfileForm() {
    if (!currentProfile) return;
    document.getElementById('p-name').value = currentProfile.name || '';
    document.getElementById('p-contact').value = currentProfile.phone || '';
    document.getElementById('p-type').value = currentProfile.member_type || '';
    document.getElementById('p-message').value = currentProfile.message || '';

    // 관심분야 체크
    const checkboxes = document.querySelectorAll('#profile-interests input[type="checkbox"]');
    const interests = currentProfile.interests || [];
    checkboxes.forEach(cb => {
        cb.checked = interests.includes(cb.value);
    });
}

// ========== Load first active event ==========
async function loadFirstEvent() {
    try {
        const events = await DB.getEvents();
        if (events.length > 0) {
            currentEventId = events[0].id;
            document.getElementById('attend-event-id').value = currentEventId;

            // 이미 참여했는지 확인
            if (currentUser) {
                checkAttendance();
            }
        }
    } catch (e) {
        // 이벤트 로드 실패 시 하드코딩된 UI 유지
    }
}

async function checkAttendance() {
    if (!currentUser || !currentEventId) return;
    try {
        const attendance = await DB.getMyAttendance(currentUser.id);
        const existing = attendance.find(a => a.event_id === currentEventId);
        const toggleBtn = document.getElementById('attend-toggle-btn');
        const attendForm = document.getElementById('attend-form');
        const attendAlready = document.getElementById('attend-already');

        if (existing) {
            toggleBtn.style.display = 'none';
            attendForm.style.display = 'none';
            attendAlready.style.display = 'block';
        } else {
            toggleBtn.style.display = '';
            attendAlready.style.display = 'none';
        }
    } catch (e) {
        // 무시
    }
}

// ========== Auth Tabs (removed — signup/login are separate views now) ==========

// ========== Sign Up ==========
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusEl = document.getElementById('signup-status');
    const btn = e.target.querySelector('.form-submit');

    const email = document.getElementById('s-email').value.trim();
    const password = document.getElementById('s-password').value;
    const name = document.getElementById('s-name').value.trim();
    const phone = document.getElementById('s-contact').value.trim();
    const memberType = document.getElementById('s-type').value;
    const message = document.getElementById('s-message').value.trim();
    const checked = e.target.querySelectorAll('input[name="interests"]:checked');
    const interests = Array.from(checked).map(c => c.value);

    // 비밀번호 유효성: 영문+숫자만, 6자 이상
    if (password.length < 6) {
        setStatus(statusEl, '비밀번호는 6자 이상이어야 합니다.', 'error');
        return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(password)) {
        setStatus(statusEl, '비밀번호는 영문과 숫자만 사용할 수 있습니다.', 'error');
        return;
    }

    setStatus(statusEl, '가입 처리 중...', 'loading');
    btn.disabled = true;

    try {
        await Auth.signUp(email, password, { name, phone });

        // 트리거가 profiles row를 생성할 시간 확보
        await new Promise(r => setTimeout(r, 1000));

        const session = await Auth.getSession();
        if (session) {
            // 프로필 업데이트 (최대 3회 재시도)
            for (let i = 0; i < 3; i++) {
                try {
                    await DB.updateProfile(session.user.id, {
                        interests,
                        member_type: memberType,
                        message
                    });
                    break;
                } catch (retryErr) {
                    if (i < 2) await new Promise(r => setTimeout(r, 1000));
                }
            }
        }

        setStatus(statusEl, '가입이 완료되었습니다! 환영합니다.', 'success');
        e.target.reset();
        setTimeout(closeModal, 1500);
    } catch (err) {
        let msg = '가입 중 오류가 발생했습니다.';
        if (err.message.includes('already registered')) {
            msg = '이미 등록된 이메일입니다.';
        } else if (err.message.includes('password')) {
            msg = '비밀번호는 6자 이상이어야 합니다.';
        }
        setStatus(statusEl, msg, 'error');
    } finally {
        btn.disabled = false;
    }
});

// ========== Login ==========
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusEl = document.getElementById('login-status');
    const btn = e.target.querySelector('.form-submit');

    const email = document.getElementById('l-email').value.trim();
    const password = document.getElementById('l-password').value;

    setStatus(statusEl, '로그인 중...', 'loading');
    btn.disabled = true;

    try {
        await Auth.signIn(email, password);
        setStatus(statusEl, '로그인 성공!', 'success');
        e.target.reset();
        setTimeout(closeModal, 1000);
    } catch (err) {
        setStatus(statusEl, '이메일 또는 비밀번호가 올바르지 않습니다.', 'error');
    } finally {
        btn.disabled = false;
    }
});

// ========== Profile Update ==========
document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusEl = document.getElementById('profile-status');
    const btn = e.target.querySelector('.form-submit');

    const name = document.getElementById('p-name').value.trim();
    const phone = document.getElementById('p-contact').value.trim();
    const memberType = document.getElementById('p-type').value;
    const message = document.getElementById('p-message').value.trim();
    const checked = e.target.querySelectorAll('input[name="interests"]:checked');
    const interests = Array.from(checked).map(c => c.value);

    setStatus(statusEl, '저장 중...', 'loading');
    btn.disabled = true;

    try {
        currentProfile = await DB.updateProfile(currentUser.id, {
            name,
            phone,
            interests,
            member_type: memberType,
            message
        });
        document.getElementById('nav-user-name').textContent = name;
        setStatus(statusEl, '프로필이 저장되었습니다.', 'success');
    } catch (err) {
        setStatus(statusEl, '저장 중 오류가 발생했습니다.', 'error');
    } finally {
        btn.disabled = false;
    }
});

// ========== Attend Toggle ==========
const attendToggleBtn = document.getElementById('attend-toggle-btn');
if (attendToggleBtn) {
    attendToggleBtn.addEventListener('click', () => {
        const form = document.getElementById('attend-form');
        if (form.style.display === 'none') {
            form.style.display = 'block';
            attendToggleBtn.textContent = '접기 ▲';
            attendToggleBtn.classList.remove('btn-primary');
            attendToggleBtn.classList.add('btn-secondary');
        } else {
            form.style.display = 'none';
            attendToggleBtn.textContent = '이 모임 참여 신청하기 →';
            attendToggleBtn.classList.remove('btn-secondary');
            attendToggleBtn.classList.add('btn-primary');
        }
    });
}

// ========== Attend Submit ==========
const attendForm = document.getElementById('attend-form');
if (attendForm) {
    attendForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusEl = document.getElementById('attend-status');
        const btn = e.target.querySelector('.form-submit');
        const note = document.getElementById('a-note').value.trim();
        const eventId = parseInt(document.getElementById('attend-event-id').value);

        if (!currentUser || !eventId) {
            setStatus(statusEl, '로그인이 필요합니다.', 'error');
            return;
        }

        setStatus(statusEl, '신청 중...', 'loading');
        btn.disabled = true;

        try {
            await DB.attendEvent(currentUser.id, eventId, note);
            setStatus(statusEl, '참여 신청이 완료되었습니다!', 'success');
            e.target.reset();
            checkAttendance();
        } catch (err) {
            if (err.message.includes('duplicate') || err.code === '23505') {
                setStatus(statusEl, '이미 참여 신청한 모임입니다.', 'error');
            } else {
                setStatus(statusEl, '신청 중 오류가 발생했습니다.', 'error');
            }
        } finally {
            btn.disabled = false;
        }
    });
}

// ========== Cancel Attendance ==========
const cancelBtn = document.getElementById('cancel-attend-btn');
if (cancelBtn) {
    cancelBtn.addEventListener('click', async () => {
        if (!currentUser || !currentEventId) return;
        try {
            await DB.cancelAttendance(currentUser.id, currentEventId);
            document.getElementById('attend-already').style.display = 'none';
            document.getElementById('attend-toggle-btn').style.display = '';
        } catch (err) {
            alert('취소 중 오류가 발생했습니다.');
        }
    });
}

// ========== Nav User Dropdown ==========
const navUserBtn = document.getElementById('nav-user-btn');
const navDropdown = document.getElementById('nav-dropdown');

if (navUserBtn) {
    navUserBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navDropdown.classList.toggle('show');
    });
}

document.addEventListener('click', () => {
    if (navDropdown) navDropdown.classList.remove('show');
});

// Dropdown actions
document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', async (e) => {
        const action = e.target.dataset.action;
        if (action === 'logout') {
            e.preventDefault();
            try {
                await Auth.signOut();
            } catch (err) {
                // 무시
            }
        }
        navDropdown.classList.remove('show');
    });
});

// ========== Init ==========
try { initAuth(); } catch(e) { console.error('Auth init error:', e); }
