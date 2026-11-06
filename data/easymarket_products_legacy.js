        // Product Database
        const products = [
            // Streaming
            { name: "Alight Motion", variant: "1 Tahun - 1 Pcs", price: 22500, category: "Streaming", brand: "alight" },
            { name: "Apple Music", variant: "Head 1 Bulan", price: 21300, category: "Streaming", brand: "apple" },
            { name: "BStation", variant: "1 Bulan Sharing", price: 12500, category: "Streaming", brand: "bstation" },
            { name: "Disney", variant: "1 Bulan Sharing 6 User", price: 43800, category: "Streaming", brand: "disney" },
            { name: "HBO Max Premium", variant: "Sharing Ultimate", price: 32300, category: "Streaming", brand: "hbo" },
            { name: "iQIYI", variant: "1 Bulan Premium", price: 16300, category: "Streaming", brand: "iqiyi" },
            { name: "iQIYI", variant: "3 Bulan Premium", price: 18800, category: "Streaming", brand: "iqiyi" },
            { name: "iQIYI", variant: "12 Bulan Premium", price: 25000, category: "Streaming", brand: "iqiyi" },
            { name: "Netflix Premium", variant: "1 User 1 Profil", price: 51300, category: "Streaming", brand: "netflix" },
            { name: "Netflix Premium", variant: "1 Day", price: 7500, category: "Streaming", brand: "netflix" },
            { name: "Netflix Premium", variant: "3 Day", price: 10000, category: "Streaming", brand: "netflix" },
            { name: "Netflix Premium", variant: "7 Day", price: 17500, category: "Streaming", brand: "netflix" },
            { name: "Netflix Premium", variant: "2 User 1 Profil", price: 27500, category: "Streaming", brand: "netflix" },
            { name: "Prime Video", variant: "Private 1 Bulan", price: 10000, category: "Streaming", brand: "prime" },
            { name: "Spotify", variant: "Individual 3 Bulan", price: 23200, category: "Streaming", brand: "spotify" },
            { name: "Vidplat", variant: "All Device 1Pcs", price: 50000, category: "Streaming", brand: "vidplat" },
            { name: "Vidplat", variant: "Mobile Only 1Pcs", price: 40000, category: "Streaming", brand: "vidplat" },
            { name: "Viu Premium", variant: "1 Tahun", price: 12500, category: "Streaming", brand: "viu" },
            { name: "Viu Premium", variant: "Lifetime", price: 18800, category: "Streaming", brand: "viu" },
            { name: "WeTV", variant: "Private", price: 41300, category: "Streaming", brand: "wetv" },
            { name: "WeTV", variant: "WeTV Sharing 1B", price: 15000, category: "Streaming", brand: "wetv" },
            { name: "YouTube", variant: "3 Bulan", price: 43800, category: "Streaming", brand: "youtube" },
            { name: "YouTube", variant: "Famhead", price: 25000, category: "Streaming", brand: "youtube" },
            { name: "YouTube", variant: "Individual 1 Bulan", price: 27500, category: "Streaming", brand: "youtube" },

            // Creative
            { name: "Canva", variant: "1 Bulan Pro (Invite)", price: 6300, category: "Creative", brand: "canva" },
            { name: "Canva", variant: "Lifetime Garansi 1 Tahun", price: 27500, category: "Creative", brand: "canva" },
            { name: "Canva", variant: "Head 1 Bulan", price: 10000, category: "Creative", brand: "canva" },
            { name: "Canva", variant: "Lifetime Garansi 6 Bulan", price: 25000, category: "Creative", brand: "canva" },
            { name: "Canva", variant: "6 Bulan Edu Garansi 3 Bulan", price: 10000, category: "Creative", brand: "canva" },
            { name: "Canva", variant: "1 Tahun Edu Garansi 6 Bulan", price: 18800, category: "Creative", brand: "canva" },
            { name: "Canva", variant: "Head Lifetime", price: 37500, category: "Creative", brand: "canva" },
            { name: "CapCut Private", variant: "30 Days", price: 52500, category: "Creative", brand: "capcut" },
            { name: "Picsart", variant: "Famhead 1 Bulan", price: 15000, category: "Creative", brand: "picsart" },

            // Productivity
            { name: "ChatGPT", variant: "Head 1 Bulan", price: 26300, category: "Productivity", brand: "chatgpt" },
            { name: "ChatGPT", variant: "Private Plus 1B", price: 50000, category: "Productivity", brand: "chatgpt" },
            { name: "Kiro AI", variant: "Pro+ - 2000 Credits", price: 37500, category: "Productivity", brand: "kiro" },
            { name: "Scribd", variant: "1 Bulan", price: 18800, category: "Productivity", brand: "scribd" },
            { name: "Zoom Pro", variant: "Zoom 14D", price: 10000, category: "Productivity", brand: "zoom" },

            // OS & Office
            { name: "Lisensi Windows", variant: "Office 2016 Professional Plus", price: 37500, category: "OS & Office", brand: "windows" },
            { name: "Lisensi Windows", variant: "Office 2019 Professional Plus", price: 37500, category: "OS & Office", brand: "windows" },
            { name: "Lisensi Windows", variant: "Office 2021 Professional Plus", price: 37500, category: "OS & Office", brand: "windows" },
            { name: "Lisensi Windows", variant: "Office 365 Random", price: 31300, category: "OS & Office", brand: "windows" },
            { name: "Lisensi Windows", variant: "Windows 10 Pro", price: 37500, category: "OS & Office", brand: "windows" },
            { name: "Lisensi Windows", variant: "Windows 11 Pro", price: 37500, category: "OS & Office", brand: "windows" },

            // VPN
            { name: "VPN", variant: "Express 1 Bulan", price: 18800, category: "VPN & Security", brand: "vpn" },
            { name: "VPN", variant: "HMA 1 Bulan", price: 18800, category: "VPN & Security", brand: "vpn" },
            { name: "VPN", variant: "Surfshark 3B", price: 50000, category: "VPN & Security", brand: "vpn" },

            // Pulsa & Paket Data
            { name: "Telepon Unlimited Sesama 14Hr", variant: "Axis Pulsa Reguler (Gangguan)", price: 4500, category: "Pulsa & Paket Data", subcategory: "AXIS", brand: "axis" },
            { name: "MASA AKTIF AXIS 30HARI", variant: "Axis Pulsa Reguler (Gangguan)", price: 7200, category: "Pulsa & Paket Data", subcategory: "AXIS", brand: "axis" },
            { name: "AXIS 5K", variant: "Axis Pulsa Reguler (Tersedia)", price: 7500, category: "Pulsa & Paket Data", subcategory: "AXIS", brand: "axis" },
            { name: "Telepon 30 Menit All Operator 7 Hari", variant: "Axis Pulsa Reguler (Tersedia)", price: 11400, category: "Pulsa & Paket Data", subcategory: "AXIS", brand: "axis" },
            { name: "AXIS 10K", variant: "Axis Pulsa Reguler (Tersedia)", price: 13800, category: "Pulsa & Paket Data", subcategory: "AXIS", brand: "axis" },
            { name: "AXIS 15K", variant: "Axis Pulsa Reguler (Tersedia)", price: 19000, category: "Pulsa & Paket Data", subcategory: "AXIS", brand: "axis" },
            { name: "AXIS 25K", variant: "Axis Pulsa Reguler (Tersedia)", price: 31500, category: "Pulsa & Paket Data", subcategory: "AXIS", brand: "axis" },
            { name: "Telepon 100 Menit All Operator 30 Hari", variant: "Axis Pulsa Reguler (Tersedia)", price: 31700, category: "Pulsa & Paket Data", subcategory: "AXIS", brand: "axis" },
            { name: "AXIS 30K", variant: "Axis Pulsa Reguler (Tersedia)", price: 37800, category: "Pulsa & Paket Data", subcategory: "AXIS", brand: "axis" },
            { name: "AXIS 50K", variant: "Axis Pulsa Reguler (Tersedia)", price: 62800, category: "Pulsa & Paket Data", subcategory: "AXIS", brand: "axis" },
            { name: "AXIS 100K", variant: "Axis Pulsa Reguler (Tersedia)", price: 125300, category: "Pulsa & Paket Data", subcategory: "AXIS", brand: "axis" },
            { name: "AXIS 150K", variant: "Axis Pulsa Reguler (Tersedia)", price: 188100, category: "Pulsa & Paket Data", subcategory: "AXIS", brand: "axis" },
            { name: "AXIS 200K", variant: "Axis Pulsa Reguler (Tersedia)", price: 250100, category: "Pulsa & Paket Data", subcategory: "AXIS", brand: "axis" },
            { name: "AXIS 300K", variant: "Axis Pulsa Reguler (Tersedia)", price: 377200, category: "Pulsa & Paket Data", subcategory: "AXIS", brand: "axis" },
            { name: "AXIS 500K", variant: "Axis Pulsa Reguler (Tersedia)", price: 627700, category: "Pulsa & Paket Data", subcategory: "AXIS", brand: "axis" },
            { name: "VOUCHER AIGO MINI 3GB 1Hr", variant: "Axis Paket Data (Tersedia)", price: 9100, category: "Pulsa & Paket Data", subcategory: "AXIS", brand: "axis" },
            { name: "VOUCHER AIGO MINI 1GB 3Hr", variant: "Axis Paket Data (Tersedia)", price: 13200, category: "Axis Paket Data (Tersedia)", price: 13200, category: "Pulsa & Paket Data", subcategory: "AXIS", brand: "axis" },
            { name: "VOUCHER AIGO MINI 3,5GB + Lokal 5Hr", variant: "Axis Paket Data (Tersedia)", price: 16500, category: "Pulsa & Paket Data", subcategory: "AXIS", brand: "axis" },
            { name: "VOUCHER AIGO MINI 6GB + Lokal 3Hr", variant: "Axis Paket Data (Tersedia)", price: 17500, category: "Pulsa & Paket Data", subcategory: "AXIS", brand: "axis" },
            { name: "VOUCHER AIGO MINI 7GB + Lokal 7Hr", variant: "Axis Paket Data (Tersedia)", price: 29200, category: "Pulsa & Paket Data", subcategory: "AXIS", brand: "axis" },
            { name: "VOUCHER AIGO MINI 5GB + Lokal 15Hr", variant: "Axis Paket Data (Tersedia)", price: 35100, category: "Pulsa & Paket Data", subcategory: "AXIS", brand: "axis" },
            { name: "VOUCHER AIGO MINI 11,5GB + Lokal 15Hr", variant: "Axis Paket Data (Tersedia)", price: 57500, category: "Pulsa & Paket Data", subcategory: "AXIS", brand: "axis" },
            { name: "Layanan Indosat Ooredoo", variant: "Pulsa & Paket Data Indosat (Tersedia)", price: 0, category: "Pulsa & Paket Data", subcategory: "INDOSAT", brand: "indosat" },
            { name: "Layanan Smartfren", variant: "Pulsa & Paket Data Smartfren (Tersedia)", price: 0, category: "Pulsa & Paket Data", subcategory: "SMARTFREN", brand: "smartfren" },
            { name: "Layanan Telkomsel", variant: "Pulsa & Paket Data Telkomsel (Tersedia)", price: 0, category: "Pulsa & Paket Data", subcategory: "TELKOMSEL", brand: "telkomsel" },
            { name: "Layanan Tri (3)", variant: "Pulsa & Paket Data Tri (Tersedia)", price: 0, category: "Pulsa & Paket Data", subcategory: "TRI (3)", brand: "tri" },
            { name: "Layanan XL Axiata", variant: "Pulsa & Paket Data XL (Tersedia)", price: 0, category: "Pulsa & Paket Data", subcategory: "XL", brand: "xl" },

            // Token Listrik
            { name: "Token PLN 5000", variant: "Token Listrik PLN (Tersedia)", price: 8800, category: "Token Listrik (PLN)", brand: "pln" },
            { name: "Token PLN 10000", variant: "Token Listrik PLN (Tersedia)", price: 15000, category: "Token Listrik (PLN)", brand: "pln" },
            { name: "Token PLN 15000", variant: "Token Listrik PLN (Tersedia)", price: 21200, category: "Token Listrik (PLN)", brand: "pln" },
            { name: "Token PLN 20000", variant: "Token Listrik PLN (Tersedia)", price: 27500, category: "Token Listrik (PLN)", brand: "pln" },
            { name: "Token PLN 50000", variant: "Token Listrik PLN (Tersedia)", price: 65000, category: "Token Listrik (PLN)", brand: "pln" },
            { name: "Token PLN 100000", variant: "Token Listrik PLN (Tersedia)", price: 127500, category: "Token Listrik (PLN)", brand: "pln" },
            { name: "Token PLN 200000", variant: "Token Listrik PLN (Tersedia)", price: 252500, category: "Token Listrik (PLN)", brand: "pln" },
            { name: "Token PLN 500000", variant: "Token Listrik PLN (Tersedia)", price: 627500, category: "Token Listrik (PLN)", brand: "pln" },
            { name: "Token PLN 1000000", variant: "Token Listrik PLN (Tersedia)", price: 1252500, category: "Token Listrik (PLN)", brand: "pln" },

            // Top Up Game - Free Fire
            { name: "Free Fire 5 Diamond", variant: "Top Up Free Fire (Tersedia)", price: 1400, category: "Top Up Game", subcategory: "Free Fire", brand: "freefire" },
            { name: "Free Fire 12 Diamond", variant: "Top Up Free Fire (Tersedia)", price: 2700, category: "Top Up Free Fire (Tersedia)", price: 2700, category: "Top Up Game", subcategory: "Free Fire", brand: "freefire" },
            { name: "Free Fire 20 Diamond", variant: "Top Up Free Fire (Tersedia)", price: 4700, category: "Top Up Game", subcategory: "Free Fire", brand: "freefire" },
            { name: "Free Fire 30 Diamond", variant: "Top Up Free Fire (Tersedia)", price: 6800, category: "Top Up Game", subcategory: "Free Fire", brand: "freefire" },
            { name: "Free Fire 50 Diamond", variant: "Top Up Free Fire (Tersedia)", price: 8400, category: "Top Up Game", subcategory: "Free Fire", brand: "freefire" },
            { name: "Free Fire 70 Diamond", variant: "Top Up Free Fire (Tersedia)", price: 12300, category: "Top Up Game", subcategory: "Free Fire", brand: "freefire" },
            { name: "Free Fire 75 Diamond", variant: "Top Up Free Fire (Tersedia)", price: 13000, category: "Top Up Game", subcategory: "Free Fire", brand: "freefire" },
            { name: "Free Fire 140 Diamond", variant: "Top Up Free Fire (Tersedia)", price: 22500, category: "Top Up Game", subcategory: "Free Fire", brand: "freefire" },
            { name: "Free Fire 355 Diamond", variant: "Top Up Free Fire (Tersedia)", price: 53800, category: "Top Up Game", subcategory: "Free Fire", brand: "freefire" },
            { name: "Free Fire 720 Diamond", variant: "Top Up Free Fire (Tersedia)", price: 110000, category: "Top Up Game", subcategory: "Free Fire", brand: "freefire" },
            { name: "Free Fire 1450 Diamond", variant: "Top Up Free Fire (Tersedia)", price: 237500, category: "Top Up Game", subcategory: "Free Fire", brand: "freefire" },
            { name: "Free Fire 2000 Diamond", variant: "Top Up Free Fire (Tersedia)", price: 320400, category: "Top Up Game", subcategory: "Free Fire", brand: "freefire" },
            { name: "Free Fire 2180 Diamond", variant: "Top Up Free Fire (Tersedia)", price: 354400, category: "Top Up Game", subcategory: "Free Fire", brand: "freefire" },
            { name: "Free Fire 3640 Diamond", variant: "Top Up Free Fire (Tersedia)", price: 575900, category: "Top Up Game", subcategory: "Free Fire", brand: "freefire" },
            
            // Top Up Game - Lainnya
            { name: "Mobile Legends (ML)", variant: "Top Up Diamond / Weekly Pass (Tersedia)", price: 0, category: "Top Up Game", subcategory: "Mobile Legends", brand: "ml" },
            { name: "PUBG Mobile (PU)", variant: "Top Up Unknown Cash (Tersedia)", price: 0, category: "Top Up Game", subcategory: "PUBG Mobile", brand: "pubg" },
            { name: "Garena Shell (GR)", variant: "Top Up Garena Shell Voucher (Tersedia)", price: 0, category: "Top Up Game", subcategory: "Garena Shell", brand: "garena" },

            // Jasa Unlock IMEI
            { name: "Unlock IMEI 3 Bulan Garansi", variant: "Layanan Garansi 3 Bulan", price: 275000, category: "Jasa Unlock IMEI", brand: "it-spec" },
            { name: "Unlock IMEI 3 Bulan No Garansi", variant: "Layanan No Garansi", price: 187500, category: "Jasa Unlock IMEI", brand: "it-spec" },

            // Layanan IT Specialist
            { name: "Bot Automation Project", variant: "WhatsApp, Telegram, Discord Automation (Tersedia)", price: 0, category: "Layanan IT Specialist", subcategory: "Bot Automation", brand: "it-spec" },
            { name: "Website Development Project", variant: "Online Shop, Landing Page, Company Profile (Tersedia)", price: 0, category: "Layanan IT Specialist", subcategory: "Website Development", brand: "it-spec" },
            { name: "Backend Developer Project", variant: "API Development & Database Integration (Tersedia)", price: 0, category: "Layanan IT Specialist", subcategory: "Backend Developer", brand: "it-spec" },
            { name: "Software Engineer Project", variant: "Desktop & Custom Software Systems (Tersedia)", price: 0, category: "Layanan IT Specialist", subcategory: "Software Engineer", brand: "it-spec" },
            { name: "Web3 Developer Project", variant: "Smart Contracts & Decentralized Apps (Tersedia)", price: 0, category: "Layanan IT Specialist", subcategory: "Web3 Developer", brand: "it-spec" },
            { name: "Aplikasi Mobile / APK Project", variant: "Android & iOS Apps Development (Tersedia)", price: 0, category: "Layanan IT Specialist", subcategory: "Aplikasi Mobile", brand: "it-spec" },

            // Sertifikat SSL (Otomatis)
            { name: "Sectigo PositiveSSL", variant: "1 Tahun - Cocok untuk personal / blog", price: 247500, category: "Sertifikat SSL (Otomatis)", subcategory: "Sectigo / Comodo", brand: "ssl" },
            { name: "Sectigo PositiveSSL Wildcard", variant: "1 Tahun - Mengamankan seluruh subdomain", price: 1134400, category: "Sertifikat SSL (Otomatis)", subcategory: "Sectigo / Comodo", brand: "ssl" },
            { name: "RapidSSL Standard", variant: "1 Tahun - Penerbitan kilat < 5 menit", price: 206300, category: "Sertifikat SSL (Otomatis)", subcategory: "RapidSSL", brand: "ssl" },
            { name: "RapidSSL Wildcard", variant: "1 Tahun - Mengamankan domain & subdomain termurah", price: 990000, category: "Sertifikat SSL (Otomatis)", subcategory: "RapidSSL", brand: "ssl" },

            // Produk Digital Manual
            { name: "Produk Digital Manual", variant: "Layanan Pemesanan Berbagai Kebutuhan Manual", price: 0, category: "Produk Digital Manual", brand: "manual" }
        ];

        let activeCategoryFilter = 'All';
        let activeSubcategoryFilter = 'All';

        const subcategoriesConfig = {
            "Pulsa & Paket Data": ["AXIS", "INDOSAT", "SMARTFREN", "TELKOMSEL", "TRI (3)", "XL"],
            "Top Up Game": ["Free Fire", "Mobile Legends", "PUBG Mobile", "Garena Shell"],
            "Layanan IT Specialist": ["Bot Automation", "Website Development", "Backend Developer", "Software Engineer", "Web3 Developer", "Aplikasi Mobile"],
            "Sertifikat SSL (Otomatis)": ["Sectigo / Comodo", "RapidSSL"]
        };

        // Brand-specific Logo Badge Generator
        function getBrandLogoBadge(brand, category) {
            let bgColor = 'bg-[#0066cc]';

            switch (brand) {
                case 'netflix':
                    bgColor = 'bg-[#e50914]';
                    break;
                case 'spotify':
                    bgColor = 'bg-[#1db954]';
                    break;
                case 'canva':
                    bgColor = 'bg-[#7d2ae8]';
                    break;
                case 'windows':
                    bgColor = 'bg-[#0078d7]';
                    break;
                case 'apple':
                    bgColor = 'bg-[#fc3c44]';
                    break;
                case 'chatgpt':
                    bgColor = 'bg-[#10a37f]';
                    break;
                case 'youtube':
                    bgColor = 'bg-[#ff0000]';
                    break;
                case 'zoom':
                    bgColor = 'bg-[#2d8cff]';
                    break;
                case 'disney':
                    bgColor = 'bg-[#0063e5]';
                    break;
                case 'hbo':
                    bgColor = 'bg-[#5821a6]';
                    break;
                case 'capcut':
                    bgColor = 'bg-[#1c1c1e]';
                    break;
                case 'bstation':
                    bgColor = 'bg-[#ff69b4]';
                    break;
                case 'iqiyi':
                    bgColor = 'bg-[#00c900]';
                    break;
                case 'viu':
                    bgColor = 'bg-[#ffc107]';
                    break;
                case 'wetv':
                    bgColor = 'bg-[#ff5c00]';
                    break;
                case 'vpn':
                    bgColor = 'bg-[#4b5563]';
                    break;
                case 'alight':
                    bgColor = 'bg-[#00d856]';
                    break;
                case 'it-spec':
                    bgColor = 'bg-[#0f172a]';
                    break;
                case 'axis':
                    bgColor = 'bg-[#8b5cf6]';
                    break;
                case 'indosat':
                    bgColor = 'bg-[#f59e0b]';
                    break;
                case 'smartfren':
                    bgColor = 'bg-[#ec4899]';
                    break;
                case 'telkomsel':
                    bgColor = 'bg-[#ef4444]';
                    break;
                case 'tri':
                    bgColor = 'bg-[#000000]';
                    break;
                case 'xl':
                    bgColor = 'bg-[#2563eb]';
                    break;
                case 'pln':
                    bgColor = 'bg-[#eab308]';
                    break;
                case 'freefire':
                    bgColor = 'bg-[#f97316]';
                    break;
                case 'ml':
                    bgColor = 'bg-[#d97706]';
                    break;
                case 'pubg':
                    bgColor = 'bg-[#166534]';
                    break;
                case 'garena':
                    bgColor = 'bg-[#dc2626]';
                    break;
                case 'ssl':
                    bgColor = 'bg-[#0ea5e9]';
                    break;
                case 'provider':
                    bgColor = 'bg-[#4b5563]';
                    break;
                case 'manual':
                    bgColor = 'bg-[#64748b]';
                    break;
                default:
                    if (category === 'Streaming') {
                        bgColor = 'bg-[#0066cc]';
                    } else if (category === 'Creative') {
                        bgColor = 'bg-[#a855f7]';
                    } else {
                        bgColor = 'bg-[#64748b]';
                    }
                    break;
            }

            return `
                <div class="w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center shrink-0 select-none p-1.5 shadow-sm">
                    <img src="documents/Logo/easyfastlogotransaparan.webp" alt="Logo" class="w-full h-full object-contain brightness-0 invert">
                </div>
            `;
        }

        // Render List Layout (Brand Logo, Variant details, Price - flat only)
        function renderProducts(filteredList) {
            const container = document.getElementById('product-list-container');
            if (!container) return;
            
            if (filteredList.length === 0) {
                container.innerHTML = `
                    <div class="py-10 text-center text-gray-400 dark:text-gray-500">
                        <i data-lucide="package-x" class="w-10 h-10 mx-auto mb-2 opacity-40"></i>
                        <p class="font-bold text-xs">Produk tidak ditemukan</p>
                    </div>
                `;
                if (window.lucide) lucide.createIcons();
                return;
            }

            container.innerHTML = filteredList.map(prod => {
                let formattedPrice;
                let waText;
                if (prod.price === 0 || !prod.price) {
                    formattedPrice = "Hubungi CS";
                    waText = encodeURIComponent(`Halo Admin EasyMarket, saya tertarik dengan layanan:\n\nLayanan: ${prod.name}\nVariasi/Keterangan: ${prod.variant}\n\nMohon informasi konsultasi lebih lanjut.`);
                } else {
                    formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(prod.price);
                    waText = encodeURIComponent(`Halo Admin EasyMarket, saya ingin memesan:\n\nProduk: ${prod.name}\nVariasi: ${prod.variant}\nHarga: ${formattedPrice}`);
                }
                const brandBadge = getBrandLogoBadge(prod.brand, prod.category);
                const clickAction = `onclick="window.open('https://wa.me/6288971071138?text=${waText}', '_blank')"`

                return `
                    <div ${clickAction} class="grid grid-cols-12 gap-2 px-4 py-3.5 items-center product-item cursor-pointer transition">
                        <div class="col-span-8 flex items-center gap-3">
                            ${brandBadge}
                            <div class="space-y-0.5">
                                <div class="font-bold text-sm text-gray-800 dark:text-gray-100">${prod.name}</div>
                                <div class="text-[10px] text-gray-400">${prod.variant}</div>
                            </div>
                        </div>
                        <div class="col-span-4 text-right">
                            <span class="font-extrabold text-sm text-[#0066cc] dark:text-[#38bdf8]">${formattedPrice}</span>
                        </div>
                    </div>
                `;
            }).join('');

            if (window.lucide) lucide.createIcons();
        }

        // Render dynamic subcategories row
        function renderSubcategories(cat) {
            const container = document.getElementById('subcategory-filters');
            if (!container) return;
            
            const subs = subcategoriesConfig[cat];
            if (!subs) {
                container.classList.add('hidden');
                container.innerHTML = '';
                return;
            }
            
            container.classList.remove('hidden');
            let html = `
                <button onclick="filterSubcategory('All')" data-sub="All" class="sub-btn px-3 py-1 text-[11px] font-bold rounded-full bg-[#0066cc]/10 text-[#0066cc] dark:bg-[#38bdf8]/10 dark:text-[#38bdf8] active">
                    Semua Sub
                </button>
            `;
            
            subs.forEach(sub => {
                html += `
                    <button onclick="filterSubcategory('${sub}')" data-sub="${sub}" class="sub-btn px-3 py-1 text-[11px] font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400">
                        ${sub}
                    </button>
                `;
            });
            
            container.innerHTML = html;
        }

        // Subcategory click handler
        window.filterSubcategory = function(sub) {
            activeSubcategoryFilter = sub;
            const buttons = document.querySelectorAll('#subcategory-filters button');
            buttons.forEach(btn => {
                if (btn.getAttribute('data-sub') === sub) {
                    btn.className = "sub-btn px-3 py-1 text-[11px] font-bold rounded-full bg-[#0066cc]/10 text-[#0066cc] dark:bg-[#38bdf8]/10 dark:text-[#38bdf8] active";
                } else {
                    btn.className = "sub-btn px-3 py-1 text-[11px] font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400";
                }
            });
            applyFilters();
        };

        // Apply Search, Category Filters, Sorting
        window.applyFilters = function() {
            const query = document.getElementById('product-search').value.toLowerCase().trim();
            const sortVal = document.getElementById('sort-select').value;

            let result = [...products];

            if (activeCategoryFilter !== 'All') {
                result = result.filter(p => p.category === activeCategoryFilter);
            }

            if (activeSubcategoryFilter !== 'All') {
                result = result.filter(p => p.subcategory === activeSubcategoryFilter);
            }

            if (query !== '') {
                result = result.filter(p => p.name.toLowerCase().includes(query) || p.variant.toLowerCase().includes(query));
            }

            if (sortVal === 'price-asc') {
                result.sort((a, b) => a.price - b.price);
            } else if (sortVal === 'price-desc') {
                result.sort((a, b) => b.price - a.price);
            }

            renderProducts(result);
        };

        // Category click handler
        window.filterCategory = function(cat) {
            activeCategoryFilter = cat;
            activeSubcategoryFilter = 'All';
            
            const buttons = document.querySelectorAll('#category-filters button');
            buttons.forEach(btn => {
                if (btn.getAttribute('data-category') === cat) {
                    btn.className = "category-btn px-4 py-1.5 text-xs font-bold rounded-full bg-[#0066cc]/10 text-[#0066cc] dark:bg-[#38bdf8]/10 dark:text-[#38bdf8] active";
                } else {
                    btn.className = "category-btn px-4 py-1.5 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-gray-500 dark:text-gray-300";
                }
            });

            renderSubcategories(cat);
            applyFilters();
        };

        // Tab Switching Logic
        window.switchTab = function(tabId) {
            const tabs = ['pengenalan', 'produk', 'harga', 'order', 'testimoni', 'sk', 'oss', 'investor'];
            
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

            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        // Lightbox Functions for Testimonials
        window.openLightbox = function(src, cardEl) {
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
            
            let captionText = 'Testimonial';
            if (cardEl) {
                const headingEl = cardEl.querySelector('h4');
                if (headingEl) {
                    const visibleSpan = Array.from(headingEl.querySelectorAll('span')).find(span => !span.classList.contains('hidden'));
                    if (visibleSpan) {
                        captionText = visibleSpan.innerText;
                    } else {
                        captionText = headingEl.innerText;
                    }
                }
            }
            cap.innerText = captionText;

            lightbox.classList.remove('hidden');
            lightbox.classList.add('flex');
            setTimeout(() => {
                lightbox.classList.remove('opacity-0');
            }, 10);
        };

        window.closeLightbox = function() {
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

        window.switchSKSubTab = function(subTabId) {
            // Hide all S&K sub-tab contents
            const contents = document.querySelectorAll('.sk-sub-content');
            contents.forEach(content => {
                content.classList.add('hidden');
            });

            // Remove active styles from S&K tab buttons
            const tabs = ['deskripsi', 'pembelian', 'refund', 'privasi'];
            tabs.forEach(tab => {
                const btn = document.getElementById(`sk-tab-${tab}`);
                if (btn) {
                    btn.classList.remove('text-[#0066cc]', 'dark:text-[#38bdf8]', 'border-[#0066cc]', 'dark:border-[#38bdf8]');
                    btn.classList.add('text-gray-500', 'dark:text-gray-400', 'border-transparent');
                }
            });

            // Show active content
            const activeContent = document.getElementById(`sk-content-${subTabId.split('-')[1]}`);
            if (activeContent) {
                activeContent.classList.remove('hidden');
            }

            // Set active button styles
            const activeBtn = document.getElementById(`sk-tab-${subTabId.split('-')[1]}`);
            if (activeBtn) {
                activeBtn.classList.remove('text-gray-500', 'dark:text-gray-400', 'border-transparent');
                activeBtn.classList.add('text-[#0066cc]', 'dark:text-[#38bdf8]', 'border-[#0066cc]', 'dark:border-[#38bdf8]');
            }
        };

        // Initial setup on load
        const initPage = async () => {
            if (window.setLoadingProgress) window.setLoadingProgress(5);
            
            if (window.loadComponent) {
                await loadComponent('header-placeholder', 'include/header.html');
                if (window.setLoadingProgress) window.setLoadingProgress(40);
                await loadComponent('footer-placeholder', 'include/footer.html');
                if (window.setLoadingProgress) window.setLoadingProgress(70);
            }
            
            if (window.lucide) lucide.createIcons();

            const searchInput = document.getElementById('product-search');
            if (searchInput) {
                searchInput.addEventListener('input', applyFilters);
            }

            applyFilters();

            // Dark mode state management
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

            // Language state management
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
