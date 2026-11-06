/* ============================================================
   INDEX PAGE LOGIC
   ============================================================ */

let allJournalsData = [];
let isShowAllJournals = false;
let currentJournalCategory = 'Semua';

function renderArticlesHTML(data) {
    const gridContainer = document.getElementById('artikel-container');
    if (!gridContainer || !Array.isArray(data) || data.length === 0) return;

    const getVal = (item, k) => {
        const key = Object.keys(item).find(key => key.trim().toLowerCase() === k);
        return item[key] || '';
    };

    let gridHtml = '';
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    data.slice(0, 6).forEach(item => {
        const itemDate = parseDate(getVal(item, 'tanggal'));
        const isToday = itemDate.getTime() === now.getTime();
        const labelText = getTranslatedLabel('badge_new', 'NEW');
        const label = isToday ? `<span class="absolute top-4 right-4 px-2 py-1 bg-red-600 text-white text-[9px] font-black rounded-sm animate-pulse z-10">${labelText}</span>` : '';

        gridHtml += `
            <a href="baca.html?id=${item.id}" class="swiper-slide neu-card group relative bg-[#ecf0f3] overflow-hidden hover:scale-[1.01] transition-all duration-500 reveal-el flex flex-col sm:flex-row h-auto sm:h-56 w-full">
                ${label}
                <div class="w-full sm:w-2/5 h-36 sm:h-full overflow-hidden bg-gray-200 relative shrink-0">
                    <img src="${getVal(item, 'gambar')}" 
                         alt="${getVal(item, 'judul')}" 
                         onerror="this.src='https://placehold.co/1200x600/ecf0f3/2563eb?text=No+Image'; this.className='w-full h-full object-cover opacity-30';"
                         class="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700">
                </div>
                <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between overflow-hidden">
                    <div>
                        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-gray-500 font-semibold mb-2">
                            <div class="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                                <i data-lucide="user" class="w-3 h-3"></i>
                                <span>Dr. Ilham Pradani C.L.</span>
                            </div>
                            <div class="flex items-center gap-1.5">
                                <i data-lucide="calendar" class="w-3 h-3"></i>
                                <span>${getVal(item, 'tanggal')}</span>
                            </div>
                            <div class="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                                <i data-lucide="tag" class="w-3 h-3"></i>
                                <span>${getVal(item, 'kategori')}</span>
                            </div>
                        </div>
                        <h3 class="text-base sm:text-md font-extrabold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                            ${getVal(item, 'judul')}
                        </h3>
                        <p class="text-gray-600 text-xs line-clamp-2 leading-relaxed mb-4 font-medium">
                            ${getVal(item, 'kutipan')}
                        </p>
                    </div>
                    <div class="flex items-center justify-between pt-3 border-t border-gray-200/50">
                        <button class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-[10px] font-black text-white uppercase tracking-widest rounded-lg shadow-[2px_2px_5px_rgba(59,130,246,0.3)] transition-all">
                            Read More &raquo;
                        </button>
                        <i data-lucide="arrow-right" class="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"></i>
                    </div>
                </div>
            </a>`;
    });
    gridContainer.innerHTML = gridHtml;

    renderJournalCategories();
    renderJournalList();

    if (window.lucide) lucide.createIcons();
    initScrollAnimations();

    if (window.Swiper && document.querySelector('.articles-swiper')) {
        if (window.articlesSwiperInstance) {
            try { window.articlesSwiperInstance.destroy(true, true); } catch (_) {}
        }
        window.articlesSwiperInstance = new Swiper('.articles-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            autoplay: {
                delay: 3500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            breakpoints: {
                768: {
                    slidesPerView: 2,
                    spaceBetween: 30
                }
            },
            pagination: {
                el: '.articles-pagination',
                clickable: true
            }
        });
    }
}

async function loadArtikel() {
    // 1. Instant Cache Load (0ms)
    const cached = localStorage.getItem('ilham_journals_cache');
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
                allJournalsData = parsed;
                renderArticlesHTML(parsed);
            }
        } catch (_) {}
    }

    // 2. Non-blocking Background Fetch
    try {
        const sheetId = '1eD1ElFcjBpVrS8DGShVlPrmuLI1bZIo4QEcxG1kBCAc';
        let res;
        try {
            res = await fetch('/api/sheets?tab=Sheet1');
            if (!res.ok) throw new Error('local api fallback');
        } catch (_) {
            res = await fetch(`https://opensheet.elk.sh/${sheetId}/Sheet1`);
        }
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
            data.sort((a, b) => parseDate(b.tanggal || b.Tanggal) - parseDate(a.tanggal || a.Tanggal));
            allJournalsData = data;
            localStorage.setItem('ilham_journals_cache', JSON.stringify(data));
            renderArticlesHTML(data);
        }
    } catch (e) {
        console.warn("Background Journal Fetch Error:", e);
    }
}

function renderJournalCategories() {
    const container = document.getElementById('jurnal-categories');
    if (!container) return;

    const categories = ['Semua', ...new Set(allJournalsData.map(item => item.kategori || 'Uncategorized'))];
    container.innerHTML = categories.map(cat => `
        <button onclick="filterJournals('${cat}')" 
                class="journal-tab-btn px-3 sm:px-4 py-1.5 text-[9px] font-extrabold uppercase tracking-widest bg-[#ecf0f3] rounded-full transition-all text-gray-600 shadow-[2px_2px_5px_#b8bec9,-2px_-2px_5px_#ffffff] hover:shadow-[inset_1px_1px_3px_#b8bec9,inset_-1px_-1px_3px_#ffffff] flex items-center justify-center text-center"
                id="journal-tab-${cat.replace(/\s+/g, '-')}">
            ${cat}
        </button>
    `).join('');
    
    updateJournalTabVisuals('Semua');
}

window.filterJournals = function(category) {
    currentJournalCategory = category;
    isShowAllJournals = false;
    updateJournalTabVisuals(category);
    renderJournalList();
}

function updateJournalTabVisuals(category) {
    document.querySelectorAll('.journal-tab-btn').forEach(btn => {
        btn.classList.remove('shadow-[inset_2px_2px_4px_#b8bec9,inset_-2px_-2px_4px_#ffffff]', 'text-blue-600', 'font-black');
        btn.classList.add('shadow-[2px_2px_5px_#b8bec9,-2px_-2px_5px_#ffffff]', 'text-gray-600');
    });
    const activeBtn = document.getElementById(`journal-tab-${category.replace(/\s+/g, '-')}`);
    if (activeBtn) {
        activeBtn.classList.remove('shadow-[2px_2px_5px_#b8bec9,-2px_-2px_5px_#ffffff]', 'text-gray-600');
        activeBtn.classList.add('shadow-[inset_2px_2px_4px_#b8bec9,inset_-2px_-2px_4px_#ffffff]', 'text-blue-600', 'font-black');
    }
}

function renderJournalList() {
    const listContainer = document.getElementById('jurnal-list-container');
    const counterVal = document.getElementById('journal-count-val');
    const showMoreBtn = document.getElementById('jurnal-show-more-container');
    if (!listContainer) return;

    const filtered = currentJournalCategory === 'Semua' 
        ? allJournalsData 
        : allJournalsData.filter(item => item.kategori === currentJournalCategory);

    counterVal.innerText = allJournalsData.length;

    const getVal = (item, k) => {
        const key = Object.keys(item).find(key => key.trim().toLowerCase() === k);
        return item[key] || '';
    };

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const isMobile = window.innerWidth < 768;
    const displayData = (isMobile && !isShowAllJournals) ? filtered.slice(0, 5) : filtered;

    if (isMobile && filtered.length > 5) {
        showMoreBtn.style.display = isShowAllJournals ? 'none' : 'flex';
    } else {
        showMoreBtn.style.display = 'none';
    }

    listContainer.innerHTML = displayData.map(item => {
        const itemDate = parseDate(getVal(item, 'tanggal'));
        const isToday = itemDate.getTime() === now.getTime();
        const labelText = getTranslatedLabel('badge_new', 'NEW');
        const label = isToday ? `<span class="px-1.5 py-0.5 bg-red-600 text-white text-[7px] font-black rounded animate-pulse ml-2">${labelText}</span>` : '';

        return `
            <a href="${getVal(item, 'link')}" class="group flex items-center justify-between p-4 border-b border-gray-200/50 hover:bg-white/20 transition-all">
                <div class="flex items-center gap-6 overflow-hidden">
                    <span class="text-[9px] font-mono text-gray-400 group-hover:text-blue-600 transition-colors shrink-0 font-bold">${getVal(item, 'tanggal')}</span>
                    <h4 class="text-[13px] font-bold text-gray-700 group-hover:text-gray-900 transition-colors truncate">${getVal(item, 'judul')}</h4>
                    ${label}
                </div>
                <i data-lucide="arrow-right" class="w-3 h-3 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0"></i>
            </a>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

window.toggleMoreJournals = function() {
    isShowAllJournals = true;
    renderJournalList();
}

window.addEventListener('resize', () => {
    renderJournalList();
});

function initScrollAnimations() {
    // Check if bot / crawler (Googlebot, Lighthouse, Bingbot, headless Chrome)
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
        // Do not hide above-the-fold elements or elements already in viewport on initial load
        const rect = el.getBoundingClientRect();
        if (rect.top < winHeight && rect.bottom > 0) {
            el.classList.add('opacity-100', 'translate-y-0');
            return;
        }
        el.classList.add('opacity-0', 'translate-y-10', 'transition-[opacity,transform]', 'duration-700');
        observer.observe(el);
    });

    // Safety timeout: ensure everything reveals even if IntersectionObserver fails to fire
    setTimeout(() => {
        document.querySelectorAll('.reveal-el.opacity-0').forEach(el => {
            el.classList.remove('opacity-0', 'translate-y-10');
            el.classList.add('opacity-100', 'translate-y-0');
        });
    }, 1200);
}

function initCategoryDetailsTabs(tabsListId, contentPanelId, bgImages) {
    const tabsList = document.getElementById(tabsListId);
    const contentPanel = document.getElementById(contentPanelId);
    if (!tabsList || !contentPanel) return;

    const cards = Array.from(contentPanel.children);
    tabsList.innerHTML = '';

    const bgOverlay = document.getElementById('services-bg-overlay');
    if (bgOverlay && bgImages[0] && tabsListId === 'services-tabs-list') {
        bgOverlay.style.backgroundImage = `url('${bgImages[0]}')`;
    }

    cards.forEach((card, index) => {
        const titleEl = card.querySelector('[data-t^="s_"][data-t$="_t"], [data-t^="p_"][data-t$="_t"], [data-t^="pr_"][data-t$="_t"]');
        const iconEl = card.querySelector('[data-lucide]');
        const iconName = iconEl ? iconEl.getAttribute('data-lucide') : 'layout';
        const titleText = titleEl ? titleEl.textContent : `Item ${index + 1}`;
        const dataT = titleEl ? titleEl.getAttribute('data-t') : '';

        const btn = document.createElement('button');
        btn.type = 'button';
        const tabBtnClass = `${tabsListId}-btn`;
        btn.className = `${tabBtnClass} flex items-center gap-1.5 md:gap-2 p-1.5 md:p-2 text-left rounded-lg md:rounded-xl transition-all w-full min-w-0 bg-[#ecf0f3]
            ${index === 0 ? 'shadow-[inset_2px_2px_4px_#b8bec9,inset_-2px_-2px_4px_#ffffff] text-blue-600 font-bold' : 'shadow-[3px_3px_6px_#b8bec9,-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8bec9,inset_-2px_-2px_4px_#ffffff] text-gray-700'}`;
        btn.innerHTML = `
            <div class="w-5 h-5 md:w-6 md:h-6 rounded-md md:rounded-lg flex items-center justify-center shrink-0 ${index === 0 ? 'bg-blue-600 text-white shadow-sm' : 'bg-[#ecf0f3] shadow-[inset_1px_1px_2px_#b8bec9,inset_-1px_-1px_2px_#ffffff] text-gray-500'}">
                <i data-lucide="${iconName}" class="w-3 h-3 md:w-3.5 md:h-3.5"></i>
            </div>
            <span class="text-[7.5px] md:text-[9.5px] uppercase tracking-wider font-extrabold truncate min-w-0" ${dataT ? `data-t="${dataT.replace('_t', '_tab')}"` : ''}>${titleText}</span>
        `;
        
        btn.addEventListener('click', () => {
            cards.forEach(c => {
                c.classList.add('hidden');
                c.style.backgroundImage = 'none';
            });
            card.classList.remove('hidden');
            card.className = "w-full h-full py-2 sm:py-4 px-1 sm:px-4 flex flex-col justify-center reveal-el transition-all duration-300 relative";

            if (bgOverlay && bgImages[index]) {
                bgOverlay.style.backgroundImage = `url('${bgImages[index]}')`;
            }

            document.querySelectorAll(`.${tabBtnClass}`).forEach((b, idx) => {
                b.className = `${tabBtnClass} flex items-center gap-1.5 md:gap-2 p-1.5 md:p-2 text-left rounded-lg md:rounded-xl transition-all w-full min-w-0 bg-[#ecf0f3]
                    ${idx === index ? 'shadow-[inset_2px_2px_4px_#b8bec9,inset_-2px_-2px_4px_#ffffff] text-blue-600 font-bold' : 'shadow-[3px_3px_6px_#b8bec9,-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8bec9,inset_-2px_-2px_4px_#ffffff] text-gray-700'}`;
                
                const iconContainer = b.querySelector('div');
                if (iconContainer) {
                    iconContainer.className = `w-5 h-5 md:w-6 md:h-6 rounded-md md:rounded-lg flex items-center justify-center shrink-0
                        ${idx === index ? 'bg-blue-600 text-white shadow-sm' : 'bg-[#ecf0f3] shadow-[inset_1px_1px_2px_#b8bec9,inset_-1px_-1px_2px_#ffffff] text-gray-500'}`;
                }
            });
        });

        tabsList.appendChild(btn);

        if (index > 0) {
            card.classList.add('hidden');
        } else {
            card.className = "w-full h-full py-2 sm:py-4 px-1 sm:px-4 flex flex-col justify-center reveal-el transition-all duration-300 relative";
        }
    });

    // Touch Swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    contentPanel.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    contentPanel.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) < 50) return;
        
        let activeIndex = cards.findIndex(c => !c.classList.contains('hidden'));
        if (activeIndex === -1) return;
        
        let newIndex = diff > 0 ? (activeIndex + 1) % cards.length : (activeIndex - 1 + cards.length) % cards.length;
        const buttons = Array.from(tabsList.children);
        if (buttons[newIndex]) {
            buttons[newIndex].click();
        }
    }, { passive: true });
}

function initServicesTabs() {
    const serviceBgImages = [
        "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop"
    ];
    const productBgImages = [
        "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1563013544-824ae1d704d3?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1547658719-da2b81169d7a?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=1200&auto=format&fit=crop"
    ];

    initCategoryDetailsTabs('services-tabs-list', 'services-content-panel', serviceBgImages);
    initCategoryDetailsTabs('products-tabs-list', 'products-content-panel', productBgImages);
    if (window.lucide) lucide.createIcons();
}

window.switchCategoryTab = function(category) {
    const tabBtns = document.querySelectorAll('.category-tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove(
            'shadow-[inset_2px_2px_4px_#b8bec9,inset_-2px_-2px_4px_#ffffff]', 
            'text-blue-600', 
            'font-extrabold'
        );
        btn.classList.add(
            'shadow-[2px_2px_5px_#b8bec9,-2px_-2px_5px_#ffffff]', 
            'text-gray-600'
        );
    });
    const activeBtn = document.getElementById(`category-tab-${category}`);
    if (activeBtn) {
        activeBtn.classList.remove(
            'shadow-[2px_2px_5px_#b8bec9,-2px_-2px_5px_#ffffff]', 
            'text-gray-600'
        );
        activeBtn.classList.add(
            'shadow-[inset_2px_2px_4px_#b8bec9,inset_-2px_-2px_4px_#ffffff]', 
            'text-blue-600', 
            'font-extrabold'
        );
    }

    if (category === 'services') {
        document.getElementById('services-tabs-list').classList.remove('hidden');
        document.getElementById('services-content-panel').classList.remove('hidden');
        document.getElementById('products-tabs-list').classList.add('hidden');
        document.getElementById('products-content-panel').classList.add('hidden');
        
        const activeCard = document.querySelector('#services-content-panel > div:not(.hidden)');
        if (activeCard && activeCard.style.backgroundImage) {
            const bgUrl = activeCard.style.backgroundImage.split('url("')[1]?.split('")')[0];
            const bgOverlay = document.getElementById('services-bg-overlay');
            if (bgOverlay && bgUrl) {
                bgOverlay.style.backgroundImage = `url('${bgUrl}')`;
            }
        }
    } else {
        document.getElementById('services-tabs-list').classList.add('hidden');
        document.getElementById('services-content-panel').classList.add('hidden');
        document.getElementById('products-tabs-list').classList.remove('hidden');
        document.getElementById('products-content-panel').classList.remove('hidden');
        
        const activeCard = document.querySelector('#products-content-panel > div:not(.hidden)');
        if (activeCard && activeCard.style.backgroundImage) {
            const bgUrl = activeCard.style.backgroundImage.split('url("')[1]?.split('")')[0];
            const bgOverlay = document.getElementById('services-bg-overlay');
            if (bgOverlay && bgUrl) {
                bgOverlay.style.backgroundImage = `url('${bgUrl}')`;
            }
        }
    }
}

function initClassicSwipers() {
    if (!window.Swiper) return;

    // 1. Award Slider
    if (document.querySelector('.blog-slider')) {
        new Swiper('.blog-slider', {
            spaceBetween: 0,
            effect: 'fade',
            loop: true,
            autoHeight: true,
            navigation: {
                nextEl: '.award-next',
                prevEl: '.award-prev',
            },
            pagination: {
                el: '.blog-slider__pagination',
                clickable: true,
            }
        });
    }

    // 2. Partnership Slider
    if (document.querySelector('.partnership-swiper')) {
        new Swiper('.partnership-swiper', {
            slidesPerView: 1,
            spaceBetween: 16,
            loop: true,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            navigation: {
                nextEl: '.partnership-next',
                prevEl: '.partnership-prev',
            },
            pagination: {
                el: '.partnership-swiper-pagination',
                clickable: true,
            },
            breakpoints: {
                640: { slidesPerView: 2, spaceBetween: 20 },
                1024: { slidesPerView: 3, spaceBetween: 24 }
            }
        });
    }

    // 3. Google Reviews Slider
    if (document.querySelector('.reviews-swiper')) {
        new Swiper('.reviews-swiper', {
            slidesPerView: 'auto',
            spaceBetween: 12,
            loop: true,
            autoplay: {
                delay: 3500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            navigation: {
                nextEl: '.reviews-next',
                prevEl: '.reviews-prev',
            },
            pagination: {
                el: '.reviews-swiper-pagination',
                clickable: true,
            },
            breakpoints: {
                768: { spaceBetween: 16 },
                1150: { spaceBetween: 20 }
            }
        });
    }
}

function initClassicScrollSpy() {
    const sections = Array.from(document.querySelectorAll('main > section'));
    if (!sections.length) return;

    // Reset transform on all sections for pure Classic Mode (100% natural, buttery smooth scroll)
    sections.forEach(sec => {
        sec.style.transform = '';
        const inner = sec.querySelector('.section-inner');
        if (inner) {
            inner.style.transform = '';
            inner.style.opacity = '';
        }
    });

    const navbar = document.getElementById('top-navbar');
    const mainTrigger = document.querySelector('[data-t="nav_main_menu"]');
    const contactTrigger = document.querySelector('[data-t="nav_contact"]');
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));

    let isScrolledPast60 = false;
    let scrollTicking = false;

    const onScroll = () => {
        const scrollTop = window.scrollY || window.pageYOffset;

        // Navbar glass shadow elevation (handled by #top-navbar-glass-bg)
        if (navbar) {
            const isScrolled = scrollTop >= 60;
            if (isScrolled !== isScrolledPast60) {
                isScrolledPast60 = isScrolled;
            }
        }

        // Section Spy
        const scrollPosition = scrollTop + 160;
        let currentSectionId = '';
        for (let i = 0; i < sections.length; i++) {
            const sec = sections[i];
            const top = sec.offsetTop;
            const height = sec.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
                currentSectionId = sec.getAttribute('id') || '';
                break;
            }
        }

        if (currentSectionId) {
            if (mainTrigger) {
                const isMainActive = ['services', 'partnership', 'teacher', 'portofolio', 'reviews', 'daftar-jurnal', 'awards'].includes(currentSectionId);
                if (isMainActive) {
                    mainTrigger.classList.add('text-blue-600', 'font-black');
                } else {
                    mainTrigger.classList.remove('text-blue-600', 'font-black');
                }
            }
            if (contactTrigger) {
                if (currentSectionId === 'contact') {
                    contactTrigger.classList.add('text-blue-600', 'font-black');
                } else {
                    contactTrigger.classList.remove('text-blue-600', 'font-black');
                }
            }
            navLinks.forEach(link => {
                const secId = link.getAttribute('data-section');
                if (secId === currentSectionId) {
                    link.classList.add('text-blue-600', 'font-extrabold');
                } else {
                    link.classList.remove('text-blue-600', 'font-extrabold');
                }
            });
        }

        scrollTicking = false;
    };

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(onScroll);
            scrollTicking = true;
        }
    }, { passive: true });

    onScroll();
}

let allPortfolioData = [];

async function loadPortofolio() {
    // 1. Instant Cache Load (0ms)
    const cached = localStorage.getItem('ilham_portfolio_cache');
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
                allPortfolioData = parsed;
                renderPortfolioTabs(parsed);
                renderPortfolioGrid(parsed);
            }
        } catch (_) {}
    }

    // 2. Non-blocking Background Fetch
    try {
        const sheetId = '1eD1ElFcjBpVrS8DGShVlPrmuLI1bZIo4QEcxG1kBCAc';
        let res;
        try {
            res = await fetch('/api/sheets?tab=Portofolio');
            if (!res.ok) throw new Error('local api fallback');
        } catch (_) {
            res = await fetch(`https://opensheet.elk.sh/${sheetId}/Portofolio`);
        }
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
            allPortfolioData = data;
            localStorage.setItem('ilham_portfolio_cache', JSON.stringify(data));
            renderPortfolioTabs(data);
            renderPortfolioGrid(data);
        }
    } catch (e) {
        console.warn("Background Portfolio Fetch Error:", e);
    }
}

function renderPortfolioTabs(data) {
    const tabContainer = document.getElementById('portofolio-tabs');
    if (!tabContainer) return;
    const categories = ['Semua', ...new Set(data.map(item => item.kategori))];
    tabContainer.innerHTML = categories.map(cat => {
        const count = cat === 'Semua' ? data.length : data.filter(item => item.kategori === cat).length;
        return `
            <button onclick="filterPortfolio('${cat}')" 
                    class="port-tab-btn px-3 sm:px-6 py-2 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest bg-[#ecf0f3] rounded-full transition-all text-gray-600 shadow-[2px_2px_5px_#b8bec9,-2px_-2px_5px_#ffffff] hover:shadow-[inset_1px_1px_3px_#b8bec9,inset_-1px_-1px_3px_#ffffff] flex items-center justify-center gap-1.5"
                    id="tab-${cat.replace(/\s+/g, '-')}">
                <span>${cat}</span>
                <span class="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-mono border border-blue-100 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05)]">${count}</span>
            </button>
        `;
    }).join('');
    filterPortfolio('Semua');
}

window.filterPortfolio = function (category) {
    document.querySelectorAll('.port-tab-btn').forEach(btn => {
        btn.classList.remove('shadow-[inset_2px_2px_4px_#b8bec9,inset_-2px_-2px_4px_#ffffff]', 'text-blue-600', 'font-black');
        btn.classList.add('shadow-[2px_2px_5px_#b8bec9,-2px_-2px_5px_#ffffff]', 'text-gray-600');
    });
    const activeBtn = document.getElementById(`tab-${category.replace(/\s+/g, '-')}`);
    if (activeBtn) {
        activeBtn.classList.remove('shadow-[2px_2px_5px_#b8bec9,-2px_-2px_5px_#ffffff]', 'text-gray-600');
        activeBtn.classList.add('shadow-[inset_2px_2px_4px_#b8bec9,inset_-2px_-2px_4px_#ffffff]', 'text-blue-600', 'font-black');
    }
    const filtered = category === 'Semua' ? allPortfolioData : allPortfolioData.filter(item => item.kategori === category);
    renderPortfolioGrid(filtered);
};

function init3DCarousel(container) {
    const items = container.querySelectorAll('.portfolio-3d-item');
    if (!items.length) return;
    
    const count = items.length;
    let activeIndex = 0;
    
    const animate = (active) => {
        const screenWidth = window.innerWidth;
        const isMobile = screenWidth < 768;
        const shiftX = isMobile ? (screenWidth * 0.45) : 220;
        const shiftY = isMobile ? 25 : 40;
        const hiddenShiftX = isMobile ? (screenWidth * 0.75) : 340;

        items.forEach((item, index) => {
            const diff = index - active;
            const zIndex = diff === 0 ? count : count - Math.abs(diff);
            
            let translateX = 0;
            let translateY = 0;
            let rotate = 0;
            let scale = 1;
            let opacity = 1;

            if (diff === 0) {
                translateX = 0;
                translateY = 0;
                rotate = 0;
                scale = 1;
                opacity = 1;
            } else if (diff === -1) {
                translateX = -shiftX;
                translateY = -shiftY;
                rotate = -12;
                scale = 0.9;
                opacity = 0.85;
            } else if (diff === 1) {
                translateX = shiftX;
                translateY = shiftY;
                rotate = 12;
                scale = 0.9;
                opacity = 0.85;
            } else if (diff < -1) {
                translateX = -hiddenShiftX;
                translateY = -shiftY * 1.8;
                rotate = -20;
                scale = 0.8;
                opacity = 0;
            } else if (diff > 1) {
                translateX = hiddenShiftX;
                translateY = shiftY * 1.8;
                rotate = 20;
                scale = 0.8;
                opacity = 0;
            }

            item.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${rotate}deg)`;
            item.style.opacity = opacity;
            item.style.zIndex = zIndex;
        });
    };
    
    animate(activeIndex);
    
    // Bind click events on items
    items.forEach((item, i) => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;
            activeIndex = i;
            animate(activeIndex);
        });
    });

    const prevBtn = document.getElementById('portfolio-prev');
    const nextBtn = document.getElementById('portfolio-next');
    if (prevBtn) {
        prevBtn.onclick = (e) => {
            e.preventDefault();
            if (activeIndex > 0) {
                activeIndex--;
            } else {
                activeIndex = count - 1;
            }
            animate(activeIndex);
        };
    }
    if (nextBtn) {
        nextBtn.onclick = (e) => {
            e.preventDefault();
            if (activeIndex < count - 1) {
                activeIndex++;
            } else {
                activeIndex = 0;
            }
            animate(activeIndex);
        };
    }
    
    // Explicitly reset any previous handlers
    container.onwheel = null;
    container.onmousedown = null;
    container.onmousemove = null;
    container.onmouseup = null;
    container.onmouseleave = null;
    let startX = 0;
    let isSwiping = false;

    container.ontouchstart = (e) => {
        startX = e.touches[0].clientX;
        isSwiping = true;
    };

    container.ontouchmove = (e) => {
        if (!isSwiping) return;
        const currentX = e.touches[0].clientX;
        const diffX = currentX - startX;
        if (Math.abs(diffX) > 50) {
            isSwiping = false;
            if (diffX > 0) {
                if (activeIndex > 0) {
                    activeIndex--;
                    animate(activeIndex);
                }
            } else {
                if (activeIndex < count - 1) {
                    activeIndex++;
                    animate(activeIndex);
                }
            }
        }
    };

    container.ontouchend = () => {
        isSwiping = false;
    };

    if (container._cleanupResize) {
        window.removeEventListener('resize', container._cleanupResize);
    }
    const handleResize = () => animate(activeIndex);
    window.addEventListener('resize', handleResize);
    container._cleanupResize = handleResize;
}

function renderPortfolioGrid(data) {
    const container = document.getElementById('portofolio-container');
    if (!container) return;
    
    container.className = "portfolio-3d-container reveal-el transition-all duration-500";
    
    container.innerHTML = data.map((item, index) => {
        const numStr = String(index + 1).padStart(2, '0');
        const techBadges = item.tech.split(',').map(t => `
            <span class="text-[8px] px-2 py-0.5 bg-gray-200/70 text-gray-700 rounded-md font-mono border border-white/60 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05)]">
                ${t.trim()}
            </span>
        `).join('');

        return `
            <div class="portfolio-3d-item group" data-index="${index}">
                <div class="portfolio-3d-box relative flex flex-col p-4 h-full w-full">
                    <!-- Image Card Area -->
                    <div class="w-full h-[120px] sm:h-[150px] md:h-[220px] overflow-hidden rounded-2xl bg-gray-200 relative shadow-[inset_2px_2px_5px_#b8bec9,inset_-2px_-2px_5px_#ffffff] mb-4 flex-shrink-0">
                        <img src="${item.gambar}" 
                             alt="${item.judul}" 
                             class="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 pointer-events-none">
                        
                        <!-- Top Category Badge & Number -->
                        <div class="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none">
                            <span class="text-[8px] font-extrabold text-white bg-black/45 backdrop-blur-md px-2.5 py-1 rounded-full uppercase tracking-widest border border-white/10 shadow-sm">
                                ${item.kategori}
                            </span>
                            <span class="text-xl font-bold font-mono text-white/40">
                                ${numStr}
                            </span>
                        </div>
                    </div>
                    
                    <!-- Content Card Area -->
                    <div class="flex-1 flex flex-col justify-between overflow-hidden">
                        <div>
                            <h3 class="text-sm md:text-base font-extrabold text-gray-900 mb-1 leading-tight group-hover:text-blue-600 transition-colors">
                                ${item.judul}
                            </h3>
                            
                            <!-- Tech badges -->
                            <div class="flex flex-wrap gap-1 mb-2">
                                ${techBadges}
                            </div>
                            
                            <!-- Description -->
                            <p class="text-gray-600 text-[10px] md:text-[11px] leading-relaxed font-semibold line-clamp-3">
                                ${item.deskripsi}
                            </p>
                        </div>
                        
                        <!-- CTA Link -->
                        <div class="mt-3 flex justify-between items-center flex-shrink-0">
                            <a href="${item.link}" target="_blank" class="inline-flex items-center gap-1.5 text-[9px] font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest">
                                <span>View Project</span>
                                <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    if (window.lucide) lucide.createIcons();
    init3DCarousel(container);
}

// Floating Page Navigation Indicator
function initPageNavIndicator() {
    let container = document.getElementById('page-nav-indicator');
    if (!container) {
        container = document.createElement('div');
        container.id = 'page-nav-indicator';
        container.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-1.5 px-2.5 py-1 bg-[#ecf0f3]/50 backdrop-blur-md rounded-full border border-white/30 shadow-[0_4px_12px_rgba(0,0,0,0.05)] items-center justify-center pointer-events-auto transition-opacity duration-300';
        document.body.appendChild(container);
    }

    const sections = Array.from(document.querySelectorAll('main > section.scroll-section'));
    if (sections.length === 0) return;

    let sectionOffsets = [];
    const calculateOffsets = () => {
        const scrollTop = window.scrollY;
        sectionOffsets = sections.map(sec => {
            const rect = sec.getBoundingClientRect();
            return {
                top: rect.top + scrollTop,
                height: rect.height
            };
        });
    };
    calculateOffsets();
    window.addEventListener('resize', () => {
        calculateOffsets();
        updateActiveDot();
    });

    const lang = localStorage.getItem('preferred_lang') || 'id';
    const sectionNames = {
        id: {
            'home': 'Beranda',
            'services': 'Layanan',
            'partnership': 'Mitra',
            'teacher': 'Akademis',
            'portofolio': 'Karya',
            'reviews': 'Ulasan',
            'artikel': 'Artikel',
            'daftar-jurnal': 'Jurnal',
            'awards': 'Sertifikat',
            'contact': 'Kontak'
        },
        en: {
            'home': 'Home',
            'services': 'Services',
            'partnership': 'Partnership',
            'teacher': 'Academic',
            'portofolio': 'Portfolio',
            'reviews': 'Reviews',
            'artikel': 'Articles',
            'daftar-jurnal': 'Journals',
            'awards': 'Certificates',
            'contact': 'Contact'
        }
    };

    container.innerHTML = '';

    sections.forEach((section, index) => {
        const id = section.getAttribute('id');
        const name = (sectionNames[lang] && sectionNames[lang][id]) ? sectionNames[lang][id] : id;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'group relative p-1 focus:outline-none flex items-center justify-center';
        btn.setAttribute('aria-label', name);
        
        const dot = document.createElement('span');
        dot.className = `h-1.5 rounded-full transition-all duration-300 ${index === 0 ? 'w-4 bg-blue-600' : 'w-1.5 bg-gray-400/60 group-hover:bg-gray-600/90'}`;
        btn.appendChild(dot);

        const tooltip = document.createElement('span');
        tooltip.className = 'absolute bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[9px] font-bold rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50';
        tooltip.textContent = name;
        btn.appendChild(tooltip);

        btn.addEventListener('click', () => {
            const targetElement = sections[index];
            if (targetElement) {
                if (window.lenis) {
                    window.lenis.scrollTo(targetElement, { duration: 1.2 });
                } else {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });

        container.appendChild(btn);
    });

    window.updateActiveDotByIndex = (currentIndex) => {
        const buttons = container.querySelectorAll('button');
        buttons.forEach((btn, idx) => {
            const dot = btn.querySelector('span');
            if (dot) {
                if (idx === currentIndex) {
                    dot.className = 'h-1.5 w-4 bg-blue-600 rounded-full transition-all duration-300';
                } else {
                    dot.className = 'h-1.5 w-1.5 bg-gray-400/60 group-hover:bg-gray-600/90 rounded-full transition-all duration-300';
                }
            }
        });
    };

    window.updateActiveDotByIndex(0);
}

// EXECUTION (Mode Classic: Instant First-Paint & Zero-Blocking UI)
document.addEventListener('DOMContentLoaded', () => {
    // 1. Instant UI & Slider Initialization (0ms delay)
    initServicesTabs();
    initClassicSwipers();
    initClassicScrollSpy();
    initScrollAnimations();
    initGravatarHovercard();
    loadWikidataStatus();

    // 2. Load cached articles & portfolio immediately (0ms first-paint, updates in background)
    loadArtikel();
    loadPortofolio();
    loadPenelitian();

    // 3. Components & Translations in parallel
    loadComponent('header-placeholder', 'include/header');
    loadComponent('footer-placeholder', 'include/footer');
    applyTranslations();

    // 4. Journal Scroll Navigation
    const jUpBtn = document.getElementById('journal-scroll-up');
    const jDownBtn = document.getElementById('journal-scroll-down');
    const jContainer = document.getElementById('jurnal-list-container');
    if (jUpBtn && jContainer) {
        jUpBtn.onclick = (e) => {
            e.preventDefault();
            jContainer.scrollBy({ top: -180, behavior: 'smooth' });
        };
    }
    if (jDownBtn && jContainer) {
        jDownBtn.onclick = (e) => {
            e.preventDefault();
            jContainer.scrollBy({ top: 180, behavior: 'smooth' });
        };
    }
});

window.switchPartnerTab = function(tabName) {
    // Hide all grids
    document.querySelectorAll('.partner-grid').forEach(grid => {
        grid.classList.add('hidden');
    });
    // Show selected grid
    const targetGrid = document.getElementById(`partner-grid-${tabName}`);
    if (targetGrid) {
        targetGrid.classList.remove('hidden');
    }
    
    // Update button styles
    const tabBtns = document.querySelectorAll('.partner-tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove(
            'shadow-[inset_2px_2px_4px_#b8bec9,inset_-2px_-2px_4px_#ffffff]', 
            'text-blue-600', 
            'font-black'
        );
        btn.classList.add(
            'shadow-[2px_2px_5px_#b8bec9,-2px_-2px_5px_#ffffff]', 
            'text-gray-600'
        );
    });
    
    const activeBtn = document.getElementById(`partner-tab-${tabName}`);
    if (activeBtn) {
        activeBtn.classList.remove(
            'shadow-[2px_2px_5px_#b8bec9,-2px_-2px_5px_#ffffff]', 
            'text-gray-600'
        );
        activeBtn.classList.add(
            'shadow-[inset_2px_2px_4px_#b8bec9,inset_-2px_-2px_4px_#ffffff]', 
            'text-blue-600', 
            'font-black'
        );
    }
};

async function loadPenelitian() {
    const grid = document.getElementById('penelitian-cards-grid');
    if (!grid) return;

    // 1. Instant Cache Render (0ms)
    const cached = localStorage.getItem('ilham_zenodo_cache');
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
                renderHomePenelitianCards(parsed);
            }
        } catch (_) {}
    }

    // 2. Fetch Fresh Data from Cloudflare Pages API (/api/zenodo)
    try {
        const res = await fetch('/api/zenodo');
        if (res.ok) {
            const json = await res.json();
            if (json && Array.isArray(json.data) && json.data.length > 0) {
                localStorage.setItem('ilham_zenodo_cache', JSON.stringify(json.data));
                renderHomePenelitianCards(json.data);
            }
        }
    } catch (e) {
        console.warn('Home penelitian sync note:', e);
    }
}

function renderHomePenelitianCards(papers) {
    const grid = document.getElementById('penelitian-cards-grid');
    if (!grid || !papers.length) return;

    const topPapers = papers.slice(0, 4);
    grid.innerHTML = topPapers.map((paper, idx) => {
        const doi = paper.doi || '';
        const doiUrl = paper.doi_url || (doi ? `https://doi.org/${doi}` : paper.url);
        const year = paper.year || '2026';
        const title = paper.title || 'Karya Ilmiah';
        const abstract = paper.abstract || 'Kajian ilmiah terverifikasi oleh Dr. Ilham Pradani C.L. Terdaftar resmi di Zenodo (CERN / OpenAIRE) dengan DOI.';
        
        let catId = 'Hukum Siber & AI';
        let catEn = 'Cyber Law & AI';
        let catZh = '网络法与人工智能';
        let catColor = 'text-blue-600 bg-blue-50 border-blue-200/50';
        const lower = title.toLowerCase();
        if (lower.includes('arbitrage') || lower.includes('futures') || lower.includes('token')) {
            catId = 'Fintech & DeFi';
            catEn = 'Fintech & DeFi';
            catZh = '金融科技与DeFi';
            catColor = 'text-emerald-700 bg-emerald-50 border-emerald-200/50';
        } else if (lower.includes('thermal') || lower.includes('twin')) {
            catId = 'Forensik & Digital-Twin';
            catEn = 'Forensics & Digital-Twin';
            catZh = '数字取证与数字孪生';
            catColor = 'text-purple-700 bg-purple-50 border-purple-200/50';
        } else if (lower.includes('logistik') || lower.includes('kontrak')) {
            catId = 'Hukum Kontrak 3T';
            catEn = '3T Contract Law';
            catZh = '3T合同法与物流';
            catColor = 'text-amber-700 bg-amber-50 border-amber-200/50';
        }

        return `
        <div class="border-b border-gray-300/70 pb-4 pt-2 flex flex-col justify-between">
            <div>
                <div class="flex items-center justify-between gap-2 mb-2">
                    <span class="text-[9px] font-black uppercase tracking-wider ${catColor} px-2 py-0.5 rounded border">
                        <span class="lang-id">${catId}</span>
                        <span class="lang-en hidden">${catEn}</span>
                        <span class="lang-zh hidden">${catZh}</span>
                    </span>
                    <span class="text-[10px] font-mono font-bold text-gray-500">${year} • Zenodo DOI</span>
                </div>
                <h3 class="text-sm sm:text-base font-extrabold text-gray-900 mb-1.5 leading-snug line-clamp-2" title="${title}">
                    ${title}
                </h3>
                <p class="text-xs text-gray-600 leading-relaxed font-medium mb-3 line-clamp-3">
                    ${abstract}
                </p>
            </div>
            <div class="pt-2 border-t border-gray-300/40 flex items-center justify-between">
                <span class="text-[10px] font-mono text-gray-500 font-semibold truncate max-w-[55%]">
                    <span class="lang-id">Penulis: Dr. Ilham Pradani C.L.</span>
                    <span class="lang-en hidden">Author: Dr. Ilham Pradani C.L.</span>
                    <span class="lang-zh hidden">作者: Ilham Pradani C.L. 博士</span>
                </span>
                <a href="${doiUrl}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 rounded-lg bg-[#ecf0f3] text-blue-600 hover:text-blue-800 text-xs font-bold shadow-[2px_2px_4px_#b8bec9,-2px_-2px_4px_#ffffff] active:shadow-[inset_1px_1px_2px_#b8bec9] transition-all flex items-center gap-1 shrink-0 cursor-pointer">
                    <span class="lang-id">Lihat di Zenodo</span>
                    <span class="lang-en hidden">View on Zenodo</span>
                    <span class="lang-zh hidden">在 Zenodo 查看</span>
                    <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                </a>
            </div>
        </div>
        `;
    }).join('');

    if (window.applyTranslations) window.applyTranslations();
    if (window.lucide) lucide.createIcons();
}

// 5. Gravatar Hovercard Interactive Drawer Handler
function initGravatarHovercard() {
    document.querySelectorAll('.gravatar-hovercard__inner').forEach((container) => {
        container.querySelectorAll('.gravatar-hovercard__button').forEach((el) => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const selector = '.gravatar-hovercard__drawer[data-drawer-name="' + el.dataset.targetDrawer + '"]';
                const drawer = container.querySelector(selector);
                drawer?.classList.add('gravatar-hovercard__drawer--open');
            });
        });
        container.querySelectorAll('.gravatar-hovercard__drawer-close').forEach((el) => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const selector = '.gravatar-hovercard__drawer[data-drawer-name="' + el.dataset.targetDrawer + '"]';
                const drawer = container.querySelector(selector);
                drawer?.classList.add('gravatar-hovercard__drawer--closing');
                drawer?.classList.remove('gravatar-hovercard__drawer--open');
                setTimeout(() => {
                    drawer?.classList.remove('gravatar-hovercard__drawer--closing');
                }, 300);
            });
        });
        container.querySelectorAll('.gravatar-hovercard__drawer-backdrop').forEach((el) => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const selector = '.gravatar-hovercard__drawer[data-drawer-name="' + el.dataset.targetDrawer + '"]';
                const drawer = container.querySelector(selector);
                drawer?.classList.add('gravatar-hovercard__drawer--closing');
                drawer?.classList.remove('gravatar-hovercard__drawer--open');
                setTimeout(() => {
                    drawer?.classList.remove('gravatar-hovercard__drawer--closing');
                }, 300);
            });
        });
    });
}

// 6. Dynamic Wikidata Entity Description Loader (Item Q142066161)
function loadWikidataStatus() {
    const el = document.getElementById('wikidata-status');
    if (!el) return;

    fetch('https://www.wikidata.org/wiki/Special:EntityData/Q142066161.json')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            const descriptions = data?.entities?.Q142066161?.descriptions;
            if (!descriptions) return;
            const lang = localStorage.getItem('preferred_lang') || 'id';
            const desc = descriptions[lang]?.value || descriptions['id']?.value || descriptions['en']?.value;
            if (desc) {
                el.textContent = desc;
            }
        })
        .catch(err => {
            console.debug('Wikidata live status fallback active:', err);
        });
}
window.loadWikidataStatus = loadWikidataStatus;
