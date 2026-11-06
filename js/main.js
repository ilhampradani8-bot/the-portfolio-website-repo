/* ============================================================
   SHARED UTILITIES & UI LOGIC
   ============================================================ */

const parseDate = (str) => {
    if (!str) return new Date(0);
    const s = str.trim().toLowerCase();
    if (s.includes('/')) {
        const [d, m, y] = s.split('/');
        return new Date(`${y}-${m}-${d}`);
    }
    const months = {
        'januari': 0, 'februari': 1, 'maret': 2, 'april': 3, 'mei': 4, 'juni': 5,
        'juli': 6, 'agustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'desember': 11,
        'january': 0, 'february': 1, 'march': 2, 'may': 4, 'june': 5,
        'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
    };
    const parts = s.split(' ');
    if (parts.length === 3) return new Date(parts[2], months[parts[1]] || 0, parts[0]);
    return new Date(str);
};

const getTranslatedLabel = (key, fallback) => {
    const lang = localStorage.getItem('preferred_lang') || 'id';
    return lang === 'en' ? 'NEW' : 'BARU';
};

window.switchLang = function (lang) {
    localStorage.setItem('preferred_lang', lang);
    location.reload();
};

window.openProfileZoom = function () {
    const modal = document.getElementById('profile-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }
};

window.closeProfileZoom = function () {
    const modal = document.getElementById('profile-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
    }
};

window.toggleMobileMenu = function (open) {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        if (open) {
            menu.classList.remove('hidden');
            menu.classList.add('flex');
            document.body.style.overflow = 'hidden';
        } else {
            menu.classList.add('hidden');
            menu.classList.remove('flex');
            document.body.style.overflow = '';
        }
    }
};

window.toggleAccordion = function (id) {
    const element = document.getElementById(id);
    const arrow = document.getElementById('arrow-' + id);
    if (element) {
        if (element.classList.contains('hidden')) {
            element.classList.remove('hidden');
            element.classList.add('flex');
            if (arrow) arrow.classList.add('rotate-180');
        } else {
            element.classList.add('hidden');
            element.classList.remove('flex');
            if (arrow) arrow.classList.remove('rotate-180');
        }
    }
};
function updateLangUI() {
    const lang = localStorage.getItem('preferred_lang') || 'id';

    // 1. Desktop dropdown label / capsule text
    const currentLangText = document.getElementById('current-lang-text');
    if (currentLangText) {
        currentLangText.textContent = lang.toUpperCase();
    }
    const activeLangLabel = document.getElementById('active-lang-label');
    if (activeLangLabel) {
        activeLangLabel.textContent = lang.toUpperCase();
    }

    // 2. Mobile buttons (Glassmorphism Pill Bubbles)
    const langList = ['id', 'en', 'zh', 'ja', 'ko', 'ru', 'fr'];
    langList.forEach(l => {
        const mBtn = document.getElementById(`m-btn-${l}`);
        if (mBtn) {
            if (l === lang) {
                mBtn.className = "text-[10px] font-black text-blue-600 px-3 py-1.5 bg-white/80 backdrop-blur-md border border-blue-300/80 shadow-[0_4px_12px_rgba(37,99,235,0.14),inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-full cursor-pointer transition-all";
            } else {
                mBtn.className = "text-[10px] font-black text-gray-700 px-3 py-1.5 bg-white/45 backdrop-blur-md border border-white/85 shadow-[0_2px_8px_rgba(15,23,42,0.06),inset_0_1px_1px_rgba(255,255,255,0.9)] rounded-full cursor-pointer transition-all";
            }
        }
    });

    // 3. Footer buttons
    const fActiveLang = document.getElementById('f-active-lang');
    if (fActiveLang) {
        fActiveLang.textContent = lang.toUpperCase();
    }
    langList.forEach(l => {
        const fBtn = document.getElementById(`f-btn-${l}`);
        if (fBtn) {
            if (l === lang) {
                fBtn.className = "block w-full text-left px-2 py-1 text-[9px] font-black text-blue-400 bg-gray-950 rounded transition-colors";
            } else {
                fBtn.className = "block w-full text-left px-2 py-1 text-[9px] font-extrabold text-gray-400 hover:text-white rounded transition-colors";
            }
        }
    });
}

let cachedTranslations = null;
let cachedLang = null;

async function applyTranslations() {
    const lang = localStorage.getItem('preferred_lang') || 'id';

    // 1. Instant Synchronous Language Toggle for .lang-* classes (No network delay)
    const isId = lang === 'id';
    const isZh = lang === 'zh';
    const isEn = !isId && !isZh;

    document.querySelectorAll('.lang-id').forEach(el => el.classList.toggle('hidden', !isId));
    document.querySelectorAll('.lang-en').forEach(el => el.classList.toggle('hidden', !isEn));
    document.querySelectorAll('.lang-zh').forEach(el => el.classList.toggle('hidden', !isZh));

    // 2. Fetch and apply dictionary [data-t] translations
    try {
        if (!cachedTranslations || cachedLang !== lang) {
            const isDev = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1' || 
                          window.location.port === '5501' || 
                          window.location.hostname.includes('139.59.122.230');
            const url = `lang/${lang}.json` + (isDev ? `?t=${Date.now()}` : '');
            const response = await fetch(url);
            if (!response.ok) return;
            cachedTranslations = await response.json();
            cachedLang = lang;
        }
        const t = cachedTranslations;
        document.querySelectorAll('[data-t]').forEach(el => {
            const key = el.getAttribute('data-t');
            if (t && t[key]) {
                const icon = el.querySelector('i[data-lucide], svg.lucide');
                if (icon) {
                    const iconHTML = icon.outerHTML;
                    if (el.innerHTML.trim().startsWith('<i') || el.innerHTML.trim().startsWith('<svg')) {
                        el.innerHTML = iconHTML + ' ' + t[key];
                    } else {
                        el.innerHTML = t[key] + ' ' + iconHTML;
                    }
                } else {
                    el.innerHTML = t[key];
                }
            }
        });
    } catch (e) {
        console.warn("Translation Notice:", e);
    }
}
window.applyTranslations = applyTranslations;

window.setLoadingProgress = function(percentage) {
    const bar = document.getElementById('nav-loading-bar');
    if (bar) {
        bar.style.width = `${percentage}%`;
        if (percentage >= 100) {
            setTimeout(() => {
                bar.style.opacity = '0';
                setTimeout(() => {
                    bar.style.width = '0';
                    bar.style.opacity = '1';
                }, 500);
            }, 600);
        }
    }
};

async function loadComponent(id, file) {
    const el = document.getElementById(id);
    if (!el) return;
    try {
        const url = file + `?t=${Date.now()}`;
        const res = await fetch(url, { cache: 'no-cache' });
        if (res.ok) {
            el.innerHTML = await res.text();
            updateLangUI();
            await applyTranslations();
            if (window.lucide) {
                lucide.createIcons();
            }
            if (id === 'header-placeholder') {
                window.setLoadingProgress(15);
            }
        }
    } catch (e) { console.error("Component Error:", e); }
}

// Global Aliases for Compatibility
window.loadComponent = loadComponent;
window.loadPart = loadComponent;

window.setTheme = function(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light-theme');
        localStorage.setItem('theme', 'dark');
    }
};

// Auto apply theme
(function() {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') document.body.classList.add('light-theme');
})();

// Lenis Smooth Scroll Initialization
if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1.1,
    });
    window.lenis = lenis;

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}

// Global Event Delegation for Anchor Navigation & Dropdown Controls
document.addEventListener('click', function (e) {
    // 1. Dropdown Toggle Click (Mobile & Touch Support)
    const dropdownTrigger = e.target.closest('.nav-dropdown-btn');
    const allDropdowns = document.querySelectorAll('.nav-dropdown-menu');

    if (dropdownTrigger) {
        e.preventDefault();
        e.stopPropagation();
        const container = dropdownTrigger.closest('.nav-dropdown-container');
        const menu = container ? container.querySelector('.nav-dropdown-menu') : null;

        allDropdowns.forEach(d => {
            if (d !== menu) d.classList.remove('dropdown-open');
        });

        if (menu) {
            menu.classList.toggle('dropdown-open');
        }
        return;
    } else {
        // Close dropdowns if clicking outside dropdown menus
        if (!e.target.closest('.nav-dropdown-menu')) {
            allDropdowns.forEach(d => d.classList.remove('dropdown-open'));
        }
    }

    // 2. Global Anchor Navigation
    const anchor = e.target.closest('a[href*="#"]');
    if (!anchor) return;

    const rawHref = anchor.getAttribute('href');
    if (!rawHref || rawHref === '#' || rawHref.startsWith('javascript:')) return;

    const hashIndex = rawHref.indexOf('#');
    if (hashIndex === -1) return;

    const hash = rawHref.substring(hashIndex);
    const targetId = hash.substring(1);
    if (!targetId) return;

    // Check if target element exists in CURRENT DOM
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
        // Element exists on current page -> smooth scroll
        e.preventDefault();
        if (typeof window.toggleMobileMenu === 'function') {
            window.toggleMobileMenu(false);
        }
        allDropdowns.forEach(d => d.classList.remove('dropdown-open'));

        if (window.lenis) {
            window.lenis.scrollTo(targetEl, {
                offset: -80,
                duration: 1.0,
            });
        } else {
            targetEl.scrollIntoView({ behavior: 'smooth' });
        }

        if (window.history && window.history.pushState) {
            window.history.pushState(null, null, hash);
        }
    } else {
        // Target does NOT exist on current page -> redirect to index.html with target hash
        const urlBeforeHash = rawHref.substring(0, hashIndex);
        if (urlBeforeHash === '' || urlBeforeHash === 'index.html' || urlBeforeHash === '/' || urlBeforeHash.endsWith('index.html')) {
            e.preventDefault();
            window.location.href = 'index.html#' + targetId;
        }
    }
});

// Auto-scroll to hash on initial load (e.g., when arriving at index.html#services)
window.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    if (window.location.hash) {
        const hashId = window.location.hash.substring(1);
        setTimeout(() => {
            const targetEl = document.getElementById(hashId);
            if (targetEl) {
                if (window.lenis) {
                    window.lenis.scrollTo(targetEl, { offset: -80, duration: 0.8 });
                } else {
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }, 350);
    }
});

/* ==========================================================================
   TELEGRAM CONTACT FORM HANDLER (Cloudflare Edge Worker Integration)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const tgForm = document.getElementById('telegram-contact-form');
    if (!tgForm) return;

    tgForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('tg-submit-btn');
        const status = document.getElementById('tg-status-text');
        const nameInput = document.getElementById('tg-name');
        const contactInput = document.getElementById('tg-contact');
        const messageInput = document.getElementById('tg-message');

        const originalBtnText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span>Mengirim...</span>';
        status.innerText = 'Mengirim pesan ke Telegram...';
        status.className = 'text-[11px] text-blue-600 font-medium';

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: nameInput.value,
                    phone: contactInput.value,
                    message: messageInput.value,
                    subject: 'Konsultasi Web Portofolio'
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                status.innerText = '✅ Pesan berhasil dikirim langsung ke Telegram!';
                status.className = 'text-[11px] text-emerald-600 font-bold';
                tgForm.reset();
            } else {
                status.innerText = '❌ ' + (data.error || 'Gagal mengirim pesan.');
                status.className = 'text-[11px] text-rose-600 font-bold';
            }
        } catch (err) {
            status.innerText = '❌ Gagal terhubung ke server edge.';
            status.className = 'text-[11px] text-rose-600 font-bold';
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalBtnText;
            if (window.lucide) lucide.createIcons();
        }
    });
});
