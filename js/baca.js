/* ============================================================
   BACA PAGE LOGIC
   ============================================================ */

window.toggleSidebar = function(open) {
    const sidebar = document.getElementById('sidebar-nav');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
        if (open) {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
            setTimeout(() => overlay.classList.add('opacity-100'), 10);
            document.body.style.overflow = 'hidden';
        } else {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.remove('opacity-100');
            setTimeout(() => {
                overlay.classList.add('hidden');
                document.body.style.overflow = '';
            }, 300);
        }
    }
};

async function renderFullContent() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const container = document.getElementById('content-area');
    const sidebarList = document.getElementById('sidebar-list');

    if (!container) return;

    if (window.setLoadingProgress) window.setLoadingProgress(25);
    try {
        const sheetId = '1eD1ElFcjBpVrS8DGShVlPrmuLI1bZIo4QEcxG1kBCAc';
        const res = await fetch(`https://opensheet.elk.sh/${sheetId}/Sheet1`);
        const data = await res.json();
        if (window.setLoadingProgress) window.setLoadingProgress(60);

        const getVal = (obj, key) => {
            const foundKey = Object.keys(obj).find(k => k.trim().toLowerCase() === key.toLowerCase());
            return obj[foundKey] || '';
        };

        data.sort((a, b) => parseDate(getVal(b, 'tanggal')) - parseDate(getVal(a, 'tanggal')));

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (sidebarList) {
            sidebarList.innerHTML = data.map(item => {
                const isCurrent = item.id === id;
                const itemDate = parseDate(getVal(item, 'tanggal'));
                const isToday = itemDate.getTime() === now.getTime();
                const activeClass = isCurrent ? 'text-blue-600 font-extrabold border-blue-300 bg-blue-50 shadow-[inset_1.5px_1.5px_3px_#b8bec9,inset_-1.5px_-1.5px_3px_#ffffff]' : 'text-gray-600 hover:text-blue-600 border-transparent bg-[#ecf0f3] shadow-[2px_2px_4px_#b8bec9,-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_2px_#b8bec9,inset_-1px_-1px_2px_#ffffff]';
                const labelText = getTranslatedLabel('badge_new', 'NEW');
                const label = isToday ? `<span class="px-1.5 py-0.5 bg-red-600 text-white text-[7px] font-black rounded animate-pulse ml-2">${labelText}</span>` : '';

                return `
                    <a href="baca.html?id=${item.id}" class="block p-3 rounded-lg border transition-all text-sm ${activeClass}">
                        <div class="flex justify-between items-start gap-2">
                            <div class="line-clamp-2">${getVal(item, 'judul')}</div>
                            ${label}
                        </div>
                        <div class="text-[9px] font-mono mt-1 text-gray-400 uppercase font-semibold">${getVal(item, 'tanggal')}</div>
                    </a>
                `;
            }).join('');
        }

        const artikel = data.find(item => item.id === id);

        if (artikel) {
            const judul = getVal(artikel, 'judul');
            const konten = getVal(artikel, 'konten');
            const gambar = getVal(artikel, 'gambar');
            const tanggal = getVal(artikel, 'tanggal');
            const kutipan = getVal(artikel, 'kutipan');

            document.title = `${judul} | Dr. Ilham Pradani C.L.`;
            
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.setAttribute('name', 'description');
                document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute('content', kutipan || judul);

            const updateMeta = (property, content) => {
                let el = document.querySelector(`meta[property="${property}"]`);
                if (!el) {
                    el = document.createElement('meta');
                    el.setAttribute('property', property);
                    document.head.appendChild(el);
                }
                el.setAttribute('content', content);
            };
            updateMeta('og:title', judul);
            updateMeta('og:description', kutipan || judul);
            updateMeta('og:image', gambar);
            updateMeta('og:url', window.location.href);

            let schemaScript = document.getElementById('schema-jsonld');
            if (!schemaScript) {
                schemaScript = document.createElement('script');
                schemaScript.id = 'schema-jsonld';
                schemaScript.type = 'application/ld+json';
                document.head.appendChild(schemaScript);
            }
            const schemaData = {
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": judul,
                "image": [gambar],
                "datePublished": parseDate(tanggal).toISOString(),
                "author": [{
                    "@type": "Person",
                    "name": "Dr. Ilham Pradani C.L.",
                    "url": "https://www.ilhampradani.me"
                }]
            };
            schemaScript.text = JSON.stringify(schemaData);

            const artikelLain = data.filter(item => item.id !== id).slice(0, 4);
            let bottomRekomendasi = '';

            if (artikelLain.length > 0) {
                bottomRekomendasi = `
                    <div class="mt-24 pt-12 border-t border-gray-200/70">
                        <h3 class="text-gray-900 text-sm font-bold uppercase tracking-widest mb-8">Eksplorasi Jurnal Lainnya</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${artikelLain.map(item => {
                                const itemDate = parseDate(getVal(item, 'tanggal'));
                                const isToday = itemDate.getTime() === now.getTime();
                                const labelText = getTranslatedLabel('badge_new', 'NEW');
                                const label = isToday ? `<span class="px-1.5 py-0.5 bg-red-600 text-white text-[8px] font-black rounded animate-pulse">${labelText}</span>` : '';
                                return `
                                    <a href="baca.html?id=${item.id}" class="neu-card group p-5 bg-[#ecf0f3] hover:scale-[1.01] transition-all flex flex-col justify-between">
                                        <div class="flex justify-between items-start mb-4 gap-2">
                                            <h4 class="text-gray-900 font-extrabold text-sm group-hover:text-blue-600 transition-colors line-clamp-2">${getVal(item, 'judul')}</h4>
                                            ${label}
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <span class="text-[10px] text-gray-500 font-mono uppercase font-semibold">${getVal(item, 'tanggal')}</span>
                                            <i data-lucide="arrow-right" class="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"></i>
                                        </div>
                                    </a>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }

            container.innerHTML = `
                <div class="reveal-el">
                    <div class="px-6 md:px-12 flex items-center justify-between mb-10">
                        <a href="index.html#artikel" class="inline-flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:text-blue-700 transition-colors group">
                            <i data-lucide="arrow-left" class="w-4 h-4 group-hover:-translate-x-1 transition-transform"></i> Kembali
                        </a>
 
                        <div class="flex items-center gap-2 bg-gray-200/50 p-1 rounded-full border border-gray-300/30">
                            <button onclick="setTheme('dark')" id="theme-dark-btn" class="p-2 rounded-full text-gray-500 hover:text-blue-600 transition-all">
                                <i data-lucide="moon" class="w-3.5 h-3.5"></i>
                            </button>
                            <button onclick="setTheme('light')" id="theme-light-btn" class="p-2 rounded-full text-gray-500 hover:text-blue-600 transition-all">
                                <i data-lucide="sun" class="w-3.5 h-3.5"></i>
                            </button>
                        </div>
 
                        <button onclick="toggleSidebar(true)" class="inline-flex items-center gap-2 text-gray-600 text-[10px] font-black uppercase tracking-widest hover:text-blue-600 transition-colors group">
                            Lihat Lainnya <i data-lucide="chevron-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform"></i>
                        </button>
                    </div>
                    
                    <div class="relative h-[400px] md:h-[600px] w-full mb-16 full-image overflow-hidden shadow-[4px_4px_12px_#b8bec9,-4px_-4px_12px_#ffffff] border border-white/40 bg-gray-200">
                        <img src="${gambar}" onerror="this.src='https://placehold.co/1200x600/ecf0f3/2563eb?text=No+Image'; this.className='w-full h-full object-cover opacity-30';" class="w-full h-full object-cover">
                        <div class="absolute inset-0 bg-gradient-to-t from-gray-100/40 via-transparent to-transparent"></div>
                    </div>
 
                    <div class="full-content-padding px-6">
                        <div class="flex items-center gap-4 mb-8 text-gray-500 font-mono text-[10px] uppercase tracking-[0.2em]">
                            <span class="px-3 py-1 bg-blue-600 text-white rounded-full font-bold">${tanggal}</span>
                            <span class="hidden md:block">Verified Article • Dr. Ilham Pradani C.L.</span>
                        </div>
 
                        <h1 class="text-4xl md:text-8xl font-black text-gray-900 leading-[1] tracking-tighter mb-16">${judul}</h1>
                        
                        <div class="prose prose-blue max-w-none text-gray-700 leading-relaxed text-xl border-l-4 border-blue-600 pl-8 md:pl-16 mb-24 font-medium">
                            ${konten}
                        </div>
 
                        <!-- ADSTERRA BANNER -->
                        <div id="ad-banner-container" class="my-12 py-10 border-t border-gray-200/50 text-center overflow-hidden">
                            <span class="text-[9px] text-gray-500 uppercase tracking-[0.2em] mb-4 block">Halaman ini didukung oleh Iklan</span>
                            <div id="adsterra-banner-unit" class="flex justify-center">
                                <!-- Adsterra Script will be injected here -->
                            </div>
                        </div>
 
                        ${bottomRekomendasi}
                    </div>
                </div>
            `;

            // Inject Adsterra Banner safely in a sandboxed iframe to prevent top-level page hijacking/redirects during scroll
            const adContainer = document.getElementById('adsterra-banner-unit');
            if (adContainer) {
                const iframe = document.createElement('iframe');
                iframe.width = 728;
                iframe.height = 90;
                iframe.frameBorder = 0;
                iframe.scrolling = 'no';
                // Sandbox attributes to prevent top-level redirects
                // allow-scripts: needed to run the ad script
                // allow-same-origin: needed because some ad scripts need it to fetch resources
                // allow-popups: allows ads to open in a new window/tab when clicked
                // Omit 'allow-top-navigation' so it cannot redirect the parent page!
                iframe.sandbox = 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox';
                
                const html = `
                    <body style="margin:0;padding:0;background:transparent;display:flex;justify-content:center;align-items:center;">
                        <script type="text/javascript">
                            atOptions = {
                                'key' : '70d4032d0634bd1a04e49f946a536c02',
                                'format' : 'iframe',
                                'height' : 90,
                                'width' : 728,
                                'params' : {}
                            };
                        </script>
                        <script type="text/javascript" src="//www.highperformanceformat.com/70d4032d0634bd1a04e49f946a536c02/invoke.js"></script>
                    </body>
                `;
                iframe.srcdoc = html;
                adContainer.innerHTML = '';
                adContainer.appendChild(iframe);
            }

            if (window.lucide) lucide.createIcons();
            initScrollAnimations();
            if (window.setLoadingProgress) window.setLoadingProgress(100);

        } else {
            window.allArticlesData = data;
            
            let frameHtml = `
                <div class="px-6 md:px-12 max-w-6xl mx-auto">
                    <div class="text-center mb-12">
                        <h1 class="text-4xl md:text-6xl font-black text-gray-900 leading-[1] tracking-tighter mb-4">Daftar Jurnal & Artikel</h1>
                        <p class="text-gray-500 uppercase tracking-widest text-xs font-semibold">Dr. Ilham Pradani C.L. — Publikasi Teknis & Kajian Hukum</p>
                    </div>

                    <!-- SEARCH & FILTER BAR -->
                    <div class="mb-12 flex flex-col md:flex-row gap-4 items-center justify-between bg-[#ecf0f3] p-5 rounded-2xl shadow-[6px_6px_12px_#b8c4df,-6px_-6px_12px_#ffffff] border border-white/20">
                        <!-- Search Input -->
                        <div class="relative w-full md:w-80">
                            <input type="text" id="article-search" placeholder="Cari judul atau isi artikel..." 
                                class="w-full bg-[#ecf0f3] text-gray-800 placeholder-gray-500 pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 shadow-[inset_3px_3px_6px_#b8bec9,inset_-3px_-3px_6px_#ffffff] transition-all text-xs font-semibold">
                            <i data-lucide="search" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
                        </div>

                        <!-- Filters & Sorting Group -->
                        <div class="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                            <!-- Category Select -->
                            <div class="relative min-w-[150px]">
                                <select id="category-filter" class="w-full bg-[#ecf0f3] text-gray-700 pl-3 pr-8 py-2.5 rounded-xl outline-none shadow-[3px_3px_6px_#b8bec9,-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8bec9,inset_-2px_-2px_4px_#ffffff] text-xs font-semibold appearance-none cursor-pointer">
                                    <option value="all">Semua Kategori</option>
                                    ${[...new Set(data.map(item => getVal(item, 'kategori')).filter(Boolean))].map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                                </select>
                                <i data-lucide="chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"></i>
                            </div>

                            <!-- Sort buttons -->
                            <div class="flex bg-[#ecf0f3] p-1 rounded-xl shadow-[inset_2px_2px_5px_#b8bec9,inset_-2px_-2px_5px_#ffffff]">
                                <button onclick="window.setSortOrder('terbaru')" id="btn-sort-terbaru" class="px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all text-blue-600 bg-[#ecf0f3] shadow-[2px_2px_4px_#b8bec9,-2px_-2px_4px_#ffffff]">Terbaru</button>
                                <button onclick="window.setSortOrder('7hari')" id="btn-sort-7hari" class="px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all text-gray-500 hover:text-blue-600 bg-transparent">7 Hari</button>
                                <button onclick="window.setSortOrder('terlama')" id="btn-sort-terlama" class="px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all text-gray-500 hover:text-blue-600 bg-transparent">Terlama</button>
                            </div>
                        </div>
                    </div>

                    <!-- LATEST ARTICLES GRID (2 ROWS OF 3 COLUMNS = 6 CARDS) -->
                    <div id="articles-grid-section" class="mb-20">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-sm font-extrabold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                <i data-lucide="book-open" class="w-4 h-4"></i> Jurnal Terbaru
                            </h2>
                            <span id="grid-count" class="text-xs text-gray-500 font-mono"></span>
                        </div>
                        <div id="articles-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <!-- Cards will be dynamically injected here -->
                        </div>
                    </div>

                    <!-- OLDER ARTICLES LIST (TEXT ONLY) -->
                    <div id="articles-list-section" class="mt-16 pt-12 border-t border-gray-300/40">
                        <h2 class="text-xl font-extrabold text-gray-900 mb-8 uppercase tracking-wider flex items-center gap-2">
                            <i data-lucide="archive" class="w-5 h-5 text-blue-600"></i> Arsip Artikel Lainnya
                        </h2>
                        <div id="articles-list" class="grid grid-cols-1 gap-4">
                            <!-- Text items will be dynamically injected here -->
                        </div>
                    </div>
                    
                    <div id="no-results" class="hidden text-center py-24 text-gray-500">
                        <i data-lucide="info" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                        <div class="text-sm font-bold uppercase tracking-wider">Artikel tidak ditemukan</div>
                        <div class="text-xs text-gray-450 mt-1">Coba sesuaikan kata kunci pencarian atau kategori Anda.</div>
                    </div>
                </div>
            `;

            container.innerHTML = frameHtml;

            // Initialize global state
            window.filterQuery = "";
            window.filterCategory = "all";
            window.sortOrder = "terbaru";

            // Attach search listener
            const searchInput = document.getElementById('article-search');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    window.filterQuery = e.target.value.trim().toLowerCase();
                    window.updateFilteredRender();
                });
            }

            // Attach category listener
            const categorySelect = document.getElementById('category-filter');
            if (categorySelect) {
                categorySelect.addEventListener('change', (e) => {
                    window.filterCategory = e.target.value;
                    window.updateFilteredRender();
                });
            }

            // Define the global rendering update function
            window.updateFilteredRender = function() {
                const searchVal = window.filterQuery;
                const catVal = window.filterCategory;
                const sortVal = window.sortOrder;

                let filtered = [...window.allArticlesData];

                // 1. Filter by category
                if (catVal !== "all") {
                    filtered = filtered.filter(item => getVal(item, 'kategori') === catVal);
                }

                // 2. Filter by search query
                if (searchVal) {
                    filtered = filtered.filter(item => {
                        const judul = getVal(item, 'judul').toLowerCase();
                        const konten = getVal(item, 'konten').toLowerCase();
                        const kutipan = getVal(item, 'kutipan').toLowerCase();
                        const kategori = getVal(item, 'kategori').toLowerCase();
                        return judul.includes(searchVal) || konten.includes(searchVal) || kutipan.includes(searchVal) || kategori.includes(searchVal);
                    });
                }

                // 3. Sort or filter by date
                if (sortVal === "terbaru") {
                    filtered.sort((a, b) => parseDate(getVal(b, 'tanggal')) - parseDate(getVal(a, 'tanggal')));
                } else if (sortVal === "terlama") {
                    filtered.sort((a, b) => parseDate(getVal(a, 'tanggal')) - parseDate(getVal(b, 'tanggal')));
                } else if (sortVal === "7hari") {
                    // Last 7 days
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    filtered = filtered.filter(item => parseDate(getVal(item, 'tanggal')) >= sevenDaysAgo);
                    filtered.sort((a, b) => parseDate(getVal(b, 'tanggal')) - parseDate(getVal(a, 'tanggal')));
                }

                // Update UI elements based on results
                const gridSection = document.getElementById('articles-grid-section');
                const listSection = document.getElementById('articles-list-section');
                const noResults = document.getElementById('no-results');
                const gridCount = document.getElementById('grid-count');
                const gridContainer = document.getElementById('articles-grid');
                const listContainer = document.getElementById('articles-list');

                if (filtered.length === 0) {
                    gridSection.classList.add('hidden');
                    listSection.classList.add('hidden');
                    noResults.classList.remove('hidden');
                    return;
                } else {
                    noResults.classList.add('hidden');
                }

                // Slice data for 2 rows of cards (up to 6 cards)
                const latestArticles = filtered.slice(0, 6);
                const olderArticles = filtered.slice(6);

                // Render grid (latest articles)
                if (latestArticles.length > 0) {
                    gridSection.classList.remove('hidden');
                    gridCount.textContent = `Menampilkan ${latestArticles.length} dari ${filtered.length} jurnal`;
                    
                    gridContainer.innerHTML = latestArticles.map(item => {
                        const itemDate = parseDate(getVal(item, 'tanggal'));
                        const isToday = itemDate.getTime() === now.getTime();
                        const labelText = getTranslatedLabel('badge_new', 'NEW');
                        const label = isToday ? `<span class="absolute top-4 right-4 px-2 py-1 bg-red-600 text-white text-[9px] font-black rounded-sm animate-pulse z-10">${labelText}</span>` : '';

                        return `
                            <a href="baca.html?id=${item.id}" class="reveal-el neu-card group relative bg-[#ecf0f3] overflow-hidden hover:scale-[1.01] transition-all duration-500 flex flex-col h-full">
                                ${label}
                                <div class="h-44 w-full overflow-hidden bg-gray-200 shrink-0">
                                    <img src="${getVal(item, 'gambar')}" 
                                         alt="${getVal(item, 'judul')}" 
                                         onerror="this.src='https://placehold.co/1200x600/ecf0f3/2563eb?text=No+Image'; this.className='w-full h-full object-cover opacity-30';"
                                         class="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700">
                                </div>
                                <div class="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div class="flex items-center gap-3 text-[10px] text-gray-500 font-semibold mb-2">
                                            <span>${getVal(item, 'tanggal')}</span>
                                            <span>•</span>
                                            <span class="px-2 py-0.5 bg-gray-200/60 rounded text-[9px] font-semibold text-gray-500 uppercase">${getVal(item, 'kategori')}</span>
                                        </div>
                                        <h3 class="text-base font-extrabold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                                            ${getVal(item, 'judul')}
                                        </h3>
                                        <p class="text-gray-600 text-xs line-clamp-2 leading-relaxed mb-4">
                                            ${getVal(item, 'kutipan')}
                                        </p>
                                    </div>
                                    <div class="flex items-center justify-between pt-3 border-t border-gray-200/50 mt-auto">
                                        <span class="text-[10px] text-blue-600 font-black uppercase tracking-wider">Read More &raquo;</span>
                                        <i data-lucide="arrow-right" class="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"></i>
                                    </div>
                                </div>
                            </a>
                        `;
                    }).join('');
                } else {
                    gridSection.classList.add('hidden');
                }

                // Render list (older articles)
                if (olderArticles.length > 0) {
                    listSection.classList.remove('hidden');
                    listContainer.innerHTML = olderArticles.map(item => {
                        return `
                            <a href="baca.html?id=${item.id}" class="reveal-el block p-5 bg-[#ecf0f3] rounded-2xl hover:shadow-[inset_2px_2px_5px_#b8bec9,inset_-2px_-2px_5px_#ffffff] shadow-[3px_3px_6px_#b8bec9,-3px_-3px_6px_#ffffff] hover:text-blue-600 transition-all group">
                                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center gap-3 mb-1.5 flex-wrap">
                                            <span class="text-[9px] font-mono text-gray-400 uppercase tracking-wider font-semibold">${getVal(item, 'tanggal')}</span>
                                            <span class="px-2 py-0.5 bg-gray-200/60 rounded text-[9px] font-semibold text-gray-500 uppercase">${getVal(item, 'kategori')}</span>
                                        </div>
                                        <span class="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">${getVal(item, 'judul')}</span>
                                    </div>
                                    <div class="flex items-center justify-end shrink-0 self-center sm:self-auto">
                                        <div class="flex items-center gap-1.5 text-xs text-blue-600 font-extrabold uppercase tracking-wider opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                                            Baca <i data-lucide="arrow-right" class="w-4 h-4"></i>
                                        </div>
                                        <i data-lucide="chevron-right" class="w-4 h-4 text-gray-400 group-hover:hidden transition-all"></i>
                                    </div>
                                </div>
                            </a>
                        `;
                    }).join('');
                } else {
                    listSection.classList.add('hidden');
                }

                if (window.lucide) lucide.createIcons();
                initScrollAnimations();
            };

            window.setSortOrder = function(order) {
                window.sortOrder = order;

                const btnTerbaru = document.getElementById('btn-sort-terbaru');
                const btn7hari = document.getElementById('btn-sort-7hari');
                const btnTerlama = document.getElementById('btn-sort-terlama');

                const activeClass = ["text-blue-600", "bg-[#ecf0f3]", "shadow-[2px_2px_4px_#b8bec9,-2px_-2px_4px_#ffffff]"];
                const inactiveClass = ["text-gray-500", "bg-transparent", "shadow-none"];

                const updateBtn = (btn, isActive) => {
                    if (!btn) return;
                    if (isActive) {
                        btn.classList.add(...activeClass);
                        btn.classList.remove(...inactiveClass);
                    } else {
                        btn.classList.remove(...activeClass);
                        btn.classList.add(...inactiveClass);
                    }
                };

                updateBtn(btnTerbaru, order === 'terbaru');
                updateBtn(btn7hari, order === '7hari');
                updateBtn(btnTerlama, order === 'terlama');

                window.updateFilteredRender();
            };

            window.updateFilteredRender();
            if (window.setLoadingProgress) window.setLoadingProgress(100);
        }
    } catch (e) {
        if (window.setLoadingProgress) window.setLoadingProgress(100);
        console.error("Content Error:", e);
        const container = document.getElementById('content-area');
        if (container) {
            container.innerHTML = `<div class="text-center py-24 text-red-500 font-bold">Terjadi kesalahan saat memuat artikel: ${e.message}</div>`;
        }
    }
}

function initScrollAnimations() {
    const isBot = /bot|googlebot|crawler|spider|robot|crawling|lighthouse/i.test(navigator.userAgent);
    if (isBot) {
        document.querySelectorAll('.reveal-el').forEach(el => {
            el.classList.remove('opacity-0', 'translate-y-10');
            el.classList.add('opacity-100', 'translate-y-0');
        });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-10');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });

    const winHeight = window.innerHeight || 800;
    document.querySelectorAll('.reveal-el').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < winHeight && rect.bottom > 0) {
            el.classList.add('opacity-100', 'translate-y-0');
            return;
        }
        el.classList.add('opacity-0', 'translate-y-10', 'transition-all', 'duration-700');
        observer.observe(el);
    });

    setTimeout(() => {
        document.querySelectorAll('.reveal-el.opacity-0').forEach(el => {
            el.classList.remove('opacity-0', 'translate-y-10');
            el.classList.add('opacity-100', 'translate-y-0');
        });
    }, 1200);
}

// EXECUTION
document.addEventListener('DOMContentLoaded', async () => {
    if (window.setLoadingProgress) window.setLoadingProgress(5);
    await loadComponent('header-placeholder', 'include/header');
    if (window.setLoadingProgress) window.setLoadingProgress(35);
    await loadComponent('footer-placeholder', 'include/footer');
    if (window.setLoadingProgress) window.setLoadingProgress(55);
    applyTranslations();
    updateLangUI();
    await renderFullContent();
});
