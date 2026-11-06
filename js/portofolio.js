let allPortfolioData = [];
        let filteredPortfolioData = [];
        let activeCategory = 'Semua';

        document.addEventListener("DOMContentLoaded", async () => {
            if (window.setLoadingProgress) window.setLoadingProgress(5);
            await loadComponent('header-placeholder', 'include/header');
            if (window.setLoadingProgress) window.setLoadingProgress(40);
            await loadComponent('footer-placeholder', 'include/footer');
            if (window.setLoadingProgress) window.setLoadingProgress(70);
            applyTranslations();
            updateLangUI();
            
            // Load and populate portfolio data
            await fetchPortfolioData();

            // Bind Category Scroll Buttons
            const tabsContainer = document.getElementById('category-tabs');
            const scrollLeftBtn = document.getElementById('cat-scroll-left');
            const scrollRightBtn = document.getElementById('cat-scroll-right');
            if (tabsContainer && scrollLeftBtn && scrollRightBtn) {
                scrollLeftBtn.addEventListener('click', () => {
                    tabsContainer.scrollBy({ left: -150, behavior: 'smooth' });
                });
                scrollRightBtn.addEventListener('click', () => {
                    tabsContainer.scrollBy({ left: 150, behavior: 'smooth' });
                });
            }

            if (typeof lucide !== "undefined") {
                lucide.createIcons();
            }
            if (window.setLoadingProgress) window.setLoadingProgress(100);
        });

        async function fetchPortfolioData() {
            try {
                const sheetId = '1eD1ElFcjBpVrS8DGShVlPrmuLI1bZIo4QEcxG1kBCAc';
                const res = await fetch(`https://opensheet.elk.sh/${sheetId}/Portofolio`);
                allPortfolioData = await res.json();
                
                // Initialize filters & lists
                renderCategoryFilters(allPortfolioData);
                filterPortfolio('Semua');
            } catch (e) {
                console.error("Gagal memuat portofolio:", e);
                document.getElementById('project-list').innerHTML = `
                    <div class="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold w-full">
                        Gagal memuat data portofolio. Silakan coba lagi nanti.
                    </div>
                `;
            }
        }

        function renderCategoryFilters(data) {
            const tabsContainer = document.getElementById('category-tabs');
            if (!tabsContainer) return;

            const categories = ['Semua', ...new Set(data.map(item => item.kategori))];
            tabsContainer.innerHTML = categories.map(cat => {
                const count = cat === 'Semua' ? data.length : data.filter(item => item.kategori === cat).length;
                return `
                    <button onclick="filterPortfolio('${cat}')" 
                            class="cat-tab-btn flex-shrink-0 px-4 py-2 text-[9px] font-extrabold uppercase tracking-wider bg-[#ecf0f3] rounded-full transition-all text-gray-600 shadow-[2px_2px_5px_#b8bec9,-2px_-2px_5px_#ffffff] hover:shadow-[inset_1px_1px_3px_#b8bec9,inset_-1px_-1px_3px_#ffffff] flex items-center gap-1.5"
                            id="port-tab-${cat.replace(/\s+/g, '-')}">
                        <span>${cat}</span>
                        <span class="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-mono border border-blue-100">${count}</span>
                    </button>
                `;
            }).join('');
        }

        window.filterPortfolio = function(category) {
            activeCategory = category;

            // Highlight active tab
            document.querySelectorAll('.cat-tab-btn').forEach(btn => {
                btn.classList.remove('shadow-[inset_2px_2px_4px_#b8bec9,inset_-2px_-2px_4px_#ffffff]', 'text-blue-600', 'font-black');
                btn.classList.add('shadow-[2px_2px_5px_#b8bec9,-2px_-2px_5px_#ffffff]', 'text-gray-600');
            });
            const activeBtn = document.getElementById(`port-tab-${category.replace(/\s+/g, '-')}`);
            if (activeBtn) {
                activeBtn.classList.remove('shadow-[2px_2px_5px_#b8bec9,-2px_-2px_5px_#ffffff]', 'text-gray-600');
                activeBtn.classList.add('shadow-[inset_2px_2px_4px_#b8bec9,inset_-2px_-2px_4px_#ffffff]', 'text-blue-600', 'font-black');
            }

            // Filter data
            filteredPortfolioData = category === 'Semua' 
                ? allPortfolioData 
                : allPortfolioData.filter(item => item.kategori === category);

            // Re-render sidebar list
            renderPortfolioSidebar(filteredPortfolioData);
            
            // Re-initialize details with the first item in the filtered list
            initPortfolioViewer();
        }

        function renderPortfolioSidebar(data) {
            const sidebar = document.getElementById('project-list');
            if (!sidebar) return;

            if (data.length === 0) {
                sidebar.innerHTML = `
                    <p class="text-xs font-bold text-gray-400 p-4">Tidak ada proyek.</p>
                `;
                return;
            }

            sidebar.innerHTML = data.map((item, index) => {
                return `
                    <div class="project-item neu-card p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 shrink-0 w-[280px] lg:w-auto" 
                         data-index="${index}">
                        <div class="w-12 h-12 rounded-xl bg-white/70 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-inner border border-white/60">
                            <img src="${item.gambar}" class="object-cover w-full h-full rounded-lg" alt="${item.judul}">
                        </div>
                        <div class="min-w-0 flex-1">
                            <span class="text-[8px] font-black text-blue-600 uppercase tracking-widest block mb-0.5">${item.kategori}</span>
                            <h3 class="text-xs font-bold text-gray-800 truncate">${item.judul}</h3>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function initPortfolioViewer() {
            const items = document.querySelectorAll('.project-item');
            const viewerCat = document.getElementById('viewer-cat');
            const viewerTitle = document.getElementById('viewer-title');
            const viewerDesc = document.getElementById('viewer-desc');
            const viewerTags = document.getElementById('viewer-tags');
            const viewerImgPreview = document.getElementById('viewer-img-preview');
            const viewerLink = document.getElementById('viewer-link');
            const viewerLoading = document.getElementById('viewer-loading');

            if (!items.length || !filteredPortfolioData.length) {
                // Clear viewer contents if no items
                viewerCat.textContent = "Kategori";
                viewerTitle.textContent = "Tidak Ada Proyek";
                viewerDesc.textContent = "Tidak ada proyek yang sesuai dengan kategori ini.";
                viewerTags.innerHTML = "";
                viewerImgPreview.src = "";
                viewerLink.setAttribute('href', '#');
                viewerLoading.classList.add('hidden');
                return;
            }

            let currentProjectIndex = 0;

            function selectProject(index) {
                if (index < 0) index = filteredPortfolioData.length - 1;
                if (index >= filteredPortfolioData.length) index = 0;
                currentProjectIndex = index;

                const item = Array.from(items).find(el => el.getAttribute('data-index') == index);
                const data = filteredPortfolioData[index];
                if (!data) return;

                // 1. Reset active states
                items.forEach(el => {
                    el.classList.remove('neu-inset');
                    el.classList.add('neu-card');
                });

                // 2. Set active state
                if (item) {
                    item.classList.add('neu-inset');
                    item.classList.remove('neu-card');
                    item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }

                // 3. Update Text Content
                viewerCat.textContent = data.kategori;
                viewerTitle.textContent = data.judul;
                viewerDesc.textContent = data.deskripsi;
                viewerLink.setAttribute('href', data.link);

                // 4. Update Tech Tags
                const tags = data.tech.split(',').map(t => t.trim());
                viewerTags.innerHTML = tags.map(tag => `
                    <span class="text-[9px] px-2 py-0.5 bg-[#ecf0f3] text-gray-700 font-semibold rounded-md border border-white/70 shadow-[1px_1px_3px_#b8bec9,-1px_-1px_3px_#ffffff]">
                        ${tag}
                    </span>
                `).join('');

                // 5. Update Preview Image
                viewerLoading.classList.remove('hidden', 'opacity-0');
                viewerLoading.classList.add('opacity-100');

                viewerImgPreview.src = data.gambar;
                viewerImgPreview.onload = () => {
                    viewerLoading.classList.add('opacity-0');
                    setTimeout(() => viewerLoading.classList.add('hidden'), 300);
                };
            }

            // Bind click handlers
            items.forEach(item => {
                const idx = item.getAttribute('data-index');
                item.addEventListener('click', () => selectProject(idx));
            });

            // Bind desktop arrow controls
            const prevBtn = document.getElementById('prev-proj');
            const nextBtn = document.getElementById('next-proj');
            if (prevBtn && nextBtn) {
                // Remove potential duplicate event listeners
                const newPrev = prevBtn.cloneNode(true);
                const newNext = nextBtn.cloneNode(true);
                prevBtn.parentNode.replaceChild(newPrev, prevBtn);
                nextBtn.parentNode.replaceChild(newNext, nextBtn);
                
                newPrev.addEventListener('click', () => selectProject(currentProjectIndex - 1));
                newNext.addEventListener('click', () => selectProject(currentProjectIndex + 1));
            }

            // Auto-select first project in filtered set
            selectProject(0);
        }