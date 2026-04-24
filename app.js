document.addEventListener('DOMContentLoaded', () => {
    // --- Data Model for Units ---
    let unitsData = {
        1: { name: 'Etapa A', desc: 'Luxusní bytová jednotka s vlastní zahradou a dvěma parkovacími místy.', layout: '5+kk', area: '145', garden: '210', parking: '2 místa', price: '8 490 000 Kč', status: 'status-available', statusText: 'Volno', pdfKarta: '', pdfStandardy: '' },
        2: { name: 'Etapa B', desc: 'Moderní rodinné bydlení s prostornou terasou v patře.', layout: '4+kk', area: '132', garden: '180', parking: '2 místa', price: '7 990 000 Kč', status: 'status-reserved', statusText: 'Rezervováno', pdfKarta: '', pdfStandardy: '' },
        3: { name: 'Etapa C', desc: 'Útulný dům ideální pro mladou rodinu s výhledem do zeleně.', layout: '4+kk', area: '128', garden: '150', parking: '2 místa', price: '7 490 000 Kč', status: 'status-sold', statusText: 'Prodáno', pdfKarta: '', pdfStandardy: '' },
        4: { name: 'Jednotka 4', desc: '', layout: '', area: '', garden: '', parking: '', price: '', status: 'status-available', statusText: 'Volno', pdfKarta: '', pdfStandardy: '' },
        5: { name: 'Jednotka 5', desc: '', layout: '', area: '', garden: '', parking: '', price: '', status: 'status-available', statusText: 'Volno', pdfKarta: '', pdfStandardy: '' },
        6: { name: 'Jednotka 6', desc: '', layout: '', area: '', garden: '', parking: '', price: '', status: 'status-available', statusText: 'Volno', pdfKarta: '', pdfStandardy: '' },
        7: { name: 'Jednotka 7', desc: '', layout: '', area: '', garden: '', parking: '', price: '', status: 'status-available', statusText: 'Volno', pdfKarta: '', pdfStandardy: '' },
        8: { name: 'Jednotka 8', desc: '', layout: '', area: '', garden: '', parking: '', price: '', status: 'status-available', statusText: 'Volno', pdfKarta: '', pdfStandardy: '' },
        9: { name: 'Jednotka 9', desc: '', layout: '', area: '', garden: '', parking: '', price: '', status: 'status-available', statusText: 'Volno', pdfKarta: '', pdfStandardy: '' }
    };

    let unitsConfig = {
        mode: 'slices',
        count: 3,
        separateImages: false,
        hoverColorHex: '#c5a059',
        pinColorHex: '#c5a059',
        hoverOpacity: 40,
        widths: { 1: 33.3, 2: 33.3, 3: 33.3, 4: 25, 5: 20, 6: 16, 7: 14, 8: 12, 9: 11 },
        pins: { 
            1: {x: 50, y: 50, s: 100}, 2: {x: 50, y: 50, s: 100}, 3: {x: 50, y: 50, s: 100}, 
            4: {x: 50, y: 50, s: 100}, 5: {x: 50, y: 50, s: 100}, 6: {x: 50, y: 50, s: 100},
            7: {x: 50, y: 50, s: 100}, 8: {x: 50, y: 50, s: 100}, 9: {x: 50, y: 50, s: 100}
        }
    };

    let partnersData = [];
    for(let i=1; i<=6; i++) {
        partnersData.push({ id: i, logo: '', url: '' });
    }

    const hexToRgba = (hex, opacity) => {
        let c;
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
            c= hex.substring(1).split('');
            if(c.length== 3){
                c= [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c= '0x'+c.join('');
            return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+(opacity/100)+')';
        }
        return 'rgba(197, 160, 89, 0.4)';
    };

    // --- IndexedDB for Large Media ---
    const MediaDB = {
        dbName: 'WebProdejMediaDB',
        dbVersion: 1,
        storeName: 'media',
        open() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, this.dbVersion);
                request.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains(this.storeName)) {
                        db.createObjectStore(this.storeName);
                    }
                };
                request.onsuccess = (e) => resolve(e.target.result);
                request.onerror = (e) => reject(e.target.error);
            });
        },
        async save(key, base64) {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(this.storeName, 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.put(base64, key);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        },
        async load(key) {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(this.storeName, 'readonly');
                const store = transaction.objectStore(this.storeName);
                const request = store.get(key);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error || 'Not found');
            });
        },
        async clear() {
            const db = await this.open();
            const transaction = db.transaction(this.storeName, 'readwrite');
            transaction.objectStore(this.storeName).clear();
        }
    };

    let siteMedia = {
        hero: '',
        heroDark: '',
        triplex: '',
        gallery: ['gallery-1.jpg', 'gallery-2.jpg']
    };

    // --- Export/Import Logic ---
    const exportBtn = document.getElementById('export-config-btn');
    const importTrigger = document.getElementById('import-config-trigger');
    const importInput = document.getElementById('import-config-input');

    if (exportBtn) {
        exportBtn.addEventListener('click', async () => {
            const configStr = localStorage.getItem('web_prodej_ultra_v3_config');
            if (!configStr) {
                alert('Žádná konfigurace k uložení nebyla nalezena.');
                return;
            }
            
            const config = JSON.parse(configStr);
            const exportData = { config, mediaData: {} };

            // Gather all db: keys from siteMedia
            const gatherMedia = async (mediaObj) => {
                for (const key in mediaObj) {
                    const val = mediaObj[key];
                    if (typeof val === 'string' && val.startsWith('db:')) {
                        const dbKey = val.split(':')[1];
                        try {
                            const data = await MediaDB.load(dbKey);
                            if (data) exportData.mediaData[dbKey] = data;
                        } catch(e) {}
                    } else if (Array.isArray(val)) {
                        for (const item of val) {
                            if (typeof item === 'string' && item.startsWith('db:')) {
                                const dbKey = item.split(':')[1];
                                try {
                                    const data = await MediaDB.load(dbKey);
                                    if (data) exportData.mediaData[dbKey] = data;
                                } catch(e) {}
                            }
                        }
                    }
                }
            };

            await gatherMedia(config.media || {});
            
            const blob = new Blob([JSON.stringify(exportData)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `projekt_KOMPLETNI_export_${new Date().toISOString().slice(0,10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    if (importTrigger && importInput) {
        importTrigger.addEventListener('click', () => importInput.click());
        importInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const imported = JSON.parse(event.target.result);
                    let config, mediaData = {};

                    // Handle both old and new export formats
                    if (imported.config && imported.mediaData) {
                        config = imported.config;
                        mediaData = imported.mediaData;
                    } else {
                        config = imported;
                    }
                    
                    if (!config.units || !config.content) throw new Error('Neplatný formát souboru.');
                    
                    // Save media to IndexedDB first
                    for (const key in mediaData) {
                        await MediaDB.save(key, mediaData[key]);
                    }

                    localStorage.setItem('web_prodej_ultra_v3_config', JSON.stringify(config));
                    alert('Kompletní konfigurace (včetně obrázků) byla úspěšně nahrána! Stránka se restartuje.');
                    window.location.reload();
                } catch (err) {
                    alert('Chyba při nahrávání konfigurace: ' + err.message);
                }
            };
            reader.readAsText(file);
        });
    }

    // --- Map Configuration ---
    let map;
    let marker;
    let mapCoords = { lat: 50.0755, lng: 14.4378 };
    const DEFAULT_ZOOM = 18;

    let tileLayer;
    let cadastralLayer;
    const initMap = (lat, lng) => {
        lat = parseFloat(lat);
        lng = parseFloat(lng);
        if (isNaN(lat)) lat = 50.0755;
        if (isNaN(lng)) lng = 14.4378;
        const diag = document.getElementById('map-diagnostic');
        const tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
        const attribution = '&copy; OpenStreetMap contributors &copy; CARTO';

        try {
            if (typeof L === 'undefined') throw new Error('Leaflet knihovna (L) není načtena. Zkontrolujte připojení k internetu.');

            if (!map) {
                const mapContainer = document.getElementById('map');
                if (!mapContainer) throw new Error('Kontejner #map nebyl nalezen v DOMu.');

                map = L.map('map', { scrollWheelZoom: false }).setView([lat, lng], DEFAULT_ZOOM);
                tileLayer = L.tileLayer(tileUrl, {
                    attribution: attribution,
                    maxZoom: 19
                }).addTo(map);
            } else {
                if (map.getCenter().lat !== lat || map.getCenter().lng !== lng) {
                    map.setView([lat, lng], map.getZoom());
                }
                if (tileLayer) tileLayer.setUrl(tileUrl);
            }

            if (marker) {
                marker.setLatLng([lat, lng]);
            } else {
                const redPinIcon = L.divIcon({
                    html: `<svg width="40" height="40" viewBox="0 0 24 24" fill="#e74c3c" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.4)); transform: translateY(-4px);"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="#ffffff" stroke="none"></circle></svg>`,
                    className: 'custom-pin-icon',
                    iconSize: [40, 40],
                    iconAnchor: [20, 36]
                });
                marker = L.marker([lat, lng], { icon: redPinIcon }).addTo(map);
            }

            // Cadastral Layer
            if (!cadastralLayer) {
                cadastralLayer = L.tileLayer.wms('https://services.cuzk.gov.cz/wms/wms.asp', {
                    layers: 'KN',
                    format: 'image/png',
                    transparent: true,
                    version: '1.3.0',
                    attribution: 'Katastrální mapa &copy; ČÚZK',
                    minZoom: 15,
                    maxZoom: 20
                });
            }

            const cadastralInput = document.getElementById('cadastral-map-input');

            if (!window.cadastralControlAdded) {
                const CadastralControl = L.Control.extend({
                    options: { position: 'topleft' },
                    onAdd: function () {
                        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
                        container.id = 'cadastral-toggle-btn';
                        container.style.backgroundColor = 'white';
                        container.style.width = '34px';
                        container.style.height = '34px';
                        container.style.lineHeight = '34px';
                        container.style.textAlign = 'center';
                        container.style.cursor = 'pointer';
                        container.style.fontSize = '18px';
                        container.innerHTML = '🗺️';
                        container.title = 'Přepnout katastrální mapu';
                        
                        L.DomEvent.disableClickPropagation(container);

                        container.onclick = function(){
                            if(map.hasLayer(cadastralLayer)){
                                map.removeLayer(cadastralLayer);
                                container.style.backgroundColor = 'white';
                                if (cadastralInput) cadastralInput.checked = false;
                            } else {
                                map.addLayer(cadastralLayer);
                                container.style.backgroundColor = '#e0e0e0';
                                if (cadastralInput) cadastralInput.checked = true;
                            }
                        };
                        
                        // Initial state
                        if (cadastralInput && cadastralInput.checked) {
                            map.addLayer(cadastralLayer);
                            container.style.backgroundColor = '#e0e0e0';
                        }
                        
                        return container;
                    }
                });
                map.addControl(new CadastralControl());
                window.cadastralControlAdded = true;
            } else {
                const btn = document.getElementById('cadastral-toggle-btn');
                if (cadastralInput && cadastralInput.checked) {
                    if (!map.hasLayer(cadastralLayer)) map.addLayer(cadastralLayer);
                    if (btn) btn.style.backgroundColor = '#e0e0e0';
                } else if (cadastralInput && !cadastralInput.checked) {
                    if (map.hasLayer(cadastralLayer)) map.removeLayer(cadastralLayer);
                    if (btn) btn.style.backgroundColor = 'white';
                }
            }

            if (diag) diag.style.display = 'none';

            // Ensure map container size is recognized by Leaflet after DOM painting
            setTimeout(() => {
                if (map) map.invalidateSize();
            }, 300);
            
        } catch (err) {
            console.error('Map init error:', err);
            if (diag) {
                diag.textContent = 'Chyba mapy: ' + err.message;
                diag.style.display = 'block';
            }
        }
    };

    // --- Selectors ---
    const adminToggle = document.getElementById('admin-toggle');
    const adminPanel = document.getElementById('admin-panel');
    const saveBtn = document.getElementById('save-settings');
    const root = document.documentElement;

    // --- Mobile Menu Toggle Logic ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    const navLinks = mainNav.querySelectorAll('a');

    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            mainNav.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                mainNav.classList.remove('active');
            });
        });
    }

    // Media Uploads
    const logoUpload = document.getElementById('logo-img-upload');
    const heroUpload = document.getElementById('hero-img-upload');
    const heroDarkUpload = document.getElementById('hero-dark-img-upload');
    const triplexUpload = document.getElementById('triplex-img-upload');
    const galleryUploadMultiple = document.getElementById('gallery-upload-multiple');
    const clearGalleryBtn = document.getElementById('clear-gallery');
    const galleryContainer = document.getElementById('gallery-container');



    // Appearance
    const primaryColorInput = document.getElementById('primary-color-input');
    const accentColorInput = document.getElementById('accent-color-input');
    const fontHeadingInput = document.getElementById('font-heading-input');
    
    // Content
    const logoInput = document.getElementById('logo-input');
    const heroTitleInput = document.getElementById('hero-title-input');
    const heroTextInput = document.getElementById('hero-text-input');
    const aboutTitleInput = document.getElementById('about-title-input');
    const aboutTextInput = document.getElementById('about-text-input');
    const subtitleInput = document.getElementById('subtitle-input');
    const logoSizeInput = document.getElementById('logo-size-input');
    
    // Cards
    const cardInputs = [
        { title: document.getElementById('card-1-title-input'), text: document.getElementById('card-1-text-input'), titleEl: document.getElementById('card-1-title'), textEl: document.getElementById('card-1-text') },
        { title: document.getElementById('card-2-title-input'), text: document.getElementById('card-2-text-input'), titleEl: document.getElementById('card-2-title'), textEl: document.getElementById('card-2-text') },
        { title: document.getElementById('card-3-title-input'), text: document.getElementById('card-3-text-input'), titleEl: document.getElementById('card-3-title'), textEl: document.getElementById('card-3-text') }
    ];

    // GPS
    const gpsLatInput = document.getElementById('gps-lat-input');
    const gpsLngInput = document.getElementById('gps-lng-input');
    const cadastralMapInput = document.getElementById('cadastral-map-input');

    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    const darkModeInput = document.getElementById('dark-mode-input');

    const toggleDarkMode = (isDark) => {
        document.body.classList.toggle('dark-mode', isDark);
        if (sunIcon && moonIcon) {
            sunIcon.style.display = isDark ? 'block' : 'none';
            moonIcon.style.display = isDark ? 'none' : 'block';
        }
        if (darkModeInput) darkModeInput.checked = isDark;
        
        // Refresh map tiles if map exists
        if (map) {
            initMap(mapCoords.lat, mapCoords.lng);
        }

        // Update Hero Image based on mode
        updateHeroBackground();
    };

    const updateHeroBackground = async () => {
        if (!heroBg) return;
        const isDark = document.body.classList.contains('dark-mode');
        let image = (isDark && siteMedia.heroDark) ? siteMedia.heroDark : siteMedia.hero;
        
        if (image && image.startsWith('db:')) {
            const key = image.split(':')[1];
            image = await MediaDB.load(key);
        }
        
        if (image) {
            heroBg.style.backgroundImage = `url(${image})`;
        }
    };

    // --- Sticky Header Logic ---
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    themeToggle.addEventListener('click', () => {
        const isDark = !document.body.classList.contains('dark-mode');
        toggleDarkMode(isDark);
    });

    darkModeInput.addEventListener('change', (e) => {
        toggleDarkMode(e.target.checked);
    });

    // Contact Admin
    const contactTitleInput = document.getElementById('contact-title-input');
    const contactTextInput = document.getElementById('contact-text-input');
    const contactPhoneInput = document.getElementById('contact-phone-input');
    const contactEmailInput = document.getElementById('contact-email-input');
    const fbLinkInput = document.getElementById('fb-link-input');
    const igLinkInput = document.getElementById('ig-link-input');
    const agentNameInput = document.getElementById('agent-name-input');

    // Unit Admin Inputs Mapping
    const unitInputs = {};
    for(let i=1; i<=9; i++) {
        unitInputs[i] = {
            status: document.getElementById(`status-${i}-input`),
            price: document.getElementById(`price-${i}-input`),
            layout: document.getElementById(`layout-${i}-input`),
            area: document.getElementById(`area-${i}-input`),
            garden: document.getElementById(`garden-${i}-input`),
            parking: document.getElementById(`parking-${i}-input`),
            desc: document.getElementById(`desc-${i}-input`),
            pdfKarta: document.getElementById(`pdf-karta-${i}-upload`),
            pdfStandardy: document.getElementById(`pdf-standardy-${i}-upload`)
        };
    }

    // --- Layout Config Inputs ---
    const unitsCountInput = document.getElementById('units-count-input');
    const unitsCountDisplay = document.getElementById('units-count-display');
    const unitsColorInput = document.getElementById('units-color-input');
    const pinColorInput = document.getElementById('pin-color-input');
    const unitsOpacityInput = document.getElementById('units-opacity-input');
    const unitsOpacityNumber = document.getElementById('units-opacity-number');
    const unitsSeparateImagesInput = document.getElementById('units-separate-images-input');

    const widthSliders = {};
    const widthNumbers = {};
    const widthContainers = {};
    const adminUnitBlocks = {};
    for(let i=1; i<=9; i++) {
        widthSliders[i] = document.getElementById(`units-width-${i}-input`);
        widthNumbers[i] = document.getElementById(`units-width-${i}-number`);
        widthContainers[i] = document.getElementById(`units-width-${i}-container`);
        adminUnitBlocks[i] = document.getElementById(`admin-unit-${i}-block`);
    }

    const unitsModeInput = document.getElementById('units-mode-input');
    const pinInputs = {};
    for(let i=1; i<=9; i++) {
        pinInputs[i] = {
            x: document.getElementById(`pin-x-${i}-input`),
            y: document.getElementById(`pin-y-${i}-input`),
            s: document.getElementById(`pin-s-${i}-input`)
        };
    }

    const updateAdminUnitsVisibility = () => {
        const mode = unitsConfig.mode || 'slices';
        if(unitsModeInput) unitsModeInput.value = mode;
        const isPins = mode === 'pins';

        const pinCoordGroups = document.querySelectorAll('.pin-coord-group');
        pinCoordGroups.forEach(el => el.style.display = isPins ? 'block' : 'none');

        const c = unitsConfig.count;
        if(unitsCountDisplay) unitsCountDisplay.textContent = c;
        if(unitsCountInput) unitsCountInput.value = c;
        
        for(let i=1; i<=9; i++) {
            const isVisible = i <= c;
            
            if(widthContainers[i]) widthContainers[i].style.display = (isVisible && !isPins && c > 1) ? 'block' : 'none';
            if(adminUnitBlocks[i]) adminUnitBlocks[i].style.display = isVisible ? 'block' : 'none';

            if(widthNumbers[i]) widthNumbers[i].value = unitsConfig.widths[i];
            if(widthSliders[i]) widthSliders[i].value = unitsConfig.widths[i];
            
            if(pinInputs[i].x && unitsConfig.pins[i]) pinInputs[i].x.value = unitsConfig.pins[i].x;
            if(pinInputs[i].y && unitsConfig.pins[i]) pinInputs[i].y.value = unitsConfig.pins[i].y;
            if(pinInputs[i].s && unitsConfig.pins[i]) pinInputs[i].s.value = unitsConfig.pins[i].s || 100;
        }
        
        if(unitsOpacityNumber) unitsOpacityNumber.value = unitsConfig.hoverOpacity;
        if(unitsColorInput) unitsColorInput.value = unitsConfig.hoverColorHex;
        if(pinColorInput) pinColorInput.value = unitsConfig.pinColorHex || '#c5a059';
        
        if(unitsSeparateImagesInput) unitsSeparateImagesInput.checked = unitsConfig.separateImages;

        // Toggle separate image upload fields in admin
        const separateInputs = document.querySelectorAll('.separate-image-upload');
        separateInputs.forEach(el => {
            el.style.display = unitsConfig.separateImages ? 'block' : 'none';
        });
        
        // Hide the main single building image uploader dynamically
        const triplexUploadGroup = document.getElementById('triplex-img-upload')?.closest('.control-group');
        if(triplexUploadGroup) {
            triplexUploadGroup.style.display = unitsConfig.separateImages ? 'none' : 'block';
        }
    };

    if (unitsCountInput) {
        unitsCountInput.addEventListener('change', (e) => {
            unitsConfig.count = parseInt(e.target.value);
            updateAdminUnitsVisibility();
            renderUnitZones();
        });
    }

    if (unitsModeInput) {
        unitsModeInput.addEventListener('change', (e) => {
            unitsConfig.mode = e.target.value;
            if (!unitsConfig.pins) {
                unitsConfig.pins = {};
                for(let i=1; i<=9; i++) unitsConfig.pins[i] = {x: 50, y: 50};
            }
            updateAdminUnitsVisibility();
            renderUnitZones();
        });
    }

    for(let i=1; i<=9; i++) {
        if(pinInputs[i].x) {
            pinInputs[i].x.addEventListener('input', (e) => {
                if (!unitsConfig.pins[i]) unitsConfig.pins[i] = {x: 50, y: 50, s: 100};
                unitsConfig.pins[i].x = parseInt(e.target.value);
                renderUnitZones();
            });
        }
        if(pinInputs[i].y) {
            pinInputs[i].y.addEventListener('input', (e) => {
                if (!unitsConfig.pins[i]) unitsConfig.pins[i] = {x: 50, y: 50, s: 100};
                unitsConfig.pins[i].y = parseInt(e.target.value);
                renderUnitZones();
            });
        }
        if(pinInputs[i].s) {
            pinInputs[i].s.addEventListener('input', (e) => {
                if (!unitsConfig.pins[i]) unitsConfig.pins[i] = {x: 50, y: 50, s: 100};
                unitsConfig.pins[i].s = parseInt(e.target.value);
                renderUnitZones();
            });
        }
    }
    if (unitsSeparateImagesInput) {
        unitsSeparateImagesInput.addEventListener('change', (e) => {
            unitsConfig.separateImages = e.target.checked;
            updateAdminUnitsVisibility();
            renderUnitZones();
        });
    }
    if (unitsColorInput) {
        unitsColorInput.addEventListener('input', (e) => {
            unitsConfig.hoverColorHex = e.target.value;
            renderUnitZones();
        });
    }
    if (pinColorInput) {
        pinColorInput.addEventListener('input', (e) => {
            unitsConfig.pinColorHex = e.target.value;
            renderUnitZones();
        });
    }
    if (unitsOpacityInput) {
        unitsOpacityInput.addEventListener('input', (e) => {
            unitsConfig.hoverOpacity = parseInt(e.target.value);
            if(unitsOpacityNumber) unitsOpacityNumber.value = unitsConfig.hoverOpacity;
            renderUnitZones();
        });
    }
    if (unitsOpacityNumber) {
        unitsOpacityNumber.addEventListener('input', (e) => {
            let val = parseInt(e.target.value) || 0;
            if(val > 100) val = 100;
            if(val < 0) val = 0;
            unitsConfig.hoverOpacity = val;
            if(unitsOpacityInput) unitsOpacityInput.value = val;
            renderUnitZones();
        });
    }

    const bindWidthSliderAndNumber = (slider, number, index) => {
        if(slider) {
            slider.addEventListener('input', (e) => { 
                unitsConfig.widths[index] = parseInt(e.target.value); 
                if(number) number.value = unitsConfig.widths[index];
                renderUnitZones(); 
            });
        }
        if(number) {
            number.addEventListener('input', (e) => {
                let val = parseInt(e.target.value) || 0;
                if(val > 100) val = 100;
                if(val < 1) val = 1;
                unitsConfig.widths[index] = val;
                if(slider) slider.value = val;
                renderUnitZones();
            });
        }
    };

    for(let i=1; i<=9; i++) {
        bindWidthSliderAndNumber(widthSliders[i], widthNumbers[i], i);
    }

    // Web Elements
    const webLogo = document.getElementById('editable-logo');
    const footerLogoText = document.getElementById('footer-editable-logo');
    const headerLogoImg = document.getElementById('logo-img-display');
    const footerLogoImg = document.getElementById('footer-logo-img-display');

    const heroTitle = document.getElementById('editable-hero-title');
    const heroText = document.getElementById('editable-hero-text');
    const aboutTitle = document.getElementById('editable-about-title');
    const aboutText = document.getElementById('editable-about-text');
    
    const contactTitle = document.getElementById('editable-contact-title');
    const contactText = document.getElementById('editable-contact-text');
    const contactPhone = document.getElementById('editable-contact-phone');
    const contactEmail = document.getElementById('editable-contact-email');
    const igLink = document.getElementById('ig-link');

    const webSubtitle = document.getElementById('editable-subtitle');
    const footerSubtitle = document.getElementById('footer-editable-subtitle');

    const modal = document.getElementById('unit-modal');
    const heroBg = document.getElementById('hero-bg');
    const triplexImage = document.querySelector('.units-image');

    // --- Helper: File to Base64 ---
    const handleFileUpload = (input, callback) => {
        if (!input) return;
        input.addEventListener('change', (e) => {
            const files = e.target.files;
            if (!files.length) return;
            
            Array.from(files).forEach(file => {
                if (file.size > 10 * 1024 * 1024) { 
                    alert(`Soubor ${file.name} je příliš velký (max 10MB). Přeskočeno.`);
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => callback(event.target.result);
                reader.readAsDataURL(file);
            });
        });
    };

    // --- Core Functions ---

    adminToggle.addEventListener('click', () => adminPanel.classList.toggle('active'));

    // Accordion Logic
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            console.log('Accordion clicked:', header.textContent);
            const section = header.parentElement;
            section.classList.toggle('active');
        });
    });

    // Appearance
    primaryColorInput.addEventListener('input', (e) => root.style.setProperty('--primary-color', e.target.value));
    accentColorInput.addEventListener('input', (e) => root.style.setProperty('--accent-color', e.target.value));
    fontHeadingInput.addEventListener('change', (e) => root.style.setProperty('--font-heading', e.target.value));

    if (logoSizeInput) {
        logoSizeInput.addEventListener('input', (e) => {
            const size = e.target.value + 'px';
            const footerSize = (e.target.value * 0.75) + 'px';
            root.style.setProperty('--logo-size', size);
            root.style.setProperty('--logo-size-footer', footerSize);
            saveToStorage(true);
        });
    }

    // Media Uploads
    handleFileUpload(logoUpload, async (base64) => {
        siteMedia.logo = 'db:logo';
        await MediaDB.save('logo', base64);
        [headerLogoImg, footerLogoImg].forEach(img => {
            if (img) {
                img.src = base64;
                img.style.display = 'block';
            }
        });
        saveToStorage(true);
    });

    handleFileUpload(heroUpload, async (base64) => {
        siteMedia.hero = 'db:hero';
        await MediaDB.save('hero', base64);
        updateHeroBackground();
        saveToStorage(true);
    });

    handleFileUpload(heroDarkUpload, async (base64) => {
        siteMedia.heroDark = 'db:heroDark';
        await MediaDB.save('heroDark', base64);
        updateHeroBackground();
        saveToStorage(true);
    });

    handleFileUpload(triplexUpload, async (base64) => {
        siteMedia.triplex = 'db:triplex';
        await MediaDB.save('triplex', base64);
        if (triplexImage) triplexImage.src = base64;
        saveToStorage(true);
    });

    for(let i=1; i<=9; i++) {
        const unitImgUpload = document.getElementById(`unit-img-${i}-upload`);
        if (unitImgUpload) {
            handleFileUpload(unitImgUpload, async (base64) => {
                siteMedia[`unit${i}`] = `db:unit${i}`;
                await MediaDB.save(`unit${i}`, base64);
                renderUnitZones();
                saveToStorage(true);
            });
        }
    }

    handleFileUpload(galleryUploadMultiple, async (base64) => {
        const key = `gallery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await MediaDB.save(key, base64);
        siteMedia.gallery.push(`db:${key}`);
        
        // Temporarily replace db: key with actual base64 for rendering in current session
        const renderList = siteMedia.gallery.map(k => k.startsWith('db:') ? base64 : k);
        renderGalleryWithImages(renderList);
        saveToStorage(true);
    });

    // --- Gallery Rendering & Interaction ---
    const prevBtn = document.getElementById('gallery-prev');
    const nextBtn = document.getElementById('gallery-next');

    // Drag-to-scroll state
    let isDragging = false;
    let dragStartX = 0;
    let dragScrollLeft = 0;
    let dragVelocity = 0;
    let dragLastX = 0;
    let dragLastTime = 0;
    let dragMoved = false;
    let momentumID = null;

    const stopMomentum = () => {
        if (momentumID) { cancelAnimationFrame(momentumID); momentumID = null; }
    };

    const applyMomentum = () => {
        if (Math.abs(dragVelocity) > 0.3) {
            galleryContainer.scrollLeft -= dragVelocity;
            dragVelocity *= 0.92;
            momentumID = requestAnimationFrame(applyMomentum);
        } else {
            dragVelocity = 0;
            galleryContainer.classList.remove('grabbing');
        }
    };

    const getColumnWidth = () => {
        const firstItem = galleryContainer ? galleryContainer.querySelector('.gallery-item') : null;
        if (firstItem) return firstItem.offsetWidth + 24; // 24 = gap (1.5rem)
        return 340;
    };

    const renderGalleryWithImages = (images) => {
        if (!galleryContainer) return;
        galleryContainer.innerHTML = '';
        images.forEach((img, idx) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            const imgEl = document.createElement('img');
            imgEl.src = img;
            imgEl.alt = 'Galerie';
            imgEl.draggable = false; // prevent native drag
            item.appendChild(imgEl);

            // Lightbox only on real click (not drag)
            item.addEventListener('click', (e) => {
                if (!dragMoved) {
                    if (typeof window.openLightbox === 'function') window.openLightbox(img);
                }
            });
            galleryContainer.appendChild(item);
        });

        const hasOverflow = images.length > 4;
        if (prevBtn) prevBtn.style.display = hasOverflow ? 'flex' : 'none';
        if (nextBtn) nextBtn.style.display = hasOverflow ? 'flex' : 'none';
    };

    // Arrow buttons: click-to-scroll by one column width
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            stopMomentum();
            galleryContainer.scrollBy({ left: -getColumnWidth(), behavior: 'smooth' });
        });
        prevBtn.addEventListener('mousedown', (e) => e.stopPropagation());
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            stopMomentum();
            galleryContainer.scrollBy({ left: getColumnWidth(), behavior: 'smooth' });
        });
        nextBtn.addEventListener('mousedown', (e) => e.stopPropagation());
    }

    // Drag-to-scroll: true 1:1 mouse tracking, no smooth scroll interference
    if (galleryContainer) {
        // Remove smooth scroll during interaction (set via JS, not CSS)
        galleryContainer.addEventListener('mousedown', (e) => {
            // Only left mouse button
            if (e.button !== 0) return;
            isDragging = true;
            dragMoved = false;
            stopMomentum();
            galleryContainer.classList.add('grabbing');
            dragStartX = e.clientX;
            dragScrollLeft = galleryContainer.scrollLeft;
            dragLastX = e.clientX;
            dragLastTime = performance.now();
            dragVelocity = 0;
            e.preventDefault();
        });

        // Use window to catch mouseup even if mouse leaves container
        window.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            galleryContainer.classList.remove('grabbing');
            // Start momentum if moved
            if (dragMoved && Math.abs(dragVelocity) > 0.5) {
                momentumID = requestAnimationFrame(applyMomentum);
            } else {
                dragVelocity = 0;
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();

            const dx = e.clientX - dragStartX;
            if (Math.abs(dx) > 4) dragMoved = true;

            // 1:1 scroll with mouse
            galleryContainer.scrollLeft = dragScrollLeft - dx;

            // Track velocity (pixels per ms, averaged over last frame)
            const now = performance.now();
            const dt = now - dragLastTime;
            if (dt > 0) {
                // Smooth velocity with exponential moving average
                const instantVel = (e.clientX - dragLastX) / dt * 16;
                dragVelocity = dragVelocity * 0.6 + instantVel * 0.4;
            }
            dragLastX = e.clientX;
            dragLastTime = now;
        });

        // Touch support
        let touchStartX = 0;
        let touchScrollLeft = 0;
        let touchLastX = 0;
        let touchLastTime = 0;
        let touchVelocity = 0;
        let touchMoved = false;

        galleryContainer.addEventListener('touchstart', (e) => {
            stopMomentum();
            touchStartX = e.touches[0].clientX;
            touchScrollLeft = galleryContainer.scrollLeft;
            touchLastX = touchStartX;
            touchLastTime = performance.now();
            touchVelocity = 0;
            touchMoved = false;
            dragMoved = false;
        }, { passive: true });

        galleryContainer.addEventListener('touchmove', (e) => {
            const dx = e.touches[0].clientX - touchStartX;
            if (Math.abs(dx) > 4) { touchMoved = true; dragMoved = true; }
            galleryContainer.scrollLeft = touchScrollLeft - dx;

            const now = performance.now();
            const dt = now - touchLastTime;
            if (dt > 0) {
                const instantVel = (e.touches[0].clientX - touchLastX) / dt * 16;
                touchVelocity = touchVelocity * 0.6 + instantVel * 0.4;
            }
            touchLastX = e.touches[0].clientX;
            touchLastTime = now;
        }, { passive: true });

        galleryContainer.addEventListener('touchend', () => {
            if (touchMoved && Math.abs(touchVelocity) > 0.5) {
                dragVelocity = touchVelocity;
                momentumID = requestAnimationFrame(applyMomentum);
            }
        });
    }

    const renderGallery = async () => {
        if (!galleryContainer) return;
        const images = [];
        for (const key of siteMedia.gallery) {
            if (key.startsWith('db:')) {
                const data = await MediaDB.load(key.split(':')[1]);
                if (data) images.push(data);
            } else {
                images.push(key);
            }
        }
        renderGalleryWithImages(images);
    };

    const agentPhotoUpload = document.getElementById('agent-photo-upload');
    const agentPhotoDisplay = document.getElementById('agent-photo-display');
    const agentPhotoPlaceholder = document.getElementById('agent-photo-placeholder');

    // Agent name live-update
    if (agentNameInput) {
        agentNameInput.addEventListener('input', (e) => {
            const display = document.getElementById('editable-agent-name');
            if (display) display.textContent = e.target.value || 'Jan Novák';
        });
    }

    handleFileUpload(agentPhotoUpload, async (base64) => {
        siteMedia.agent = 'db:agent';
        await MediaDB.save('agent', base64);
        if (agentPhotoDisplay) {
            agentPhotoDisplay.src = base64;
            agentPhotoDisplay.style.display = 'block';
            if (agentPhotoPlaceholder) agentPhotoPlaceholder.style.display = 'none';
        }
        saveToStorage(true);
    });

    // --- Partners Logic ---
    const partnersGrid = document.getElementById('partners-grid');
    
    const renderPartners = async () => {
        if (!partnersGrid) return;
        partnersGrid.innerHTML = '';
        
        for (const partner of partnersData) {
            if (partner.logo) {
                let logoSrc = partner.logo;
                if (logoSrc.startsWith('db:')) {
                    const data = await MediaDB.load(logoSrc.split(':')[1]);
                    if (data) logoSrc = data;
                }
                
                const item = document.createElement('a');
                item.href = partner.url || '#';
                item.target = '_blank';
                item.rel = 'noopener noreferrer';
                item.className = 'partner-item';
                
                const img = document.createElement('img');
                img.src = logoSrc;
                img.alt = 'Partner';
                img.style.cssText = 'max-width: 100%; max-height: 100%; object-fit: contain; filter: grayscale(1); opacity: 0.55; transition: all 0.35s ease;';
                item.appendChild(img);
                
                item.addEventListener('mouseenter', () => {
                    img.style.filter = 'grayscale(0) saturate(1.2)';
                    img.style.opacity = '1';
                    img.style.transform = 'scale(1.08)';
                });
                item.addEventListener('mouseleave', () => {
                    img.style.filter = 'grayscale(1)';
                    img.style.opacity = '0.55';
                    img.style.transform = 'scale(1)';
                });
                
                partnersGrid.appendChild(item);
            }
        }
    };

    // Partner Admin Listeners
    for(let i=1; i<=6; i++) {
        const logoInput = document.getElementById(`partner-logo-${i}-upload`);
        const urlInput = document.getElementById(`partner-url-${i}-input`);
        
        if (logoInput) {
            handleFileUpload(logoInput, async (base64) => {
                const key = `partner_logo_${i}`;
                await MediaDB.save(key, base64);
                partnersData[i-1].logo = `db:${key}`;
                saveToStorage(true);
                renderPartners();
            });
        }
        
        if (urlInput) {
            urlInput.addEventListener('input', (e) => {
                partnersData[i-1].url = e.target.value;
                renderPartners(); // Live update links
            });
        }
    }

    clearGalleryBtn.addEventListener('click', () => {
        if (confirm('Opravdu chcete smazat všechny fotky v galerii?')) {
            siteMedia.gallery = [];
            renderGallery();
        }
    });

    // Icons Library
    const icons = {
        home: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
        map: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
        settings: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
        leaf: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 8a7 7 0 0 1-9 10z"></path><path d="M7 21l3-4"></path></svg>`,
        shield: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
        car: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="10" width="22" height="8" rx="2"></rect><path d="M7 10l2-6h6l2 6"></path><circle cx="7" cy="18" r="2"></circle><circle cx="17" cy="18" r="2"></circle></svg>`,
        sun: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
        compass: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`,
        trendingUp: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
        bricks: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="12" y1="3" x2="12" y2="9"></line><line x1="8" y1="9" x2="8" y2="15"></line><line x1="16" y1="9" x2="16" y2="15"></line><line x1="12" y1="15" x2="12" y2="21"></line></svg>`,
        pipe: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21v-6M12 9V3M4 12h16M16 12l-4-4-4 4M16 12l-4 4-4-4"></path><circle cx="12" cy="12" r="9"></circle></svg>`,
        heating: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"></rect><line x1="7" y1="5" x2="7" y2="19"></line><line x1="12" y1="5" x2="12" y2="19"></line><line x1="17" y1="5" x2="17" y2="19"></line></svg>`,
        star: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
        heart: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`
    };

    let projectCards = [
        { title: 'Architektura', text: 'Minimalistické linie a přírodní materiály.', icon: 'home' },
        { title: 'Lokalita', text: 'Klidné prostředí s výbornou dostupností.', icon: 'map' },
        { title: 'Standardy', text: 'Tepelná čerpadla a inteligentní domácnost.', icon: 'settings' }
    ];

    const cardsContainer = document.getElementById('cards-container');
    const adminCardsContainer = document.getElementById('admin-cards-container');
    const addCardBtn = document.getElementById('add-card-btn');

    const renderWebCards = () => {
        if (!cardsContainer) return;
        cardsContainer.innerHTML = '';
        projectCards.forEach(card => {
            const el = document.createElement('div');
            el.className = 'card';
            el.innerHTML = `
                <div class="card-icon">${icons[card.icon] || icons.home}</div>
                <h3>${card.title}</h3>
                <p>${card.text}</p>
            `;
            cardsContainer.appendChild(el);
        });
    };

    const renderUnitZones = async () => {
        const overlay = document.getElementById('unit-overlay');
        const mainImage = document.querySelector('.units-image');
        if (!overlay) return;
        overlay.innerHTML = '';
        
        const rgbaColor = hexToRgba(unitsConfig.hoverColorHex, unitsConfig.hoverOpacity);
        root.style.setProperty('--unit-hover-color', rgbaColor);
        const pinColor = unitsConfig.pinColorHex || '#c5a059';
        root.style.setProperty('--pin-color', pinColor);
        root.style.setProperty('--pin-color-rgba', hexToRgba(pinColor, 70));

        if(unitsConfig.separateImages) {
            overlay.classList.add('separate-mode');
            if(mainImage) mainImage.style.display = 'none';
        } else {
            overlay.classList.remove('separate-mode');
            if(mainImage) mainImage.style.display = 'block';
        }

        let htmlString = '';
        const isPins = unitsConfig.mode === 'pins';

        for(let i=1; i<=unitsConfig.count; i++) {
            const data = unitsData[i];
            if(!data) continue;

            const flexValue = unitsConfig.widths[i] || (100 / unitsConfig.count);

            let bgHtml = '';
            let extraClass = '';
            let styleAttr = '';

            if(isPins) {
                extraClass = 'unit-pin-mode';
                const px = unitsConfig.pins[i] ? unitsConfig.pins[i].x : 50;
                const py = unitsConfig.pins[i] ? unitsConfig.pins[i].y : 50;
                const ps = unitsConfig.pins[i] && unitsConfig.pins[i].s ? unitsConfig.pins[i].s / 100 : 1;
                styleAttr = `style="left: ${px}%; top: ${py}%; --pin-scale: ${ps};"`;
            } else {
                styleAttr = `style="flex: ${flexValue}"`;
                if(unitsConfig.separateImages) {
                    extraClass = 'bg-zone';
                    let bgSource = siteMedia[`unit${i}`] || '';
                    
                    if (bgSource.startsWith('db:')) {
                        try {
                            const data = await MediaDB.load(`unit${i}`);
                            if (data) bgSource = data;
                            else bgSource = '';
                        } catch(e) { bgSource = ''; }
                    }

                    if(bgSource) {
                        bgHtml = `<div style="position: absolute; top:0; left:0; width:100%; height:100%; background-image: url('${bgSource}'); background-size: cover; background-position: center; z-index: -1;"></div>`;
                    }
                }
            }

            htmlString += `
                <div class="unit-zone ${extraClass}" onclick="openUnit(${i})" ${styleAttr}>
                    ${bgHtml}
                    ${isPins ? `<div class="pin-marker"><span>${String.fromCharCode(64 + i)}</span></div>` : ''}
                    <div class="unit-footer-compact">
                        <span class="unit-status ${data.status}" id="status-${i}">${data.statusText}</span>
                        <span class="unit-label">${data.name.toUpperCase()}</span>
                    </div>
                    <div class="unit-details-compact">
                        <span id="unit-price-${i}-display" class="price">${data.price || '---'}</span>
                        <span id="unit-layout-${i}-display" class="layout">${data.layout || '---'}</span>
                        <div class="specs-mini">
                            <span class="spec-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg><span id="unit-area-${i}-display">${data.area ? data.area + ' m²' : '---'}</span></span>
                            <span class="spec-divider">|</span>
                            <span class="spec-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 8a7 7 0 0 1-9 10z"></path></svg><span id="unit-garden-${i}-display">${data.garden ? data.garden + ' m²' : '---'}</span></span>
                        </div>
                    </div>
                </div>
            `;
        }
        overlay.insertAdjacentHTML('beforeend', htmlString);
    };

    const renderAdminCards = () => {
        if (!adminCardsContainer) return;
        adminCardsContainer.innerHTML = '';
        projectCards.forEach((card, index) => {
            const el = document.createElement('div');
            el.style.marginBottom = '1.5rem';
            el.style.padding = '1rem';
            el.style.background = 'rgba(0,0,0,0.03)';
            el.style.borderRadius = '8px';
            el.style.position = 'relative';

            let iconOptions = '';
            Object.keys(icons).forEach(key => {
                iconOptions += `<option value="${key}" ${card.icon === key ? 'selected' : ''}>${key.charAt(0).toUpperCase() + key.slice(1)}</option>`;
            });

            el.innerHTML = `
                <button style="position: absolute; top: 5px; right: 5px; background: #ff4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 10px;" onclick="removeCard(${index})">×</button>
                <div class="control-group">
                    <label>Ikona</label>
                    <select onchange="updateCard(${index}, 'icon', this.value)">${iconOptions}</select>
                </div>
                <div class="control-group">
                    <input type="text" value="${card.title}" placeholder="Nadpis" oninput="updateCard(${index}, 'title', this.value)">
                    <textarea class="admin-input" placeholder="Text" oninput="updateCard(${index}, 'text', this.value)" style="height: 60px;">${card.text}</textarea>
                </div>
            `;
            adminCardsContainer.appendChild(el);
        });
    };

    window.updateCard = (index, key, value) => {
        projectCards[index][key] = value;
        renderWebCards();
    };

    window.removeCard = (index) => {
        projectCards.splice(index, 1);
        renderAdminCards();
        renderWebCards();
    };

    addCardBtn.addEventListener('click', () => {
        projectCards.push({ title: 'Nový benefit', text: 'Popis benefitu...', icon: 'star' });
        renderAdminCards();
        renderWebCards();
    });

    // Content Sync
    const updateContent = (input, element, defaultText) => {
        if (!input || !element) return;
        input.addEventListener('input', (e) => {
            element.textContent = e.target.value || defaultText;
            if (element === webLogo && footerLogoText) {
                footerLogoText.textContent = e.target.value || defaultText;
            }
        });
    };

    updateContent(logoInput, webLogo, 'MODERNÍ BYDLENÍ');
    updateContent(heroTitleInput, heroTitle, 'Domov, kde začíná vaše nová etapa');
    updateContent(heroTextInput, heroText, 'Objevte moderní architekturu...');
    updateContent(aboutTitleInput, aboutTitle, 'O projektu');
    updateContent(aboutTextInput, aboutText, 'Moderní design...');
    
    updateContent(contactTitleInput, contactTitle, 'Máte dotaz?');
    updateContent(contactTextInput, contactText, 'Náš tým je vám k dispozici...');
    updateContent(contactPhoneInput, contactPhone, '+420 123 456 789');
    updateContent(contactEmailInput, contactEmail, 'info@modernibydleni.cz');

    // Keep phone/email href in sync
    if (contactPhoneInput) {
        contactPhoneInput.addEventListener('input', (e) => {
            const phoneLink = document.getElementById('editable-contact-phone-link');
            if (phoneLink) phoneLink.href = 'tel:' + e.target.value.replace(/\s/g, '');
        });
    }
    if (contactEmailInput) {
        contactEmailInput.addEventListener('input', (e) => {
            const emailRow = document.querySelector('.agent-info-row[href^="mailto:"]');
            if (emailRow) emailRow.href = 'mailto:' + e.target.value;
        });
    }
    
    if (subtitleInput) {
        subtitleInput.addEventListener('input', (e) => {
            const text = e.target.value;
            if (webSubtitle) webSubtitle.textContent = text;
            if (footerSubtitle) footerSubtitle.textContent = text;
            saveToStorage(true);
        });
    }

    fbLinkInput.addEventListener('input', (e) => fbLink.href = e.target.value || '#');
    igLinkInput.addEventListener('input', (e) => igLink.href = e.target.value || '#');
    updateContent(heroTitleInput, heroTitle, 'Domov, kde začíná vaše nová etapa');
    updateContent(heroTextInput, heroText, 'Objevte moderní architekturu v srdci přírody.');
    updateContent(aboutTitleInput, aboutTitle, 'O projektu');
    updateContent(aboutTextInput, aboutText, 'Moderní design, funkčnost a nejvyšší standardy.');

    cardInputs.forEach(card => {
        updateContent(card.title, card.titleEl, 'Nadpis');
        updateContent(card.text, card.textEl, 'Popis výhody projektu.');
    });

    // GPS
    const handleGPSUpdate = () => {
        const lat = parseFloat(gpsLatInput.value) || 50.0755;
        const lng = parseFloat(gpsLngInput.value) || 14.4378;
        mapCoords = { lat, lng };
        initMap(lat, lng);
        if (typeof saveToStorage === 'function') saveToStorage(true);
    };
    gpsLatInput.addEventListener('change', handleGPSUpdate);
    gpsLngInput.addEventListener('change', handleGPSUpdate);
    cadastralMapInput.addEventListener('change', handleGPSUpdate);

    // Units Logic
    Object.keys(unitInputs).forEach(id => {
        const inputs = unitInputs[id];
        
        inputs.status.addEventListener('change', (e) => {
            const badge = document.getElementById(`status-${id}`);
            if (badge) {
                badge.className = `unit-status ${e.target.value}`;
                badge.textContent = e.target.options[e.target.selectedIndex].text;
            }
            unitsData[id].status = e.target.value;
            unitsData[id].statusText = e.target.options[e.target.selectedIndex].text;
        });

        inputs.price.addEventListener('input', (e) => unitsData[id].price = e.target.value);
        inputs.layout.addEventListener('input', (e) => unitsData[id].layout = e.target.value);
        inputs.area.addEventListener('input', (e) => unitsData[id].area = e.target.value);
        inputs.garden.addEventListener('input', (e) => unitsData[id].garden = e.target.value);
        inputs.parking.addEventListener('input', (e) => unitsData[id].parking = e.target.value);
        inputs.desc.addEventListener('input', (e) => unitsData[id].desc = e.target.value);

        handleFileUpload(inputs.pdfKarta, (base64) => unitsData[id].pdfKarta = base64);
        handleFileUpload(inputs.pdfStandardy, (base64) => unitsData[id].pdfStandardy = base64);
    });

    // --- Modal Logic ---
    window.openUnit = (id) => {
        const data = unitsData[id];
        document.getElementById('modal-unit-name').textContent = data.name;
        document.getElementById('modal-unit-desc').textContent = data.desc;
        document.getElementById('spec-layout').textContent = data.layout;
        document.getElementById('spec-area').textContent = data.area;
        document.getElementById('spec-garden').textContent = data.garden;
        document.getElementById('spec-parking').textContent = data.parking;
        document.getElementById('spec-price').textContent = data.price;
        
        const btnKarta = document.getElementById('btn-karta-bytu');
        const btnStandardy = document.getElementById('btn-standardy');

        btnKarta.href = data.pdfKarta || '#';
        btnKarta.style.opacity = data.pdfKarta ? '1' : '0.5';
        btnKarta.download = `karta_bytu_${data.name.replace(' ', '_')}.pdf`;

        btnStandardy.href = data.pdfStandardy || '#';
        btnStandardy.style.opacity = data.pdfStandardy ? '1' : '0.5';
        btnStandardy.download = `standardy_${data.name.replace(' ', '_')}.pdf`;
        
        modal.classList.add('active');
    };

    window.closeModal = () => modal.classList.remove('active');

    // --- Lightbox Logic ---
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');

    window.openLightbox = (src) => {
        if(lightboxImg && lightboxModal) {
            lightboxImg.src = src;
            lightboxModal.style.display = 'flex';
            setTimeout(() => lightboxModal.style.opacity = '1', 10);
        }
    };

    window.closeLightbox = () => {
        if(lightboxModal) {
            lightboxModal.style.opacity = '0';
            setTimeout(() => lightboxModal.style.display = 'none', 300);
        }
    };

    if(lightboxClose) lightboxClose.addEventListener('click', window.closeLightbox);
    if(lightboxModal) lightboxModal.addEventListener('click', (e) => {
        if(e.target === lightboxModal) window.closeLightbox();
    });

    // --- Persistence ---
    const saveToStorage = (silent = false) => {
        const config = {
            styles: {
                primary: primaryColorInput.value || '#1a1a1a',
                accent: accentColorInput.value || '#c5a059',
                fontHeading: fontHeadingInput.value,
                logoSize: logoSizeInput.value,
                darkMode: darkModeInput.checked,
                showCadastral: cadastralMapInput.checked
            },
            content: {
                logo: logoInput.value,
                subtitle: subtitleInput.value,
                heroTitle: heroTitleInput.value,
                heroText: heroTextInput.value,
                aboutTitle: aboutTitleInput.value,
                aboutText: aboutTextInput.value,
                contactTitle: contactTitleInput.value,
                contactText: contactTextInput.value,
                contactPhone: contactPhoneInput.value,
                contactEmail: contactEmailInput.value,
                fbLink: fbLinkInput.value,
                igLink: igLinkInput.value,
                agentName: agentNameInput.value,
                projectCards: projectCards
            },
            media: siteMedia,
            location: mapCoords,
            units: unitsData,
            unitsConfig: unitsConfig,
            partners: partnersData
        };
        try {
            localStorage.setItem('web_prodej_ultra_v3_config', JSON.stringify(config));
            if (!silent) alert('Změny uloženy!');
        } catch (e) {
            console.error('Save error:', e);
            alert('Chyba: Paměť prohlížeče je plná. Budu se snažit uložit, co jde.');
        }
    };

    const loadFromStorage = async () => {
        // Initialize map immediately with defaults, will update coordinates if found in config
        initMap(mapCoords.lat, mapCoords.lng);

        const saved = localStorage.getItem('web_prodej_ultra_v3_config');
        if (saved) {
            const config = JSON.parse(saved);
            
            root.style.setProperty('--primary-color', config.styles.primary);
            root.style.setProperty('--accent-color', config.styles.accent);
            root.style.setProperty('--font-heading', config.styles.fontHeading);
            primaryColorInput.value = config.styles.primary;
            accentColorInput.value = config.styles.accent;
            fontHeadingInput.value = config.styles.fontHeading;
            if (config.styles.darkMode !== undefined) toggleDarkMode(config.styles.darkMode);
            if (config.styles.showCadastral !== undefined) cadastralMapInput.checked = config.styles.showCadastral;
            if (config.styles.logoSize !== undefined) {
                const size = config.styles.logoSize;
                logoSizeInput.value = size;
                root.style.setProperty('--logo-size', size + 'px');
                root.style.setProperty('--logo-size-footer', (size * 0.75) + 'px');
            }

            if (config.unitsConfig) {
                unitsConfig = config.unitsConfig;
                if(unitsCountInput) unitsCountInput.value = unitsConfig.count;
                if(unitsColorInput) unitsColorInput.value = unitsConfig.hoverColorHex;
                if(pinColorInput) pinColorInput.value = unitsConfig.pinColorHex || '#c5a059';
                if(unitsOpacityInput) unitsOpacityInput.value = unitsConfig.hoverOpacity;
                
                // Restore all widths
                for(let i=1; i<=9; i++) {
                    if(widthSliders[i] && unitsConfig.widths[i]) widthSliders[i].value = unitsConfig.widths[i];
                    if(widthNumbers[i] && unitsConfig.widths[i]) widthNumbers[i].value = unitsConfig.widths[i];
                }
                
                updateAdminUnitsVisibility();
            }

            const c = config.content;
            webLogo.textContent = c.logo || 'MODERNÍ BYDLENÍ';
            if (footerLogoText) footerLogoText.textContent = c.logo || 'MODERNÍ BYDLENÍ';
            heroTitle.textContent = c.heroTitle || 'Domov, kde začíná vaše nová etapa';
            heroText.textContent = c.heroText || 'Objevte moderní architekturu...';
            aboutTextInput.value = c.aboutText || '';
            
            if (c.subtitle !== undefined) {
                const subText = c.subtitle;
                if (webSubtitle) webSubtitle.textContent = subText;
                if (footerSubtitle) footerSubtitle.textContent = subText;
                if (subtitleInput) subtitleInput.value = c.subtitle;
            }

            if (config.media) {
                siteMedia = config.media;
                // Load images from DB if keys are found
                try {
                    if (siteMedia.logo && siteMedia.logo.startsWith('db:')) {
                        const data = await MediaDB.load('logo');
                        if (data) [headerLogoImg, footerLogoImg].forEach(img => { if (img) { img.src = data; img.style.display = 'block'; } });
                    }
                    
                    await updateHeroBackground();
                    
                    if (siteMedia.triplex && siteMedia.triplex.startsWith('db:')) {
                        const data = await MediaDB.load('triplex');
                        if (data && triplexImage) triplexImage.src = data;
                    }

                    if (siteMedia.agent && siteMedia.agent.startsWith('db:')) {
                        const data = await MediaDB.load('agent');
                        if (data && agentPhotoDisplay) {
                            agentPhotoDisplay.src = data;
                            agentPhotoDisplay.style.display = 'block';
                            if (agentPhotoPlaceholder) agentPhotoPlaceholder.style.display = 'none';
                        }
                    }

                    // Gallery load
                    if (siteMedia.gallery && siteMedia.gallery.length > 0) {
                        try {
                            await renderGallery();
                        } catch(e) { console.warn('Silently ignore load issues if gallery ref fails'); }
                    }
                } catch (e) {
                    console.error('Error loading media from IndexedDB:', e);
                }
            }

            if (config.location) {
                mapCoords = config.location;
                gpsLatInput.value = mapCoords.lat;
                gpsLngInput.value = mapCoords.lng;
            }

            if (config.partners) {
                partnersData = config.partners;
                for(let i=1; i<=6; i++) {
                    const urlInput = document.getElementById(`partner-url-${i}-input`);
                    if (urlInput && partnersData[i-1]) urlInput.value = partnersData[i-1].url || '';
                }
                renderPartners();
            }
            
            // Apply map state and cadastral layers now that config is loaded
            initMap(mapCoords.lat, mapCoords.lng);
            if (config.units) unitsData = config.units;

            // Agent info (text)
            const agentNameDisplay = document.getElementById('editable-agent-name');
            if (agentNameDisplay) agentNameDisplay.textContent = c.agentName || 'Jan Novák';
            agentNameInput.value = c.agentName || '';
            contactTitleInput.value = c.contactTitle || '';
            contactTextInput.value = c.contactText || '';
            contactPhoneInput.value = c.contactPhone || '';
            contactEmailInput.value = c.contactEmail || '';
            fbLinkInput.value = c.fbLink || '';
            igLinkInput.value = c.igLink || '';

            // Sync link hrefs from loaded data
            const phoneLink = document.getElementById('editable-contact-phone-link');
            if (phoneLink && c.contactPhone) phoneLink.href = 'tel:' + c.contactPhone.replace(/\s/g, '');
            const emailRow = document.querySelector('.agent-info-row[href^="mailto:"]');
            if (emailRow && c.contactEmail) emailRow.href = 'mailto:' + c.contactEmail;

            if (c.projectCards) {
                projectCards = c.projectCards;
            }
            renderWebCards();
            renderAdminCards();

            // Sync units UI
            updateAdminUnitsVisibility();
            renderUnitZones();
            Object.keys(unitsData).forEach(id => {
                const badge = document.getElementById(`status-${id}`);
                if (badge) {
                    badge.className = `unit-status ${unitsData[id].status}`;
                    badge.textContent = unitsData[id].statusText;
                }
                const inputs = unitInputs[id];
                if (inputs) {
                    inputs.status.value = unitsData[id].status;
                    inputs.price.value = unitsData[id].price;
                    inputs.layout.value = unitsData[id].layout || '';
                    inputs.area.value = unitsData[id].area || '';
                    inputs.garden.value = unitsData[id].garden || '';
                    inputs.parking.value = unitsData[id].parking || '';
                    inputs.desc.value = unitsData[id].desc || '';
                    
                    const priceDisplay = document.getElementById(`unit-price-${id}-display`);
                    const layoutDisplay = document.getElementById(`unit-layout-${id}-display`);
                    const areaDisplay = document.getElementById(`unit-area-${id}-display`);
                    const gardenDisplay = document.getElementById(`unit-garden-${id}-display`);

                    if (priceDisplay) priceDisplay.textContent = unitsData[id].price || '---';
                    if (layoutDisplay) layoutDisplay.textContent = unitsData[id].layout || '---';
                    if (areaDisplay) areaDisplay.textContent = unitsData[id].area ? unitsData[id].area + ' m²' : '---';
                    if (gardenDisplay) gardenDisplay.textContent = unitsData[id].garden ? unitsData[id].garden + ' m²' : '---';
                }
            });
        }
        // Final update with correct coordinates if they were loaded
        initMap(mapCoords.lat, mapCoords.lng);
    };

    saveBtn.addEventListener('click', () => saveToStorage(false));
    
    // Start the loading sequence
    (async () => {
        await loadFromStorage();
        renderWebCards();
        renderAdminCards();
    })();
});

// ===== COOKIE CONSENT LOGIC (outside DOMContentLoaded for early init) =====
(function() {
    const COOKIE_KEY = 'web_prodej_cookie_consent';
    const EXPIRY_DAYS = 365;

    const banner      = document.getElementById('cookie-banner');
    const modal       = document.getElementById('cookie-modal');
    const openBtn     = document.getElementById('cookies-open-btn');
    const modalClose  = document.getElementById('cookie-modal-close');
    const acceptBtn   = document.getElementById('cookie-accept-btn');
    const rejectBtn   = document.getElementById('cookie-reject-btn');
    const settingsBtn = document.getElementById('cookie-settings-btn');
    const saveBtn     = document.getElementById('cookie-save-btn');
    const acceptAllModalBtn = document.getElementById('cookie-accept-all-modal-btn');
    const analyticsToggle   = document.getElementById('cookie-analytics');
    const marketingToggle   = document.getElementById('cookie-marketing');

    const getConsent = () => {
        try {
            const raw = localStorage.getItem(COOKIE_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (data.expires && Date.now() > data.expires) {
                localStorage.removeItem(COOKIE_KEY);
                return null;
            }
            return data;
        } catch { return null; }
    };

    const saveConsent = (analytics, marketing) => {
        const expires = Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        localStorage.setItem(COOKIE_KEY, JSON.stringify({ analytics, marketing, expires }));
    };

    const hideBanner = () => { if (banner) banner.style.display = 'none'; };
    const hideModal  = () => { if (modal)  modal.style.display  = 'none'; };
    const showModal  = () => {
        if (!modal) return;
        // Sync toggles with saved state
        const consent = getConsent();
        if (analyticsToggle)  analyticsToggle.checked  = consent?.analytics  || false;
        if (marketingToggle)  marketingToggle.checked  = consent?.marketing  || false;
        modal.style.display = 'flex';
    };

    // Show banner if no consent saved
    if (!getConsent()) {
        if (banner) banner.style.display = 'block';
    }

    // Accept all
    if (acceptBtn) acceptBtn.addEventListener('click', () => {
        saveConsent(true, true);
        hideBanner();
    });

    // Reject (only necessary)
    if (rejectBtn) rejectBtn.addEventListener('click', () => {
        saveConsent(false, false);
        hideBanner();
    });

    // Open settings from banner
    if (settingsBtn) settingsBtn.addEventListener('click', () => {
        hideBanner();
        showModal();
    });

    // Open settings from cookie button next to social icons
    if (openBtn) openBtn.addEventListener('click', () => showModal());

    // Close modal
    if (modalClose) modalClose.addEventListener('click', hideModal);
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });

    // Save custom settings
    if (saveBtn) saveBtn.addEventListener('click', () => {
        saveConsent(analyticsToggle?.checked || false, marketingToggle?.checked || false);
        hideModal();
    });

    // Accept all from modal
    if (acceptAllModalBtn) acceptAllModalBtn.addEventListener('click', () => {
        if (analyticsToggle)  analyticsToggle.checked  = true;
        if (marketingToggle)  marketingToggle.checked  = true;
        saveConsent(true, true);
        hideModal();
    });

    // Escape key closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.style.display === 'flex') hideModal();
    });
})();
