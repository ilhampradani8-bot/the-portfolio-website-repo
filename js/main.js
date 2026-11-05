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

    // 1. Desktop dropdown label
    const activeLangLabel = document.getElementById('active-lang-label');
    if (activeLangLabel) {
        activeLangLabel.textContent = lang.toUpperCase();
    }

    // 2. Mobile buttons
    const langList = ['id', 'en', 'zh', 'ja', 'ko', 'ru', 'fr'];
    langList.forEach(l => {
        const mBtn = document.getElementById(`m-btn-${l}`);
        if (mBtn) {
            if (l === lang) {
                mBtn.className = "text-[10px] font-black text-blue-600 px-3 py-2 bg-[#ecf0f3] shadow-[inset_2px_2px_4px_#b8bec9,inset_-2px_-2px_4px_#ffffff] rounded-lg transition-all";
            } else {
                mBtn.className = "text-[10px] font-black text-gray-700 px-3 py-2 bg-[#ecf0f3] shadow-[3px_3px_6px_#b8bec9,-3px_-3px_6px_#ffffff] rounded-lg transition-all";
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

async function applyTranslations() {
    const lang = localStorage.getItem('preferred_lang') || 'id';
    try {
        const isDev = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' || 
                      window.location.port === '5501' || 
                      window.location.hostname.includes('139.59.122.230');
        const url = `lang/${lang}.json` + (isDev ? `?t=${Date.now()}` : '');
        const response = await fetch(url);
        if (!response.ok) return;
        const t = await response.json();
        document.querySelectorAll('[data-t]').forEach(el => {
            const key = el.getAttribute('data-t');
            if (t[key]) {
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
        if (window.lucide) lucide.createIcons();
    } catch (e) { console.error("Translation Error:", e); }
}

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
        const isDev = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' || 
                      window.location.port === '5501' || 
                      window.location.hostname.includes('139.59.122.230');
        const url = file + (isDev ? `?t=${Date.now()}` : '');
        const res = await fetch(url);
        if (res.ok) {
            el.innerHTML = await res.text();
            if (window.lucide) lucide.createIcons();
            updateLangUI();
            await applyTranslations();
            if (id === 'header-placeholder') {
                window.setLoadingProgress(15);
            }
        }
    } catch (e) { console.error("Component Error:", e); }
}

// Alias for compatibility
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

// Global Event Delegation for Anchor Hash Navigation
document.addEventListener('click', function (e) {
    const anchor = e.target.closest('a[href*="#"]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;
    
    const hashIndex = href.indexOf('#');
    if (hashIndex === -1) return;
    const hash = href.substring(hashIndex);
    
    const path = window.location.pathname;
    const isIndexPage = path === '/' || 
                        path.endsWith('/index.html') || 
                        path === '' ||
                        (!path.endsWith('.html') && 
                         !path.includes('/view.html') && 
                         !path.includes('/baca.html') && 
                         !path.includes('/certified.html') && 
                         !path.includes('/easymarket.html') && 
                         !path.includes('/tradingsafe.html') && 
                         !path.includes('/ojekasia.html'));
    
    if (!isIndexPage) {
        e.preventDefault();
        window.location.href = 'index.html' + hash;
    } else {
        if (hash) {
            const targetEl = document.getElementById(hash.substring(1));
            if (targetEl) {
                e.preventDefault();
                if (window.lenis) {
                    window.lenis.scrollTo(targetEl, {
                        offset: -80,
                        duration: 1.2,
                    });
                } else {
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
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
