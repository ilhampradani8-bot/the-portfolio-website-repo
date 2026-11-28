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
            const host = (typeof window !== 'undefined' && window.location && window.location.hostname) || '';
            const isDev = host === 'localhost' || host === '127.0.0.1' || host.includes('139.59.122.230');
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
   SIMPLECHAT WHITE FLOATING CHAT BUBBLE (Clean White Theme msger)
   ========================================================================== */
(function initSimpleChatBubble() {
    function setupChat() {
        if (document.getElementById("floating-action-hub")) return;

        // 1. Inject Styles
        const styleId = "msger-chat-styles";
        if (!document.getElementById(styleId)) {
            const style = document.createElement("style");
            style.id = styleId;
            style.textContent = `
:root {
  --msger-bg: #ffffff;
  --msger-border: 1px solid #e2e8f0;
  --left-msg-bg: #ececec;
  --right-msg-bg: #579ffb;
}

#floating-action-hub {
  position: fixed;
  bottom: 1.25rem;
  right: 1.25rem;
  z-index: 99999 !important;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.65rem;
  pointer-events: none;
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

#floating-msger-panel {
  pointer-events: auto;
  position: relative;
  width: 360px;
  max-width: calc(100vw - 28px);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: bottom right;
}

.msger {
  display: flex;
  flex-flow: column;
  justify-content: space-between;
  width: 100%;
  height: 520px;
  max-height: calc(100vh - 110px);
  border: var(--msger-border);
  border-radius: 16px;
  background: var(--msger-bg);
  box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.22), 0 0 1px 1px rgba(0,0,0,0.05);
  overflow: hidden;
}

.msger-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
  color: #1f2937;
  font-weight: 700;
  font-size: 13.5px;
}

.msger-header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #111827;
  font-weight: 800;
}

.msger-header-options {
  display: flex;
  align-items: center;
  gap: 6px;
}

.msger-opt-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #64748b;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  padding: 0;
  text-decoration: none;
}

.msger-opt-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.msger-chat {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  background-color: #fcfcfe;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260' viewBox='0 0 260 260'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23dddddd' fill-opacity='0.4'%3E%3Cpath d='M24.37 16c.2.65.39 1.32.54 2H21.17l1.17 2.34.45.9-.24.11V28a5 5 0 0 1-2.23 8.94l-.02.06a8 8 0 0 1-7.75 6h-20a8 8 0 0 1-7.74-6l-.02-.06A5 5 0 0 1-17.45 28v-6.76l-.79-1.58-.44-.9.9-.44.63-.32H-20a23.01 23.01 0 0 1 44.37-2zm-36.82 2a1 1 0 0 0-.44.1l-3.1 1.56.89 1.79 1.31-.66a3 3 0 0 1 2.69 0l2.2 1.1a1 1 0 0 0 .9 0l2.21-1.1a3 3 0 0 1 2.69 0l2.2 1.1a1 1 0 0 0 .9 0l2.21-1.1a3 3 0 0 1 2.69 0l2.2 1.1a1 1 0 0 0 .86.02l2.88-1.27a3 3 0 0 1 2.43 0l2.88 1.27a1 1 0 0 0 .85-.02l3.1-1.55-.89-1.79-1.42.71a3 3 0 0 1-2.56.06l-2.77-1.23a1 1 0 0 0-.4-.09h-.01a1 1 0 0 0-.4.09l-2.78 1.23a3 3 0 0 1-2.56-.06l-2.3-1.15a1 1 0 0 0-.45-.11h-.01a1 1 0 0 0-.44.1L.9 19.22a3 3 0 0 1-2.69 0l-2.2-1.1a1 1 0 0 0-.45-.11h-.01a1 1 0 0 0-.44.1l-2.21 1.11a3 3 0 0 1-2.69 0l-2.2-1.1a1 1 0 0 0-.45-.11h-.01zm0-2h-4.9a21.01 21.01 0 0 1 39.61 0h-2.09l-.06-.13-.26.13h-32.31zm30.35 7.68l1.36-.68h1.3v2h-36v-1.15l.34-.17 1.36-.68h2.59l1.36.68a3 3 0 0 0 2.69 0l1.36-.68h2.59l1.36.68a3 3 0 0 0 2.69 0L2.26 23h2.59l1.36.68a3 3 0 0 0 2.56.06l1.67-.74h3.23l1.67.74a3 3 0 0 0 2.56-.06zM-13.82 27l16.37 4.91L18.93 27h-32.75zm-.63 2h.34l16.66 5 16.67-5h.33a3 3 0 1 1 0 6h-34a3 3 0 1 1 0-6zm1.35 8a6 6 0 0 0 5.65 4h20a6 6 0 0 0 5.66-4H-13.1z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.msger-chat::-webkit-scrollbar {
  width: 5px;
}
.msger-chat::-webkit-scrollbar-track {
  background: #f1f5f9;
}
.msger-chat::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

.msg {
  display: flex;
  align-items: flex-end;
  margin-bottom: 12px;
}
.msg:last-of-type {
  margin: 0;
}
.msg-img {
  width: 36px;
  height: 36px;
  min-width: 36px;
  margin-right: 10px;
  background: #e2e8f0;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  border-radius: 50%;
  border: 1.5px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.12);
}
.msg-bubble {
  max-width: 82%;
  padding: 10px 14px;
  border-radius: 15px;
  background: var(--left-msg-bg, #ececec);
  font-size: 12px;
  line-height: 1.45;
  color: #1f2937;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.msg-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}
.msg-info-name {
  margin-right: 10px;
  font-weight: 700;
  font-size: 11px;
}
.msg-info-time {
  font-size: 10px;
  opacity: 0.65;
}

.left-msg .msg-bubble {
  border-bottom-left-radius: 0;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #1e293b;
}

.right-msg {
  flex-direction: row-reverse;
}
.right-msg .msg-bubble {
  background: var(--right-msg-bg, #579ffb);
  color: #ffffff;
  border-bottom-right-radius: 0;
}
.right-msg .msg-info-name {
  color: rgba(255, 255, 255, 0.95);
}
.right-msg .msg-info-time {
  color: rgba(255, 255, 255, 0.8);
}
.right-msg .msg-img {
  margin: 0 0 0 10px;
}

.msger-chips-bar {
  display: flex;
  gap: 6px;
  padding: 8px 12px;
  background: #ffffff;
  border-top: 1px solid #f1f5f9;
  overflow-x: auto;
  white-space: nowrap;
}
.msger-chips-bar::-webkit-scrollbar {
  display: none;
}
.msger-chip {
  padding: 4px 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 10.5px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.msger-chip:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.msger-inputarea {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid #e5e7eb;
  background: #ffffff;
}
.msger-input {
  flex: 1;
  padding: 9px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  background: #f9fafb;
  outline: none;
  color: #111827;
  transition: border-color 0.2s;
}
.msger-input:focus {
  border-color: #579ffb;
  background: #ffffff;
}
.msger-send-btn {
  padding: 9px 16px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  background: rgb(0, 196, 65);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}
.msger-send-btn:hover {
  background: rgb(0, 180, 50);
}
.msger-send-btn:active {
  transform: scale(0.97);
}
`;
            document.head.appendChild(style);
        }

        function formatTime(date) {
            const h = "0" + date.getHours();
            const m = "0" + date.getMinutes();
            return `${h.slice(-2)}:${m.slice(-2)}`;
        }

        // 2. Inject HTML Markup
        const hubHtml = `
        <div id="floating-action-hub">
            <!-- Scroll to top button -->
            <button type="button" id="hub-scroll-top-btn" 
                    class="pointer-events-auto opacity-0 translate-y-3 pointer-events-none transition-all duration-300 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white cursor-pointer group" 
                    aria-label="Scroll to top" title="Scroll ke Atas">
                <svg class="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/>
                </svg>
            </button>

            <!-- Floating msger Panel -->
            <div id="floating-msger-panel" class="scale-95 opacity-0 translate-y-4 pointer-events-none mb-1">
                <section class="msger">
                    <header class="msger-header">
                        <div class="msger-header-title">
                            <i class="fas fa-comment-alt" style="color: #579ffb;"></i>
                            <span>SimpleChat</span>
                        </div>
                        <div class="msger-header-options">
                            <a href="https://wa.me/6288971071138?text=Halo%20Ilham%20Pradani,%20saya%20ingin%20berkonsultasi" target="_blank" rel="noopener noreferrer" class="msger-opt-btn" title="Hubungi via WhatsApp">
                                <img src="image/wa_clean.svg" class="w-4 h-4 object-contain" alt="WA">
                            </a>
                            <a href="https://t.me/ilhampradani_sh" target="_blank" rel="noopener noreferrer" class="msger-opt-btn" title="Hubungi via Telegram">
                                <img src="image/tg_clean.png" class="w-4 h-4 object-contain" alt="TG">
                            </a>
                            <button type="button" id="msger-close-btn" class="msger-opt-btn" title="Tutup Chat" aria-label="Tutup">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                    </header>

                    <main class="msger-chat" id="msger-chat">
                        <div class="msg left-msg">
                            <div class="msg-img" style="background-image: url(https://image.flaticon.com/icons/svg/327/327779.svg)"></div>
                            <div class="msg-bubble">
                                <div class="msg-info">
                                    <div class="msg-info-name">BOT</div>
                                    <div class="msg-info-time">${formatTime(new Date())}</div>
                                </div>
                                <div class="msg-text">
                                    Hi, welcome to SimpleChat! Go ahead and send me a message. 😄
                                </div>
                            </div>
                        </div>

                        <div class="msg right-msg">
                            <div class="msg-img" style="background-image: url(https://image.flaticon.com/icons/svg/145/145867.svg)"></div>
                            <div class="msg-bubble">
                                <div class="msg-info">
                                    <div class="msg-info-name">Sajad</div>
                                    <div class="msg-info-time">${formatTime(new Date())}</div>
                                </div>
                                <div class="msg-text">
                                    You can change your name in JS section!
                                </div>
                            </div>
                        </div>
                    </main>

                    <div class="msger-chips-bar">
                        <button type="button" class="msger-chip" data-msg="Halo, saya ingin konsultasi hukum siber & TI">⚖️ Konsultasi Hukum</button>
                        <button type="button" class="msger-chip" data-msg="Bagaimana cara order bot trading / sistem AI?">🤖 Custom AI Bot</button>
                        <button type="button" class="msger-chip" data-msg="Boleh minta kontak WhatsApp dan Telegram resmi?">📞 Info Kontak</button>
                    </div>

                    <form class="msger-inputarea" id="msger-form">
                        <input type="text" class="msger-input" id="msger-input" placeholder="Enter your message..." autocomplete="off">
                        <button type="submit" class="msger-send-btn">Send</button>
                    </form>
                </section>
            </div>

            <!-- Floating Action Button Bubble -->
            <button type="button" id="btn-floating-bubble" 
                    style="width: 58px; height: 58px;" class="pointer-events-auto relative w-14 h-14 rounded-full bg-white text-blue-600 shadow-[0_10px_35px_rgba(0,0,0,0.18)] border border-slate-200/90 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group"
                    aria-label="Buka SimpleChat" title="SimpleChat">
                <span class="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full z-10 shadow-xs">
                    <span class="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
                </span>
                <div id="msger-bubble-icon" class="transition-all duration-300 flex items-center justify-center">
                    <svg class="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    </svg>
                </div>
                <div id="msger-bubble-close" class="hidden transition-all duration-300 text-gray-700">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </div>
            </button>
        </div>
        `;

        document.body.insertAdjacentHTML("beforeend", hubHtml);

        // 3. Bind Logic
        const hubScrollTopBtn = document.getElementById("hub-scroll-top-btn");
        const btnFloatingBubble = document.getElementById("btn-floating-bubble");
        const msgerPanel = document.getElementById("floating-msger-panel");
        const msgerCloseBtn = document.getElementById("msger-close-btn");
        const msgerBubbleIcon = document.getElementById("msger-bubble-icon");
        const msgerBubbleClose = document.getElementById("msger-bubble-close");
        const msgerForm = document.getElementById("msger-form");
        const msgerInput = document.getElementById("msger-input");
        const msgerChat = document.getElementById("msger-chat");
        const chips = document.querySelectorAll(".msger-chip");

        // Scroll listener for top button
        window.addEventListener("scroll", () => {
            if (window.scrollY > 220) {
                hubScrollTopBtn?.classList.remove("opacity-0", "translate-y-3", "pointer-events-none");
                hubScrollTopBtn?.classList.add("opacity-100", "translate-y-0", "pointer-events-auto");
            } else {
                hubScrollTopBtn?.classList.add("opacity-0", "translate-y-3", "pointer-events-none");
                hubScrollTopBtn?.classList.remove("opacity-100", "translate-y-0", "pointer-events-auto");
            }
        }, { passive: true });

        hubScrollTopBtn?.addEventListener("click", () => {
            if (window.lenis) {
                window.lenis.scrollTo(0, { duration: 0.9 });
            } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        });

        // Toggle logic
        let isOpen = false;
        function toggleMsger(open) {
            isOpen = typeof open === "boolean" ? open : !isOpen;
            if (isOpen) {
                msgerPanel?.classList.remove("scale-95", "opacity-0", "translate-y-4", "pointer-events-none");
                msgerPanel?.classList.add("scale-100", "opacity-100", "translate-y-0", "pointer-events-auto");
                msgerBubbleIcon?.classList.add("hidden");
                msgerBubbleClose?.classList.remove("hidden");
                setTimeout(() => msgerInput?.focus(), 150);
            } else {
                msgerPanel?.classList.add("scale-95", "opacity-0", "translate-y-4", "pointer-events-none");
                msgerPanel?.classList.remove("scale-100", "opacity-100", "translate-y-0", "pointer-events-auto");
                msgerBubbleIcon?.classList.remove("hidden");
                msgerBubbleClose?.classList.add("hidden");
            }
        }

        btnFloatingBubble?.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleMsger();
        });

        msgerCloseBtn?.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleMsger(false);
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && isOpen) {
                toggleMsger(false);
            }
        });

        document.addEventListener("click", (e) => {
            if (isOpen && !e.target.closest("#floating-msger-panel") && !e.target.closest("#btn-floating-bubble")) {
                toggleMsger(false);
            }
        });

        // Chat functionality
        const BOT_MSGS = [
            "Hi, how are you?",
            "Ohh... I can't understand what you trying to say. Sorry!",
            "I like to play games... But I don't know how to play!",
            "Sorry if my answers are not relevant. :))",
            "I feel sleepy! :("
        ];

        const BOT_IMG = "https://image.flaticon.com/icons/svg/327/327779.svg";
        const PERSON_IMG = "https://image.flaticon.com/icons/svg/145/145867.svg";
        const BOT_NAME = "BOT";
        const PERSON_NAME = "Sajad";

        function appendMessage(name, img, side, text) {
            const msgHTML = `
                <div class="msg ${side}-msg">
                    <div class="msg-img" style="background-image: url(${img})"></div>
                    <div class="msg-bubble">
                        <div class="msg-info">
                            <div class="msg-info-name">${name}</div>
                            <div class="msg-info-time">${formatTime(new Date())}</div>
                        </div>
                        <div class="msg-text">${text}</div>
                    </div>
                </div>
            `;
            msgerChat.insertAdjacentHTML("beforeend", msgHTML);
            msgerChat.scrollTop = msgerChat.scrollHeight;
        }

        function botResponse(userText) {
            const lower = (userText || "").toLowerCase();
            let msgText = "";

            if (lower.includes("wa") || lower.includes("whatsapp") || lower.includes("kontak") || lower.includes("nomor")) {
                msgText = "Hubungi Ilham Pradani via WhatsApp resmi di +62 889-7107-1138 atau kunjungi wa.me/6288971071138.";
            } else if (lower.includes("tele") || lower.includes("tg")) {
                msgText = "Telegram resmi: @ilhampradani_sh (t.me/ilhampradani_sh).";
            } else if (lower.includes("hukum") || lower.includes("legal") || lower.includes("siber") || lower.includes("cyber")) {
                msgText = "Layanan hukum siber kami mengintegrasikan kepatuhan regulasi digital, audit sistem, dan arsitektur TI presisi.";
            } else if (lower.includes("bot") || lower.includes("ai") || lower.includes("trading")) {
                msgText = "Kami membangun Custom AI Bot dan sistem Algorithmic Trading mutakhir berbasis Rust Axum berkinerja tinggi.";
            } else {
                const r = Math.floor(Math.random() * BOT_MSGS.length);
                msgText = BOT_MSGS[r];
            }

            const delay = Math.min(1200, Math.max(300, msgText.split(" ").length * 70));
            setTimeout(() => {
                appendMessage(BOT_NAME, BOT_IMG, "left", msgText);
            }, delay);
        }

        msgerForm?.addEventListener("submit", (e) => {
            e.preventDefault();
            const msgText = msgerInput.value.trim();
            if (!msgText) return;
            appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText);
            msgerInput.value = "";
            botResponse(msgText);
        });

        chips.forEach(chip => {
            chip.addEventListener("click", () => {
                const msg = chip.getAttribute("data-msg") || chip.textContent;
                appendMessage(PERSON_NAME, PERSON_IMG, "right", msg);
                botResponse(msg);
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setupChat);
    } else {
        setupChat();
    }
})();
