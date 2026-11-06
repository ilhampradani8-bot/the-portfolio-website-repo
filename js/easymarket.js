// MallDigital & SirkelHub (Evolution of EasyMarket) Controller
// PT CHAIN ASIA CONECT & PT EASYMALL SOFTWARE DEVELOPMENT

(function () {
    let mallProducts = [];
    let legacyProducts = [];
    let activeCategoryFilter = 'All';
    let activeSubcategoryFilter = 'All';
    let isDataLoaded = false;

    // Category mapping & normalization
    const CATEGORIES = [
        { id: 'All', labelId: 'Semua (200+)', labelEn: 'All (200+)', labelZh: '全部' },
        { id: 'spesial_fast', labelId: 'Spesial Fast', labelEn: 'Special Fast', labelZh: '超快专区' },
        { id: 'instan', labelId: 'Instan 24 Jam', labelEn: 'Instant 24 Hours', labelZh: '24小时秒发' },
        { id: 'digital', labelId: 'Streaming & Akun', labelEn: 'Streaming & Accounts', labelZh: '流媒体与账号' },
        { id: 'productivity', labelId: 'Produktivitas & Desain', labelEn: 'Productivity & Design', labelZh: '生产力与设计' },
        { id: 'music', labelId: 'Musik', labelEn: 'Music', labelZh: '音乐' },
        { id: 'sosmed', labelId: 'Sosmed & SMM', labelEn: 'Social Media & SMM', labelZh: '社交媒体与SMM' },
        { id: 'game', labelId: 'Top Up Game', labelEn: 'Game Top-Up', labelZh: '游戏充值' },
        { id: 'pulsa', labelId: 'Pulsa & Kuota', labelEn: 'Mobile Credit & Data', labelZh: '话费与流量' },
        { id: 'pln', labelId: 'Token PLN', labelEn: 'PLN Electricity Token', labelZh: '国家电力充值' },
        { id: 'ssl', labelId: 'SSL & Domain', labelEn: 'SSL & Domain', labelZh: 'SSL证书与域名' },
        { id: 'international', labelId: 'Mall International', labelEn: 'Mall International', labelZh: '国际商城' }
    ];

    // Helper: format currency
    function formatRupiah(amount) {
        if (!amount || amount === 0) return 'Hubungi CS';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Helper: WhatsApp order link
    function getWaOrderUrl(prodName, variantName, price) {
        const text = encodeURIComponent(
            `Halo Admin MallDigital & SirkelHub,\nSaya ingin order produk berikut:\n\n` +
            `• Produk: ${prodName}\n` +
            `• Varian: ${variantName || '-'}\n` +
            `• Harga: ${formatRupiah(price)}\n\n` +
            `Mohon panduan pembayaran QRIS otomatis dan aktivasi akunnya. Terima kasih!`
        );
        return `https://wa.me/6288971071138?text=${text}`;
    }

    // Load products data
    async function loadData() {
        try {
            // Try fetching from local cache first for fast render
            const res = await fetch('data/malldigital_products.json');
            if (res.ok) {
                const json = await res.json();
                mallProducts = json.products || [];
            }
        } catch (e) {
            console.warn('Local malldigital_products.json failed, fallback array', e);
        }

        // Background attempt to update from live MallDigital API
        fetch('https://malldigital.tech/api/products', { cache: 'no-cache' })
            .then(r => r.json())
            .then(data => {
                if (data && data.products && data.products.length > 0) {
                    mallProducts = data.products;
                    if (document.getElementById('product-list-container')) {
                        applyFilters();
                    }
                }
            })
            .catch(() => {
                // silently use cached json
            });

        // Load legacy products for archive tab
        try {
            const resLegacy = await fetch('data/legacy_products.json');
            if (resLegacy.ok) {
                legacyProducts = await resLegacy.json();
                renderLegacyArchive(legacyProducts);
            }
        } catch (e) {
            console.warn('Could not load legacy products', e);
        }

        isDataLoaded = true;
        renderCategoryFilters();
        applyFilters();
    }

    // Render category filters pills
    function renderCategoryFilters() {
        const container = document.getElementById('category-filters');
        if (!container) return;

        container.innerHTML = CATEGORIES.map(cat => `
            <button onclick="filterCategory('${cat.id}')" data-category="${cat.id}"
                class="category-btn px-4 py-1.5 text-xs font-bold rounded-full transition-all shrink-0 ${cat.id === activeCategoryFilter
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }">
                <span class="lang-id">${cat.labelId}</span>
                <span class="lang-en hidden">${cat.labelEn}</span>
                <span class="lang-zh hidden">${cat.labelZh}</span>
            </button>
        `).join('');
    }

    // Category click handler
    window.filterCategory = function (catId) {
        activeCategoryFilter = catId;
        document.querySelectorAll('#category-filters button').forEach(btn => {
            const isMatch = btn.getAttribute('data-category') === catId;
            if (isMatch) {
                btn.className = 'category-btn px-4 py-1.5 text-xs font-bold rounded-full bg-blue-600 text-white shadow-sm shrink-0 transition-all';
            } else {
                btn.className = 'category-btn px-4 py-1.5 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0 transition-all';
            }
        });
        applyFilters();
    };

    // Render MallDigital Product Catalog
    function renderProducts(list) {
        const container = document.getElementById('product-list-container');
        const countEl = document.getElementById('product-count-badge');
        if (!container) return;

        if (countEl) {
            countEl.textContent = `${list.length} Produk Tersedia`;
        }

        if (list.length === 0) {
            container.innerHTML = `
                <div class="py-14 text-center text-gray-400 dark:text-gray-500">
                    <i data-lucide="package-search" class="w-12 h-12 mx-auto mb-3 opacity-40"></i>
                    <p class="font-bold text-sm">Tidak ada produk yang cocok dengan pencarian.</p>
                    <p class="text-xs text-gray-400 mt-1">Coba kata kunci lain atau pilih kategori "Semua".</p>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
            return;
        }

        container.innerHTML = list.map(prod => {
            // Determine image URL
            let imgUrl = prod.image_url || prod.image || '';
            if (imgUrl && imgUrl.startsWith('/')) {
                imgUrl = 'https://malldigital.tech' + imgUrl;
            } else if (!imgUrl) {
                imgUrl = 'documents/Logo/easyfastlogotransaparan.webp';
            }

            // Min and max price
            const variants = prod.variants || [];
            let priceDisplay = formatRupiah(prod.price);
            let firstVariantName = variants.length > 0 ? variants[0].name : '';
            if (variants.length > 1) {
                const prices = variants.map(v => v.price).filter(p => p > 0);
                if (prices.length > 0) {
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    priceDisplay = minPrice === maxPrice ? formatRupiah(minPrice) : `Mulai ${formatRupiah(minPrice)}`;
                }
            }

            // Badge text
            const badgeText = prod.badge || prod.badge_label || (prod.is_realtime ? 'INSTAN 24H' : 'MALL');
            const storeText = prod.store_name || (prod.product_source === 'sirkelhub' ? 'SirkelHub' : 'MALL Official');
            const desc = prod.description || (variants[0] && variants[0].terms_and_conditions ? variants[0].terms_and_conditions.slice(0, 70) + '...' : 'Produk digital aktif bergaransi');

            const waUrl = getWaOrderUrl(prod.name, firstVariantName, prod.price);
            const mallUrl = `https://malldigital.tech/hasil_pencarian?query=${encodeURIComponent(prod.name)}`;

            return `
                <div class="product-item py-4 px-3 sm:px-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-blue-50/40 dark:hover:bg-slate-800/40 border-b border-gray-100 dark:border-white/5">
                    <div class="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                        <div class="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                            <img src="${imgUrl}" alt="${prod.name}" class="w-full h-full object-contain" onerror="this.onerror=null; this.src='documents/Logo/easyfastlogotransaparan.webp';">
                        </div>
                        <div class="min-w-0 flex-1 space-y-1">
                            <div class="flex flex-wrap items-center gap-2">
                                <h4 class="font-extrabold text-sm sm:text-base text-gray-900 dark:text-gray-100 tracking-tight truncate">${prod.name}</h4>
                                <span class="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">${badgeText}</span>
                                <span class="px-1.5 py-0.5 text-[9px] font-bold rounded bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">${storeText}</span>
                            </div>
                            <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">${desc}</p>
                            ${variants.length > 0 ? `
                                <div class="flex flex-wrap gap-1.5 pt-1">
                                    ${variants.slice(0, 3).map(v => `
                                        <span class="inline-flex items-center text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded font-medium">
                                            ${v.name}: <strong class="ml-1 text-blue-600 dark:text-[#38bdf8]">${formatRupiah(v.price)}</strong>
                                        </span>
                                    `).join('')}
                                    ${variants.length > 3 ? `<span class="text-[10px] text-gray-400 self-center">+${variants.length - 3} varian lainnya</span>` : ''}
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <div class="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-white/5">
                        <div class="text-left md:text-right">
                            <div class="text-[10px] uppercase font-bold text-gray-400">Harga</div>
                            <div class="font-black text-base sm:text-lg text-blue-600 dark:text-[#38bdf8]">${priceDisplay}</div>
                        </div>
                        <div class="flex items-center gap-2">
                            <a href="${mallUrl}" target="_blank" rel="noopener"
                                class="px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-1.5 shadow-sm">
                                <i data-lucide="shopping-cart" class="w-3.5 h-3.5"></i>
                                <span>Beli Online</span>
                            </a>
                            <a href="${waUrl}" target="_blank" rel="noopener"
                                class="p-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center justify-center shadow-sm"
                                title="Order via WhatsApp Bot">
                                <i data-lucide="message-circle" class="w-4 h-4"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        if (window.lucide) lucide.createIcons();
    }

    // Apply Filters for MallDigital catalog
    window.applyFilters = function () {
        const searchInput = document.getElementById('product-search');
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const sortVal = document.getElementById('sort-select') ? document.getElementById('sort-select').value : 'default';

        let list = [...mallProducts];

        // Filter by category slug or category name
        if (activeCategoryFilter !== 'All') {
            list = list.filter(p => {
                if (p.category_slug && p.category_slug.toLowerCase() === activeCategoryFilter.toLowerCase()) return true;
                if (p.category) {
                    const c = p.category.toLowerCase();
                    if (activeCategoryFilter === 'digital' && (c.includes('streaming') || c.includes('digital') || c.includes('akun'))) return true;
                    if (activeCategoryFilter === 'productivity' && (c.includes('desain') || c.includes('produktivitas') || c.includes('design'))) return true;
                    if (activeCategoryFilter === 'music' && c.includes('musik')) return true;
                    if (activeCategoryFilter === 'sosmed' && (c.includes('sosmed') || c.includes('smm'))) return true;
                    if (activeCategoryFilter === 'game' && c.includes('game')) return true;
                    if (activeCategoryFilter === 'pulsa' && (c.includes('pulsa') || c.includes('data'))) return true;
                    if (activeCategoryFilter === 'pln' && (c.includes('pln') || c.includes('listrik'))) return true;
                    if (activeCategoryFilter === 'ssl' && (c.includes('ssl') || c.includes('domain'))) return true;
                    if (activeCategoryFilter === 'spesial_fast' && (p.badge === 'FAST' || c.includes('spesial') || (p.badge_label && p.badge_label.includes('Fast')))) return true;
                    if (activeCategoryFilter === 'instan' && (p.is_realtime || (p.badge_label && p.badge_label.includes('Instan')))) return true;
                }
                return false;
            });
        }

        // Filter by search query
        if (query) {
            list = list.filter(p => {
                const name = (p.name || '').toLowerCase();
                const desc = (p.description || '').toLowerCase();
                const cat = (p.category || '').toLowerCase();
                const variantsText = (p.variants || []).map(v => v.name.toLowerCase()).join(' ');
                return name.includes(query) || desc.includes(query) || cat.includes(query) || variantsText.includes(query);
            });
        }

        // Sorting
        if (sortVal === 'price-asc') {
            list.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortVal === 'price-desc') {
            list.sort((a, b) => (b.price || 0) - (a.price || 0));
        } else if (sortVal === 'name-asc') {
            list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        }

        renderProducts(list);
    };

    // Render Legacy Archive
    function renderLegacyArchive(list) {
        const container = document.getElementById('legacy-product-list');
        if (!container) return;

        if (!list || list.length === 0) {
            container.innerHTML = `<div class="py-6 text-center text-gray-400 text-xs">Memuat arsip produk lama...</div>`;
            return;
        }

        container.innerHTML = list.map((item, idx) => `
            <div class="py-2.5 px-3 flex items-center justify-between text-xs border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-slate-800/40">
                <div class="flex items-center gap-2 min-w-0">
                    <span class="text-gray-400 font-mono text-[10px] w-6 shrink-0">${idx + 1}.</span>
                    <div class="truncate">
                        <span class="font-bold text-gray-800 dark:text-gray-200">${item.name}</span>
                        <span class="text-gray-400 text-[11px] ml-1">(${item.variant || '-'})</span>
                    </div>
                </div>
                <div class="font-semibold text-blue-600 dark:text-[#38bdf8] shrink-0 ml-2">
                    ${formatRupiah(item.price)}
                </div>
            </div>
        `).join('');
    }

    // Filter Legacy Archive Search
    window.filterLegacyArchive = function (query) {
        const q = (query || '').toLowerCase().trim();
        if (!q) {
            renderLegacyArchive(legacyProducts);
            return;
        }
        const filtered = legacyProducts.filter(p =>
            (p.name && p.name.toLowerCase().includes(q)) ||
            (p.variant && p.variant.toLowerCase().includes(q)) ||
            (p.category && p.category.toLowerCase().includes(q))
        );
        renderLegacyArchive(filtered);
    };

    // Tab Switching Logic
    window.switchTab = function (tabId) {
        const tabs = ['pengenalan', 'produk', 'harga', 'order', 'testimoni', 'sk', 'oss', 'investor', 'arsip'];

        tabs.forEach(tab => {
            const content = document.getElementById(`content-${tab}`);
            const btn = document.getElementById(`tab-${tab}`);
            if (content) content.classList.add('hidden');
            if (btn) btn.classList.remove('active');
        });

        const activeContent = document.getElementById(`content-${tabId}`);
        const activeBtn = document.getElementById(`tab-${tabId}`);
        if (activeContent) activeContent.classList.remove('hidden');
        if (activeBtn) activeBtn.classList.add('active');

        if (tabId === 'harga' && !isDataLoaded) {
            loadData();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Testimonial Lightbox
    window.openLightbox = function (src, cardEl) {
        const lightbox = document.getElementById('testi-lightbox');
        const img = document.getElementById('lightbox-img');
        const video = document.getElementById('lightbox-video');
        const cap = document.getElementById('lightbox-caption');
        if (!lightbox || !img || !video || !cap) return;

        const isVideo = src.toLowerCase().endsWith('.mp4');

        if (isVideo) {
            img.classList.add('hidden');
            img.src = '';
            video.classList.remove('hidden');
            video.src = src;
            video.play().catch(() => {});
        } else {
            video.classList.add('hidden');
            video.pause();
            video.src = '';
            img.classList.remove('hidden');
            img.src = src;
        }

        let captionText = 'Testimonial MallDigital & SirkelHub';
        if (cardEl) {
            const headingEl = cardEl.querySelector('h4');
            if (headingEl) {
                const visibleSpan = Array.from(headingEl.querySelectorAll('span')).find(span => !span.classList.contains('hidden'));
                captionText = visibleSpan ? visibleSpan.innerText : headingEl.innerText;
            }
        }
        cap.innerText = captionText;

        lightbox.classList.remove('hidden');
        lightbox.classList.add('flex');
        setTimeout(() => {
            lightbox.classList.remove('opacity-0');
        }, 10);
    };

    window.closeLightbox = function () {
        const lightbox = document.getElementById('testi-lightbox');
        const video = document.getElementById('lightbox-video');
        if (!lightbox) return;

        if (video) {
            video.pause();
            video.src = '';
        }

        lightbox.classList.add('opacity-0');
        setTimeout(() => {
            lightbox.classList.remove('flex');
            lightbox.classList.add('hidden');
        }, 300);
    };

    // S&K Sub-tabs
    window.switchSKSubTab = function (subTabId) {
        const contents = document.querySelectorAll('.sk-sub-content');
        contents.forEach(content => content.classList.add('hidden'));

        const tabs = ['deskripsi', 'pembelian', 'refund', 'privasi'];
        tabs.forEach(tab => {
            const btn = document.getElementById(`sk-tab-${tab}`);
            if (btn) {
                btn.classList.remove('text-[#0066cc]', 'dark:text-[#38bdf8]', 'border-[#0066cc]', 'dark:border-[#38bdf8]');
                btn.classList.add('text-gray-500', 'dark:text-gray-400', 'border-transparent');
            }
        });

        const activeContent = document.getElementById(`sk-content-${subTabId.split('-')[1]}`);
        if (activeContent) activeContent.classList.remove('hidden');

        const activeBtn = document.getElementById(`sk-tab-${subTabId.split('-')[1]}`);
        if (activeBtn) {
            activeBtn.classList.remove('text-gray-500', 'dark:text-gray-400', 'border-transparent');
            activeBtn.classList.add('text-[#0066cc]', 'dark:text-[#38bdf8]', 'border-[#0066cc]', 'dark:border-[#38bdf8]');
        }
    };

    // Init function
    const initPage = async () => {
        if (window.setLoadingProgress) window.setLoadingProgress(10);

        if (window.loadComponent) {
            await loadComponent('header-placeholder', 'include/header.html');
            if (window.setLoadingProgress) window.setLoadingProgress(45);
            await loadComponent('footer-placeholder', 'include/footer.html');
            if (window.setLoadingProgress) window.setLoadingProgress(75);
        }

        if (window.lucide) lucide.createIcons();

        // Search inputs listeners
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
        }

        const legacySearchInput = document.getElementById('legacy-search');
        if (legacySearchInput) {
            legacySearchInput.addEventListener('input', (e) => filterLegacyArchive(e.target.value));
        }

        // Load data immediately
        await loadData();

        // Theme management
        const body = document.body;
        const darkToggle = document.getElementById('dark-mode-toggle');
        const savedTheme = localStorage.getItem('proposal_theme');

        if (savedTheme === 'dark') {
            body.classList.add('dark-mode');
            updateDarkToggleIcon(true);
        }

        function updateDarkToggleIcon(isDark) {
            if (darkToggle) {
                darkToggle.innerHTML = isDark
                    ? `<i data-lucide="sun" class="w-4 h-4 text-yellow-400"></i>`
                    : `<i data-lucide="moon" class="w-4 h-4"></i>`;
                if (window.lucide) lucide.createIcons();
            }
        }

        if (darkToggle) {
            darkToggle.addEventListener('click', (e) => {
                e.preventDefault();
                const isDark = body.classList.toggle('dark-mode');
                localStorage.setItem('proposal_theme', isDark ? 'dark' : 'light');
                updateDarkToggleIcon(isDark);
            });
        }

        // Language toggle
        const langToggle = document.getElementById('lang-toggle');
        let currentLang = localStorage.getItem('preferred_lang') || 'id';

        function updateLanguageUI(lang) {
            currentLang = lang;
            localStorage.setItem('preferred_lang', lang);

            document.querySelectorAll('.lang-id').forEach(el => {
                if (lang === 'id') el.classList.remove('hidden');
                else el.classList.add('hidden');
            });
            document.querySelectorAll('.lang-en').forEach(el => {
                if (lang === 'en') el.classList.remove('hidden');
                else el.classList.add('hidden');
            });
            document.querySelectorAll('.lang-zh').forEach(el => {
                if (lang === 'zh') el.classList.remove('hidden');
                else el.classList.add('hidden');
            });

            if (langToggle) {
                let label = '🇮🇩 Indo';
                if (lang === 'en') label = '🇬🇧 Eng';
                if (lang === 'zh') label = '🇨🇳 中文';

                langToggle.innerHTML = `
                    <i data-lucide="languages" class="w-3.5 h-3.5 text-[#0066cc]"></i>
                    <span>${label}</span>
                `;
                if (window.lucide) lucide.createIcons();
            }
        }

        if (langToggle) {
            langToggle.addEventListener('click', (e) => {
                e.preventDefault();
                let nextLang = 'id';
                if (currentLang === 'id') nextLang = 'en';
                else if (currentLang === 'en') nextLang = 'zh';
                else if (currentLang === 'zh') nextLang = 'id';
                updateLanguageUI(nextLang);
            });
        }

        updateLanguageUI(currentLang);
        if (window.setLoadingProgress) window.setLoadingProgress(100);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPage);
    } else {
        initPage();
    }
})();
