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
        // Strip .html when served over HTTP/HTTPS to prevent Cloudflare Pages 308 clean-URL redirect (Google Search Console error)
        let targetFile = file;
        if (targetFile.endsWith('.html') && typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {
            targetFile = targetFile.replace(/\.html$/, '');
        }
        let res = await fetch(targetFile, { cache: 'no-cache' });
        // Fallback to original file if clean URL returns 404 (e.g. static local server)
        if (!res.ok && targetFile !== file) {
            res = await fetch(file, { cache: 'no-cache' });
        }
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
        duration: 1.0,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
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

/* ==========================================================================
   GLASSMORPHISM EXTERNAL REDIRECT CONFIRMATION POPUP (WhatsApp & Telegram)
   ========================================================================== */
(function initExternalRedirectModal() {
    let activeRedirectUrl = '';
    let activeTargetId = '';

    // Copy helper dengan visual feedback
    function handleCopy(textToCopy, btn, labelEl, defaultLabel) {
        if (!textToCopy || !btn) return;

        const originalBtnHtml = btn.innerHTML;

        const onSuccess = () => {
            btn.classList.add('!bg-emerald-600', '!text-white', '!border-emerald-600', 'shadow-emerald-500/30');
            btn.innerHTML = `
                <svg class="w-3.5 h-3.5 text-white shrink-0 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                </svg>
                <span>Tersalin!</span>
            `;
            setTimeout(() => {
                btn.innerHTML = originalBtnHtml;
                btn.classList.remove('!bg-emerald-600', '!text-white', '!border-emerald-600', 'shadow-emerald-500/30');
            }, 1800);
        };

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(textToCopy).then(onSuccess).catch(() => {
                fallbackCopy(textToCopy);
                onSuccess();
            });
        } else {
            fallbackCopy(textToCopy);
            onSuccess();
        }
    }

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
    }

    // Buat elemen modal ke DOM bila belum ada
    function createModalElement() {
        if (document.getElementById('external-redirect-modal')) return;

        const modalHtml = `
        <div id="external-redirect-modal" 
             class="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md opacity-0 pointer-events-none transition-all duration-300">
            <div id="external-modal-card" 
                 class="relative w-full max-w-sm sm:max-w-md p-6 sm:p-7 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] transform scale-95 transition-all duration-300 text-center overflow-hidden">
                
                <!-- Ambient Glass Glow -->
                <div id="ext-glow" class="absolute -top-16 -left-16 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-40"></div>
                
                <!-- Close Button -->
                <button type="button" id="ext-modal-close" 
                        class="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer"
                        aria-label="Tutup">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>

                <!-- Icon Container -->
                <div id="ext-icon-box" class="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 duration-300 p-3 sm:p-4">
                    <img id="ext-icon-img" src="" alt="Icon" class="w-full h-full object-contain">
                </div>

                <!-- Badge -->
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-3 border" id="ext-badge">
                    <span class="w-1.5 h-1.5 rounded-full animate-ping" id="ext-badge-dot"></span>
                    <span id="ext-badge-text">Direct Link</span>
                </div>

                <!-- Verified Account Handle Container -->
                <div id="ext-account-container" class="hidden items-center justify-center gap-1.5 mb-3 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 w-fit mx-auto shadow-sm">
                    <span id="ext-account-handle" class="font-extrabold text-gray-900 dark:text-white text-xs sm:text-sm">@ilhampradani_official</span>
                    <svg class="w-4 h-4 text-[#0095f6] shrink-0 fill-current" viewBox="0 0 24 24" aria-label="Verified">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                </div>

                <!-- Title & Description -->
                <h3 id="ext-title" class="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                    Buka Aplikasi Luar?
                </h3>
                <p id="ext-desc" class="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-4 font-medium">
                    Anda akan dialihkan ke situs/aplikasi eksternal. Apakah Anda ingin melanjutkan?
                </p>

                <!-- Link & ID Container with 2 Copy Views -->
                <div class="mb-5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/5 dark:border-white/10 p-3 sm:p-3.5 text-left">
                    
                    <!-- Link View -->
                    <div class="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-black/5 dark:border-white/5">
                        <div class="flex items-center gap-1.5 min-w-0 flex-1 text-[11px] font-mono text-gray-600 dark:text-gray-300">
                            <svg class="w-3.5 h-3.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                            </svg>
                            <span id="ext-url-preview" class="truncate font-semibold select-all">https://...</span>
                        </div>
                    </div>

                    <!-- ID View -->
                    <div class="flex items-center justify-between gap-2 mb-3">
                        <div class="flex items-center gap-1.5 min-w-0 flex-1 text-[11px] text-gray-600 dark:text-gray-300">
                            <span class="text-[9px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Target ID:</span>
                            <span id="ext-id-preview" class="font-mono font-bold text-gray-900 dark:text-white truncate select-all">@handle</span>
                        </div>
                    </div>

                    <!-- 2 Copy Options: ID Saja & Full Link -->
                    <div class="grid grid-cols-2 gap-2">
                        <!-- Button 1: Copy ID Aja -->
                        <button type="button" id="ext-btn-copy-id" 
                                class="py-2 px-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-blue-500 text-gray-800 dark:text-gray-100 font-extrabold text-[10.5px] uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 group"
                                title="Salin ID / Username Saja">
                            <svg class="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/>
                            </svg>
                            <span id="ext-btn-copy-id-label">Salin ID</span>
                        </button>

                        <!-- Button 2: Copy Full Link -->
                        <button type="button" id="ext-btn-copy-link" 
                                class="py-2 px-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-blue-500 text-gray-800 dark:text-gray-100 font-extrabold text-[10.5px] uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 group"
                                title="Salin Full Link / URL Lengkap">
                            <svg class="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                            </svg>
                            <span id="ext-btn-copy-link-label">Full Link</span>
                        </button>
                    </div>

                </div>

                <!-- Action Buttons -->
                <div class="flex items-center justify-end gap-3">
                    <button type="button" id="ext-btn-cancel" 
                            class="w-1/2 py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer">
                        Batal
                    </button>
                    <button type="button" id="ext-btn-confirm" 
                            class="w-1/2 py-3 px-4 rounded-2xl text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 cursor-pointer">
                        <span id="ext-btn-label">Lanjutkan</span>
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Bind events
        const modal = document.getElementById('external-redirect-modal');
        const closeBtn = document.getElementById('ext-modal-close');
        const cancelBtn = document.getElementById('ext-btn-cancel');
        const confirmBtn = document.getElementById('ext-btn-confirm');
        const copyIdBtn = document.getElementById('ext-btn-copy-id');
        const copyIdLabel = document.getElementById('ext-btn-copy-id-label');
        const copyLinkBtn = document.getElementById('ext-btn-copy-link');
        const copyLinkLabel = document.getElementById('ext-btn-copy-link-label');

        function closeModal() {
            if (!modal) return;
            const card = document.getElementById('external-modal-card');
            modal.classList.remove('opacity-100', 'pointer-events-auto');
            modal.classList.add('opacity-0', 'pointer-events-none');
            if (card) {
                card.classList.remove('scale-100');
                card.classList.add('scale-95');
            }
        }

        closeBtn?.addEventListener('click', closeModal);
        cancelBtn?.addEventListener('click', closeModal);
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Copy events
        copyIdBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            handleCopy(activeTargetId, copyIdBtn, copyIdLabel, 'Salin ID');
        });

        copyLinkBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            handleCopy(activeRedirectUrl, copyLinkBtn, copyLinkLabel, 'Full Link');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && modal.classList.contains('opacity-100')) {
                closeModal();
            }
        });

        confirmBtn?.addEventListener('click', () => {
            if (activeRedirectUrl) {
                if (activeRedirectUrl.startsWith('mailto:')) {
                    window.location.href = activeRedirectUrl;
                } else {
                    window.open(activeRedirectUrl, '_blank', 'noopener,noreferrer');
                }
            }
            closeModal();
        });
    }

    function openRedirectModal(url, type) {
        createModalElement();
        activeRedirectUrl = url;

        const modal = document.getElementById('external-redirect-modal');
        const card = document.getElementById('external-modal-card');
        const glow = document.getElementById('ext-glow');
        const iconBox = document.getElementById('ext-icon-box');
        const iconImg = document.getElementById('ext-icon-img');
        const badge = document.getElementById('ext-badge');
        const badgeDot = document.getElementById('ext-badge-dot');
        const badgeText = document.getElementById('ext-badge-text');
        const accountBox = document.getElementById('ext-account-container');
        const accountHandle = document.getElementById('ext-account-handle');
        const title = document.getElementById('ext-title');
        const desc = document.getElementById('ext-desc');
        const urlPreview = document.getElementById('ext-url-preview');
        const idPreview = document.getElementById('ext-id-preview');
        const confirmBtn = document.getElementById('ext-btn-confirm');
        const btnLabel = document.getElementById('ext-btn-label');

        urlPreview.textContent = url;
        if (accountBox) {
            accountBox.classList.add('hidden');
            accountBox.classList.remove('flex');
        }

        if (type === 'whatsapp' || url.includes('wa.me') || url.includes('whatsapp.com')) {
            glow.className = "absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40 bg-emerald-500";
            iconBox.className = "w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 duration-300 p-3 sm:p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-700/50";
            iconImg.src = "image/wa_clean.svg";
            iconImg.alt = "WhatsApp";
            badge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-3 border bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
            badgeDot.className = "w-1.5 h-1.5 rounded-full animate-ping bg-emerald-500";
            badgeText.textContent = "WhatsApp Bisnis";
            title.textContent = "Membuka WhatsApp?";
            desc.textContent = "Anda akan dialihkan ke situs/aplikasi WhatsApp untuk memulai komunikasi langsung dengan Sir Ilham Pradani.";
            confirmBtn.className = "w-1/2 py-3 px-4 rounded-2xl text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 cursor-pointer bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-500/25 hover:from-emerald-600 hover:to-emerald-700";
            btnLabel.textContent = "Buka WhatsApp";

            // Extract Target ID
            const match = url.match(/(?:\/|\=)(\+?[0-9]{8,16})/);
            const digits = match ? match[1].replace(/[^0-9]/g, '') : '6288971071138';
            activeTargetId = digits === '6288971071138' ? '+6288971071138' : (digits.startsWith('62') ? '+' + digits : digits);
            if (idPreview) idPreview.textContent = digits === '6288971071138' ? '+62 889-7107-1138' : activeTargetId;

        } else if (type === 'telegram' || url.includes('t.me') || url.includes('telegram.me')) {
            glow.className = "absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40 bg-sky-500";
            iconBox.className = "w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 duration-300 p-3 sm:p-4 bg-sky-50 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-700/50";
            iconImg.src = "image/tg_clean.png";
            iconImg.alt = "Telegram";
            badge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-3 border bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800";
            badgeDot.className = "w-1.5 h-1.5 rounded-full animate-ping bg-sky-500";
            badgeText.textContent = "Telegram Official";
            title.textContent = "Membuka Telegram?";
            desc.textContent = "Anda akan dialihkan ke Telegram untuk terhubung langsung dengan akun resmi @ilhampradani_sh.";
            confirmBtn.className = "w-1/2 py-3 px-4 rounded-2xl text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 cursor-pointer bg-gradient-to-r from-sky-500 to-sky-600 shadow-sky-500/25 hover:from-sky-600 hover:to-sky-700";
            btnLabel.textContent = "Buka Telegram";

            // Extract Target ID
            const match = url.match(/t\.me\/([a-zA-Z0-9_]+)/);
            activeTargetId = match ? '@' + match[1].replace(/^@/, '') : '@ilhampradani_sh';
            if (idPreview) idPreview.textContent = activeTargetId;

        } else if (type === 'email' || url.startsWith('mailto:')) {
            glow.className = "absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40 bg-indigo-500";
            iconBox.className = "w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 duration-300 p-3 sm:p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-700/50";
            iconImg.src = "image/gravatar/mail.svg";
            iconImg.alt = "Email";
            badge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-3 border bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800";
            badgeDot.className = "w-1.5 h-1.5 rounded-full animate-ping bg-indigo-500";
            badgeText.textContent = "Email Profesional";
            title.textContent = "Kirim Pesan Email?";
            desc.textContent = "Anda akan dialihkan ke aplikasi email default Anda untuk mengirimkan korespondensi atau konsultasi resmi kepada Sir Ilham Pradani.";
            confirmBtn.className = "w-1/2 py-3 px-4 rounded-2xl text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 cursor-pointer bg-gradient-to-r from-indigo-600 to-blue-600 shadow-indigo-500/25 hover:from-indigo-700 hover:to-blue-700";
            btnLabel.textContent = "Buka Email";

            const cleanEmail = url.replace(/^mailto:/, '').split('?')[0].trim() || 'hello@ilhampradani.me';
            activeTargetId = cleanEmail;
            if (idPreview) idPreview.textContent = cleanEmail;

        } else if (type === 'instagram' || url.includes('instagram.com')) {
            glow.className = "absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40 bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600";
            iconBox.className = "w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 duration-300 p-3 sm:p-4 bg-gradient-to-tr from-pink-50 to-purple-50 dark:from-pink-950/40 dark:to-purple-950/40 border border-pink-200/80 dark:border-pink-700/50";
            iconImg.src = "image/ig_clean.png";
            iconImg.alt = "Instagram";
            badge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-2 border bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800";
            badgeDot.className = "w-1.5 h-1.5 rounded-full animate-ping bg-pink-500";
            badgeText.textContent = "Instagram Official";
            title.textContent = "Membuka Instagram?";
            if (accountBox && accountHandle) {
                accountBox.classList.remove('hidden');
                accountBox.classList.add('flex');
                accountHandle.textContent = "@ilhampradani_official";
            }
            desc.textContent = "Anda akan dialihkan ke situs/aplikasi Instagram untuk mengunjungi profil resmi terverifikasi Sir Ilham Pradani.";
            confirmBtn.className = "w-1/2 py-3 px-4 rounded-2xl text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 cursor-pointer bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 shadow-pink-500/25 hover:opacity-95";
            btnLabel.textContent = "Buka Instagram";

            // Extract Target ID
            const match = url.match(/instagram\.com\/([a-zA-Z0-9_\.]+)/);
            activeTargetId = match ? '@' + match[1].replace(/^@/, '') : '@ilhampradani_official';
            if (idPreview) idPreview.textContent = activeTargetId;

        } else if (type === 'linkedin' || url.includes('linkedin.com')) {
            glow.className = "absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40 bg-blue-600";
            iconBox.className = "w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 duration-300 p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-700/50";
            iconImg.src = "image/gravatar/linkedin.svg";
            iconImg.alt = "LinkedIn";
            badge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-3 border bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800";
            badgeDot.className = "w-1.5 h-1.5 rounded-full animate-ping bg-blue-600";
            badgeText.textContent = "LinkedIn Profesional";
            title.textContent = "Membuka LinkedIn?";
            desc.textContent = "Anda akan dialihkan ke profil profesional resmi Ilham Pradani di jaringan LinkedIn.";
            confirmBtn.className = "w-1/2 py-3 px-4 rounded-2xl text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 cursor-pointer bg-[#0077b5] shadow-blue-500/25 hover:bg-[#006097]";
            btnLabel.textContent = "Buka LinkedIn";

            const match = url.match(/in\/([a-zA-Z0-9_\-\%]+)/);
            activeTargetId = match ? decodeURIComponent(match[1]) : 'in/ilhampradani';
            if (idPreview) idPreview.textContent = activeTargetId;

        } else if (type === 'github' || url.includes('github.com')) {
            glow.className = "absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40 bg-slate-700";
            iconBox.className = "w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 duration-300 p-3 sm:p-4 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700";
            iconImg.src = "image/gh.svg";
            iconImg.alt = "GitHub";
            badge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-3 border bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700";
            badgeDot.className = "w-1.5 h-1.5 rounded-full animate-ping bg-slate-500";
            badgeText.textContent = "GitHub Developer";
            title.textContent = "Membuka GitHub?";
            desc.textContent = "Anda akan dialihkan ke profil dan repositori kode sumber terbuka Ilham Pradani di GitHub.";
            confirmBtn.className = "w-1/2 py-3 px-4 rounded-2xl text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 cursor-pointer bg-slate-900 hover:bg-black shadow-slate-900/30";
            btnLabel.textContent = "Buka GitHub";

            const match = url.match(/github\.com\/([a-zA-Z0-9_\-]+)/);
            activeTargetId = match ? '@' + match[1] : '@ilhampradani';
            if (idPreview) idPreview.textContent = activeTargetId;

        } else if (type === 'zenodo' || url.includes('zenodo.org')) {
            glow.className = "absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40 bg-sky-600";
            iconBox.className = "w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 duration-300 p-3 sm:p-4 bg-sky-50 dark:bg-sky-950/40 border border-sky-300/80 dark:border-sky-700/50";
            iconImg.src = "image/zenodo.svg";
            iconImg.alt = "Zenodo";
            badge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-3 border bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700";
            badgeDot.className = "w-1.5 h-1.5 rounded-full animate-ping bg-sky-500";
            badgeText.textContent = "Open Science Archive";
            title.textContent = "Membuka Zenodo?";
            desc.textContent = "Anda akan dialihkan ke repositori riset internasional Zenodo (CERN) untuk membaca publikasi & catatan DOI resmi.";
            confirmBtn.className = "w-1/2 py-3 px-4 rounded-2xl text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 cursor-pointer bg-[#1483c4] hover:bg-[#0f689e] shadow-sky-600/30";
            btnLabel.textContent = "Buka Zenodo";

            const match = url.match(/records\/([0-9]+)/);
            activeTargetId = match ? 'Record ID: ' + match[1] : 'Record: 18884976';
            if (idPreview) idPreview.textContent = activeTargetId;

        } else {
            activeTargetId = url;
            if (idPreview) idPreview.textContent = url;
        }

        // Tampilkan modal
        modal.classList.remove('opacity-0', 'pointer-events-none');
        modal.classList.add('opacity-100', 'pointer-events-auto');
        card.classList.remove('scale-95');
        card.classList.add('scale-100');
    }

    // Expose helpers globally
    window.openRedirectModal = openRedirectModal;
    window.handleCopy = handleCopy;

    // Intercept semua klik pada link yang mengarah ke WA, Telegram, Instagram, Email, LinkedIn, Zenodo
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = (link.getAttribute('href') || '').trim();
        if (!href) return;

        // Cek WhatsApp
        if (href.includes('wa.me') || href.includes('api.whatsapp.com') || href.includes('whatsapp.com')) {
            e.preventDefault();
            e.stopPropagation();
            openRedirectModal(href, 'whatsapp');
            return;
        }

        // Cek Telegram
        if (href.includes('t.me') || href.includes('telegram.me')) {
            e.preventDefault();
            e.stopPropagation();
            openRedirectModal(href, 'telegram');
            return;
        }

        // Cek Instagram
        if (href.includes('instagram.com')) {
            e.preventDefault();
            e.stopPropagation();
            openRedirectModal(href, 'instagram');
            return;
        }

        // Cek Email / Mailto
        if (href.startsWith('mailto:')) {
            e.preventDefault();
            e.stopPropagation();
            openRedirectModal(href, 'email');
            return;
        }

        // Cek LinkedIn
        if (href.includes('linkedin.com/in/')) {
            e.preventDefault();
            e.stopPropagation();
            openRedirectModal(href, 'linkedin');
            return;
        }

        // Cek Zenodo
        if (href.includes('zenodo.org/records/')) {
            e.preventDefault();
            e.stopPropagation();
            openRedirectModal(href, 'zenodo');
            return;
        }
    }, true); // useCapture true agar diprioritaskan sebelum listener lain
})();

/* ==========================================================================
   FLOATING ACTION HUB (Telegram Chat UI: Contact, Pages, & Live Search)
   ========================================================================== */
(function initFloatingActionHub() {
    function setupHub() {
        if (document.getElementById('floating-action-hub')) return;

        let cachedSearchArticles = [];
        let isArticlesFetched = false;

        // Preload articles from /api/sheets in background for instantaneous search
        async function prefetchArticles() {
            if (isArticlesFetched) return;
            try {
                const res = await fetch('/api/sheets?tab=Sheet1');
                if (res.ok) {
                    cachedSearchArticles = await res.json();
                    isArticlesFetched = true;
                }
            } catch (e) {
                console.warn("Hub prefetch notice:", e);
            }
        }
        setTimeout(prefetchArticles, 1000);

        // Copy feedback helper for Telegram inline buttons
        function hubCopyFeedback(btn, textToCopy) {
            if (!btn || !textToCopy) return;
            const originalHtml = btn.innerHTML;
            const originalClasses = btn.className;

            const onDone = () => {
                btn.className = "py-1.5 px-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-[10.5px] uppercase tracking-wider shadow-sm flex items-center justify-center gap-1 transition-all";
                btn.innerHTML = `
                    <svg class="w-3.5 h-3.5 text-white shrink-0 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span>Tersalin!</span>
                `;
                setTimeout(() => {
                    btn.innerHTML = originalHtml;
                    btn.className = originalClasses;
                }, 1800);
            };

            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(textToCopy).then(onDone).catch(() => {
                    fallbackCopy(textToCopy);
                    onDone();
                });
            } else {
                fallbackCopy(textToCopy);
                onDone();
            }
        }

        function fallbackCopy(text) {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); } catch (e) {}
            document.body.removeChild(ta);
        }

        // Highlight matching query keywords
        function highlightMatch(text, query) {
            if (!query || !text) return text;
            const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${escaped})`, 'gi');
            return text.replace(regex, '<mark class="bg-amber-300 dark:bg-amber-400/30 text-gray-900 dark:text-amber-200 px-0.5 rounded font-bold">$1</mark>');
        }

        // Get current local time in HH:mm format for Telegram timestamp
        function getTgTimestamp() {
            const now = new Date();
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            return `${h}:${m}`;
        }

        // Construct HTML markup for Telegram Chat Floating Hub
        const hubHtml = `
        <div id="floating-action-hub" class="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[9990] flex flex-col items-end gap-2.5 font-sans pointer-events-none select-none">
            
            <!-- 1. Tombol Melayang ke Atas (Telegram Floating Scroll-to-Top) -->
            <button type="button" id="hub-scroll-top-btn" 
                    class="pointer-events-auto opacity-0 translate-y-3 pointer-events-none transition-all duration-300 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 dark:bg-[#17212b]/95 backdrop-blur-xl border border-slate-200/90 dark:border-[#2b3a4a] shadow-[0_8px_25px_rgba(0,0,0,0.18)] flex items-center justify-center text-[#2481cc] dark:text-[#64b5f6] hover:bg-[#2481cc] hover:text-white dark:hover:bg-[#2481cc] dark:hover:text-white hover:scale-105 active:scale-95 cursor-pointer group"
                    aria-label="Kembali ke atas" title="Scroll ke Atas">
                <svg class="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/>
                </svg>
            </button>

            <!-- 2. Telegram Chat Window Panel -->
            <div id="floating-hub-panel" 
                 class="pointer-events-auto relative w-[345px] xs:w-[385px] sm:w-[415px] max-w-[calc(100vw-28px)] bg-[#eef2f5] dark:bg-[#0e1621] border border-slate-200/90 dark:border-[#242f3d] rounded-3xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.45)] flex flex-col overflow-hidden transition-all duration-300 transform scale-95 opacity-0 translate-y-4 pointer-events-none origin-bottom-right mb-1">
                
                <!-- Telegram App Header -->
                <div class="px-3.5 sm:px-4 py-3 bg-[#2481cc] dark:bg-[#17212b] text-white flex items-center justify-between shadow-md">
                    <div class="flex items-center gap-3 min-w-0">
                        <!-- Telegram Avatar with Online Badge -->
                        <div class="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-white/20 border-2 border-white/60 dark:border-slate-600 shrink-0 shadow-sm">
                            <img src="image/hero-removebg-preview.png" alt="Ilham Pradani" class="w-full h-full object-cover object-top scale-110">
                            <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#2481cc] dark:border-[#17212b] rounded-full"></span>
                        </div>
                        <div class="min-w-0">
                            <div class="flex items-center gap-1.5">
                                <h4 class="font-extrabold text-white text-xs sm:text-sm leading-tight truncate">Ilham Pradani, S.H. (cand.)</h4>
                                <!-- Telegram Verified Badge -->
                                <svg class="w-4 h-4 text-white shrink-0 fill-current" viewBox="0 0 24 24" aria-label="Verified">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                            </div>
                            <p class="text-[10.5px] font-medium text-blue-100 dark:text-gray-400 flex items-center gap-1.5 mt-0.5 truncate">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-300 dark:bg-emerald-400 animate-pulse"></span>
                                <span>online • Konsultan Hukum & AI</span>
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                        <a href="https://t.me/ilhampradani_sh" target="_blank" rel="noopener noreferrer" 
                           class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                           title="Buka Langsung di Telegram">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.77-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                            </svg>
                        </a>
                        <button type="button" id="hub-panel-close-btn" class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer" aria-label="Tutup">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Telegram Pinned Segment Tabs Bar -->
                <div class="px-3 sm:px-4 py-2 bg-white/90 dark:bg-[#17212b]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-[#242f3d] flex items-center gap-1.5">
                    <button type="button" data-hub-tab="kontak" class="hub-tab-btn flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-[#2481cc] text-white shadow-xs">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                        <span>Chat & Kontak</span>
                    </button>
                    <button type="button" data-hub-tab="halaman" class="hub-tab-btn flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                        <span>Menu Web</span>
                    </button>
                    <button type="button" data-hub-tab="cari" class="hub-tab-btn flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        <span>Cari Pesan</span>
                    </button>
                </div>

                <!-- Telegram Chat Conversation Viewport -->
                <div class="p-3 sm:p-4 max-h-[58vh] overflow-y-auto space-y-3" id="hub-chat-body">
                    
                    <!-- Center Date Pill -->
                    <div class="flex justify-center">
                        <span class="px-2.5 py-0.5 rounded-full bg-black/15 dark:bg-black/35 text-slate-600 dark:text-slate-300 font-bold text-[10px] uppercase tracking-wider backdrop-blur-xs">
                            Hari Ini
                        </span>
                    </div>

                    <!-- Incoming Welcome Message Bubble from Ilham -->
                    <div class="flex items-start gap-2 max-w-[94%]">
                        <div class="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-1 border border-white dark:border-slate-700 shadow-xs">
                            <img src="image/hero-removebg-preview.png" alt="Ilham" class="w-full h-full object-cover object-top scale-110">
                        </div>
                        <div class="relative bg-white dark:bg-[#182533] p-3 rounded-2xl rounded-tl-xs shadow-xs border border-slate-200/70 dark:border-[#242f3d] text-slate-800 dark:text-slate-100">
                            <div class="flex items-center gap-1 mb-1">
                                <span class="font-bold text-[11px] text-[#2481cc] dark:text-[#64b5f6]">Ilham Pradani</span>
                                <svg class="w-3 h-3 text-[#2481cc] dark:text-[#64b5f6] fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                            </div>
                            <p class="text-xs leading-relaxed">
                                Halo! Selamat datang di portal resmi saya. Silakan pilih tombol kontak di bawah untuk konsultasi langsung, jelajahi pintasan menu, atau cari arsip riset hukum & AI.
                            </p>
                            <div class="flex items-center justify-end gap-1 mt-1.5 text-[9.5px] text-slate-400 dark:text-slate-400">
                                <span id="hub-tg-time">${getTgTimestamp()}</span>
                                <span class="text-[#2481cc] dark:text-[#64b5f6] font-bold tracking-tighter">✓✓</span>
                            </div>
                        </div>
                    </div>

                    <!-- Tab 1: Kontak (Telegram Bot Inline Keyboard Cards) -->
                    <div id="hub-tab-pane-kontak" class="hub-tab-pane space-y-2.5">
                        <div class="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 px-1 flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5 text-[#2481cc]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            <span>Pilih tombol aksi di bawah untuk menghubungi atau menyalin:</span>
                        </div>

                        <!-- 1. WA Inline Card -->
                        <div class="p-2.5 rounded-2xl bg-white dark:bg-[#182533] border border-slate-200/80 dark:border-[#242f3d] shadow-xs space-y-2">
                            <div class="flex items-center gap-2.5">
                                <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-1.5 shrink-0 flex items-center justify-center">
                                    <img src="image/wa_clean.svg" alt="WA" class="w-full h-full object-contain">
                                </div>
                                <div class="min-w-0">
                                    <h5 class="text-xs font-black text-slate-900 dark:text-white truncate">WhatsApp Bisnis</h5>
                                    <p class="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">+62 889-7107-1138</p>
                                </div>
                            </div>
                            <!-- Telegram Inline Buttons Grid -->
                            <div class="grid grid-cols-3 gap-1.5 pt-1">
                                <button type="button" class="hub-copy-btn py-1.5 px-1 rounded-xl bg-[#f0f4f9] hover:bg-[#e2ebf5] dark:bg-[#242f3d] dark:hover:bg-[#2c394b] text-[#2481cc] dark:text-[#64b5f6] border border-[#d6e3f0] dark:border-[#38485c] text-[10.5px] font-bold text-center transition-all cursor-pointer shadow-2xs active:scale-95"
                                        data-copy-val="+6288971071138" title="Salin ID WhatsApp">📋 Salin ID</button>
                                <button type="button" class="hub-copy-btn py-1.5 px-1 rounded-xl bg-[#f0f4f9] hover:bg-[#e2ebf5] dark:bg-[#242f3d] dark:hover:bg-[#2c394b] text-[#2481cc] dark:text-[#64b5f6] border border-[#d6e3f0] dark:border-[#38485c] text-[10.5px] font-bold text-center transition-all cursor-pointer shadow-2xs active:scale-95"
                                        data-copy-val="https://wa.me/6288971071138" title="Salin Link WhatsApp">🔗 Link</button>
                                <button type="button" class="hub-contact-row py-1.5 px-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-extrabold text-center transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center gap-1"
                                        data-url="https://wa.me/6288971071138?text=Halo%20Sir%20Ilham%20Pradani,%20saya%20tertarik%20untuk%20berkonsultasi" data-type="whatsapp">
                                    <span>🚀 Chat</span>
                                </button>
                            </div>
                        </div>

                        <!-- 2. TG Inline Card -->
                        <div class="p-2.5 rounded-2xl bg-white dark:bg-[#182533] border border-slate-200/80 dark:border-[#242f3d] shadow-xs space-y-2">
                            <div class="flex items-center gap-2.5">
                                <div class="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 p-1.5 shrink-0 flex items-center justify-center">
                                    <img src="image/tg_clean.png" alt="TG" class="w-full h-full object-contain">
                                </div>
                                <div class="min-w-0">
                                    <h5 class="text-xs font-black text-slate-900 dark:text-white truncate">Telegram Official</h5>
                                    <p class="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">@ilhampradani_sh</p>
                                </div>
                            </div>
                            <!-- Telegram Inline Buttons Grid -->
                            <div class="grid grid-cols-3 gap-1.5 pt-1">
                                <button type="button" class="hub-copy-btn py-1.5 px-1 rounded-xl bg-[#f0f4f9] hover:bg-[#e2ebf5] dark:bg-[#242f3d] dark:hover:bg-[#2c394b] text-[#2481cc] dark:text-[#64b5f6] border border-[#d6e3f0] dark:border-[#38485c] text-[10.5px] font-bold text-center transition-all cursor-pointer shadow-2xs active:scale-95"
                                        data-copy-val="@ilhampradani_sh" title="Salin Handle Telegram">📋 Salin ID</button>
                                <button type="button" class="hub-copy-btn py-1.5 px-1 rounded-xl bg-[#f0f4f9] hover:bg-[#e2ebf5] dark:bg-[#242f3d] dark:hover:bg-[#2c394b] text-[#2481cc] dark:text-[#64b5f6] border border-[#d6e3f0] dark:border-[#38485c] text-[10.5px] font-bold text-center transition-all cursor-pointer shadow-2xs active:scale-95"
                                        data-copy-val="https://t.me/ilhampradani_sh" title="Salin Link Telegram">🔗 Link</button>
                                <button type="button" class="hub-contact-row py-1.5 px-1 rounded-xl bg-[#2481cc] hover:bg-[#1c6eb3] text-white text-[10.5px] font-extrabold text-center transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center gap-1"
                                        data-url="https://t.me/ilhampradani_sh" data-type="telegram">
                                    <span>🚀 Chat</span>
                                </button>
                            </div>
                        </div>

                        <!-- 3. Email Inline Card -->
                        <div class="p-2.5 rounded-2xl bg-white dark:bg-[#182533] border border-slate-200/80 dark:border-[#242f3d] shadow-xs space-y-2">
                            <div class="flex items-center gap-2.5">
                                <div class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 p-1.5 shrink-0 flex items-center justify-center">
                                    <img src="image/gravatar/mail.svg" alt="Email" class="w-full h-full object-contain">
                                </div>
                                <div class="min-w-0">
                                    <h5 class="text-xs font-black text-slate-900 dark:text-white truncate">Email Profesional</h5>
                                    <p class="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">hello@ilhampradani.me</p>
                                </div>
                            </div>
                            <!-- Telegram Inline Buttons Grid -->
                            <div class="grid grid-cols-3 gap-1.5 pt-1">
                                <button type="button" class="hub-copy-btn py-1.5 px-1 rounded-xl bg-[#f0f4f9] hover:bg-[#e2ebf5] dark:bg-[#242f3d] dark:hover:bg-[#2c394b] text-[#2481cc] dark:text-[#64b5f6] border border-[#d6e3f0] dark:border-[#38485c] text-[10.5px] font-bold text-center transition-all cursor-pointer shadow-2xs active:scale-95"
                                        data-copy-val="hello@ilhampradani.me" title="Salin Email">📋 Salin ID</button>
                                <button type="button" class="hub-copy-btn py-1.5 px-1 rounded-xl bg-[#f0f4f9] hover:bg-[#e2ebf5] dark:bg-[#242f3d] dark:hover:bg-[#2c394b] text-[#2481cc] dark:text-[#64b5f6] border border-[#d6e3f0] dark:border-[#38485c] text-[10.5px] font-bold text-center transition-all cursor-pointer shadow-2xs active:scale-95"
                                        data-copy-val="mailto:hello@ilhampradani.me" title="Salin Full Mailto">🔗 Link</button>
                                <button type="button" class="hub-contact-row py-1.5 px-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10.5px] font-extrabold text-center transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center gap-1"
                                        data-url="mailto:hello@ilhampradani.me" data-type="email">
                                    <span>✉️ Email</span>
                                </button>
                            </div>
                        </div>

                        <!-- 4. Instagram Inline Card -->
                        <div class="p-2.5 rounded-2xl bg-white dark:bg-[#182533] border border-slate-200/80 dark:border-[#242f3d] shadow-xs space-y-2">
                            <div class="flex items-center gap-2.5">
                                <div class="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/50 border border-pink-200 dark:border-pink-800 p-1.5 shrink-0 flex items-center justify-center">
                                    <img src="image/ig_clean.png" alt="IG" class="w-full h-full object-contain">
                                </div>
                                <div class="min-w-0">
                                    <h5 class="text-xs font-black text-slate-900 dark:text-white truncate">Instagram Official</h5>
                                    <p class="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">@ilhampradani_official</p>
                                </div>
                            </div>
                            <!-- Telegram Inline Buttons Grid -->
                            <div class="grid grid-cols-3 gap-1.5 pt-1">
                                <button type="button" class="hub-copy-btn py-1.5 px-1 rounded-xl bg-[#f0f4f9] hover:bg-[#e2ebf5] dark:bg-[#242f3d] dark:hover:bg-[#2c394b] text-[#2481cc] dark:text-[#64b5f6] border border-[#d6e3f0] dark:border-[#38485c] text-[10.5px] font-bold text-center transition-all cursor-pointer shadow-2xs active:scale-95"
                                        data-copy-val="@ilhampradani_official" title="Salin Handle Instagram">📋 Salin ID</button>
                                <button type="button" class="hub-copy-btn py-1.5 px-1 rounded-xl bg-[#f0f4f9] hover:bg-[#e2ebf5] dark:bg-[#242f3d] dark:hover:bg-[#2c394b] text-[#2481cc] dark:text-[#64b5f6] border border-[#d6e3f0] dark:border-[#38485c] text-[10.5px] font-bold text-center transition-all cursor-pointer shadow-2xs active:scale-95"
                                        data-copy-val="https://instagram.com/ilhampradani_official" title="Salin Link Instagram">🔗 Link</button>
                                <button type="button" class="hub-contact-row py-1.5 px-1 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:opacity-90 text-white text-[10.5px] font-extrabold text-center transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center gap-1"
                                        data-url="https://instagram.com/ilhampradani_official" data-type="instagram">
                                    <span>📸 Buka</span>
                                </button>
                            </div>
                        </div>

                        <!-- 5. LinkedIn Inline Card -->
                        <div class="p-2.5 rounded-2xl bg-white dark:bg-[#182533] border border-slate-200/80 dark:border-[#242f3d] shadow-xs space-y-2">
                            <div class="flex items-center gap-2.5">
                                <div class="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 p-1.5 shrink-0 flex items-center justify-center">
                                    <img src="image/gravatar/linkedin.svg" alt="LinkedIn" class="w-full h-full object-contain">
                                </div>
                                <div class="min-w-0">
                                    <h5 class="text-xs font-black text-slate-900 dark:text-white truncate">LinkedIn Network</h5>
                                    <p class="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">in/ilhampradani</p>
                                </div>
                            </div>
                            <!-- Telegram Inline Buttons Grid -->
                            <div class="grid grid-cols-3 gap-1.5 pt-1">
                                <button type="button" class="hub-copy-btn py-1.5 px-1 rounded-xl bg-[#f0f4f9] hover:bg-[#e2ebf5] dark:bg-[#242f3d] dark:hover:bg-[#2c394b] text-[#2481cc] dark:text-[#64b5f6] border border-[#d6e3f0] dark:border-[#38485c] text-[10.5px] font-bold text-center transition-all cursor-pointer shadow-2xs active:scale-95"
                                        data-copy-val="ilhampradani" title="Salin ID LinkedIn">📋 Salin ID</button>
                                <button type="button" class="hub-copy-btn py-1.5 px-1 rounded-xl bg-[#f0f4f9] hover:bg-[#e2ebf5] dark:bg-[#242f3d] dark:hover:bg-[#2c394b] text-[#2481cc] dark:text-[#64b5f6] border border-[#d6e3f0] dark:border-[#38485c] text-[10.5px] font-bold text-center transition-all cursor-pointer shadow-2xs active:scale-95"
                                        data-copy-val="https://www.linkedin.com/in/ilhampradani/" title="Salin Link LinkedIn">🔗 Link</button>
                                <button type="button" class="hub-contact-row py-1.5 px-1 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-[10.5px] font-extrabold text-center transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center gap-1"
                                        data-url="https://www.linkedin.com/in/ilhampradani/" data-type="linkedin">
                                    <span>💼 Profil</span>
                                </button>
                            </div>
                        </div>

                        <!-- 6. Zenodo Inline Card -->
                        <div class="p-2.5 rounded-2xl bg-white dark:bg-[#182533] border border-slate-200/80 dark:border-[#242f3d] shadow-xs space-y-2">
                            <div class="flex items-center gap-2.5">
                                <div class="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-300 dark:border-sky-800 p-1.5 shrink-0 flex items-center justify-center">
                                    <img src="image/zenodo.svg" alt="Zenodo" class="w-full h-full object-contain">
                                </div>
                                <div class="min-w-0">
                                    <h5 class="text-xs font-black text-slate-900 dark:text-white truncate">Zenodo CERN Repository</h5>
                                    <p class="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">DOI Record: 18884976</p>
                                </div>
                            </div>
                            <!-- Telegram Inline Buttons Grid -->
                            <div class="grid grid-cols-3 gap-1.5 pt-1">
                                <button type="button" class="hub-copy-btn py-1.5 px-1 rounded-xl bg-[#f0f4f9] hover:bg-[#e2ebf5] dark:bg-[#242f3d] dark:hover:bg-[#2c394b] text-[#2481cc] dark:text-[#64b5f6] border border-[#d6e3f0] dark:border-[#38485c] text-[10.5px] font-bold text-center transition-all cursor-pointer shadow-2xs active:scale-95"
                                        data-copy-val="18884976" title="Salin Record ID Zenodo">📋 Salin ID</button>
                                <button type="button" class="hub-copy-btn py-1.5 px-1 rounded-xl bg-[#f0f4f9] hover:bg-[#e2ebf5] dark:bg-[#242f3d] dark:hover:bg-[#2c394b] text-[#2481cc] dark:text-[#64b5f6] border border-[#d6e3f0] dark:border-[#38485c] text-[10.5px] font-bold text-center transition-all cursor-pointer shadow-2xs active:scale-95"
                                        data-copy-val="https://zenodo.org/records/18884976" title="Salin Link Zenodo">🔗 Link</button>
                                <button type="button" class="hub-contact-row py-1.5 px-1 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[10.5px] font-extrabold text-center transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center gap-1"
                                        data-url="https://zenodo.org/records/18884976" data-type="zenodo">
                                    <span>📚 Riset</span>
                                </button>
                            </div>
                        </div>

                    </div>

                    <!-- Tab 2: Menu Web (Telegram Bot Commands /commands) -->
                    <div id="hub-tab-pane-halaman" class="hub-tab-pane hidden space-y-2">
                        <div class="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 px-1 flex items-center gap-1.5 mb-1">
                            <span class="font-mono text-[#2481cc] dark:text-[#64b5f6]">/commands</span>
                            <span>Pintasan halaman website:</span>
                        </div>

                        <!-- 12 Telegram Commands Cards -->
                        <div class="grid grid-cols-1 gap-1.5">
                            <a href="index.html" class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#182533] hover:bg-blue-50 dark:hover:bg-[#242f3d] border border-slate-200/80 dark:border-[#242f3d] transition-all group">
                                <div class="flex items-center gap-2.5 min-w-0">
                                    <span class="font-mono text-[11px] font-bold text-[#2481cc] dark:text-[#64b5f6] shrink-0">/beranda</span>
                                    <div class="min-w-0 truncate">
                                        <div class="text-xs font-bold text-slate-900 dark:text-white truncate">Beranda Utama</div>
                                        <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">Ringkasan profil & layanan hukum AI</div>
                                    </div>
                                </div>
                                <span class="text-xs text-slate-400 group-hover:text-[#2481cc] transition-colors">→</span>
                            </a>

                            <a href="about.html" class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#182533] hover:bg-blue-50 dark:hover:bg-[#242f3d] border border-slate-200/80 dark:border-[#242f3d] transition-all group">
                                <div class="flex items-center gap-2.5 min-w-0">
                                    <span class="font-mono text-[11px] font-bold text-[#2481cc] dark:text-[#64b5f6] shrink-0">/about</span>
                                    <div class="min-w-0 truncate">
                                        <div class="text-xs font-bold text-slate-900 dark:text-white truncate">Tentang Saya</div>
                                        <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">Biografi, filosofi hukum & riset</div>
                                    </div>
                                </div>
                                <span class="text-xs text-slate-400 group-hover:text-[#2481cc] transition-colors">→</span>
                            </a>

                            <a href="penelitian.html" class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#182533] hover:bg-blue-50 dark:hover:bg-[#242f3d] border border-slate-200/80 dark:border-[#242f3d] transition-all group">
                                <div class="flex items-center gap-2.5 min-w-0">
                                    <span class="font-mono text-[11px] font-bold text-[#2481cc] dark:text-[#64b5f6] shrink-0">/penelitian</span>
                                    <div class="min-w-0 truncate">
                                        <div class="text-xs font-bold text-slate-900 dark:text-white truncate">Penelitian & Publikasi</div>
                                        <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">Arsip jurnal DOI Zenodo & riset AI</div>
                                    </div>
                                </div>
                                <span class="text-xs text-slate-400 group-hover:text-[#2481cc] transition-colors">→</span>
                            </a>

                            <a href="cv.html" class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#182533] hover:bg-blue-50 dark:hover:bg-[#242f3d] border border-slate-200/80 dark:border-[#242f3d] transition-all group">
                                <div class="flex items-center gap-2.5 min-w-0">
                                    <span class="font-mono text-[11px] font-bold text-[#2481cc] dark:text-[#64b5f6] shrink-0">/cv</span>
                                    <div class="min-w-0 truncate">
                                        <div class="text-xs font-bold text-slate-900 dark:text-white truncate">Curriculum Vitae (CV)</div>
                                        <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">Pendidikan hukum & lisensi resmi</div>
                                    </div>
                                </div>
                                <span class="text-xs text-slate-400 group-hover:text-[#2481cc] transition-colors">→</span>
                            </a>

                            <a href="portofolio.html" class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#182533] hover:bg-blue-50 dark:hover:bg-[#242f3d] border border-slate-200/80 dark:border-[#242f3d] transition-all group">
                                <div class="flex items-center gap-2.5 min-w-0">
                                    <span class="font-mono text-[11px] font-bold text-[#2481cc] dark:text-[#64b5f6] shrink-0">/portofolio</span>
                                    <div class="min-w-0 truncate">
                                        <div class="text-xs font-bold text-slate-900 dark:text-white truncate">Portofolio Proyek</div>
                                        <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">Showcase solusi enterprise & audit sistem</div>
                                    </div>
                                </div>
                                <span class="text-xs text-slate-400 group-hover:text-[#2481cc] transition-colors">→</span>
                            </a>

                            <a href="baca.html" class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#182533] hover:bg-blue-50 dark:hover:bg-[#242f3d] border border-slate-200/80 dark:border-[#242f3d] transition-all group">
                                <div class="flex items-center gap-2.5 min-w-0">
                                    <span class="font-mono text-[11px] font-bold text-[#2481cc] dark:text-[#64b5f6] shrink-0">/artikel</span>
                                    <div class="min-w-0 truncate">
                                        <div class="text-xs font-bold text-slate-900 dark:text-white truncate">Artikel & Edukasi</div>
                                        <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">110+ opini & analisis regulasi teknologi</div>
                                    </div>
                                </div>
                                <span class="text-xs text-slate-400 group-hover:text-[#2481cc] transition-colors">→</span>
                            </a>

                            <a href="tradingsafe.html" class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#182533] hover:bg-blue-50 dark:hover:bg-[#242f3d] border border-slate-200/80 dark:border-[#242f3d] transition-all group">
                                <div class="flex items-center gap-2.5 min-w-0">
                                    <span class="font-mono text-[11px] font-bold text-[#2481cc] dark:text-[#64b5f6] shrink-0">/tradingsafe</span>
                                    <div class="min-w-0 truncate">
                                        <div class="text-xs font-bold text-slate-900 dark:text-white truncate">TradingSafe AI</div>
                                        <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">Kepatuhan regulasi algoritma trading</div>
                                    </div>
                                </div>
                                <span class="text-xs text-slate-400 group-hover:text-[#2481cc] transition-colors">→</span>
                            </a>

                            <a href="ojekasia.html" class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#182533] hover:bg-blue-50 dark:hover:bg-[#242f3d] border border-slate-200/80 dark:border-[#242f3d] transition-all group">
                                <div class="flex items-center gap-2.5 min-w-0">
                                    <span class="font-mono text-[11px] font-bold text-[#2481cc] dark:text-[#64b5f6] shrink-0">/ojekasia</span>
                                    <div class="min-w-0 truncate">
                                        <div class="text-xs font-bold text-slate-900 dark:text-white truncate">OjekAsia Mobility</div>
                                        <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">Hukum mobilitas digital terdistribusi</div>
                                    </div>
                                </div>
                                <span class="text-xs text-slate-400 group-hover:text-[#2481cc] transition-colors">→</span>
                            </a>

                            <a href="easymarket.html" class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#182533] hover:bg-blue-50 dark:hover:bg-[#242f3d] border border-slate-200/80 dark:border-[#242f3d] transition-all group">
                                <div class="flex items-center gap-2.5 min-w-0">
                                    <span class="font-mono text-[11px] font-bold text-[#2481cc] dark:text-[#64b5f6] shrink-0">/easymarket</span>
                                    <div class="min-w-0 truncate">
                                        <div class="text-xs font-bold text-slate-900 dark:text-white truncate">EasyMarket Tech</div>
                                        <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">Kepatuhan POS kasir & data UMKM</div>
                                    </div>
                                </div>
                                <span class="text-xs text-slate-400 group-hover:text-[#2481cc] transition-colors">→</span>
                            </a>

                            <a href="certified.html" class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#182533] hover:bg-blue-50 dark:hover:bg-[#242f3d] border border-slate-200/80 dark:border-[#242f3d] transition-all group">
                                <div class="flex items-center gap-2.5 min-w-0">
                                    <span class="font-mono text-[11px] font-bold text-[#2481cc] dark:text-[#64b5f6] shrink-0">/sertifikasi</span>
                                    <div class="min-w-0 truncate">
                                        <div class="text-xs font-bold text-slate-900 dark:text-white truncate">Sertifikasi Keamanan</div>
                                        <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">CEH Master, CompTIA Sec+ & lisensi</div>
                                    </div>
                                </div>
                                <span class="text-xs text-slate-400 group-hover:text-[#2481cc] transition-colors">→</span>
                            </a>

                            <a href="career.html" class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#182533] hover:bg-blue-50 dark:hover:bg-[#242f3d] border border-slate-200/80 dark:border-[#242f3d] transition-all group">
                                <div class="flex items-center gap-2.5 min-w-0">
                                    <span class="font-mono text-[11px] font-bold text-[#2481cc] dark:text-[#64b5f6] shrink-0">/karir</span>
                                    <div class="min-w-0 truncate">
                                        <div class="text-xs font-bold text-slate-900 dark:text-white truncate">Rekam Karir</div>
                                        <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">Riwayat jabatan Direktur & Konsultan AI</div>
                                    </div>
                                </div>
                                <span class="text-xs text-slate-400 group-hover:text-[#2481cc] transition-colors">→</span>
                            </a>

                            <a href="izin-usaha.html" class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#182533] hover:bg-blue-50 dark:hover:bg-[#242f3d] border border-slate-200/80 dark:border-[#242f3d] transition-all group">
                                <div class="flex items-center gap-2.5 min-w-0">
                                    <span class="font-mono text-[11px] font-bold text-[#2481cc] dark:text-[#64b5f6] shrink-0">/legalitas</span>
                                    <div class="min-w-0 truncate">
                                        <div class="text-xs font-bold text-slate-900 dark:text-white truncate">Izin Usaha & Legal</div>
                                        <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">Legalitas NIB & KBLI PT Chain Asia Conect</div>
                                    </div>
                                </div>
                                <span class="text-xs text-slate-400 group-hover:text-[#2481cc] transition-colors">→</span>
                            </a>
                        </div>
                    </div>

                    <!-- Tab 3: Cari (In-Chat Live Search Feed) -->
                    <div id="hub-tab-pane-cari" class="hub-tab-pane hidden space-y-2.5">
                        <!-- Quick Suggestions Hashtags -->
                        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10.5px] no-scrollbar">
                            <span class="text-slate-400 text-[10px] font-bold uppercase shrink-0">Tag:</span>
                            <button type="button" class="hub-chip px-2.5 py-0.5 rounded-full bg-white dark:bg-[#182533] hover:bg-blue-50 dark:hover:bg-[#242f3d] hover:text-[#2481cc] text-slate-700 dark:text-slate-300 font-bold shrink-0 transition-colors cursor-pointer border border-slate-200/80 dark:border-[#242f3d]" data-keyword="AI">#AI</button>
                            <button type="button" class="hub-chip px-2.5 py-0.5 rounded-full bg-white dark:bg-[#182533] hover:bg-blue-50 dark:hover:bg-[#242f3d] hover:text-[#2481cc] text-slate-700 dark:text-slate-300 font-bold shrink-0 transition-colors cursor-pointer border border-slate-200/80 dark:border-[#242f3d]" data-keyword="UU PDP">#UU-PDP</button>
                            <button type="button" class="hub-chip px-2.5 py-0.5 rounded-full bg-white dark:bg-[#182533] hover:bg-blue-50 dark:hover:bg-[#242f3d] hover:text-[#2481cc] text-slate-700 dark:text-slate-300 font-bold shrink-0 transition-colors cursor-pointer border border-slate-200/80 dark:border-[#242f3d]" data-keyword="TradingSafe">#TradingSafe</button>
                            <button type="button" class="hub-chip px-2.5 py-0.5 rounded-full bg-white dark:bg-[#182533] hover:bg-blue-50 dark:hover:bg-[#242f3d] hover:text-[#2481cc] text-slate-700 dark:text-slate-300 font-bold shrink-0 transition-colors cursor-pointer border border-slate-200/80 dark:border-[#242f3d]" data-keyword="Smart Contract">#SmartContract</button>
                            <button type="button" class="hub-chip px-2.5 py-0.5 rounded-full bg-white dark:bg-[#182533] hover:bg-blue-50 dark:hover:bg-[#242f3d] hover:text-[#2481cc] text-slate-700 dark:text-slate-300 font-bold shrink-0 transition-colors cursor-pointer border border-slate-200/80 dark:border-[#242f3d]" data-keyword="Zenodo">#Zenodo</button>
                            <button type="button" class="hub-chip px-2.5 py-0.5 rounded-full bg-white dark:bg-[#182533] hover:bg-blue-50 dark:hover:bg-[#242f3d] hover:text-[#2481cc] text-slate-700 dark:text-slate-300 font-bold shrink-0 transition-colors cursor-pointer border border-slate-200/80 dark:border-[#242f3d]" data-keyword="Sertifikasi">#Sertifikasi</button>
                        </div>

                        <!-- Live Search Results Feed -->
                        <div id="hub-search-results" class="space-y-2 max-h-[46vh] overflow-y-auto pr-0.5">
                            <div class="py-6 text-center text-slate-400 dark:text-slate-500">
                                <svg class="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                                <p class="text-xs font-semibold">Ketik topik di bar bawah untuk mencari pesan</p>
                                <p class="text-[10px] mt-0.5 opacity-75">110+ publikasi artikel, riset ilmiah, & seluruh halaman web</p>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- Telegram Bottom Composer / Input Bar -->
                <div class="p-2 sm:p-2.5 bg-white dark:bg-[#17212b] border-t border-slate-200/90 dark:border-[#242f3d] flex items-center gap-1.5">
                    <!-- Attachment Clip Button (Cycles through tabs) -->
                    <button type="button" id="hub-composer-clip-btn" 
                            class="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-[#242f3d] text-slate-400 hover:text-[#2481cc] dark:hover:text-[#64b5f6] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                            title="Ganti Mode Tab">
                        <svg class="w-5 h-5 -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                        </svg>
                    </button>

                    <!-- Text Input for Search / Message -->
                    <div class="relative flex-1">
                        <input type="text" id="hub-search-input" 
                               placeholder="Ketik topik untuk mencari..." 
                               class="w-full py-2 pl-3 pr-7 text-xs font-medium rounded-2xl bg-slate-100 dark:bg-[#242f3d] border-none focus:outline-none focus:ring-1 focus:ring-[#2481cc] text-slate-900 dark:text-white placeholder:text-slate-400">
                        <button type="button" id="hub-search-clear-btn" 
                                class="hidden absolute right-2 top-2 text-slate-400 hover:text-slate-700 dark:hover:text-white w-4 h-4 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[10px] font-bold cursor-pointer">
                            ✕
                        </button>
                    </div>

                    <!-- Telegram Blue Paper Airplane Send Button -->
                    <button type="button" id="hub-composer-send-btn" 
                            class="w-9 h-9 rounded-full bg-[#2481cc] hover:bg-[#1c6eb3] text-white flex items-center justify-center shrink-0 shadow-md transition-all active:scale-95 cursor-pointer"
                            title="Cari">
                        <svg class="w-4 h-4 translate-x-0.5 -translate-y-0.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                    </button>
                </div>

            </div>

            <!-- 3. Tombol Melayang Bubble Chat Utama (Telegram Floating Action Button) -->
            <button type="button" id="btn-floating-bubble" 
                    class="pointer-events-auto relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#2AABEE] hover:bg-[#229ED9] text-white shadow-[0_10px_35px_rgba(42,171,238,0.45)] hover:shadow-[0_15px_45px_rgba(42,171,238,0.65)] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group"
                    aria-label="Buka Chat Telegram" title="Buka Chat & Hub Komunikasi">
                
                <!-- Pulse Glow Ring -->
                <span class="absolute -inset-1 rounded-full bg-[#2AABEE]/30 animate-pulse pointer-events-none"></span>

                <!-- Status Online Indicator -->
                <span class="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white dark:border-[#0e1621] rounded-full z-10 shadow-xs">
                    <span class="absolute inset-0 rounded-full bg-emerald-300 animate-ping opacity-75"></span>
                </span>

                <!-- Telegram Paper Airplane Icon (Shown when closed) -->
                <div id="hub-icon-bubble" class="transition-all duration-300 transform group-hover:scale-110 flex items-center justify-center">
                    <svg class="w-6 h-6 sm:w-7 sm:h-7 -translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.77-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                    </svg>
                </div>

                <!-- Close Icon (Shown when open) -->
                <div id="hub-icon-close" class="hidden transition-all duration-300 transform rotate-0 hover:rotate-90">
                    <svg class="w-6 h-6 sm:w-6.5 sm:h-6.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </div>
            </button>

        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', hubHtml);

        // Bind DOM references
        const hubScrollTopBtn = document.getElementById('hub-scroll-top-btn');
        const btnFloatingBubble = document.getElementById('btn-floating-bubble');
        const hubPanel = document.getElementById('floating-hub-panel');
        const hubCloseBtn = document.getElementById('hub-panel-close-btn');
        const hubIconBubble = document.getElementById('hub-icon-bubble');
        const hubIconClose = document.getElementById('hub-icon-close');
        const tabBtns = document.querySelectorAll('.hub-tab-btn');
        const searchInput = document.getElementById('hub-search-input');
        const searchClearBtn = document.getElementById('hub-search-clear-btn');
        const searchResultsContainer = document.getElementById('hub-search-results');
        const searchChips = document.querySelectorAll('.hub-chip');
        const composerClipBtn = document.getElementById('hub-composer-clip-btn');
        const composerSendBtn = document.getElementById('hub-composer-send-btn');
        const hubChatBody = document.getElementById('hub-chat-body');

        // Scroll-to-Top Listener
        window.addEventListener('scroll', () => {
            if (window.scrollY > 220) {
                hubScrollTopBtn?.classList.remove('opacity-0', 'translate-y-3', 'pointer-events-none');
                hubScrollTopBtn?.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
            } else {
                hubScrollTopBtn?.classList.add('opacity-0', 'translate-y-3', 'pointer-events-none');
                hubScrollTopBtn?.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
            }
        }, { passive: true });

        hubScrollTopBtn?.addEventListener('click', () => {
            if (window.lenis) {
                window.lenis.scrollTo(0, { duration: 0.9 });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        // Panel Toggle Logic
        let isHubOpen = false;
        function toggleHub(open) {
            isHubOpen = typeof open === 'boolean' ? open : !isHubOpen;
            if (isHubOpen) {
                hubPanel?.classList.remove('scale-95', 'opacity-0', 'translate-y-4', 'pointer-events-none');
                hubPanel?.classList.add('scale-100', 'opacity-100', 'translate-y-0', 'pointer-events-auto');
                hubIconBubble?.classList.add('hidden');
                hubIconClose?.classList.remove('hidden');
                prefetchArticles();
            } else {
                hubPanel?.classList.add('scale-95', 'opacity-0', 'translate-y-4', 'pointer-events-none');
                hubPanel?.classList.remove('scale-100', 'opacity-100', 'translate-y-0', 'pointer-events-auto');
                hubIconBubble?.classList.remove('hidden');
                hubIconClose?.classList.add('hidden');
            }
        }

        btnFloatingBubble?.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleHub();
        });

        hubCloseBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleHub(false);
        });

        // Close on Escape or click outside
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isHubOpen) {
                toggleHub(false);
            }
        });

        document.addEventListener('click', (e) => {
            if (isHubOpen && !e.target.closest('#floating-hub-panel') && !e.target.closest('#btn-floating-bubble')) {
                toggleHub(false);
            }
        });

        // Tab Switching function
        function switchHubTab(targetTab) {
            // Update tab buttons style
            tabBtns.forEach(b => {
                const isCurrent = b.getAttribute('data-hub-tab') === targetTab;
                if (isCurrent) {
                    b.className = "hub-tab-btn flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-[#2481cc] text-white shadow-xs";
                } else {
                    b.className = "hub-tab-btn flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800";
                }
            });

            // Show active tab pane
            document.querySelectorAll('.hub-tab-pane').forEach(p => p.classList.add('hidden'));
            const activePane = document.getElementById(`hub-tab-pane-${targetTab}`);
            if (activePane) {
                activePane.classList.remove('hidden');
            }

            if (targetTab === 'cari' && searchInput) {
                setTimeout(() => searchInput.focus(), 150);
            }
        }

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-hub-tab');
                switchHubTab(targetTab);
            });
        });

        // Paperclip attachment cycles tabs: kontak -> halaman -> cari -> kontak
        const tabOrder = ['kontak', 'halaman', 'cari'];
        let currentTabIndex = 0;
        composerClipBtn?.addEventListener('click', () => {
            currentTabIndex = (currentTabIndex + 1) % tabOrder.length;
            switchHubTab(tabOrder[currentTabIndex]);
        });

        // Send button triggers search tab & focuses
        composerSendBtn?.addEventListener('click', () => {
            switchHubTab('cari');
            if (searchInput && searchInput.value.trim()) {
                performSearch(searchInput.value.trim());
            } else if (searchInput) {
                searchInput.focus();
            }
        });

        // Contact Tab: Copy Buttons & Row Click to Direct Modal
        document.querySelectorAll('.hub-copy-btn').forEach(cBtn => {
            cBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const text = cBtn.getAttribute('data-copy-val');
                hubCopyFeedback(cBtn, text);
            });
        });

        // Shift legacy floating capsule if present to avoid overlap
        const existingCapsules = document.querySelectorAll('.floating-capsule');
        existingCapsules.forEach(cap => {
            const parentFixed = cap.closest('.fixed.bottom-6.right-6') || (cap.classList.contains('fixed') ? cap : null);
            if (parentFixed) {
                parentFixed.classList.remove('right-6');
                parentFixed.classList.add('right-20', 'sm:right-24');
            }
        });

        // Auto close hub when clicking navigation links inside
        hubPanel?.addEventListener('click', (e) => {
            const anchor = e.target.closest('a');
            if (anchor && !anchor.classList.contains('hub-contact-row')) {
                toggleHub(false);
            }
        });

        document.querySelectorAll('.hub-contact-row').forEach(row => {
            row.addEventListener('click', () => {
                const url = row.getAttribute('data-url');
                const type = row.getAttribute('data-type');
                if (window.openRedirectModal) {
                    window.openRedirectModal(url, type);
                } else if (url) {
                    window.open(url, '_blank', 'noopener,noreferrer');
                }
            });
        });

        // Live Search Engine
        const staticPages = [
            { title: "Beranda Utama", snippet: "Profil eksekutif, keahlian hukum, AI governance, dan layanan konsultasi Sir Ilham Pradani.", url: "index.html", cat: "Halaman Web" },
            { title: "Tentang Saya (About)", snippet: "Biografi lengkap, latar belakang akademis hukum, dan dedikasi teknologi.", url: "about.html", cat: "Halaman Web" },
            { title: "Penelitian & Publikasi Ilmiah", snippet: "Arsip riset hukum siber, AI governance, smart contracts, dan regulasi data pribadi ber-DOI.", url: "penelitian.html", cat: "Riset Ilmiah" },
            { title: "Curriculum Vitae (CV)", snippet: "Riwayat pendidikan hukum, pengalaman kerja eksekutif, sertifikasi, dan lisensi.", url: "cv.html", cat: "Karir & CV" },
            { title: "Portofolio Proyek", snippet: "Showcase sistem enterprise, audit keamanan siber, dan solusi legal-tech.", url: "portofolio.html", cat: "Portofolio" },
            { title: "Artikel, Opini & Berita", snippet: "110+ publikasi artikel terkini seputar transformasi digital, AI, dan regulasi siber.", url: "baca.html", cat: "Publikasi" },
            { title: "TradingSafe AI", snippet: "Kajian kepatuhan regulasi algoritma trading cerdas dan perlindungan konsumen keuangan.", url: "tradingsafe.html", cat: "Legal Tech" },
            { title: "OjekAsia Tech", snippet: "Struktur hukum dan kepatuhan sistem mobilitas digital terdistribusi di Indonesia.", url: "ojekasia.html", cat: "Legal Tech" },
            { title: "EasyMarket POS", snippet: "Kajian yuridis kepatuhan transaksi kasir digital dan perlindungan data keuangan UMKM.", url: "easymarket.html", cat: "Legal Tech" },
            { title: "Sertifikasi & Lisensi Keamanan", snippet: "Kredensial CEH Master, CompTIA Security+, GIAC GPEN, dan lisensi standar internasional.", url: "certified.html", cat: "Sertifikasi" },
            { title: "Rekam Karir & Pengalaman", snippet: "Perjalanan profesional sebagai Direktur Utama, Legal Counsel, dan Konsultan AI.", url: "career.html", cat: "Karir" },
            { title: "Izin Usaha & Legal Standing", snippet: "Dokumentasi NIB, KBLI, dan legalitas resmi korporasi PT Chain Asia Conect.", url: "izin-usaha.html", cat: "Legalitas" }
        ];

        const academicPapers = [
            { title: "Analisis Yuridis Penerapan Smart Contract dalam Transaksi Bisnis Digital", snippet: "Kajian keabsahan kontrak cerdas berbasis blockchain menurut KUHPerdata dan UU ITE.", url: "penelitian.html#paper-smart-contract", cat: "Riset Ilmiah (Zenodo DOI: 10.5281/zenodo.18884976)" },
            { title: "Kajian Yuridis dan Regulasi AI dalam Perlindungan Data Pribadi di Indonesia", snippet: "Analisis kepatuhan model kecerdasan buatan terhadap UU No. 27 Tahun 2022 (UU PDP).", url: "penelitian.html#paper-ai-pdp", cat: "Riset Ilmiah (Zenodo DOI: 10.5281/zenodo.23997116)" },
            { title: "Tanggung Jawab Hukum Terhadap Insiden Kebocoran Data pada Sistem Cloud", snippet: "Tinjauan pertanggungjawaban penyedia jasa komputasi awan dan subkontraktor data.", url: "penelitian.html#paper-cloud-security", cat: "Riset Ilmiah (Jurnal OJS)" },
            { title: "Aspek Hukum Bukti Digital (Digital Evidence) dalam Tindak Pidana Siber", snippet: "Standar forensik digital dan penerimaan alat bukti elektronik di peradilan Indonesia.", url: "penelitian.html#paper-digital-forensics", cat: "Riset Ilmiah" },
            { title: "Regulasi Artificial Intelligence dalam Hukum Internasional dan Komparasi Uni Eropa (EU AI Act)", snippet: "Perbandingan pendekatan berbasis risiko AI Act Uni Eropa dengan kerangka hukum Indonesia.", url: "penelitian.html#paper-eu-ai-act", cat: "Riset Ilmiah" }
        ];

        function performSearch(query) {
            const q = query.trim().toLowerCase();
            if (!q) {
                searchClearBtn?.classList.add('hidden');
                searchClearBtn?.classList.remove('flex');
                searchResultsContainer.innerHTML = `
                    <div class="py-6 text-center text-slate-400 dark:text-slate-500">
                        <svg class="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <p class="text-xs font-semibold">Ketik topik di bar bawah untuk mencari pesan</p>
                        <p class="text-[10px] mt-0.5 opacity-75">110+ publikasi artikel, riset ilmiah, & seluruh halaman web</p>
                    </div>
                `;
                return;
            }

            searchClearBtn?.classList.remove('hidden');
            searchClearBtn?.classList.add('flex');

            const results = [];

            // 1. Search Static Pages
            staticPages.forEach(p => {
                if (p.title.toLowerCase().includes(q) || p.snippet.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q)) {
                    results.push(p);
                }
            });

            // 2. Search Academic Research Papers
            academicPapers.forEach(p => {
                if (p.title.toLowerCase().includes(q) || p.snippet.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q)) {
                    results.push(p);
                }
            });

            // 3. Search Dynamic Articles from Sheets API
            if (Array.isArray(cachedSearchArticles)) {
                cachedSearchArticles.forEach(a => {
                    const title = a.judul || '';
                    const snippet = a.kutipan || '';
                    const cat = a.kategori || 'Artikel Edukasi';
                    if (title.toLowerCase().includes(q) || snippet.toLowerCase().includes(q) || cat.toLowerCase().includes(q)) {
                        results.push({
                            title: title,
                            snippet: snippet.length > 115 ? snippet.substring(0, 115) + '...' : snippet,
                            url: a.link || `baca.html?id=${a.id}`,
                            cat: `Artikel: ${cat}`
                        });
                    }
                });
            }

            if (results.length === 0) {
                searchResultsContainer.innerHTML = `
                    <div class="py-6 text-center text-slate-400 dark:text-slate-500">
                        <div class="text-2xl mb-1">🔍</div>
                        <p class="text-xs font-bold text-slate-700 dark:text-slate-300">Tidak menemukan pesan untuk "${query}"</p>
                        <p class="text-[10px] mt-1 text-slate-500">Coba kata kunci seperti "AI", "Hukum", "UU PDP", "Trading", atau klik tagar di atas.</p>
                    </div>
                `;
                return;
            }

            const total = results.length;
            const shown = results.slice(0, 20); // render max 20 for fast response

            let html = `
                <div class="flex items-center justify-between pb-1 px-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-black/5 dark:border-white/5">
                    <span>Hasil Pencarian</span>
                    <span class="text-[#2481cc] dark:text-[#64b5f6]">${total} Ditemukan</span>
                </div>
            `;

            shown.forEach(item => {
                html += `
                <a href="${item.url}" class="block p-2.5 rounded-xl bg-white dark:bg-[#182533] hover:bg-blue-50 dark:hover:bg-[#242f3d] border border-slate-200/80 dark:border-[#242f3d] transition-all group">
                    <div class="flex items-center justify-between gap-1 mb-1">
                        <span class="inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-[#2481cc] dark:text-[#64b5f6]">
                            ${item.cat}
                        </span>
                        <span class="text-[10px] text-slate-400 group-hover:text-[#2481cc] transition-colors">Buka →</span>
                    </div>
                    <h6 class="text-xs font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#2481cc] dark:group-hover:text-[#64b5f6] transition-colors">
                        ${highlightMatch(item.title, query)}
                    </h6>
                    <p class="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1 line-clamp-2">
                        ${highlightMatch(item.snippet, query)}
                    </p>
                </a>
                `;
            });

            if (total > 20) {
                html += `
                    <div class="text-center py-2 text-[10px] font-bold text-slate-400">
                        +${total - 20} hasil lainnya... Spesifikkan kata kunci untuk memfilter.
                    </div>
                `;
            }

            searchResultsContainer.innerHTML = html;
        }

        let debounceTimer = null;
        searchInput?.addEventListener('input', (e) => {
            const val = e.target.value;
            // If user types, auto switch to search tab to see live results
            if (val.trim()) {
                switchHubTab('cari');
            }
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                performSearch(val);
            }, 80);
        });

        searchClearBtn?.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                searchInput.focus();
                performSearch('');
            }
        });

        searchChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const kw = chip.getAttribute('data-keyword') || chip.textContent.replace('#', '');
                switchHubTab('cari');
                if (searchInput) {
                    searchInput.value = kw;
                    searchInput.focus();
                    performSearch(kw);
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupHub);
    } else {
        setupHub();
    }
})();
