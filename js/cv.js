document.addEventListener("DOMContentLoaded", async () => {
            if (window.setLoadingProgress) window.setLoadingProgress(10);
            await loadComponent('header-placeholder', 'include/header');
            if (window.setLoadingProgress) window.setLoadingProgress(50);
            await loadComponent('footer-placeholder', 'include/footer');
            if (window.setLoadingProgress) window.setLoadingProgress(80);
            applyTranslations();
            updateLangUI();
            if (typeof lucide !== "undefined") {
                lucide.createIcons();
            }
            if (window.setLoadingProgress) window.setLoadingProgress(100);
        });