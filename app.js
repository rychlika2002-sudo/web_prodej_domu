document.addEventListener('DOMContentLoaded', () => {
    // --- Data Model for Units ---
    let unitsData = {
        1: { name: 'Jednotka 1', desc: 'Luxusní bytová jednotka s vlastní zahradou a dvěma parkovacími místy.', layout: '5+kk', area: '145', garden: '210', parking: '2 místa', price: '8 490 000 Kč', status: 'status-available', statusText: 'Volno', pdfKarta: '', pdfStandardy: '' },
        2: { name: 'Jednotka 2', desc: 'Moderní rodinné bydlení s prostornou terasou v patře.', layout: '4+kk', area: '132', garden: '180', parking: '2 místa', price: '7 990 000 Kč', status: 'status-reserved', statusText: 'Rezervováno', pdfKarta: '', pdfStandardy: '' },
        3: { name: 'Jednotka 3', desc: 'Útulný dům ideální pro mladou rodinu s výhledem do zeleně.', layout: '4+kk', area: '128', garden: '150', parking: '2 místa', price: '7 490 000 Kč', status: 'status-sold', statusText: 'Prodáno', pdfKarta: '', pdfStandardy: '' },
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
        hoverColorHex: '#c5a059',
        pinColorHex: '#c5a059',
        hoverOpacity: 40,
        reservedColorHex: '#e67e22',
        reservedOpacity: 40,
        soldColorHex: '#e74c3c',
        soldOpacity: 45,
        strokeColorHex: '#ffffff',
        strokeWidth: 2,
        widths: { 1: 33.3, 2: 33.3, 3: 33.3, 4: 25, 5: 20, 6: 16, 7: 14, 8: 12, 9: 11 },
        pins: { 
            1: {x: 50, y: 50, s: 100}, 2: {x: 50, y: 50, s: 100}, 3: {x: 50, y: 50, s: 100}, 
            4: {x: 50, y: 50, s: 100}, 5: {x: 50, y: 50, s: 100}, 6: {x: 50, y: 50, s: 100},
            7: {x: 50, y: 50, s: 100}, 8: {x: 50, y: 50, s: 100}, 9: {x: 50, y: 50, s: 100}
        },
        polygons: {
            1: "25,395 325,350 330,750 30,780",
            2: "338,348 640,345 640,745 342,750",
            3: "655,345 970,390 960,780 655,745",
            4: "", 5: "", 6: "", 7: "", 8: "", 9: ""
        },
        zoom: 100
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
    const DEFAULT_ZOOM = 17;

    let tileLayer;
    const initMap = (lat, lng) => {
        lat = parseFloat(lat);
        lng = parseFloat(lng);
        if (isNaN(lat)) lat = 50.0755;
        if (isNaN(lng)) lng = 14.4378;
        const diag = document.getElementById('map-diagnostic');
        const tileUrl = 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
        const attribution = '&copy; Google Maps';

        try {
            if (typeof L === 'undefined') throw new Error('Leaflet knihovna (L) není načtena. Zkontrolujte připojení k internetu.');

            if (!map) {
                const mapContainer = document.getElementById('map');
                if (!mapContainer) throw new Error('Kontejner #map nebyl nalezen v DOMu.');

                map = L.map('map', { 
                    scrollWheelZoom: false,
                    zoomControl: true 
                }).setView([lat, lng], DEFAULT_ZOOM);

                tileLayer = L.tileLayer(tileUrl, {
                    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                    maxZoom: 20,
                    attribution: attribution
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

    // Polygon Config Inputs
    const adminPolygonSettings = document.getElementById('admin-polygon-settings');
    const polygonCountInput = document.getElementById('polygon-count-input');
    const polygonCountBadge = document.getElementById('polygon-count-badge');
    const editorUnitSelector = document.getElementById('editor-unit-selector');
    const polygonReservedColorInput = document.getElementById('polygon-reserved-color-input');
    const polygonSoldColorInput = document.getElementById('polygon-sold-color-input');
    const polygonReservedOpacityInput = document.getElementById('polygon-reserved-opacity-input');
    const polygonReservedOpacityNumber = document.getElementById('polygon-reserved-opacity-number');
    const polygonStrokeColorInput = document.getElementById('polygon-stroke-color-input');
    const polygonStrokeWidthInput = document.getElementById('polygon-stroke-width-input');
    const polygonStrokeWidthNumber = document.getElementById('polygon-stroke-width-number');

    const widthSliders = {};
    const widthNumbers = {};
    const widthContainers = {};
    const adminUnitBlocks = {};
    const polygonCoordGroups = {};
    const polygonStatusLabels = {};

    for(let i=1; i<=9; i++) {
        widthSliders[i] = document.getElementById(`units-width-${i}-input`);
        widthNumbers[i] = document.getElementById(`units-width-${i}-number`);
        widthContainers[i] = document.getElementById(`units-width-${i}-container`);
        adminUnitBlocks[i] = document.getElementById(`admin-unit-${i}-block`);
        polygonCoordGroups[i] = document.getElementById(`polygon-coord-group-${i}`);
        polygonStatusLabels[i] = document.getElementById(`polygon-status-${i}`);
    }

    const unitsModeInput = document.getElementById('units-mode-input');
    const pinInputs = {};
    for(let i=1; i<=9; i++) {
        pinInputs[i] = {
            x: document.getElementById(`pin-x-${i}-input`),
            xNum: document.getElementById(`pin-x-${i}-number`),
            y: document.getElementById(`pin-y-${i}-input`),
            yNum: document.getElementById(`pin-y-${i}-number`),
            s: document.getElementById(`pin-s-${i}-input`),
            sNum: document.getElementById(`pin-s-${i}-number`)
        };
    }

    const updateAdminUnitsVisibility = () => {
        const mode = unitsConfig.mode || 'slices';
        if(unitsModeInput) unitsModeInput.value = mode;
        const isSlices = mode === 'slices';
        const isPins = mode === 'pins';
        const isPolygons = mode === 'polygons';

        const pinCoordGroups = document.querySelectorAll('.pin-coord-group');
        pinCoordGroups.forEach(el => el.style.display = isPins ? 'block' : 'none');

        if(adminPolygonSettings) adminPolygonSettings.style.display = isPolygons ? 'block' : 'none';

        const c = unitsConfig.count || 3;
        if(unitsCountDisplay) unitsCountDisplay.textContent = c;
        if(unitsCountInput) unitsCountInput.value = c;
        if(polygonCountInput) polygonCountInput.value = c;
        if(polygonCountBadge) {
            polygonCountBadge.textContent = c === 1 ? '1 polygon' : (c < 5 ? `${c} polygony` : `${c} polygonů`);
        }
        if(editorUnitSelector) {
            const currentSelected = parseInt(editorUnitSelector.value) || 1;
            editorUnitSelector.innerHTML = '';
            for(let i=1; i<=c; i++) {
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = `Jednotka ${i}`;
                editorUnitSelector.appendChild(opt);
            }
            if (activeEditingUnit && activeEditingUnit <= c) {
                editorUnitSelector.value = activeEditingUnit;
            } else if (currentSelected <= c) {
                editorUnitSelector.value = currentSelected;
            }
        }
        
        for(let i=1; i<=9; i++) {
            const isVisible = i <= c;
            
            if(widthContainers[i]) widthContainers[i].style.display = (isVisible && isSlices && c > 1) ? 'block' : 'none';
            if(adminUnitBlocks[i]) adminUnitBlocks[i].style.display = isVisible ? 'block' : 'none';
            if(polygonCoordGroups[i]) polygonCoordGroups[i].style.display = (isVisible && isPolygons) ? 'block' : 'none';

            const idleCtrl = document.getElementById(`polygon-idle-controls-${i}`);
            const activeCtrl = document.getElementById(`polygon-active-controls-${i}`);
            const ptsEl = document.getElementById(`polygon-live-pts-${i}`);
            const isThisActive = window.isPolygonEditingActive && activeEditingUnit === i;

            if (idleCtrl) idleCtrl.style.display = isThisActive ? 'none' : 'flex';
            if (activeCtrl) activeCtrl.style.display = isThisActive ? 'flex' : 'none';
            if (isThisActive && ptsEl) {
                ptsEl.textContent = `${currentPolygonPoints.length} bodů`;
            }

            if(polygonStatusLabels[i]) {
                const poly = unitsConfig.polygons && unitsConfig.polygons[i] ? unitsConfig.polygons[i].trim() : '';
                if(poly) {
                    const ptsCount = poly.split(/\s+/).filter(Boolean).length;
                    polygonStatusLabels[i].innerHTML = `Stav: <span style="color: #27ae60; font-weight: 600;">✓ Polygon (${ptsCount} bodů)</span>`;
                } else {
                    polygonStatusLabels[i].innerHTML = `Stav: <span style="opacity: 0.6;">Žádný polygon</span>`;
                }
            }

            if(widthNumbers[i]) widthNumbers[i].value = unitsConfig.widths[i];
            if(widthSliders[i]) widthSliders[i].value = unitsConfig.widths[i];
            
            if(unitsConfig.pins && unitsConfig.pins[i]) {
                const px = unitsConfig.pins[i].x !== undefined ? unitsConfig.pins[i].x : 50;
                const py = unitsConfig.pins[i].y !== undefined ? unitsConfig.pins[i].y : 50;
                const ps = unitsConfig.pins[i].s !== undefined ? unitsConfig.pins[i].s : 100;
                if(pinInputs[i].x) pinInputs[i].x.value = px;
                if(pinInputs[i].xNum) pinInputs[i].xNum.value = px;
                if(pinInputs[i].y) pinInputs[i].y.value = py;
                if(pinInputs[i].yNum) pinInputs[i].yNum.value = py;
                if(pinInputs[i].s) pinInputs[i].s.value = ps;
                if(pinInputs[i].sNum) pinInputs[i].sNum.value = ps;
            }
        }
        
        if(unitsOpacityNumber) unitsOpacityNumber.value = unitsConfig.hoverOpacity;
        if(unitsOpacityInput) unitsOpacityInput.value = unitsConfig.hoverOpacity;
        if(unitsColorInput) unitsColorInput.value = unitsConfig.hoverColorHex;
        if(pinColorInput) pinColorInput.value = unitsConfig.pinColorHex || '#c5a059';

        if(polygonReservedColorInput) polygonReservedColorInput.value = unitsConfig.reservedColorHex || '#e67e22';
        if(polygonSoldColorInput) polygonSoldColorInput.value = unitsConfig.soldColorHex || '#e74c3c';
        if(polygonReservedOpacityInput) polygonReservedOpacityInput.value = unitsConfig.reservedOpacity || 40;
        if(polygonReservedOpacityNumber) polygonReservedOpacityNumber.value = unitsConfig.reservedOpacity || 40;
        if(polygonStrokeColorInput) polygonStrokeColorInput.value = unitsConfig.strokeColorHex || '#ffffff';
        if(polygonStrokeWidthInput) polygonStrokeWidthInput.value = unitsConfig.strokeWidth || 2;
        if(polygonStrokeWidthNumber) polygonStrokeWidthNumber.value = unitsConfig.strokeWidth || 2;
    };

    if (unitsCountInput) {
        unitsCountInput.addEventListener('change', (e) => {
            const count = parseInt(e.target.value);
            unitsConfig.count = count;
            if (polygonCountInput) polygonCountInput.value = count;
            updateAdminUnitsVisibility();
            renderUnitZones();
        });
    }

    if (polygonCountInput) {
        polygonCountInput.addEventListener('change', (e) => {
            const count = parseInt(e.target.value);
            unitsConfig.count = count;
            if (unitsCountInput) unitsCountInput.value = count;
            updateAdminUnitsVisibility();
            renderUnitZones();
        });
    }

    if (unitsModeInput) {
        unitsModeInput.addEventListener('change', (e) => {
            unitsConfig.mode = e.target.value;
            if (!unitsConfig.pins) {
                unitsConfig.pins = {};
                for(let i=1; i<=9; i++) unitsConfig.pins[i] = {x: 50, y: 50, s: 100};
            }
            if (!unitsConfig.polygons) {
                unitsConfig.polygons = {};
                for(let i=1; i<=9; i++) unitsConfig.polygons[i] = '';
            }
            updateAdminUnitsVisibility();
            renderUnitZones();
        });
    }

    const bindPinInputPair = (slider, number, unitIndex, coordKey, minVal, maxVal, defaultVal) => {
        const updateVal = (val) => {
            if (!unitsConfig.pins) unitsConfig.pins = {};
            if (!unitsConfig.pins[unitIndex]) unitsConfig.pins[unitIndex] = { x: 50, y: 50, s: 100 };
            unitsConfig.pins[unitIndex][coordKey] = val;
            renderUnitZones();
        };

        if (slider) {
            slider.addEventListener('input', (e) => {
                const val = parseInt(e.target.value) || defaultVal;
                if (number) number.value = val;
                updateVal(val);
            });
        }
        if (number) {
            number.addEventListener('input', (e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val)) return;
                if (val > maxVal) val = maxVal;
                if (val < minVal) val = minVal;
                if (slider) slider.value = val;
                updateVal(val);
            });
            number.addEventListener('change', (e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val)) val = defaultVal;
                if (val > maxVal) val = maxVal;
                if (val < minVal) val = minVal;
                number.value = val;
                if (slider) slider.value = val;
                updateVal(val);
            });
        }
    };

    for(let i=1; i<=9; i++) {
        bindPinInputPair(pinInputs[i].x, pinInputs[i].xNum, i, 'x', 0, 100, 50);
        bindPinInputPair(pinInputs[i].y, pinInputs[i].yNum, i, 'y', 0, 100, 50);
        bindPinInputPair(pinInputs[i].s, pinInputs[i].sNum, i, 's', 20, 200, 100);
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
    if (polygonReservedColorInput) {
        polygonReservedColorInput.addEventListener('input', (e) => {
            unitsConfig.reservedColorHex = e.target.value;
            renderUnitZones();
        });
    }
    if (polygonSoldColorInput) {
        polygonSoldColorInput.addEventListener('input', (e) => {
            unitsConfig.soldColorHex = e.target.value;
            renderUnitZones();
        });
    }
    if (polygonReservedOpacityInput) {
        polygonReservedOpacityInput.addEventListener('input', (e) => {
            const val = parseInt(e.target.value) || 40;
            unitsConfig.reservedOpacity = val;
            if (polygonReservedOpacityNumber) polygonReservedOpacityNumber.value = val;
            renderUnitZones();
        });
    }
    if (polygonReservedOpacityNumber) {
        polygonReservedOpacityNumber.addEventListener('input', (e) => {
            let val = parseInt(e.target.value) || 0;
            if (val > 100) val = 100;
            if (val < 0) val = 0;
            unitsConfig.reservedOpacity = val;
            if (polygonReservedOpacityInput) polygonReservedOpacityInput.value = val;
            renderUnitZones();
        });
    }
    if (polygonStrokeColorInput) {
        polygonStrokeColorInput.addEventListener('input', (e) => {
            unitsConfig.strokeColorHex = e.target.value;
            renderUnitZones();
        });
    }
    if (polygonStrokeWidthInput) {
        polygonStrokeWidthInput.addEventListener('input', (e) => {
            const val = parseInt(e.target.value) || 2;
            unitsConfig.strokeWidth = val;
            if (polygonStrokeWidthNumber) polygonStrokeWidthNumber.value = val;
            renderUnitZones();
        });
    }
    if (polygonStrokeWidthNumber) {
        polygonStrokeWidthNumber.addEventListener('input', (e) => {
            let val = parseInt(e.target.value) || 1;
            if (val > 10) val = 10;
            if (val < 1) val = 1;
            unitsConfig.strokeWidth = val;
            if (polygonStrokeWidthInput) polygonStrokeWidthInput.value = val;
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

    // --- Core Functions & Admin Panel System ---

    // Admin Toggle with Auto-Recovery (Guarantees panel is NEVER lost off-screen)
    adminToggle.addEventListener('click', () => {
        const isActive = adminPanel.classList.contains('active');
        if (!isActive) {
            const rect = adminPanel.getBoundingClientRect();
            const isOffScreen = rect.left < -50 || rect.left > (window.innerWidth - 80) || rect.top < 0 || rect.top > (window.innerHeight - 60);
            if (isOffScreen || !adminPanel.classList.contains('is-floating')) {
                adminPanel.classList.remove('is-floating');
                adminPanel.style.left = '';
                adminPanel.style.top = '';
                adminPanel.style.width = '';
                adminPanel.style.height = '';
            }
            adminPanel.classList.add('active');
        } else {
            adminPanel.classList.remove('active');
        }
    });

    // Double click on toggle gear resets to default dock position
    adminToggle.addEventListener('dblclick', () => {
        adminPanel.classList.remove('is-floating');
        adminPanel.style.left = '';
        adminPanel.style.top = '';
        adminPanel.style.width = '';
        adminPanel.style.height = '';
        adminPanel.classList.add('active');
    });

    // Admin Panel Draggable Window Logic (With boundary protection so it stays visible)
    const adminDragHeader = document.getElementById('admin-panel-drag-header');
    const adminResetPosBtn = document.getElementById('admin-reset-pos-btn');
    const adminCloseBtn = document.getElementById('admin-close-btn');
    const adminPopoutBtn = document.getElementById('admin-popout-btn');

    let isAdminDragging = false;
    let adminDragStartX = 0;
    let adminDragStartY = 0;
    let adminInitialPanelLeft = 0;
    let adminInitialPanelTop = 0;

    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

    if (adminDragHeader && adminPanel) {
        adminDragHeader.addEventListener('mousedown', (e) => {
            if (e.target.closest('button')) return; // Don't drag when clicking header buttons
            
            isAdminDragging = true;
            const rect = adminPanel.getBoundingClientRect();
            
            if (!adminPanel.classList.contains('is-floating')) {
                adminPanel.classList.add('is-floating');
                adminPanel.style.left = `${rect.left}px`;
                adminPanel.style.top = `${rect.top}px`;
                adminPanel.style.width = `${rect.width}px`;
            }
            
            adminDragStartX = e.clientX;
            adminDragStartY = e.clientY;
            adminInitialPanelLeft = adminPanel.offsetLeft;
            adminInitialPanelTop = adminPanel.offsetTop;
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isAdminDragging) return;
            const dx = e.clientX - adminDragStartX;
            const dy = e.clientY - adminDragStartY;
            
            // Clamp within screen boundaries so it can never be pulled into the void
            const minLeft = 10;
            const maxLeft = Math.max(10, window.innerWidth - 120);
            const minTop = 10;
            const maxTop = Math.max(10, window.innerHeight - 80);

            adminPanel.style.left = `${clamp(adminInitialPanelLeft + dx, minLeft, maxLeft)}px`;
            adminPanel.style.top = `${clamp(adminInitialPanelTop + dy, minTop, maxTop)}px`;
        });

        window.addEventListener('mouseup', () => {
            isAdminDragging = false;
        });

        // Touch support for dragging on touchscreens
        adminDragHeader.addEventListener('touchstart', (e) => {
            if (e.target.closest('button')) return;
            if (e.touches.length === 1) {
                isAdminDragging = true;
                const rect = adminPanel.getBoundingClientRect();
                if (!adminPanel.classList.contains('is-floating')) {
                    adminPanel.classList.add('is-floating');
                    adminPanel.style.left = `${rect.left}px`;
                    adminPanel.style.top = `${rect.top}px`;
                    adminPanel.style.width = `${rect.width}px`;
                }
                adminDragStartX = e.touches[0].clientX;
                adminDragStartY = e.touches[0].clientY;
                adminInitialPanelLeft = adminPanel.offsetLeft;
                adminInitialPanelTop = adminPanel.offsetTop;
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (!isAdminDragging || e.touches.length === 0) return;
            const dx = e.touches[0].clientX - adminDragStartX;
            const dy = e.touches[0].clientY - adminDragStartY;
            const minLeft = 10;
            const maxLeft = Math.max(10, window.innerWidth - 120);
            const minTop = 10;
            const maxTop = Math.max(10, window.innerHeight - 80);
            adminPanel.style.left = `${clamp(adminInitialPanelLeft + dx, minLeft, maxLeft)}px`;
            adminPanel.style.top = `${clamp(adminInitialPanelTop + dy, minTop, maxTop)}px`;
        }, { passive: true });

        window.addEventListener('touchend', () => {
            isAdminDragging = false;
        });
    }

    if (adminResetPosBtn) {
        adminResetPosBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            adminPanel.classList.remove('is-floating');
            adminPanel.style.left = '';
            adminPanel.style.top = '';
            adminPanel.style.width = '';
            adminPanel.style.height = '';
        });
    }

    if (adminCloseBtn) {
        adminCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            adminPanel.classList.remove('active');
        });
    }

    if (adminPopoutBtn) {
        adminPopoutBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (adminPanel.style.width === '850px') {
                adminPanel.style.width = '520px';
            } else {
                if (!adminPanel.classList.contains('is-floating')) {
                    const rect = adminPanel.getBoundingClientRect();
                    adminPanel.classList.add('is-floating');
                    adminPanel.style.left = `${Math.max(20, rect.left - 330)}px`;
                    adminPanel.style.top = `${rect.top}px`;
                }
                adminPanel.style.width = '850px';
            }
        });
    }

    // --- Triplex House Image Zoom / Size System ---
    const triplexZoomInput = document.getElementById('triplex-zoom-input');
    const triplexZoomNumber = document.getElementById('triplex-zoom-number');
    const unitsMainContainer = document.getElementById('units-main-container');

    window.setUnitsZoom = (level, save = false) => {
        const zoomVal = Math.min(250, Math.max(50, Math.round(Number(level) || 100)));
        if (!unitsConfig) unitsConfig = {};
        unitsConfig.zoom = zoomVal;

        if (triplexZoomInput) triplexZoomInput.value = zoomVal;
        if (triplexZoomNumber) triplexZoomNumber.value = zoomVal;

        if (unitsMainContainer) {
            if (zoomVal === 100) {
                unitsMainContainer.style.width = '100%';
            } else {
                unitsMainContainer.style.width = `${zoomVal}%`;
            }
        }

        if (save && typeof saveToStorage === 'function') {
            saveToStorage(true);
        }
    };

    if (triplexZoomInput) triplexZoomInput.addEventListener('input', (e) => window.setUnitsZoom(e.target.value, true));
    if (triplexZoomNumber) triplexZoomNumber.addEventListener('input', (e) => window.setUnitsZoom(e.target.value, true));

    // Accordion Logic
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            console.log('Accordion clicked:', header.textContent);
            const section = header.parentElement;
            section.classList.toggle('active');
        });
    });

    window.scrollToAdminSec = (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (!el.classList.contains('active')) {
            el.classList.add('active');
        }
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.style.transition = 'box-shadow 0.3s ease';
        el.style.boxShadow = '0 0 0 2px var(--gold-color, #c5a059)';
        setTimeout(() => {
            el.style.boxShadow = '';
        }, 1500);
    };

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
        const list = (siteMedia.gallery && siteMedia.gallery.length > 0) ? siteMedia.gallery : ['gallery-1.jpg', 'gallery-2.jpg'];
        for (const key of list) {
            if (key.startsWith('db:')) {
                const data = await MediaDB.load(key.split(':')[1]);
                if (data) images.push(data);
            } else {
                images.push(key);
            }
        }
        if (images.length === 0) {
            images.push('gallery-1.jpg', 'gallery-2.jpg');
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
        const svgOverlay = document.getElementById('units-svg-overlay');
        const svgPolygonsLayer = document.getElementById('units-svg-polygons-layer');
        const popover = document.getElementById('polygon-unit-popover');
        const mainImage = document.querySelector('.units-image');
        if (!overlay) return;
        overlay.innerHTML = '';
        
        const rgbaColor = hexToRgba(unitsConfig.hoverColorHex, unitsConfig.hoverOpacity);
        root.style.setProperty('--unit-hover-color', rgbaColor);
        const pinColor = unitsConfig.pinColorHex || '#c5a059';
        root.style.setProperty('--pin-color', pinColor);
        root.style.setProperty('--pin-color-rgba', hexToRgba(pinColor, 70));

        // Polygon custom properties
        const reservedRgba = hexToRgba(unitsConfig.reservedColorHex || '#e67e22', unitsConfig.reservedOpacity || 40);
        const soldRgba = hexToRgba(unitsConfig.soldColorHex || '#e74c3c', unitsConfig.soldOpacity || 45);
        root.style.setProperty('--polygon-reserved-fill', reservedRgba);
        root.style.setProperty('--polygon-reserved-color', unitsConfig.reservedColorHex || '#e67e22');
        root.style.setProperty('--polygon-sold-fill', soldRgba);
        root.style.setProperty('--polygon-sold-color', unitsConfig.soldColorHex || '#e74c3c');
        root.style.setProperty('--polygon-stroke-color', unitsConfig.strokeColorHex || '#ffffff');
        root.style.setProperty('--polygon-stroke-width', (unitsConfig.strokeWidth || 2) + 'px');

        if (mainImage) {
            mainImage.style.display = 'block';
            if (!mainImage.getAttribute('src') || mainImage.getAttribute('src') === '') {
                mainImage.src = 'triplex.jpg';
            }
        }

        const isPolygons = unitsConfig.mode === 'polygons';
        const isPins = unitsConfig.mode === 'pins';

        if (isPolygons) {
            overlay.style.display = 'none';
            if (svgOverlay) svgOverlay.style.display = 'block';
            if (svgPolygonsLayer) svgPolygonsLayer.innerHTML = '';

            for (let i = 1; i <= unitsConfig.count; i++) {
                const data = unitsData[i];
                if (!data) continue;

                const pointsStr = (unitsConfig.polygons && unitsConfig.polygons[i]) ? unitsConfig.polygons[i].trim() : '';
                if (!pointsStr) continue;

                // Create SVG Polygon
                const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                poly.setAttribute('class', `unit-polygon ${data.status}`);
                poly.setAttribute('points', pointsStr);
                poly.setAttribute('data-unit', i);
                
                // Parse points to find centroid
                const rawPairs = pointsStr.split(/\s+/).filter(Boolean);
                let sumX = 0, sumY = 0, countPts = 0;
                rawPairs.forEach(p => {
                    const [px, py] = p.split(',').map(Number);
                    if (!isNaN(px) && !isNaN(py)) {
                        sumX += px;
                        sumY += py;
                        countPts++;
                    }
                });
                const cx = countPts > 0 ? (sumX / countPts) : 500;
                const cy = countPts > 0 ? (sumY / countPts) : 500;

                // Create Polygon Label/Badge
                const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                labelGroup.setAttribute('class', 'unit-polygon-label-group');
                labelGroup.setAttribute('transform', `translate(${cx}, ${cy})`);
                labelGroup.innerHTML = `
                    <rect x="-24" y="-12" width="48" height="24" class="unit-polygon-badge"></rect>
                    <text class="unit-polygon-text">${i}</text>
                `;

                // Interactivity for Polygon
                poly.addEventListener('mouseenter', (e) => {
                    if (window.isPolygonEditingActive) return;
                    if (popover) {
                        const containerRect = document.getElementById('units-main-container').getBoundingClientRect();
                        const clientX = (cx / 1000) * containerRect.width;
                        const clientY = (cy / 1000) * containerRect.height;
                        
                        popover.innerHTML = `
                            <div class="popover-header">
                                <h4 class="popover-title">${data.name}</h4>
                                <span class="unit-status ${data.status}" style="margin:0; padding: 3px 8px; font-size: 0.68rem;">${data.statusText}</span>
                            </div>
                            <div class="popover-price">${data.price || 'Cena na vyžádání'}</div>
                            <div class="popover-specs">
                                <span>${data.layout || ''}</span>
                                ${data.area ? `<span>• ${data.area} m²</span>` : ''}
                                ${data.garden ? `<span>• Zahrada ${data.garden} m²</span>` : ''}
                            </div>
                        `;
                        popover.style.left = `${clientX}px`;
                        popover.style.top = `${clientY}px`;
                        popover.style.display = 'block';
                        popover.classList.add('active');
                    }
                });

                poly.addEventListener('mousemove', (e) => {
                    if (window.isPolygonEditingActive) return;
                    if (popover) {
                        const containerRect = document.getElementById('units-main-container').getBoundingClientRect();
                        const posX = e.clientX - containerRect.left;
                        const posY = e.clientY - containerRect.top;
                        popover.style.left = `${posX}px`;
                        popover.style.top = `${posY}px`;
                    }
                });

                poly.addEventListener('mouseleave', () => {
                    if (popover) {
                        popover.classList.remove('active');
                        popover.style.display = 'none';
                    }
                });

                poly.addEventListener('click', (e) => {
                    if (window.isPolygonEditingActive) return;
                    if (popover) popover.style.display = 'none';
                    openUnit(i);
                });

                if (svgPolygonsLayer) {
                    svgPolygonsLayer.appendChild(poly);
                    svgPolygonsLayer.appendChild(labelGroup);
                }
            }
        } else {
            if (svgOverlay) svgOverlay.style.display = 'none';
            if (popover) popover.style.display = 'none';
            overlay.style.display = 'flex';

            let htmlString = '';
            for(let i=1; i<=unitsConfig.count; i++) {
                const data = unitsData[i];
                if(!data) continue;

                const flexValue = unitsConfig.widths[i] || (100 / unitsConfig.count);
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
                }

                htmlString += `
                    <div class="unit-zone ${extraClass}" onclick="openUnit(${i})" ${styleAttr}>
                        ${isPins ? `<div class="pin-marker"><span>${i}</span></div>` : ''}
                        <div class="unit-footer-compact">
                            <span class="unit-status ${data.status || 'status-available'}" id="status-${i}">${data.statusText || 'Volno'}</span>
                            <span class="unit-label">${(data.name || `JEDNOTKA ${i}`).toUpperCase()}</span>
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
        }
    };

    const renderAdminCards = () => {
        if (!adminCardsContainer) return;
        adminCardsContainer.innerHTML = '';
        projectCards.forEach((card, index) => {
            const el = document.createElement('div');
            el.className = 'admin-card-item';

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
        if (!inputs) return;
        
        if (inputs.status) {
            inputs.status.addEventListener('change', (e) => {
                const badge = document.getElementById(`status-${id}`);
                if (badge) {
                    badge.className = `unit-status ${e.target.value}`;
                    badge.textContent = e.target.options[e.target.selectedIndex].text;
                }
                unitsData[id].status = e.target.value;
                unitsData[id].statusText = e.target.options[e.target.selectedIndex].text;
                saveToStorage(true);
            });
        }

        if (inputs.price) inputs.price.addEventListener('input', (e) => { unitsData[id].price = e.target.value; saveToStorage(true); });
        if (inputs.layout) inputs.layout.addEventListener('input', (e) => { unitsData[id].layout = e.target.value; saveToStorage(true); });
        if (inputs.area) inputs.area.addEventListener('input', (e) => { unitsData[id].area = e.target.value; saveToStorage(true); });
        if (inputs.garden) inputs.garden.addEventListener('input', (e) => { unitsData[id].garden = e.target.value; saveToStorage(true); });
        if (inputs.parking) inputs.parking.addEventListener('input', (e) => { unitsData[id].parking = e.target.value; saveToStorage(true); });
        if (inputs.desc) inputs.desc.addEventListener('input', (e) => { unitsData[id].desc = e.target.value; saveToStorage(true); });

        if (inputs.pdfKarta) handleFileUpload(inputs.pdfKarta, (base64) => { unitsData[id].pdfKarta = base64; saveToStorage(true); });
        if (inputs.pdfStandardy) handleFileUpload(inputs.pdfStandardy, (base64) => { unitsData[id].pdfStandardy = base64; saveToStorage(true); });
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
        try {
            // Initialize map immediately with defaults, will update coordinates if found in config
            initMap(mapCoords.lat, mapCoords.lng);

            const saved = localStorage.getItem('web_prodej_ultra_v3_config');
            if (saved) {
                let config = {};
                try {
                    config = JSON.parse(saved) || {};
                } catch(e) {
                    console.error('Failed to parse saved config:', e);
                    config = {};
                }
                
                if (config.styles) {
                    if (config.styles.primary) {
                        root.style.setProperty('--primary-color', config.styles.primary);
                        if (primaryColorInput) primaryColorInput.value = config.styles.primary;
                    }
                    if (config.styles.accent) {
                        root.style.setProperty('--accent-color', config.styles.accent);
                        if (accentColorInput) accentColorInput.value = config.styles.accent;
                    }
                    if (config.styles.fontHeading) {
                        root.style.setProperty('--font-heading', config.styles.fontHeading);
                        if (fontHeadingInput) fontHeadingInput.value = config.styles.fontHeading;
                    }
                    if (config.styles.darkMode !== undefined) toggleDarkMode(config.styles.darkMode);
                    if (config.styles.showCadastral !== undefined && cadastralMapInput) cadastralMapInput.checked = config.styles.showCadastral;
                    if (config.styles.logoSize !== undefined && logoSizeInput) {
                        const size = config.styles.logoSize;
                        logoSizeInput.value = size;
                        root.style.setProperty('--logo-size', size + 'px');
                        root.style.setProperty('--logo-size-footer', (size * 0.75) + 'px');
                    }
                }

                if (config.unitsConfig) {
                    unitsConfig = {
                        ...unitsConfig,
                        ...config.unitsConfig,
                        polygons: {
                            ...unitsConfig.polygons,
                            ...(config.unitsConfig.polygons || {})
                        }
                    };
                    if (unitsCountInput) unitsCountInput.value = unitsConfig.count || 3;
                    if (polygonCountInput) polygonCountInput.value = unitsConfig.count || 3;
                    if (unitsColorInput) unitsColorInput.value = unitsConfig.hoverColorHex || '#c5a059';
                    if (pinColorInput) pinColorInput.value = unitsConfig.pinColorHex || '#c5a059';
                    if (unitsOpacityInput) unitsOpacityInput.value = unitsConfig.hoverOpacity || 40;
                    
                    // Restore all widths
                    for(let i=1; i<=9; i++) {
                        if (widthSliders[i] && unitsConfig.widths && unitsConfig.widths[i]) widthSliders[i].value = unitsConfig.widths[i];
                        if (widthNumbers[i] && unitsConfig.widths && unitsConfig.widths[i]) widthNumbers[i].value = unitsConfig.widths[i];
                    }

                    if (typeof window.setUnitsZoom === 'function') {
                        window.setUnitsZoom(unitsConfig.zoom || 100, false);
                    }
                }

                const c = config.content || {};
                if (webLogo) webLogo.textContent = c.logo || 'MODERNÍ BYDLENÍ';
                if (footerLogoText) footerLogoText.textContent = c.logo || 'MODERNÍ BYDLENÍ';
                if (heroTitle) heroTitle.textContent = c.heroTitle || 'Domov, kde začíná vaše nová etapa';
                if (heroText) heroText.textContent = c.heroText || 'Objevte moderní architekturu v srdci přírody.';
                if (aboutTextInput) aboutTextInput.value = c.aboutText || '';
                
                if (c.subtitle !== undefined) {
                    const subText = c.subtitle;
                    if (webSubtitle) webSubtitle.textContent = subText;
                    if (footerSubtitle) footerSubtitle.textContent = subText;
                    if (subtitleInput) subtitleInput.value = c.subtitle;
                }

                if (config.media) {
                    siteMedia = { ...siteMedia, ...config.media };
                    try {
                        if (siteMedia.logo && siteMedia.logo.startsWith('db:')) {
                            const data = await MediaDB.load('logo');
                            if (data) [headerLogoImg, footerLogoImg].forEach(img => { if (img) { img.src = data; img.style.display = 'block'; } });
                        }
                        
                        await updateHeroBackground();
                        
                        let loadedTriplex = false;
                        if (siteMedia.triplex && siteMedia.triplex.startsWith('db:')) {
                            try {
                                const data = await MediaDB.load('triplex');
                                if (data && triplexImage) {
                                    triplexImage.src = data;
                                    loadedTriplex = true;
                                }
                            } catch(e) {}
                        } else if (siteMedia.triplex && triplexImage) {
                            triplexImage.src = siteMedia.triplex;
                            loadedTriplex = true;
                        }
                        if (!loadedTriplex && triplexImage) {
                            triplexImage.src = 'triplex.jpg';
                        }

                        if (siteMedia.agent && siteMedia.agent.startsWith('db:')) {
                            const data = await MediaDB.load('agent');
                            if (data && agentPhotoDisplay) {
                                agentPhotoDisplay.src = data;
                                agentPhotoDisplay.style.display = 'block';
                                if (agentPhotoPlaceholder) agentPhotoPlaceholder.style.display = 'none';
                            }
                        }
                    } catch (e) {
                        console.error('Error loading media from IndexedDB:', e);
                    }
                }

                if (config.location) {
                    mapCoords = config.location;
                    if (gpsLatInput) gpsLatInput.value = mapCoords.lat;
                    if (gpsLngInput) gpsLngInput.value = mapCoords.lng;
                }

                if (config.partners && Array.isArray(config.partners)) {
                    partnersData = config.partners;
                    for(let i=1; i<=6; i++) {
                        const urlInput = document.getElementById(`partner-url-${i}-input`);
                        if (urlInput && partnersData[i-1]) urlInput.value = partnersData[i-1].url || '';
                    }
                }

                if (config.units) {
                    Object.keys(config.units).forEach(key => {
                        if (unitsData[key]) {
                            unitsData[key] = { ...unitsData[key], ...config.units[key] };
                        }
                    });
                    for(let i=1; i<=9; i++) {
                        if (unitsData[i]) {
                            if (!unitsData[i].name || unitsData[i].name.startsWith('Etapa') || unitsData[i].name.startsWith('Segment')) {
                                unitsData[i].name = `Jednotka ${i}`;
                            }
                        }
                    }
                }

                // Agent info (text)
                const agentNameDisplay = document.getElementById('editable-agent-name');
                if (agentNameDisplay) agentNameDisplay.textContent = c.agentName || 'Jan Novák';
                if (agentNameInput) agentNameInput.value = c.agentName || '';
                if (contactTitleInput) contactTitleInput.value = c.contactTitle || '';
                if (contactTextInput) contactTextInput.value = c.contactText || '';
                if (contactPhoneInput) contactPhoneInput.value = c.contactPhone || '';
                if (contactEmailInput) contactEmailInput.value = c.contactEmail || '';
                if (fbLinkInput) fbLinkInput.value = c.fbLink || '';
                if (igLinkInput) igLinkInput.value = c.igLink || '';

                // Sync link hrefs from loaded data
                const phoneLink = document.getElementById('editable-contact-phone-link');
                if (phoneLink && c.contactPhone) phoneLink.href = 'tel:' + c.contactPhone.replace(/\s/g, '');
                const emailRow = document.querySelector('.agent-info-row[href^="mailto:"]');
                if (emailRow && c.contactEmail) emailRow.href = 'mailto:' + c.contactEmail;

                if (c.projectCards && Array.isArray(c.projectCards)) {
                    projectCards = c.projectCards;
                }

                Object.keys(unitsData).forEach(id => {
                    const badge = document.getElementById(`status-${id}`);
                    if (badge) {
                        badge.className = `unit-status ${unitsData[id].status || 'status-available'}`;
                        badge.textContent = unitsData[id].statusText || 'Volno';
                    }
                    const inputs = unitInputs[id];
                    if (inputs) {
                        if (inputs.status) inputs.status.value = unitsData[id].status || 'status-available';
                        if (inputs.price) inputs.price.value = unitsData[id].price || '';
                        if (inputs.layout) inputs.layout.value = unitsData[id].layout || '';
                        if (inputs.area) inputs.area.value = unitsData[id].area || '';
                        if (inputs.garden) inputs.garden.value = unitsData[id].garden || '';
                        if (inputs.parking) inputs.parking.value = unitsData[id].parking || '';
                        if (inputs.desc) inputs.desc.value = unitsData[id].desc || '';
                        
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
        } catch (e) {
            console.error('loadFromStorage top-level error:', e);
        }
    };

    // --- Interactive Polygon Editor ---
    let activeEditingUnit = null;
    let currentPolygonPoints = [];
    let isDraggingHandle = false;
    let draggedPointIndex = -1;
    window.isPolygonEditingActive = false;

    const editorToolbar = document.getElementById('polygon-editor-toolbar');
    const editorActiveUnitText = document.getElementById('editor-active-unit-text');
    const editorBtnSave = document.getElementById('editor-btn-save');
    const editorBtnUndo = document.getElementById('editor-btn-undo');
    const editorBtnClear = document.getElementById('editor-btn-clear');
    const editorBtnCancel = document.getElementById('editor-btn-cancel');
    const svgOverlay = document.getElementById('units-svg-overlay');
    const svgEditorLayer = document.getElementById('units-svg-editor-layer');

    // Helper: Distance from point P to line segment VW squared
    const distToSegmentSquared = (p, v, w) => {
        const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
        if (l2 === 0) return (p.x - v.x) ** 2 + (p.y - v.y) ** 2;
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        const projX = v.x + t * (w.x - v.x);
        const projY = v.y + t * (w.y - v.y);
        return (p.x - projX) ** 2 + (p.y - projY) ** 2;
    };

    // Find best position to insert a new vertex into polygon perimeter
    const findBestInsertIndex = (newPt, points) => {
        if (points.length < 3) return points.length;
        let minSqDist = Infinity;
        let bestIdx = points.length;
        for (let i = 0; i < points.length; i++) {
            const nextIdx = (i + 1) % points.length;
            const d = distToSegmentSquared(newPt, points[i], points[nextIdx]);
            if (d < minSqDist) {
                minSqDist = d;
                bestIdx = i + 1;
            }
        }
        return bestIdx;
    };

    const renderEditorLayer = () => {
        if (!svgEditorLayer) return;
        svgEditorLayer.innerHTML = '';
        if (!window.isPolygonEditingActive) return;

        if (activeEditingUnit) {
            const ptsEl = document.getElementById(`polygon-live-pts-${activeEditingUnit}`);
            if (ptsEl) ptsEl.textContent = `${currentPolygonPoints.length} bodů`;
        }

        const pointsString = currentPolygonPoints.map(p => `${Math.round(p.x)},${Math.round(p.y)}`).join(' ');

        if (currentPolygonPoints.length > 0) {
            // Preview polygon
            const previewPoly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            previewPoly.setAttribute('class', 'editor-polygon-preview');
            previewPoly.setAttribute('points', pointsString);
            svgEditorLayer.appendChild(previewPoly);

            // Clickable/Hoverable edge lines for adding vertices along perimeter
            if (currentPolygonPoints.length >= 2) {
                for (let i = 0; i < currentPolygonPoints.length; i++) {
                    const nextIdx = (i + 1) % currentPolygonPoints.length;
                    const p1 = currentPolygonPoints[i];
                    const p2 = currentPolygonPoints[nextIdx];

                    const edgeLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    edgeLine.setAttribute('class', 'editor-edge-line');
                    edgeLine.setAttribute('x1', p1.x);
                    edgeLine.setAttribute('y1', p1.y);
                    edgeLine.setAttribute('x2', p2.x);
                    edgeLine.setAttribute('y2', p2.y);
                    edgeLine.setAttribute('title', 'Kliknutím přidáte nový úchopový bod sem na hranu');

                    edgeLine.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (isDraggingHandle) return;
                        const rect = svgOverlay.getBoundingClientRect();
                        const x = Math.max(0, Math.min(1000, Math.round(((e.clientX - rect.left) / rect.width) * 1000)));
                        const y = Math.max(0, Math.min(1000, Math.round(((e.clientY - rect.top) / rect.height) * 1000)));

                        currentPolygonPoints.splice(i + 1, 0, { x, y });
                        renderEditorLayer();
                    });

                    svgEditorLayer.appendChild(edgeLine);
                }
            }

            // Vertices handles (Unlimited points, drag to move, right-click/double-click to delete)
            currentPolygonPoints.forEach((p, index) => {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('class', 'editor-handle' + (draggedPointIndex === index ? ' dragging' : ''));
                circle.setAttribute('cx', p.x);
                circle.setAttribute('cy', p.y);
                circle.setAttribute('data-point-index', index);
                circle.setAttribute('title', `Bod ${index + 1} (Uchopte pro posun / Pravý klik pro smazání)`);

                circle.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                    if (e.button === 2) return;
                    isDraggingHandle = true;
                    draggedPointIndex = index;
                    renderEditorLayer();
                });
                circle.addEventListener('touchstart', (e) => {
                    e.stopPropagation();
                    isDraggingHandle = true;
                    draggedPointIndex = index;
                    renderEditorLayer();
                }, { passive: true });

                // Right click deletes vertex
                circle.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (currentPolygonPoints.length > 3) {
                        currentPolygonPoints.splice(index, 1);
                        renderEditorLayer();
                    } else {
                        alert('Polygon musí mít minimálně 3 body.');
                    }
                });

                // Double click deletes vertex
                circle.addEventListener('dblclick', (e) => {
                    e.stopPropagation();
                    if (currentPolygonPoints.length > 3) {
                        currentPolygonPoints.splice(index, 1);
                        renderEditorLayer();
                    }
                });

                svgEditorLayer.appendChild(circle);
            });
        }
    };

    window.startPolygonEditor = (unitIndex) => {
        activeEditingUnit = unitIndex;
        window.isPolygonEditingActive = true;
        
        // Parse existing points
        currentPolygonPoints = [];
        const rawPoints = (unitsConfig.polygons && unitsConfig.polygons[unitIndex]) ? unitsConfig.polygons[unitIndex].trim() : '';
        if (rawPoints) {
            rawPoints.split(/\s+/).filter(Boolean).forEach(pair => {
                const [x, y] = pair.split(',').map(Number);
                if (!isNaN(x) && !isNaN(y)) currentPolygonPoints.push({ x, y });
            });
        }

        if (svgOverlay) svgOverlay.style.display = 'block';
        if (unitsMainContainer) unitsMainContainer.classList.add('editor-crosshair-canvas');

        updateAdminUnitsVisibility();
        renderEditorLayer();
        
        // Scroll to units section
        const unitsSection = document.getElementById('units');
        if (unitsSection) unitsSection.scrollIntoView({ behavior: 'smooth' });
    };

    const closePolygonEditor = () => {
        window.isPolygonEditingActive = false;
        activeEditingUnit = null;
        currentPolygonPoints = [];
        isDraggingHandle = false;
        draggedPointIndex = -1;
        if (unitsMainContainer) unitsMainContainer.classList.remove('editor-crosshair-canvas');
        if (svgEditorLayer) svgEditorLayer.innerHTML = '';
        updateAdminUnitsVisibility();
        renderUnitZones();
    };

    window.closePolygonEditor = () => {
        closePolygonEditor();
    };

    window.saveCurrentPolygon = () => {
        if (!activeEditingUnit) return;
        if (currentPolygonPoints.length < 3) {
            alert('Polygon musí mít alespoň 3 body! Klikněte do obrázku budovy pro přidání dalších bodů obrysu.');
            return;
        }
        if (!unitsConfig.polygons) unitsConfig.polygons = {};
        unitsConfig.polygons[activeEditingUnit] = currentPolygonPoints.map(p => `${Math.round(p.x)},${Math.round(p.y)}`).join(' ');
        saveToStorage(true);
        const unitSaved = activeEditingUnit;
        closePolygonEditor();
        updateAdminUnitsVisibility();
        renderUnitZones();
        alert(`Polygon pro Jednotku ${unitSaved} byl úspěšně uložen!`);
    };

    window.undoPolygonPoint = () => {
        if (currentPolygonPoints.length > 0) {
            currentPolygonPoints.pop();
            renderEditorLayer();
        }
    };

    window.clearCurrentPoints = () => {
        if (confirm('Chcete vymazat rozpracované body?')) {
            currentPolygonPoints = [];
            renderEditorLayer();
        }
    };

    window.clearPolygon = (unitIndex) => {
        if (confirm(`Opravdu chcete smazat polygon pro Jednotku ${unitIndex}?`)) {
            if (!unitsConfig.polygons) unitsConfig.polygons = {};
            unitsConfig.polygons[unitIndex] = '';
            saveToStorage(true);
            updateAdminUnitsVisibility();
            renderUnitZones();
        }
    };

    // SVG click to add points
    if (svgOverlay) {
        svgOverlay.addEventListener('click', (e) => {
            if (!window.isPolygonEditingActive) return;
            if (isDraggingHandle) return;

            const rect = svgOverlay.getBoundingClientRect();
            const x = Math.max(0, Math.min(1000, Math.round(((e.clientX - rect.left) / rect.width) * 1000)));
            const y = Math.max(0, Math.min(1000, Math.round(((e.clientY - rect.top) / rect.height) * 1000)));

            const insertIdx = findBestInsertIndex({ x, y }, currentPolygonPoints);
            currentPolygonPoints.splice(insertIdx, 0, { x, y });
            renderEditorLayer();
        });
    }

    // Handle dragging points across window
    const handleMove = (clientX, clientY) => {
        if (!window.isPolygonEditingActive || !isDraggingHandle || draggedPointIndex === -1 || !svgOverlay) return;
        const rect = svgOverlay.getBoundingClientRect();
        const x = Math.max(0, Math.min(1000, Math.round(((clientX - rect.left) / rect.width) * 1000)));
        const y = Math.max(0, Math.min(1000, Math.round(((clientY - rect.top) / rect.height) * 1000)));

        currentPolygonPoints[draggedPointIndex] = { x, y };
        renderEditorLayer();
    };

    window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    const stopDragging = () => {
        if (isDraggingHandle) {
            isDraggingHandle = false;
            draggedPointIndex = -1;
            renderEditorLayer();
        }
    };
    window.addEventListener('mouseup', stopDragging);
    window.addEventListener('touchend', stopDragging);

    if (saveBtn) saveBtn.addEventListener('click', () => saveToStorage(false));
    
    // Start the loading sequence safely
    (async () => {
        try {
            await loadFromStorage();
        } catch(e) {
            console.error('loadFromStorage error:', e);
        }
        try { renderWebCards(); } catch(e) { console.error('renderWebCards error:', e); }
        try { renderAdminCards(); } catch(e) { console.error('renderAdminCards error:', e); }
        try { updateAdminUnitsVisibility(); } catch(e) { console.error('updateAdminUnitsVisibility error:', e); }
        try { await renderUnitZones(); } catch(e) { console.error('renderUnitZones error:', e); }
        try { await renderGallery(); } catch(e) { console.error('renderGallery error:', e); }
        try { renderPartners(); } catch(e) { console.error('renderPartners error:', e); }
    })();
});

// ===== COOKIE CONSENT LOGIC =====
(function() {
    const COOKIE_KEY = 'web_prodej_cookie_consent';
    const EXPIRY_DAYS = 365;

    const banner          = document.getElementById('cookie-banner');
    const acceptBtn       = document.getElementById('cookie-accept-btn');
    const rejectBtn       = document.getElementById('cookie-reject-btn');
    const analyticsToggle = document.getElementById('cookie-analytics');
    const marketingToggle = document.getElementById('cookie-marketing');
    const saveBtn         = document.getElementById('cookie-save-btn');
    const resetBtn        = document.getElementById('cookie-reset-btn');
    const statusEl        = document.getElementById('cookie-consent-status');

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
        updateAdminStatus();
    };

    const updateAdminStatus = () => {
        const consent = getConsent();
        if (!statusEl) return;
        if (!consent) {
            statusEl.textContent = '⚪ Souhlas nebyl udělen (banner se zobrazí při příští návštěvě)';
            statusEl.style.background = '#f5f5f5';
            statusEl.style.color = '#666';
        } else {
            const parts = ['✅ Nezbytné: zapnuto'];
            parts.push(consent.analytics ? '✅ Analytické: zapnuto' : '❌ Analytické: vypnuto');
            parts.push(consent.marketing ? '✅ Marketingové: zapnuto' : '❌ Marketingové: vypnuto');
            statusEl.innerHTML = parts.join('<br>');
            statusEl.style.background = '#f0faf0';
            statusEl.style.color = '#333';
        }
        // Sync toggles
        if (analyticsToggle) analyticsToggle.checked = consent?.analytics || false;
        if (marketingToggle) marketingToggle.checked = consent?.marketing || false;
    };

    const showBanner = () => { if (banner) banner.style.display = 'block'; };
    const hideBanner = () => { if (banner) banner.style.display = 'none'; };

    // Show banner on first visit
    if (!getConsent()) showBanner();

    // Public banner actions
    if (acceptBtn) acceptBtn.addEventListener('click', () => { saveConsent(true, true);   hideBanner(); });
    if (rejectBtn) rejectBtn.addEventListener('click', () => { saveConsent(false, false); hideBanner(); });

    // Admin: save custom settings
    if (saveBtn) saveBtn.addEventListener('click', () => {
        saveConsent(analyticsToggle?.checked || false, marketingToggle?.checked || false);
    });

    // Admin: reset — clears consent, shows banner again
    if (resetBtn) resetBtn.addEventListener('click', () => {
        localStorage.removeItem(COOKIE_KEY);
        updateAdminStatus();
        showBanner();
    });

    // Init admin status display
    updateAdminStatus();
})();
