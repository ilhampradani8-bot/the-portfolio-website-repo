window.initPillarsDeck = function() { if (typeof initOptionsAccordion === 'function') initOptionsAccordion(); };
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

function initOptionsAccordion() {
    const options = document.querySelectorAll('.options .option');
    if (!options.length) return;
    options.forEach(opt => {
        const activate = () => {
            if (opt.classList.contains('active')) return;
            options.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
        };
        // Auto open when cursor hovers over card
        opt.addEventListener('mouseenter', activate);
        // Also support click (for mobile/touch devices)
        opt.addEventListener('click', activate);
    });
}

window.nextPillarOption = function(direction) {
    const options = Array.from(document.querySelectorAll('.options .option'));
    if (!options.length) return;
    const activeIdx = options.findIndex(o => o.classList.contains('active'));
    let nextIdx = (activeIdx === -1 ? 0 : activeIdx) + direction;
    if (nextIdx < 0) nextIdx = options.length - 1;
    if (nextIdx >= options.length) nextIdx = 0;
    options.forEach(o => o.classList.remove('active'));
    options[nextIdx].classList.add('active');
    if (window.innerWidth <= 768) {
        options[nextIdx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
};

function initServicesTabs() {
    initDeckScroll('productDeckWrapper');
    initDeckScroll('servicesDeckWrapper');
    if (window.location.hash === '#products') {
        window.switchCategoryTab('products');
    } else if (window.location.hash === '#services-tab') {
        window.switchCategoryTab('services');
    }
    if (window.lucide) lucide.createIcons();
}

window.scrollActiveDeck = function(direction) {
    const s = document.getElementById('services-stack-container');
    const isServices = s && !s.classList.contains('hidden');
    const wrapper = isServices ? document.getElementById('servicesDeckWrapper') : document.getElementById('productDeckWrapper');
    if (!wrapper) return;

    const step = 320 * direction;
    const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;

    if (maxScroll <= 10) {
        const track = wrapper.querySelector('.product-stack-track');
        if (track) {
            track.style.transition = 'transform 0.25s ease';
            track.style.transform = 'translateX(' + (-20 * direction) + 'px)';
            setTimeout(() => {
                track.style.transform = 'none';
            }, 250);
        }
        return;
    }

    if (direction > 0 && wrapper.scrollLeft >= maxScroll - 20) {
        wrapper.scrollTo({ left: 0, behavior: 'smooth' });
        return;
    }
    if (direction < 0 && wrapper.scrollLeft <= 20) {
        wrapper.scrollTo({ left: maxScroll, behavior: 'smooth' });
        return;
    }

    try {
        wrapper.scrollBy({ left: step, behavior: 'smooth' });
    } catch (e) {
        wrapper.scrollLeft += step;
    }
};

window.scrollProductDeck = function(direction) {
    window.scrollActiveDeck(direction);
};

window.scrollServicesDeck = function(direction) {
    window.scrollActiveDeck(direction);
};

function initDeckScroll(wrapperId) {
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    wrapper.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - wrapper.offsetLeft;
        scrollLeft = wrapper.scrollLeft;
    });
    wrapper.addEventListener('mouseleave', () => {
        isDown = false;
    });
    wrapper.addEventListener('mouseup', () => {
        isDown = false;
    });
    wrapper.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - wrapper.offsetLeft;
        const walk = (x - startX) * 1.5;
        wrapper.scrollLeft = scrollLeft - walk;
    });
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

    const servicesStackContainer = document.getElementById('services-stack-container');
    const productsStackContainer = document.getElementById('products-stack-container');

    if (category === 'services') {
        if (servicesStackContainer) servicesStackContainer.classList.remove('hidden');
        if (productsStackContainer) productsStackContainer.classList.add('hidden');
    } else {
        if (servicesStackContainer) servicesStackContainer.classList.add('hidden');
        if (productsStackContainer) productsStackContainer.classList.remove('hidden');
    }
    if (window.lucide) lucide.createIcons();
};

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

const DEFAULT_PORTFOLIO_DATA = [
  {
    "id": "6",
    "kategori": "playstore",
    "judul": "APK BUKU TULIS",
    "deskripsi": "Aplikasi buku tulis digital yang simpel, efisien, dan praktis untuk pencatatan harian.",
    "gambar": "image/artikel-1.jpg",
    "link": "https://play.google.com/store/apps/details?id=com.ilham.bukutulis",
    "tech": "Kotlin, Java, Flutter, Google Ads"
  },
  {
    "id": "7",
    "kategori": "Aplikasi Offline",
    "judul": "Telur Barokah POS System",
    "deskripsi": "Aplikasi manajemen stok & kasir berbasis Web PWA yang cepat dan efisien untuk UMKM.",
    "gambar": "image/Screenshot 2026-04-11 at 19-21-33 Instagram.png",
    "link": "https://www.instagram.com/p/DTnhYtkE3Nm/?img_index=1",
    "tech": "Java, PWA, Web POS"
  },
  {
    "id": "8",
    "kategori": "Aplikasi Offline",
    "judul": "SimpelKas Pro!",
    "deskripsi": "Aplikasi kasir mobile Android profesional dengan nota WA otomatis dan database cloud.",
    "gambar": "image/apksimplecash.png",
    "link": "https://www.instagram.com/p/DTXSywUlJq0/?img_index=3",
    "tech": "Java, Android, Cloud DB"
  },
  {
    "id": "9",
    "kategori": "Certificate",
    "judul": "Sertifikat Keamanan Siber",
    "deskripsi": "5+ Sertifikasi internasional dalam vulnerability assessment dan pertahanan siber.",
    "gambar": "image/Screenshot 2026-04-12 at 15-38-17 Ilham Pradani C.L. (@doc_n_porto_iilham_pradani_c.l) • Instagram photos and videos.png",
    "link": "https://www.instagram.com/p/DTAHv5YAUOJ/?img_index=1",
    "tech": "Cyber Security, Ethical Hacking"
  },
  {
    "id": "10",
    "kategori": "Aplikasi Offline",
    "judul": "Membangun Aplikasi PPOB",
    "deskripsi": "Web-Based Application untuk manajemen transaksi digital dan pembayaran tagihan.",
    "gambar": "image/Screenshot 2026-04-12 at 15-50-17 Ilham Pradani C.L. (@doc_n_porto_iilham_pradani_c.l) • Instagram photos and videos.png",
    "link": "https://www.instagram.com/p/DS2dfn-FKXY/?img_index=2",
    "tech": "HTML5, CSS3, JavaScript, REST API"
  },
  {
    "id": "11",
    "kategori": "Aplikasi Offline",
    "judul": "APK Management Stock & Penjualan",
    "deskripsi": "Aplikasi manajemen persediaan barang dan point of sales multi-cabang terintegrasi.",
    "gambar": "image/Screenshot 2026-04-12 at 15-52-16 Ilham Pradani C.L. (@doc_n_porto_iilham_pradani_c.l) • Instagram photos and videos.png",
    "link": "https://www.instagram.com/p/DS2dfn-FKXY/?img_index=2",
    "tech": "Java, CSS, POS System"
  },
  {
    "id": "13",
    "kategori": "E-commerce/marketplace",
    "judul": "GRAFISA Marketplace",
    "deskripsi": "Platform penghubung antara penjual dan pembeli jasa desain grafis pertama di Indonesia.",
    "gambar": "image/grafisa-ss.png",
    "link": "https://www.grafisa.id/index.html",
    "tech": "JavaScript, React, Node.js, Express"
  },
  {
    "id": "14",
    "kategori": "Bot script - github",
    "judul": "TradingSafe Algo Crypto Trading",
    "deskripsi": "Platform trading algoritmik kripto mandiri dengan backend Rust Axum berkinerja tinggi.",
    "gambar": "https://bpb-eu-w2.wpmucdn.com/blogs.city.ac.uk/dist/1/2063/files/2024/02/markus-spiske-cvBBO4PzWPg-unsplash-f3c2c366d8f32be1-676x441.jpg",
    "link": "https://github.com/ilhampradani8-bot/bottrade",
    "tech": "Rust, TypeScript, PHP, Binance API"
  },
  {
    "id": "15",
    "kategori": "Bot script - github",
    "judul": "Threads App Automation Post",
    "deskripsi": "Sistem otomatisasi posting konten Threads menggunakan Buffer API dan Groq AI.",
    "gambar": "https://bpb-eu-w2.wpmucdn.com/blogs.city.ac.uk/dist/1/2063/files/2024/02/markus-spiske-cvBBO4PzWPg-unsplash-f3c2c366d8f32be1-676x441.jpg",
    "link": "https://github.com/ilhampradani8-bot/botthreads",
    "tech": "Python, Shell, Buffer API, Groq AI"
  },
  {
    "id": "16",
    "kategori": "Bot script - github",
    "judul": "Bot Trading Mandiri Rust V1",
    "deskripsi": "Bot trading mandiri dengan kecepatan eksekusi kode Rust ultra cepat 0,0006 milidetik.",
    "gambar": "https://bpb-eu-w2.wpmucdn.com/blogs.city.ac.uk/dist/1/2063/files/2024/02/markus-spiske-cvBBO4PzWPg-unsplash-f3c2c366d8f32be1-676x441.jpg",
    "link": "https://github.com/ilhampradani8-bot/bot_cuan",
    "tech": "Rust, C, Makefile, Assembly"
  }
];

let allPortfolioData = DEFAULT_PORTFOLIO_DATA;

async function loadPortofolio() {
    // 1. Instant Cache/Default Load (0ms)
    const cached = localStorage.getItem("ilham_portfolio_cache");
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
                allPortfolioData = parsed;
            }
        } catch (_) {}
    }
    renderPortfolioTabs(allPortfolioData);

    // 2. Non-blocking Background Fetch from Cloudflare D1 SQL API (with fallback)
    try {
        let res;
        try {
            res = await fetch("/api/portfolio");
            if (!res.ok) throw new Error("D1 API fallback");
        } catch (_) {
            try {
                res = await fetch("/api/sheets?tab=Portofolio");
                if (!res.ok) throw new Error("local api fallback");
            } catch (_) {
                const sheetId = "1eD1ElFcjBpVrS8DGShVlPrmuLI1bZIo4QEcxG1kBCAc";
                res = await fetch(`https://opensheet.elk.sh/${sheetId}/Portofolio`);
            }
        }
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
            allPortfolioData = data;
            localStorage.setItem("ilham_portfolio_cache", JSON.stringify(data));
            renderPortfolioTabs(data);
            renderPortfolioGrid(data);
        }
    } catch (e) {
        console.warn("Background Portfolio Fetch Error:", e);
    }
}

function renderPortfolioTabs(data) {
    const tabContainer = document.getElementById("portofolio-tabs");
    if (!tabContainer) return;
    const categories = ["Semua", ...new Set(data.map(item => item.kategori))];
    tabContainer.innerHTML = categories.map(cat => {
        const count = cat === "Semua" ? data.length : data.filter(item => item.kategori === cat).length;
        const safeId = "tab-" + cat.replace(/[^a-zA-Z0-9]/g, "-");
        const safeCatArg = cat.replace(/'/g, "\\x27");
        return `
            <button onclick="filterPortfolio('${safeCatArg}')"
                    class="port-tab-btn shrink-0 px-3.5 sm:px-5 py-2 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest bg-[#ecf0f3] rounded-full transition-all text-gray-600 shadow-[2px_2px_5px_#b8bec9,-2px_-2px_5px_#ffffff] hover:shadow-[inset_1px_1px_3px_#b8bec9,inset_-1px_-1px_3px_#ffffff] flex items-center justify-center gap-1.5 whitespace-nowrap"
                    id="${safeId}">
                <span>${cat}</span>
                <span class="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-mono border border-blue-100 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05)]">${count}</span>
            </button>
        `;
    }).join("");
    filterPortfolio("Semua");
}

window.filterPortfolio = function (category) {
    document.querySelectorAll(".port-tab-btn").forEach(btn => {
        btn.classList.remove("shadow-[inset_2px_2px_4px_#b8bec9,inset_-2px_-2px_4px_#ffffff]", "text-blue-600", "font-black");
        btn.classList.add("shadow-[2px_2px_5px_#b8bec9,-2px_-2px_5px_#ffffff]", "text-gray-600");
    });
    const safeId = "tab-" + category.replace(/[^a-zA-Z0-9]/g, "-");
    const activeBtn = document.getElementById(safeId);
    if (activeBtn) {
        activeBtn.classList.remove("shadow-[2px_2px_5px_#b8bec9,-2px_-2px_5px_#ffffff]", "text-gray-600");
        activeBtn.classList.add("shadow-[inset_2px_2px_4px_#b8bec9,inset_-2px_-2px_4px_#ffffff]", "text-blue-600", "font-black");
    }
    const filtered = category === "Semua" ? allPortfolioData : allPortfolioData.filter(item => item.kategori === category);
    renderPortfolioGrid(filtered);
};

let currentPortfolioList = [];
let currentCarouselIndex = 0;
let isCarouselAnimating = false;

function renderPortfolioGrid(data) {
    const track = document.getElementById("portofolio-container");
    const dotsContainer = document.getElementById("portfolio-dots");
    if (!track) return;

    currentPortfolioList = data || [];
    currentCarouselIndex = 0;
    isCarouselAnimating = false;

    if (currentPortfolioList.length === 0) {
        track.innerHTML = `<div class="text-center text-gray-500 py-10 font-bold">Tidak ada karya dalam kategori ini.</div>`;
        if (dotsContainer) dotsContainer.innerHTML = "";
        return;
    }

    const count = currentPortfolioList.length;

    // Render cards with initial 3D stack classes already assigned!
    track.innerHTML = currentPortfolioList.map((item, index) => {
        const safeImg = encodeURI(item.gambar || "").replace(/#/g, "%23");
        let initialClass = "hidden";
        if (count === 1) {
            initialClass = "center";
        } else if (count === 2) {
            initialClass = (index === 0) ? "center" : "down-1";
        } else if (count === 3) {
            if (index === 0) initialClass = "center";
            else if (index === 1) initialClass = "down-1";
            else initialClass = "up-1";
        } else if (count === 4) {
            if (index === 0) initialClass = "center";
            else if (index === 1) initialClass = "down-1";
            else if (index === 2) initialClass = "down-2";
            else initialClass = "up-1";
        } else {
            if (index === 0) initialClass = "center";
            else if (index === 1) initialClass = "down-1";
            else if (index === 2) initialClass = "down-2";
            else if (index === count - 1) initialClass = "up-1";
            else if (index === count - 2) initialClass = "up-2";
            else initialClass = "hidden";
        }

        return `
            <div class="card ${initialClass}" data-index="${index}">
                <img src="${safeImg}" alt="${item.judul}" onerror="this.onerror=null; this.src='image/apksimplecash.png';" loading="lazy">
                <div class="card-badge">${item.kategori}</div>
            </div>
        `;
    }).join("");

    // Render dots
    if (dotsContainer) {
        dotsContainer.innerHTML = currentPortfolioList.map((_, index) => {
            return `<div class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>`;
        }).join("");
    }

    if (window.lucide) lucide.createIcons();
    initSideCarousel();
}

function initSideCarousel() {
    const section = document.getElementById("portofolio");
    if (!section) return;

    const cards = section.querySelectorAll(".carousel-track .card");
    const dots = section.querySelectorAll(".dots .dot");
    const memberName = section.querySelector(".member-name");
    const memberRole = section.querySelector(".member-role");
    const memberDesc = section.querySelector(".member-desc");
    const memberTech = section.querySelector(".member-tech");
    const memberLink = section.querySelector(".member-link");
    const upArrows = section.querySelectorAll(".nav-arrow.up");
    const downArrows = section.querySelectorAll(".nav-arrow.down");
    const container = section.querySelector(".carousel-container");

    if (!cards.length) return;
    isCarouselAnimating = false;

    function updateCarousel(newIndex, isDirect = false) {
        if (isCarouselAnimating && !isDirect) return;
        isCarouselAnimating = true;

        const count = cards.length;
        currentCarouselIndex = (newIndex + count) % count;

        cards.forEach((card, i) => {
            const offset = (i - currentCarouselIndex + count) % count;

            card.classList.remove(
                "center",
                "up-1",
                "up-2",
                "down-1",
                "down-2",
                "hidden"
            );

            if (count === 1) {
                card.classList.add("center");
            } else if (count === 2) {
                if (offset === 0) card.classList.add("center");
                else card.classList.add("down-1");
            } else if (count === 3) {
                if (offset === 0) card.classList.add("center");
                else if (offset === 1) card.classList.add("down-1");
                else card.classList.add("up-1");
            } else if (count === 4) {
                if (offset === 0) card.classList.add("center");
                else if (offset === 1) card.classList.add("down-1");
                else if (offset === 2) card.classList.add("down-2");
                else card.classList.add("up-1");
            } else {
                if (offset === 0) {
                    card.classList.add("center");
                } else if (offset === 1) {
                    card.classList.add("down-1");
                } else if (offset === 2) {
                    card.classList.add("down-2");
                } else if (offset === count - 1) {
                    card.classList.add("up-1");
                } else if (offset === count - 2) {
                    card.classList.add("up-2");
                } else {
                    card.classList.add("hidden");
                }
            }
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === currentCarouselIndex);
        });

        const activeItem = currentPortfolioList[currentCarouselIndex];
        if (activeItem) {
            if (memberName) memberName.style.opacity = "0";
            if (memberRole) memberRole.style.opacity = "0";
            if (memberDesc) memberDesc.style.opacity = "0";
            if (memberTech) memberTech.style.opacity = "0";
            if (memberLink) memberLink.style.opacity = "0";

            setTimeout(() => {
                if (memberName) {
                    memberName.textContent = activeItem.judul;
                    memberName.style.opacity = "1";
                }
                if (memberRole) {
                    memberRole.textContent = activeItem.kategori;
                    memberRole.style.opacity = "1";
                }
                if (memberDesc) {
                    memberDesc.textContent = activeItem.deskripsi || "";
                    memberDesc.style.opacity = "1";
                }
                if (memberTech) {
                    const cleanTech = (activeItem.tech || "")
                        .split(/[\n,]+/)
                        .map(t => t.replace(/[\d.]+%?/g, "").trim())
                        .filter(t => t.length > 0 && t.toLowerCase() !== "other" && !t.includes("/"))
                        .slice(0, 4);
                    memberTech.innerHTML = cleanTech.map(t => `
                        <span class="text-[9px] px-2.5 py-0.5 bg-[#ecf0f3] text-gray-700 rounded-md font-mono border border-white/60 shadow-[inset_1px_1px_2px_#b8bec9,inset_-1px_-1px_2px_#ffffff]">
                            ${t}
                        </span>
                    `).join("");
                    memberTech.style.opacity = "1";
                }
                if (memberLink) {
                    memberLink.href = activeItem.link || "#";
                    memberLink.style.opacity = "1";
                }
            }, 250);
        }

        setTimeout(() => {
            isCarouselAnimating = false;
        }, 700);
    }

    // Bind arrows
    upArrows.forEach(arrow => {
        arrow.onclick = (e) => {
            e.preventDefault();
            updateCarousel(currentCarouselIndex - 1);
        };
    });

    downArrows.forEach(arrow => {
        arrow.onclick = (e) => {
            e.preventDefault();
            updateCarousel(currentCarouselIndex + 1);
        };
    });

    // Bind dots
    dots.forEach((dot, i) => {
        dot.onclick = (e) => {
            e.preventDefault();
            updateCarousel(i);
        };
    });

    // Bind cards
    cards.forEach((card, i) => {
        card.onclick = (e) => {
            if (e.target.closest("a")) return;
            if (i === currentCarouselIndex) {
                const item = currentPortfolioList[i];
                if (item && item.link && item.link !== "#") {
                    window.open(item.link, "_blank");
                }
            } else {
                updateCarousel(i);
            }
        };
    });

    // Touch Swipe handling on carousel
    let touchStartY = 0;
    let touchEndY = 0;

    if (container) {
        container.ontouchstart = (e) => {
            touchStartY = e.changedTouches[0].screenY;
        };
        container.ontouchend = (e) => {
            touchEndY = e.changedTouches[0].screenY;
            const diff = touchStartY - touchEndY;
            if (Math.abs(diff) > 40) {
                if (diff > 0) {
                    updateCarousel(currentCarouselIndex + 1);
                } else {
                    updateCarousel(currentCarouselIndex - 1);
                }
            }
        };

        // Mouse wheel over carousel container
        let wheelTimeout = null;
        container.onwheel = (e) => {
            if (Math.abs(e.deltaY) > 20) {
                e.preventDefault();
                if (!wheelTimeout && !isCarouselAnimating) {
                    if (e.deltaY > 0) {
                        updateCarousel(currentCarouselIndex + 1);
                    } else {
                        updateCarousel(currentCarouselIndex - 1);
                    }
                    wheelTimeout = setTimeout(() => {
                        wheelTimeout = null;
                    }, 500);
                }
            }
        };
    }

    // Direct initial update without lock
    updateCarousel(0, true);
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

    const sections = Array.from(document.querySelectorAll('main section.scroll-section'));
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
            'cooperation': 'Mitra',
            'services': 'Layanan',
            'partnership': 'Pilar',
            'teacher': 'Akademis',
            'portofolio': 'Karya',
            'reviews': 'Ulasan',
            'artikel': 'Artikel',
            'daftar-jurnal': 'Jurnal',
            'awards': 'Sertifikat',
            'penelitian': 'Riset',
            'contact': 'Kontak'
        },
        en: {
            'home': 'Home',
            'cooperation': 'Partners',
            'services': 'Services',
            'partnership': 'Pillars',
            'teacher': 'Academic',
            'portofolio': 'Portfolio',
            'reviews': 'Reviews',
            'artikel': 'Articles',
            'daftar-jurnal': 'Journals',
            'awards': 'Certificates',
            'penelitian': 'Research',
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

// ==========================================
// PENELITIAN & PUBLIKASI ILMIAH (ZENODO REAL-TIME SYNC)
// ==========================================
async function loadPenelitian() {
    const container = document.getElementById('penelitian-cards-grid');
    if (!container) return;

    // 1. Instant Cache Render (0ms First-Paint)
    const cached = localStorage.getItem('ilham_zenodo_cache');
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
                renderHomePenelitian(parsed);
                updateZenodoBadge(parsed.length);
            }
        } catch (_) {}
    }

    // 2. Non-blocking Realtime Fetch from Cloudflare Pages API (/api/zenodo) with Fallbacks
    try {
        let res;
        try {
            res = await fetch('/api/zenodo');
            if (!res.ok) throw new Error('local api fallback');
        } catch (_) {
            res = await fetch('https://zenodo.org/api/records?q=metadata.creators.person_or_org.name:%22Pradani,%20Ilham%22&sort=-mostrecent&size=50');
        }

        if (res.ok) {
            const json = await res.json();
            const papers = Array.isArray(json.data) ? json.data : (json.hits?.hits?.map(h => ({
                id: String(h.id),
                title: h.metadata?.title || 'Karya Ilmiah',
                doi: h.doi || '',
                doi_url: h.doi_url || `https://zenodo.org/records/${h.id}`,
                url: h.links?.html || `https://zenodo.org/records/${h.id}`,
                publication_date: h.metadata?.publication_date || h.created?.split('T')[0] || '2026',
                year: h.metadata?.publication_date ? h.metadata.publication_date.split('-')[0] : '2026',
                authors: h.metadata?.creators?.map(c => c.name) || ['Dr. Ilham Pradani C.L.'],
                abstract: h.metadata?.description ? h.metadata.description.replace(/<[^>]+>/g, '').trim() : '',
                keywords: h.metadata?.keywords || []
            })) || []);

            if (Array.isArray(papers) && papers.length > 0) {
                localStorage.setItem('ilham_zenodo_cache', JSON.stringify(papers));
                renderHomePenelitian(papers);
                updateZenodoBadge(papers.length);
            }
        }
    } catch (e) {
        console.warn('Real-time Zenodo sync notice:', e);
    }
}

function updateZenodoBadge(totalCount) {
    const badge = document.getElementById('zenodo-live-badge');
    if (badge && totalCount) {
        badge.textContent = `${totalCount} Riset Zenodo Live`;
    }
}

function renderHomePenelitian(papers) {
    const container = document.getElementById('penelitian-cards-grid');
    if (!container || !papers || !papers.length) return;

    // Show top 6 most recent published papers on the homepage
    const displayPapers = papers.slice(0, 6);

    const lang = localStorage.getItem('preferred_lang') || 'id';
    const isZh = lang === 'zh';
    const isEn = lang !== 'id' && !isZh;

    container.innerHTML = displayPapers.map((paper, idx) => {
        const title = paper.title || 'Publikasi Ilmiah';
        const doi = paper.doi || '';
        const doiUrl = paper.doi_url || (doi ? `https://doi.org/${doi}` : paper.url || `https://zenodo.org/records/${paper.id}`);
        const year = paper.year || '2026';
        const date = paper.publication_date || year;
        const authors = Array.isArray(paper.authors) ? paper.authors.join(', ') : (paper.authors || 'Dr. Ilham Pradani C.L.');
        const rawAbstract = paper.abstract || 'Kajian ilmiah terverifikasi oleh Dr. Ilham Pradani C.L. Terdaftar resmi di repositori terbuka Zenodo (CERN / OpenAIRE) dengan DOI terverifikasi.';
        const cleanAbstract = rawAbstract.replace(/<[^>]+>/g, '').trim();

        // Categorize paper
        let catLabel = isZh ? '网络法与AI' : (isEn ? 'Cyber Law & AI' : 'Hukum Siber & AI');
        let catColor = 'text-blue-600 bg-blue-50 border-blue-200/50';
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('arbitrage') || lowerTitle.includes('futures') || lowerTitle.includes('token') || lowerTitle.includes('credit') || lowerTitle.includes('financing')) {
            catLabel = isZh ? '金融科技与DeFi' : (isEn ? 'Fintech & DeFi' : 'Fintech & DeFi');
            catColor = 'text-emerald-700 bg-emerald-50 border-emerald-200/50';
        } else if (lowerTitle.includes('forensik') || lowerTitle.includes('thermal') || lowerTitle.includes('twin') || lowerTitle.includes('stochastic') || lowerTitle.includes('iot')) {
            catLabel = isZh ? '数字取证与安全' : (isEn ? 'Digital Forensics' : 'Digital Twin & Forensik');
            catColor = 'text-purple-700 bg-purple-50 border-purple-200/50';
        } else if (lowerTitle.includes('logistik') || lowerTitle.includes('kontrak') || lowerTitle.includes('krui') || lowerTitle.includes('enterprise')) {
            catLabel = isZh ? '企业架构战略' : (isEn ? 'Enterprise Strategy' : 'Hukum Kontrak & 3T');
            catColor = 'text-amber-700 bg-amber-50 border-amber-200/50';
        }

        const lblDetail = isZh ? '论文详情' : (isEn ? 'Paper Details' : 'Detail Paper');
        const lblZenodo = isZh ? 'Zenodo DOI' : 'Zenodo DOI';

        return `
            <div class="border-b border-gray-300/70 pb-4 pt-2 flex flex-col justify-between group transition-colors">
                <div>
                    <div class="flex items-center justify-between gap-2 mb-2">
                        <div class="flex items-center gap-1.5 flex-wrap">
                            <span class="text-[9px] font-black uppercase tracking-wider ${catColor} px-2 py-0.5 rounded border">
                                ${catLabel}
                            </span>
                            ${doi ? `<span class="text-[9px] font-mono font-bold text-gray-500 bg-white/70 px-1.5 py-0.5 rounded border border-gray-200/70 hidden sm:inline-block">DOI: ${doi}</span>` : ''}
                        </div>
                        <span class="text-[10px] font-mono font-bold text-gray-500 flex items-center gap-1 shrink-0">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>${date}</span>
                        </span>
                    </div>

                    <h3 class="text-sm sm:text-base font-extrabold text-gray-900 mb-1.5 leading-snug group-hover:text-blue-600 transition-colors">
                        <a href="${doiUrl}" target="_blank" rel="noopener noreferrer" class="hover:underline">
                            ${title}
                        </a>
                    </h3>

                    <p class="text-xs text-gray-600 leading-relaxed font-medium mb-3 line-clamp-3">
                        ${cleanAbstract}
                    </p>
                </div>

                <div class="pt-2 border-t border-gray-300/40 flex items-center justify-between gap-2">
                    <span class="text-[10px] font-mono text-gray-500 font-semibold truncate max-w-[180px] sm:max-w-xs">
                        <i data-lucide="user" class="w-3 h-3 inline-block text-blue-600 mr-0.5"></i>
                        <span>${authors}</span>
                    </span>

                    <div class="flex items-center gap-1.5 shrink-0">
                        <a href="${doiUrl}" target="_blank" rel="noopener noreferrer"
                            class="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold border border-emerald-200/60 shadow-sm transition-all flex items-center gap-1"
                            title="Buka di Zenodo (CERN / OpenAIRE)">
                            <img src="image/zenodo.svg" alt="Zenodo" class="w-3.5 h-3.5 object-contain">
                            <span>${lblZenodo}</span>
                            <i data-lucide="external-link" class="w-3 h-3"></i>
                        </a>

                        <a href="penelitian.html#paper-zenodo-${idx + 1}"
                            class="px-2.5 py-1 rounded-lg bg-[#ecf0f3] text-blue-600 hover:text-blue-800 text-xs font-bold shadow-[2px_2px_4px_#b8bec9,-2px_-2px_4px_#ffffff] active:shadow-[inset_1px_1px_2px_#b8bec9] transition-all flex items-center gap-1 cursor-pointer">
                            <span>${lblDetail}</span>
                            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
    if (window.applyTranslations) window.applyTranslations();
}

// EXECUTION (Mode Classic: Instant First-Paint & Zero-Blocking UI)
// Safe Global Execution (Mode Classic: Instant First-Paint & Zero-Blocking UI)
function runInitApp() {
    // 1. Immediately load components FIRST so the page shell is never missing header or footer!
    try { loadComponent('header-placeholder', 'include/header'); } catch (e) { console.warn("Header load error:", e); }
    try { loadComponent('footer-placeholder', 'include/footer'); } catch (e) { console.warn("Footer load error:", e); }
    try { applyTranslations(); } catch (e) { console.warn("Translation error:", e); }

    // 2. UI Interactive Components (isolated in try-catch so one never breaks another)
    try { initServicesTabs(); } catch (e) { console.warn(e); }
    try { initOptionsAccordion(); } catch (e) { console.warn(e); }
    try { initClassicSwipers(); } catch (e) { console.warn(e); }
    try { initClassicScrollSpy(); } catch (e) { console.warn(e); }
    try { initScrollAnimations(); } catch (e) { console.warn(e); }

    // 3. Data Loaders
    try { loadArtikel(); } catch (e) { console.warn(e); }
    try { loadPortofolio(); } catch (e) { console.warn(e); }
    try { loadPenelitian(); } catch (e) { console.warn("Penelitian load error:", e); }

    // 4. Journal Scroll Navigation
    try {
        const jUpBtn = document.getElementById('journal-scroll-up');
        const jDownBtn = document.getElementById('journal-scroll-down');
        const jContainer = document.getElementById('jurnal-list-container');
        if (jUpBtn && jContainer) {
            jUpBtn.onclick = (e) => { e.preventDefault(); jContainer.scrollBy({ top: -180, behavior: 'smooth' }); };
        }
        if (jDownBtn && jContainer) {
            jDownBtn.onclick = (e) => { e.preventDefault(); jContainer.scrollBy({ top: 180, behavior: 'smooth' }); };
        }
    } catch (e) { console.warn(e); }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runInitApp);
} else {
    runInitApp();
}
