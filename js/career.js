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
    await loadComponent('footer-placeholder', 'include/footer');
    if (window.lucide) lucide.createIcons();
});

window.toggleSidebar = function (open) {
    const sidebar = document.getElementById('sidebar-nav');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (open) {
        sidebar.classList.remove('-translate-x-full');
        sidebar.classList.add('translate-x-0');
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
    } else {
        sidebar.classList.remove('translate-x-0');
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
};

window.toggleSub = function (id, arrowId) {
    const el = document.getElementById(id);
    const arrow = document.getElementById(arrowId);
    if (el) {
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

// Re-initialize icons just in case
if (window.lucide) {
    lucide.createIcons();
}
