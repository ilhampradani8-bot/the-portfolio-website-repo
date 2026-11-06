window.switchLang = function (lang) {
            localStorage.setItem('preferred_lang', lang);
            location.reload();
        };

        function updateLangUI() {
            const lang = localStorage.getItem('preferred_lang') || 'id';

            // 1. Desktop dropdown label
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

        async function applyTranslations() {
            const lang = localStorage.getItem('preferred_lang') || 'id';
            try {
                const response = await fetch(`lang/${lang}.json`);
                if (!response.ok) return;
                const t = await response.json();
                document.querySelectorAll('[data-t]').forEach(el => {
                    const key = el.getAttribute('data-t');
                    if (t[key]) el.innerHTML = t[key];
                });
            } catch (e) { console.error("Translation Error:", e); }
        }

        async function loadComponent(id, file) {
            const el = document.getElementById(id);
            if (!el) return;
            try {
                const res = await fetch(file + `?t=${Date.now()}`, { cache: 'no-cache' });
                if (res.ok) {
                    el.innerHTML = await res.text();
                    if (window.lucide) lucide.createIcons();
                    updateLangUI();
                    applyTranslations();
                }
            } catch (e) { console.error("Component Error:", e); }
        }

        async function loadPageContent() {
            const params = new URLSearchParams(window.location.search);
            const page = params.get('page') || 'about';
            const container = document.getElementById('content-container');
            
            try {
                // Use clean URL path to avoid 308 redirects on Cloudflare Pages
                const res = await fetch(`include/komponent_footer/${page}`);
                if (res.ok) {
                    container.innerHTML = await res.text();
                    
                    // Execute scripts inside the loaded content
                    const scripts = container.querySelectorAll('script');
                    scripts.forEach(oldScript => {
                        const newScript = document.createElement('script');
                        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                        oldScript.parentNode.replaceChild(newScript, oldScript);
                    });

                    if (window.lucide) lucide.createIcons();
                    document.title = `Dr. Ilham Pradani C.L. | ${page.charAt(0).toUpperCase() + page.slice(1)}`;
                    applyTranslations();
                } else {
                    container.innerHTML = '<div class="text-center py-20 text-slate-500">Halaman tidak ditemukan.</div>';
                }
            } catch (e) {
                container.innerHTML = '<div class="text-center py-20 text-red-500">Gagal memuat konten.</div>';
            }
        }

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

        document.addEventListener('DOMContentLoaded', async () => {
            if (window.setLoadingProgress) window.setLoadingProgress(5);
            await loadComponent('header-placeholder', 'include/header');
            if (window.setLoadingProgress) window.setLoadingProgress(40);
            await loadComponent('footer-placeholder', 'include/footer');
            if (window.setLoadingProgress) window.setLoadingProgress(70);
            await loadPageContent();
            if (window.setLoadingProgress) window.setLoadingProgress(100);
        });

        window.addEventListener('popstate', loadPageContent);