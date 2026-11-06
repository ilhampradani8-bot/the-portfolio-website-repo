async function loadComponent(id, file) {
    const el = document.getElementById(id);
    if (!el) return;
    try {
        const res = await fetch(file + `?t=${Date.now()}`, { cache: 'no-cache' });
        if (res.ok) {
            el.innerHTML = await res.text();
            if (window.lucide) lucide.createIcons();
        }
    } catch (e) { console.error("Component Error:", e); }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadComponent('header-placeholder', 'include/header');
    if (window.lucide) lucide.createIcons();
});

window.switchLang = function (lang) {
    localStorage.setItem('preferred_lang', lang);
    location.reload();
};

window.toggleMobileMenu = function (open) {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        if (open) {
            menu.classList.remove('hidden');
            menu.classList.add('flex');
        } else {
            menu.classList.add('hidden');
            menu.classList.remove('flex');
        }
    }
};

window.toggleAccordion = function(id) {
    const el = document.getElementById(id);
    const arrow = document.getElementById('arrow-' + id);
    if (el && arrow) {
        if (el.classList.contains('hidden')) {
            el.classList.remove('hidden');
            el.classList.add('flex');
            if (arrow) arrow.style.transform = 'rotate(180deg)';
        } else {
            el.classList.add('hidden');
            el.classList.remove('flex');
            if (arrow) arrow.style.transform = 'rotate(0deg)';
        }
    }
};

function toggleSidebar(show) {
    const sidebar = document.getElementById('sidebar-nav');
    const overlay = document.getElementById('sidebar-overlay');
    if (show) {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
    } else {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
}

function toggleSub(id, arrowId) {
    const el = document.getElementById(id);
    const arrow = document.getElementById(arrowId);
    if (el.classList.contains('hidden')) {
        el.classList.remove('hidden');
        el.classList.add('flex');
        arrow.style.transform = 'rotate(180deg)';
    } else {
        el.classList.add('hidden');
        el.classList.remove('flex');
        arrow.style.transform = 'rotate(0deg)';
    }
}

function openPdf(url, btnElement) {
    // Update UI
    document.querySelectorAll('.doc-btn').forEach(btn => {
        btn.classList.remove('active-doc');
    });
    btnElement.classList.add('active-doc');

    // Show PDF viewer
    const viewer = document.getElementById('pdf-viewer');
    const emptyState = document.getElementById('empty-state');
    const fullBtn = document.getElementById('open-full-btn');
    
    // fix double encoding issues by splitting and encoding parts
    const segments = url.split('/');
    const encodedUrl = segments.map(seg => encodeURIComponent(seg)).join('/');

    viewer.src = encodedUrl;
    viewer.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    fullBtn.href = encodedUrl;
    fullBtn.classList.remove('hidden');
    
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
        toggleSidebar(false);
    }
}
