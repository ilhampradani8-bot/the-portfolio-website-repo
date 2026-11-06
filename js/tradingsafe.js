const initPage = async () => {
    if (window.setLoadingProgress) window.setLoadingProgress(5);
    
    // Load components using main.js logic
    if (window.loadComponent) {
        await loadComponent('header-placeholder', 'include/header');
        if (window.setLoadingProgress) window.setLoadingProgress(40);
        await loadComponent('footer-placeholder', 'include/footer');
        if (window.setLoadingProgress) window.setLoadingProgress(70);
    }
    
    if (window.lucide) lucide.createIcons();

    // Dark mode state management
    const body = document.body;
    const darkToggle = document.getElementById('dark-mode-toggle');
    const savedTheme = localStorage.getItem('proposal_theme');

    // Apply saved theme
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

    // Language state management
    const langToggle = document.getElementById('lang-toggle');
    let currentLang = localStorage.getItem('preferred_lang') || 'id';

    function updateLanguageUI(lang) {
        currentLang = lang;
        localStorage.setItem('preferred_lang', lang);
        
        // Show/hide elements based on language toggle
        document.querySelectorAll('.lang-id').forEach(el => {
            if (lang === 'id') el.classList.remove('hidden');
            else el.classList.add('hidden');
        });
        document.querySelectorAll('.lang-en').forEach(el => {
            if (lang === 'en') el.classList.remove('hidden');
            else el.classList.add('hidden');
        });

        // Update toggle button text
        if (langToggle) {
            langToggle.innerHTML = `
                <i data-lucide="languages" class="w-3.5 h-3.5 text-[#0066cc]"></i>
                <span>${lang === 'id' ? 'English' : 'Bahasa'}</span>
            `;
            if (window.lucide) lucide.createIcons();
        }
    }

    // Click handler for language toggle
    if (langToggle) {
        langToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const newLang = currentLang === 'id' ? 'en' : 'id';
            updateLanguageUI(newLang);
        });
    }

    // Init language on load
    updateLanguageUI(currentLang);

    // Scroll Spy logic to highlight active section on the left navigation
    const sections = document.querySelectorAll('.book-section');
    const navLinks = document.querySelectorAll('.nav-card');
    
    window.handleScrollSpy = () => {
        const proposalContent = document.getElementById('content-proposal');
        if (proposalContent && proposalContent.classList.contains('hidden')) return;

        const scrollTop = window.scrollY;
        const viewportCenter = scrollTop + 250; // Offset calculation for scrollspy
        
        let currentIndex = 0;
        let minDiff = Infinity;
        
        sections.forEach((sec, idx) => {
            const rect = sec.getBoundingClientRect();
            const top = rect.top + scrollTop;
            const diff = Math.abs(top - viewportCenter);
            if (diff < minDiff) {
                minDiff = diff;
                currentIndex = idx;
            }
        });
        
        navLinks.forEach((link, idx) => {
            if (idx === currentIndex) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };
    
    window.addEventListener('scroll', window.handleScrollSpy, { passive: true });
    window.addEventListener('resize', window.handleScrollSpy);
    window.handleScrollSpy();

    // Helper to setup sliding ads (Adsterra & Custom Image Banner)
    const setupAdSlider = (containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Apply container styles for centering and fitting the 728x90 ads
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
        container.style.width = '100%';
        container.style.maxWidth = '728px';
        container.style.height = '90px';
        container.style.margin = '0 auto';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';

        // Slide 1: Sandboxed Adsterra Banner
        const slide1 = document.createElement('div');
        slide1.style.position = 'absolute';
        slide1.style.top = '0';
        slide1.style.left = '0';
        slide1.style.width = '100%';
        slide1.style.height = '100%';
        slide1.style.transition = 'opacity 0.8s ease-in-out';
        slide1.style.display = 'flex';
        slide1.style.justifyContent = 'center';
        slide1.style.alignItems = 'center';
        slide1.style.opacity = '1';
        slide1.style.zIndex = '10';

        const iframe = document.createElement('iframe');
        iframe.width = 728;
        iframe.height = 90;
        iframe.frameBorder = 0;
        iframe.scrolling = 'no';
        iframe.sandbox = 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox';
        const closeScript = '</' + 'script>';
        iframe.srcdoc = `
            <body style="margin:0;padding:0;background:transparent;display:flex;justify-content:center;align-items:center;">
                <script type="text/javascript">
                    atOptions = {
                        'key' : '70d4032d0634bd1a04e49f946a536c02',
                        'format' : 'iframe',
                        'height' : 90,
                        'width' : 728,
                        'params' : {}
                    };
                ${closeScript}
                <script type="text/javascript" src="//www.highperformanceformat.com/70d4032d0634bd1a04e49f946a536c02/invoke.js">${closeScript}
            </body>
        `;
        slide1.appendChild(iframe);

        // Slide 2: Easy Company Product Digital Banner
        const slide2 = document.createElement('div');
        slide2.style.position = 'absolute';
        slide2.style.top = '0';
        slide2.style.left = '0';
        slide2.style.width = '100%';
        slide2.style.height = '100%';
        slide2.style.transition = 'opacity 0.8s ease-in-out';
        slide2.style.display = 'flex';
        slide2.style.justifyContent = 'center';
        slide2.style.alignItems = 'center';
        slide2.style.opacity = '0';
        slide2.style.zIndex = '0';

        const link = document.createElement('a');
        link.href = 'easymarket.html';
        link.target = '_blank';
        link.style.display = 'block';
        link.style.width = '728px';
        link.style.height = '90px';

        const img = document.createElement('img');
        img.src = 'documents/easycompany-productdigital/banneriklan.webp';
        img.alt = 'Easy Company Product Digital Banner';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '8px';

        link.appendChild(img);
        slide2.appendChild(link);

        // Add slides to container
        container.innerHTML = '';
        container.appendChild(slide1);
        container.appendChild(slide2);

        // Slide transition logic (Auto-slide every 6 seconds)
        let currentSlide = 0;
        const slides = [slide1, slide2];

        setInterval(() => {
            const nextSlide = (currentSlide + 1) % slides.length;
            
            slides[currentSlide].style.opacity = '0';
            slides[currentSlide].style.zIndex = '0';
            
            slides[nextSlide].style.opacity = '1';
            slides[nextSlide].style.zIndex = '10';
            
            currentSlide = nextSlide;
        }, 6000);
    };

    // Initialize sliders on both ad slots
    setupAdSlider('adsterra-banner-unit');
    setupAdSlider('overview-ad-unit');

    if (window.setLoadingProgress) window.setLoadingProgress(100);
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}
