document.addEventListener("DOMContentLoaded", async () => {
            if (window.setLoadingProgress) window.setLoadingProgress(5);
            await loadComponent('header-placeholder', 'include/header');
            if (window.setLoadingProgress) window.setLoadingProgress(40);
            await loadComponent('footer-placeholder', 'include/footer');
            if (window.setLoadingProgress) window.setLoadingProgress(70);
            applyTranslations();
            updateLangUI();
            if (typeof lucide !== "undefined") {
                lucide.createIcons();
            }
            
            // Set up interactive certificate viewer
            initCertViewer();
            
            if (window.setLoadingProgress) window.setLoadingProgress(100);
        });

        function initCertViewer() {
            const certItems = document.querySelectorAll('.cert-item');
            const viewerCat = document.getElementById('viewer-cat');
            const viewerTitle = document.getElementById('viewer-title');
            const viewerDesc = document.getElementById('viewer-desc');
            const viewerFrame = document.getElementById('viewer-frame');
            const viewerFallback = document.getElementById('viewer-fallback');
            const viewerFallbackLogo = document.getElementById('viewer-fallback-logo');
            const viewerFallbackBtn = document.getElementById('viewer-fallback-btn');
            const viewerLink = document.getElementById('viewer-link');
            const viewerLoading = document.getElementById('viewer-loading');

            if (!certItems.length) return;

            let currentCertIndex = 0;

            function selectCert(index) {
                if (index < 0) index = certItems.length - 1;
                if (index >= certItems.length) index = 0;
                currentCertIndex = index;
                
                const item = certItems[index];
                if (!item) return;

                // 1. Reset all active card classes
                certItems.forEach(el => {
                    el.classList.remove('neu-inset');
                    el.classList.add('neu-card');
                });
                
                // 2. Select current card
                item.classList.add('neu-inset');
                item.classList.remove('neu-card');

                // Scroll the selected item into view inside the list
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

                // 3. Retrieve attributes
                const link = item.getAttribute('data-link');
                const logo = item.getAttribute('data-logo');
                const catKey = item.getAttribute('data-cat-key');
                const titleKey = item.getAttribute('data-title-key');
                const descKey = item.getAttribute('data-desc-key');
                const embed = item.getAttribute('data-embed') === 'true';
                const preview = item.getAttribute('data-preview');

                // 4. Update texts & translations
                viewerCat.setAttribute('data-t', catKey);
                viewerTitle.setAttribute('data-t', titleKey);
                viewerDesc.setAttribute('data-t', descKey);
                applyTranslations();

                // 5. Update URLs
                viewerLink.setAttribute('href', link);
                viewerFallbackBtn.setAttribute('href', link);

                // 6. Handle loading/embedding behavior
                viewerLoading.classList.remove('hidden', 'opacity-0');
                viewerLoading.classList.add('opacity-100');

                // Clear previous view
                viewerFrame.classList.add('hidden');
                viewerImgContainer.classList.add('hidden');
                viewerFallback.classList.add('hidden');

                if (preview) {
                    // Show local image preview (like EF SET image)
                    viewerImgPreview.src = preview;
                    viewerImgContainer.classList.remove('hidden');
                    
                    viewerLoading.classList.add('opacity-0');
                    setTimeout(() => viewerLoading.classList.add('hidden'), 300);
                } else if (embed) {
                    // Embed PDF or link in iframe
                    viewerFrame.src = link;
                    viewerFrame.classList.remove('hidden');
                } else {
                    // Show fallback
                    viewerFallbackLogo.src = logo;
                    viewerFallback.classList.remove('hidden');
                    
                    viewerLoading.classList.add('opacity-0');
                    setTimeout(() => viewerLoading.classList.add('hidden'), 300);
                }
            }

            // Bind click handlers
            certItems.forEach((item, index) => {
                item.addEventListener('click', () => selectCert(index));
            });

            // Bind desktop arrow controls
            const prevBtn = document.getElementById('prev-cert');
            const nextBtn = document.getElementById('next-cert');
            if (prevBtn && nextBtn) {
                prevBtn.addEventListener('click', () => selectCert(currentCertIndex - 1));
                nextBtn.addEventListener('click', () => selectCert(currentCertIndex + 1));
            }

            // Auto-select the first certificate
            selectCert(0);
        }