document.addEventListener('DOMContentLoaded', () => {
    const escapeHtml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    
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
        mode: 'polygons',
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
        strokeMode: 'always',
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
        polygonSettings: {
            1: { permanentFill: false, fillColor: '#c5a059', fillOpacity: 40, strokeMode: 'global' },
            2: { permanentFill: false, fillColor: '#c5a059', fillOpacity: 40, strokeMode: 'global' },
            3: { permanentFill: false, fillColor: '#c5a059', fillOpacity: 40, strokeMode: 'global' },
            4: { permanentFill: false, fillColor: '#c5a059', fillOpacity: 40, strokeMode: 'global' },
            5: { permanentFill: false, fillColor: '#c5a059', fillOpacity: 40, strokeMode: 'global' },
            6: { permanentFill: false, fillColor: '#c5a059', fillOpacity: 40, strokeMode: 'global' },
            7: { permanentFill: false, fillColor: '#c5a059', fillOpacity: 40, strokeMode: 'global' },
            8: { permanentFill: false, fillColor: '#c5a059', fillOpacity: 40, strokeMode: 'global' },
            9: { permanentFill: false, fillColor: '#c5a059', fillOpacity: 40, strokeMode: 'global' }
        },
        zoom: 100,
        posX: 0,
        posY: 0
    };

    let partnersData = [];
    for(let i=1; i<=3; i++) {
        partnersData.push({ id: i, logo: '', url: '', scale: 100 });
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
        async delete(key) {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(this.storeName, 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.delete(key);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
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
            if (config.partners && Array.isArray(config.partners)) {
                for (const p of config.partners) {
                    if (p && p.logo && typeof p.logo === 'string' && p.logo.startsWith('db:')) {
                        const dbKey = p.logo.split(':')[1];
                        try {
                            const data = await MediaDB.load(dbKey);
                            if (data) exportData.mediaData[dbKey] = data;
                        } catch(e) {}
                    }
                }
            }
            
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
    let mapCoords = { lat: 48.932424, lng: 14.616280 };
    const DEFAULT_ZOOM = 17;

    let tileLayer;
    let cadastralLayer = null;

    const updateMapCadastralUI = (isActive) => {
        const btn = document.getElementById('map-cadastral-btn');
        const status = document.getElementById('map-cadastral-status');
        const cInput = document.getElementById('cadastral-map-input');
        if (btn) btn.classList.toggle('active', !!isActive);
        if (status) status.textContent = isActive ? 'ZAPNUTO' : 'VYPNUTO';
        if (cInput && cInput.checked !== !!isActive) cInput.checked = !!isActive;
    };

    const updateCadastralZoomHint = () => {
        const hint = document.getElementById('map-cadastral-zoom-hint');
        if (!hint || !map) return;
        const cInput = document.getElementById('cadastral-map-input');
        const isCadastralActive = cInput ? cInput.checked : false;
        if (isCadastralActive && map.getZoom() < 14) {
            hint.style.display = 'block';
        } else {
            hint.style.display = 'none';
        }
    };

    const updateCadastralLayer = () => {
        if (!map) return;
        const cInput = document.getElementById('cadastral-map-input');
        const isCadastralActive = cInput ? cInput.checked : false;
        const isDark = document.body.classList.contains('dark-mode');
        const targetLayerName = isDark ? 'KN_I' : 'KN';

        if (isCadastralActive) {
            if (cadastralLayer) {
                if (cadastralLayer._currentLayerName !== targetLayerName) {
                    map.removeLayer(cadastralLayer);
                    cadastralLayer = null;
                }
            }

            if (!cadastralLayer) {
                cadastralLayer = L.tileLayer.wms('https://services.cuzk.cz/wms/local-km-wms.asp', {
                    layers: targetLayerName,
                    format: 'image/png',
                    transparent: true,
                    version: '1.3.0',
                    crs: L.CRS.EPSG3857,
                    maxZoom: 22,
                    minZoom: 14,
                    pane: 'cadastralPane',
                    opacity: 0.9,
                    attribution: '&copy; <a href="https://www.cuzk.cz" target="_blank" rel="noopener">ČÚZK</a>'
                });
                cadastralLayer._currentLayerName = targetLayerName;
            }

            if (!map.hasLayer(cadastralLayer)) {
                cadastralLayer.addTo(map);
            }
        } else {
            if (cadastralLayer && map.hasLayer(cadastralLayer)) {
                map.removeLayer(cadastralLayer);
            }
        }

        updateMapCadastralUI(isCadastralActive);
        updateCadastralZoomHint();
    };

    const initMap = (lat, lng) => {
        lat = parseFloat(lat);
        lng = parseFloat(lng);
        if (isNaN(lat)) lat = 48.932424;
        if (isNaN(lng)) lng = 14.616280;
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

                // Dedicated pane for ČÚZK cadastral layer
                if (!map.getPane('cadastralPane')) {
                    const cPane = map.createPane('cadastralPane');
                    cPane.style.zIndex = 450;
                    cPane.style.pointerEvents = 'none';
                }

                map.on('zoomend', updateCadastralZoomHint);
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

            // Sync cadastral layer
            updateCadastralLayer();

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
    const agentAddressInput = document.getElementById('agent-address-input');
    const agentIcoInput = document.getElementById('agent-ico-input');
    const agentHoursInput = document.getElementById('agent-hours-input');

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
    const polygonStrokeModeInput = document.getElementById('polygon-stroke-mode-input');
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
            const mainBtn = document.getElementById(`polygon-main-btn-${i}`);
            const ptsEl = document.getElementById(`polygon-live-pts-${i}`);
            const isThisActive = window.isPolygonEditingActive && Number(activeEditingUnit) === i;

            if (idleCtrl) idleCtrl.style.display = 'flex';
            if (activeCtrl) activeCtrl.style.display = isThisActive ? 'flex' : 'none';

            if (mainBtn) {
                if (isThisActive) {
                    const count = currentPolygonPoints.length;
                    const countText = count === 1 ? '1 bod' : (count < 5 && count > 1 ? `${count} body` : `${count} bodů`);
                    mainBtn.innerHTML = `💾 ULOŽIT POLYGON (${countText})`;
                    mainBtn.style.background = '#27ae60';
                    mainBtn.style.color = '#ffffff';
                    mainBtn.style.fontWeight = '700';
                    mainBtn.style.boxShadow = '0 0 12px rgba(39, 174, 96, 0.5)';
                    mainBtn.title = 'Kliknutím polygon uložíte a změny se trvale vykreslí na webu';
                } else {
                    mainBtn.innerHTML = '✏️ Kreslit / Upravit polygon';
                    mainBtn.style.background = 'var(--accent-color, #c5a059)';
                    mainBtn.style.color = '#ffffff';
                    mainBtn.style.fontWeight = '600';
                    mainBtn.style.boxShadow = 'none';
                    mainBtn.title = 'Zapnout kreslení a úpravu polygonu na obrázku';
                }
            }

            if (isThisActive && ptsEl) {
                const count = currentPolygonPoints.length;
                const countText = count === 1 ? '1 bod' : (count < 5 && count > 1 ? `${count} body` : `${count} bodů`);
                ptsEl.textContent = countText;
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
        if(polygonStrokeWidthInput) polygonStrokeWidthInput.value = (unitsConfig.strokeWidth !== undefined) ? unitsConfig.strokeWidth : 2;
        if(polygonStrokeWidthNumber) polygonStrokeWidthNumber.value = (unitsConfig.strokeWidth !== undefined) ? unitsConfig.strokeWidth : 2;
        if(polygonStrokeModeInput) polygonStrokeModeInput.value = unitsConfig.strokeMode || 'always';
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
    if (polygonStrokeModeInput) {
        polygonStrokeModeInput.addEventListener('change', (e) => {
            unitsConfig.strokeMode = e.target.value; // 'hover', 'always', 'none'
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
            const val = parseInt(e.target.value) || 0;
            unitsConfig.strokeWidth = val;
            if (polygonStrokeWidthNumber) polygonStrokeWidthNumber.value = val;
            renderUnitZones();
        });
    }
    if (polygonStrokeWidthNumber) {
        polygonStrokeWidthNumber.addEventListener('input', (e) => {
            let val = parseInt(e.target.value) || 0;
            if (val > 10) val = 10;
            if (val < 0) val = 0;
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

    // Helper: Auto-trim transparent margins from image to unify visual size
    const trimImageCanvas = (img) => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        if (!canvas.width || !canvas.height) return null;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const w = canvas.width;
        const h = canvas.height;
        let imgData;
        try {
            imgData = ctx.getImageData(0, 0, w, h);
        } catch(e) {
            return null;
        }
        
        const data = imgData.data;
        let minX = w, minY = h, maxX = -1, maxY = -1;
        
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const idx = (y * w + x) * 4;
                const alpha = data[idx + 3];
                if (alpha > 20) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }
        
        // If image has no transparent borders or completely empty, skip crop
        if (maxX === -1 || (minX === 0 && minY === 0 && maxX === w - 1 && maxY === h - 1)) {
            return null;
        }
        
        // Add minimal padding (4px)
        const pad = 4;
        minX = Math.max(0, minX - pad);
        minY = Math.max(0, minY - pad);
        maxX = Math.min(w - 1, maxX + pad);
        maxY = Math.min(h - 1, maxY + pad);
        
        const cropW = maxX - minX + 1;
        const cropH = maxY - minY + 1;
        
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = cropW;
        cropCanvas.height = cropH;
        const cropCtx = cropCanvas.getContext('2d');
        cropCtx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
        
        return cropCanvas.toDataURL('image/png');
    };

    // --- Core Functions & Admin Panel System ---

    // --- Admin Authentication & User Database System ---
    const DEFAULT_ADMIN_USERS = [
        {
            id: 'admin_master',
            username: 'admin',
            email: 'admin@prodejdomu.cz',
            password: 'admin123',
            name: 'Hlavní administrátor',
            role: 'Administrátor'
        },
        {
            id: 'agent_svec',
            username: 'michal.svec',
            email: 'michal.svec@realitik.cz',
            password: 'domyledenice',
            name: 'Michal Švec',
            role: 'Makléř projektu'
        }
    ];

    const USERS_STORAGE_KEY = 'web_prodej_admin_users_v1';
    const SESSION_STORAGE_KEY = 'web_prodej_admin_session_v1';

    function getAdminUsers() {
        try {
            const raw = localStorage.getItem(USERS_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('Chyba při načítání databáze uživatelů:', e);
        }
        try {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_ADMIN_USERS));
        } catch (e) {}
        return DEFAULT_ADMIN_USERS;
    }

    function saveAdminUsers(users) {
        try {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        } catch (e) {
            console.warn('Chyba při ukládání databáze uživatelů:', e);
        }
    }

    function getAuthenticatedUser() {
        try {
            const sess = sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(SESSION_STORAGE_KEY);
            if (!sess) return null;
            return JSON.parse(sess);
        } catch (e) {
            return null;
        }
    }

    function setAuthenticatedUser(user, remember) {
        const sessionData = {
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role,
            loginAt: new Date().toISOString()
        };
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
        if (remember) {
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
        } else {
            localStorage.removeItem(SESSION_STORAGE_KEY);
        }
        updateAdminUIAuthState();
    }

    function logoutAdminUser() {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        localStorage.removeItem(SESSION_STORAGE_KEY);
        if (adminPanel) adminPanel.classList.remove('active');
        updateAdminUIAuthState();
        showAuthNotification('🚪 Byli jste úspěšně odhlášeni z administrace.');
    }

    function showAuthNotification(text) {
        const oldToast = document.getElementById('auth-floating-toast');
        if (oldToast) oldToast.remove();

        const toast = document.createElement('div');
        toast.id = 'auth-floating-toast';
        toast.textContent = text;
        toast.style.cssText = 'position: fixed; bottom: 85px; right: 20px; background: #1e2024; color: #fff; padding: 12px 18px; border-radius: 10px; font-size: 0.88rem; font-weight: 600; box-shadow: 0 10px 30px rgba(0,0,0,0.3); z-index: 10010; border-left: 4px solid var(--gold-color); animation: authFadeIn 0.3s ease;';
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.transition = 'opacity 0.4s';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    function updateAdminUIAuthState() {
        const user = getAuthenticatedUser();
        const adminLoggedName = document.getElementById('admin-logged-user-name');
        const adminUserPill = document.getElementById('admin-user-status-pill');
        const adminSecUserDisplay = document.getElementById('admin-sec-user-display');
        const adminSecEmailInput = document.getElementById('admin-sec-email-input');

        if (user) {
            if (adminLoggedName) adminLoggedName.textContent = user.username || user.email;
            if (adminUserPill) adminUserPill.title = `Přihlášen jako: ${user.name} (${user.email})`;
            if (adminSecUserDisplay) adminSecUserDisplay.textContent = `${user.name} (${user.email})`;
            if (adminSecEmailInput) adminSecEmailInput.value = user.email;
            if (adminToggle) adminToggle.title = `Nastavení webu (Přihlášen: ${user.username})`;
        } else {
            if (adminLoggedName) adminLoggedName.textContent = 'Nepřihlášen';
            if (adminToggle) adminToggle.title = 'Přihlásit se do administrace';
            if (adminPanel) adminPanel.classList.remove('active');
        }
    }

    // Modal selectors
    const adminLoginModal = document.getElementById('admin-login-modal');
    const authModalCloseBtn = document.getElementById('auth-modal-close-btn');
    const authViewLogin = document.getElementById('auth-view-login');
    const authViewForgot = document.getElementById('auth-view-forgot');
    const authLoginForm = document.getElementById('auth-login-form');
    const authForgotForm = document.getElementById('auth-forgot-form');
    const authLoginAlert = document.getElementById('auth-login-alert');
    const authForgotAlert = document.getElementById('auth-forgot-alert');
    const authUsernameInput = document.getElementById('auth-username');
    const authPasswordInput = document.getElementById('auth-password');
    const authForgotEmailInput = document.getElementById('auth-forgot-email');
    const authRememberCheckbox = document.getElementById('auth-remember');
    const authShowForgotBtn = document.getElementById('auth-show-forgot-btn');
    const authBackToLoginBtn = document.getElementById('auth-back-to-login-btn');
    const authTogglePwdBtn = document.getElementById('auth-toggle-pwd');
    const authEyeOpen = document.getElementById('auth-eye-open');
    const authEyeClosed = document.getElementById('auth-eye-closed');
    const authDemoFillBtn = document.getElementById('auth-demo-fill-btn');

    function openLoginModal() {
        if (!adminLoginModal) return;
        if (authViewLogin) authViewLogin.style.display = 'block';
        if (authViewForgot) authViewForgot.style.display = 'none';
        if (authLoginAlert) {
            authLoginAlert.style.display = 'none';
            authLoginAlert.innerHTML = '';
        }
        if (authForgotAlert) {
            authForgotAlert.style.display = 'none';
            authForgotAlert.innerHTML = '';
        }
        if (authPasswordInput) authPasswordInput.value = '';

        adminLoginModal.classList.add('active');
        setTimeout(() => {
            if (authUsernameInput) {
                if (!authUsernameInput.value) {
                    authUsernameInput.focus();
                } else if (authPasswordInput) {
                    authPasswordInput.focus();
                }
            }
        }, 100);
    }

    function closeLoginModal() {
        if (!adminLoginModal) return;
        adminLoginModal.classList.remove('active');
    }

    function shakeAuthModal() {
        const card = adminLoginModal ? adminLoginModal.querySelector('.auth-modal-card') : null;
        if (card) {
            card.classList.remove('shake');
            void card.offsetWidth;
            card.classList.add('shake');
            setTimeout(() => card.classList.remove('shake'), 500);
        }
    }

    function openAdminPanel() {
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
    }

    // Admin Toggle (Ozubené kolečko) - Auth Gatekeeper
    adminToggle.addEventListener('click', () => {
        const user = getAuthenticatedUser();
        if (!user) {
            openLoginModal();
            return;
        }

        const isActive = adminPanel.classList.contains('active');
        if (!isActive) {
            openAdminPanel();
        } else {
            adminPanel.classList.remove('active');
        }
    });

    // Double click on toggle gear resets to default dock position (only if authenticated)
    adminToggle.addEventListener('dblclick', () => {
        const user = getAuthenticatedUser();
        if (!user) {
            openLoginModal();
            return;
        }
        adminPanel.classList.remove('is-floating');
        adminPanel.style.left = '';
        adminPanel.style.top = '';
        adminPanel.style.width = '';
        adminPanel.style.height = '';
        adminPanel.classList.add('active');
    });

    // Modal Close buttons & interactions
    if (authModalCloseBtn) {
        authModalCloseBtn.addEventListener('click', closeLoginModal);
    }
    if (adminLoginModal) {
        adminLoginModal.addEventListener('click', (e) => {
            if (e.target === adminLoginModal) {
                closeLoginModal();
            }
        });
    }
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && adminLoginModal && adminLoginModal.classList.contains('active')) {
            closeLoginModal();
        }
    });

    // Login Form Submit
    if (authLoginForm) {
        authLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = authUsernameInput ? authUsernameInput.value.trim() : '';
            const password = authPasswordInput ? authPasswordInput.value : '';
            const remember = authRememberCheckbox ? authRememberCheckbox.checked : true;

            if (!username || !password) {
                if (authLoginAlert) {
                    authLoginAlert.className = 'auth-alert error';
                    authLoginAlert.textContent = 'Zadejte prosím uživatelské jméno a heslo.';
                    authLoginAlert.style.display = 'block';
                }
                shakeAuthModal();
                return;
            }

            const users = getAdminUsers();
            const matched = users.find(u => 
                (u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()) &&
                u.password === password
            );

            if (matched) {
                if (authLoginAlert) {
                    authLoginAlert.className = 'auth-alert success';
                    authLoginAlert.textContent = '✅ Přihlášení úspěšné! Načítám nastavení webu...';
                    authLoginAlert.style.display = 'block';
                }
                setAuthenticatedUser(matched, remember);

                setTimeout(() => {
                    closeLoginModal();
                    openAdminPanel();
                    if (authPasswordInput) authPasswordInput.value = '';
                    if (authLoginAlert) authLoginAlert.style.display = 'none';
                }, 400);
            } else {
                shakeAuthModal();
                if (authLoginAlert) {
                    authLoginAlert.className = 'auth-alert error';
                    authLoginAlert.textContent = '❌ Neplatné uživatelské jméno nebo heslo. Zkontrolujte prosím zadané údaje.';
                    authLoginAlert.style.display = 'block';
                }
                if (authPasswordInput) {
                    authPasswordInput.focus();
                    authPasswordInput.select();
                }
            }
        });
    }

    // Forgot Password Interactions
    if (authShowForgotBtn) {
        authShowForgotBtn.addEventListener('click', () => {
            if (authViewLogin) authViewLogin.style.display = 'none';
            if (authViewForgot) authViewForgot.style.display = 'block';
            if (authForgotAlert) authForgotAlert.style.display = 'none';

            const curVal = authUsernameInput ? authUsernameInput.value.trim() : '';
            if (curVal && curVal.includes('@') && authForgotEmailInput) {
                authForgotEmailInput.value = curVal;
            }
            setTimeout(() => {
                if (authForgotEmailInput) authForgotEmailInput.focus();
            }, 50);
        });
    }

    if (authBackToLoginBtn) {
        authBackToLoginBtn.addEventListener('click', () => {
            if (authViewForgot) authViewForgot.style.display = 'none';
            if (authViewLogin) authViewLogin.style.display = 'block';
            if (authLoginAlert) authLoginAlert.style.display = 'none';
            setTimeout(() => {
                if (authUsernameInput) authUsernameInput.focus();
            }, 50);
        });
    }

    if (authForgotForm) {
        authForgotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = authForgotEmailInput ? authForgotEmailInput.value.trim().toLowerCase() : '';

            if (!email) {
                if (authForgotAlert) {
                    authForgotAlert.className = 'auth-alert error';
                    authForgotAlert.textContent = 'Zadejte prosím e-mailovou adresu.';
                    authForgotAlert.style.display = 'block';
                }
                shakeAuthModal();
                return;
            }

            const users = getAdminUsers();
            const found = users.find(u => u.email.toLowerCase() === email);

            if (found) {
                if (authForgotAlert) {
                    authForgotAlert.className = 'auth-alert success';
                    authForgotAlert.innerHTML = `
                        <div style="font-weight: 700; margin-bottom: 6px;">✅ Heslo bylo úspěšně odesláno na e-mail:</div>
                        <div style="color: inherit; font-size: 0.95rem; margin-bottom: 10px;"><strong>${escapeHtml(found.email)}</strong></div>
                        <div style="background: rgba(0,0,0,0.06); padding: 8px 10px; border-radius: 8px; font-size: 0.82rem; margin-bottom: 12px; line-height: 1.45;">
                            <span style="font-size: 0.76rem; text-transform: uppercase; font-weight: 700; color: var(--gold-color);">💡 Testovací zobrazení hesla:</span><br>
                            Vaše heslo je: <code style="font-size: 1.05rem; font-weight: 800; color: var(--gold-color); letter-spacing: 0.5px;">${escapeHtml(found.password)}</code><br>
                            <span style="font-size: 0.72rem; opacity: 0.75;">(V ostrém provozu se toto heslo odešle skrytě přes e-mailovou bránu).</span>
                        </div>
                        <button type="button" id="auth-fill-found-btn" class="btn" style="width: 100%; padding: 8px; font-size: 0.84rem; background: var(--accent-color); color: #fff; font-weight: 700;">
                            ← Přejít k přihlášení s tímto e-mailem
                        </button>
                    `;
                    authForgotAlert.style.display = 'block';

                    const fillFoundBtn = document.getElementById('auth-fill-found-btn');
                    if (fillFoundBtn) {
                        fillFoundBtn.addEventListener('click', () => {
                            if (authViewForgot) authViewForgot.style.display = 'none';
                            if (authViewLogin) authViewLogin.style.display = 'block';
                            if (authUsernameInput) authUsernameInput.value = found.email;
                            if (authPasswordInput) authPasswordInput.value = found.password;
                            if (authLoginAlert) {
                                authLoginAlert.className = 'auth-alert info';
                                authLoginAlert.textContent = '⚡ Údaje z obnovy hesla byly předvyplněny.';
                                authLoginAlert.style.display = 'block';
                            }
                            if (authPasswordInput) authPasswordInput.focus();
                        });
                    }
                }
            } else {
                shakeAuthModal();
                if (authForgotAlert) {
                    authForgotAlert.className = 'auth-alert error';
                    authForgotAlert.innerHTML = `
                        <div style="font-weight: 700; margin-bottom: 4px;">❌ E-mail nebyl v systému nalezen</div>
                        <div>Zadaný e-mail <strong>${escapeHtml(email)}</strong> se nenachází v databázi oprávněných správců. Zkontrolujte prosím správnost nebo kontaktujte správce webu.</div>
                    `;
                    authForgotAlert.style.display = 'block';
                }
            }
        });
    }

    // Demo Fill Button
    if (authDemoFillBtn) {
        authDemoFillBtn.addEventListener('click', () => {
            if (authUsernameInput) authUsernameInput.value = 'admin';
            if (authPasswordInput) authPasswordInput.value = 'admin123';
            if (authLoginAlert) {
                authLoginAlert.className = 'auth-alert info';
                authLoginAlert.textContent = '⚡ Testovací údaje vyplněny. Klikněte na Přihlásit se.';
                authLoginAlert.style.display = 'block';
            }
        });
    }

    // Password Visibility Toggle
    if (authTogglePwdBtn && authPasswordInput) {
        authTogglePwdBtn.addEventListener('click', () => {
            const isPass = authPasswordInput.type === 'password';
            authPasswordInput.type = isPass ? 'text' : 'password';
            if (authEyeOpen) authEyeOpen.style.display = isPass ? 'none' : 'block';
            if (authEyeClosed) authEyeClosed.style.display = isPass ? 'block' : 'none';
        });
    }

    // Initialize Auth UI on page load
    updateAdminUIAuthState();

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

    // Header & Security Logout and Settings handlers
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const adminSecLogoutBtn = document.getElementById('admin-sec-logout-btn');
    const adminSecEmailInput = document.getElementById('admin-sec-email-input');
    const adminSecNewPassInput = document.getElementById('admin-sec-new-pass-input');
    const adminSecConfirmPassInput = document.getElementById('admin-sec-confirm-pass-input');
    const adminSecSavePassBtn = document.getElementById('admin-sec-save-pass-btn');
    const adminSecAlert = document.getElementById('admin-sec-alert');

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            logoutAdminUser();
        });
    }

    if (adminSecLogoutBtn) {
        adminSecLogoutBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            logoutAdminUser();
        });
    }

    if (adminSecSavePassBtn) {
        adminSecSavePassBtn.addEventListener('click', () => {
            const user = getAuthenticatedUser();
            if (!user) return;

            const newEmail = adminSecEmailInput ? adminSecEmailInput.value.trim() : '';
            const newPass = adminSecNewPassInput ? adminSecNewPassInput.value : '';
            const confirmPass = adminSecConfirmPassInput ? adminSecConfirmPassInput.value : '';

            const showSecNotice = (msg, isErr) => {
                if (!adminSecAlert) return;
                adminSecAlert.style.display = 'block';
                adminSecAlert.style.background = isErr ? 'rgba(231, 76, 60, 0.15)' : 'rgba(39, 174, 96, 0.15)';
                adminSecAlert.style.color = isErr ? '#c0392b' : '#27ae60';
                adminSecAlert.style.border = `1px solid ${isErr ? 'rgba(231, 76, 60, 0.3)' : 'rgba(39, 174, 96, 0.3)'}`;
                adminSecAlert.innerHTML = msg;
                setTimeout(() => {
                    if (adminSecAlert) adminSecAlert.style.display = 'none';
                }, 5000);
            };

            if (!newEmail || !newEmail.includes('@')) {
                showSecNotice('Zadejte prosím platný e-mail správce.', true);
                return;
            }

            if (newPass || confirmPass) {
                if (newPass.length < 4) {
                    showSecNotice('Heslo musí mít alespoň 4 znaky.', true);
                    return;
                }
                if (newPass !== confirmPass) {
                    showSecNotice('Nové heslo a potvrzení nového hesla se neshodují.', true);
                    return;
                }
            }

            const users = getAdminUsers();
            const idx = users.findIndex(u => 
                u.username.toLowerCase() === user.username.toLowerCase() ||
                u.email.toLowerCase() === user.email.toLowerCase()
            );

            if (idx !== -1) {
                users[idx].email = newEmail;
                if (newPass) {
                    users[idx].password = newPass;
                }
                saveAdminUsers(users);

                user.email = newEmail;
                setAuthenticatedUser(user, true);
                updateAdminUIAuthState();

                if (adminSecNewPassInput) adminSecNewPassInput.value = '';
                if (adminSecConfirmPassInput) adminSecConfirmPassInput.value = '';

                showSecNotice('✅ Zabezpečení a přístupové údaje byly úspěšně aktualizovány.', false);
                showAuthNotification('🔒 Přístupové údaje k administraci byly uloženy.');
            } else {
                showSecNotice('Uživatelský účet nebyl v databázi nalezen.', true);
            }
        });
    }

    // --- Triplex House Image Zoom & Position System ---
    const triplexZoomInput = document.getElementById('triplex-zoom-input');
    const triplexZoomNumber = document.getElementById('triplex-zoom-number');
    const triplexPosxInput = document.getElementById('triplex-posx-input');
    const triplexPosxNumber = document.getElementById('triplex-posx-number');
    const triplexPosyInput = document.getElementById('triplex-posy-input');
    const triplexPosyNumber = document.getElementById('triplex-posy-number');
    const triplexResetTransformBtn = document.getElementById('triplex-reset-transform-btn');

    window.applyTriplexTransform = (save = false) => {
        if (!unitsConfig) unitsConfig = {};
        const zoom = (unitsConfig.zoom !== undefined) ? Number(unitsConfig.zoom) : 100;
        const posX = (unitsConfig.posX !== undefined) ? Number(unitsConfig.posX) : 0;
        const posY = (unitsConfig.posY !== undefined) ? Number(unitsConfig.posY) : 0;

        const canvas = document.getElementById('units-viewport-canvas');
        if (canvas) {
            canvas.style.transform = `translate3d(${posX}%, ${posY}%, 0) scale(${zoom / 100})`;
            canvas.style.transformOrigin = 'center center';
        }

        const tZoomIn = document.getElementById('triplex-zoom-input');
        const tZoomNum = document.getElementById('triplex-zoom-number');
        const tPosXIn = document.getElementById('triplex-posx-input');
        const tPosXNum = document.getElementById('triplex-posx-number');
        const tPosYIn = document.getElementById('triplex-posy-input');
        const tPosYNum = document.getElementById('triplex-posy-number');

        if (tZoomIn && Number(tZoomIn.value) !== zoom) tZoomIn.value = zoom;
        if (tZoomNum && Number(tZoomNum.value) !== zoom) tZoomNum.value = zoom;
        if (tPosXIn && Number(tPosXIn.value) !== posX) tPosXIn.value = posX;
        if (tPosXNum && Number(tPosXNum.value) !== posX) tPosXNum.value = posX;
        if (tPosYIn && Number(tPosYIn.value) !== posY) tPosYIn.value = posY;
        if (tPosYNum && Number(tPosYNum.value) !== posY) tPosYNum.value = posY;

        if (save && typeof saveToStorage === 'function') {
            saveToStorage(true);
        }
    };

    window.setUnitsZoom = (level, save = false) => {
        if (!unitsConfig) unitsConfig = {};
        unitsConfig.zoom = Math.min(250, Math.max(100, Math.round(Number(level) || 100)));
        window.applyTriplexTransform(save);
    };

    ['input', 'change'].forEach(evt => {
        if (triplexZoomInput) {
            triplexZoomInput.addEventListener(evt, (e) => {
                if (!unitsConfig) unitsConfig = {};
                unitsConfig.zoom = Number(e.target.value);
                window.applyTriplexTransform(true);
            });
        }
        if (triplexZoomNumber) {
            triplexZoomNumber.addEventListener(evt, (e) => {
                if (!unitsConfig) unitsConfig = {};
                unitsConfig.zoom = Number(e.target.value);
                window.applyTriplexTransform(true);
            });
        }
        if (triplexPosxInput) {
            triplexPosxInput.addEventListener(evt, (e) => {
                if (!unitsConfig) unitsConfig = {};
                unitsConfig.posX = Number(e.target.value);
                window.applyTriplexTransform(true);
            });
        }
        if (triplexPosxNumber) {
            triplexPosxNumber.addEventListener(evt, (e) => {
                if (!unitsConfig) unitsConfig = {};
                unitsConfig.posX = Number(e.target.value);
                window.applyTriplexTransform(true);
            });
        }
        if (triplexPosyInput) {
            triplexPosyInput.addEventListener(evt, (e) => {
                if (!unitsConfig) unitsConfig = {};
                unitsConfig.posY = Number(e.target.value);
                window.applyTriplexTransform(true);
            });
        }
        if (triplexPosyNumber) {
            triplexPosyNumber.addEventListener(evt, (e) => {
                if (!unitsConfig) unitsConfig = {};
                unitsConfig.posY = Number(e.target.value);
                window.applyTriplexTransform(true);
            });
        }
    });

    if (triplexResetTransformBtn) {
        triplexResetTransformBtn.addEventListener('click', () => {
            if (!unitsConfig) unitsConfig = {};
            unitsConfig.zoom = 100;
            unitsConfig.posX = 0;
            unitsConfig.posY = 0;
            window.applyTriplexTransform(true);
        });
    }

    // Initialize per-unit polygon custom highlight & stroke controls
    const initPerUnitPolygonControls = () => {
        if (!unitsConfig.polygonSettings) unitsConfig.polygonSettings = {};
        for (let i = 1; i <= 9; i++) {
            if (!unitsConfig.polygonSettings[i]) {
                unitsConfig.polygonSettings[i] = {
                    permanentFill: false,
                    fillColor: '#c5a059',
                    fillOpacity: 40,
                    strokeMode: 'global'
                };
            }

            const permCheck = document.getElementById(`unit-${i}-perm-fill-check`);
            const permOpts = document.getElementById(`unit-${i}-perm-fill-options`);
            const fillCol = document.getElementById(`unit-${i}-fill-color-input`);
            const fillOp = document.getElementById(`unit-${i}-fill-opacity-input`);
            const strokeMode = document.getElementById(`unit-${i}-stroke-mode-input`);

            if (permCheck) {
                permCheck.checked = !!unitsConfig.polygonSettings[i].permanentFill;
                if (permOpts) permOpts.style.display = permCheck.checked ? 'block' : 'none';

                permCheck.onchange = (e) => {
                    unitsConfig.polygonSettings[i].permanentFill = e.target.checked;
                    if (permOpts) permOpts.style.display = e.target.checked ? 'block' : 'none';
                    renderUnitZones();
                    saveToStorage(true);
                };
            }

            if (fillCol) {
                fillCol.value = unitsConfig.polygonSettings[i].fillColor || '#c5a059';
                fillCol.oninput = (e) => {
                    unitsConfig.polygonSettings[i].fillColor = e.target.value;
                    renderUnitZones();
                    saveToStorage(true);
                };
            }

            if (fillOp) {
                fillOp.value = (unitsConfig.polygonSettings[i].fillOpacity !== undefined) ? unitsConfig.polygonSettings[i].fillOpacity : 40;
                fillOp.oninput = (e) => {
                    unitsConfig.polygonSettings[i].fillOpacity = parseInt(e.target.value) || 40;
                    renderUnitZones();
                    saveToStorage(true);
                };
            }

            if (strokeMode) {
                strokeMode.value = unitsConfig.polygonSettings[i].strokeMode || 'global';
                strokeMode.onchange = (e) => {
                    unitsConfig.polygonSettings[i].strokeMode = e.target.value;
                    renderUnitZones();
                    saveToStorage(true);
                };
            }
        }
    };

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
    let scrollAnimId = null;
    let targetScrollPos = null;

    const stopMomentum = () => {
        if (momentumID) { cancelAnimationFrame(momentumID); momentumID = null; }
        if (scrollAnimId) { cancelAnimationFrame(scrollAnimId); scrollAnimId = null; }
        targetScrollPos = null;
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
        if (!galleryContainer) return 340;
        const items = galleryContainer.querySelectorAll('.gallery-item');
        if (items.length >= 3) {
            const diff = items[2].getBoundingClientRect().left - items[0].getBoundingClientRect().left;
            if (diff > 50) return Math.round(diff);
        }
        const firstItem = galleryContainer.querySelector('.gallery-item');
        if (firstItem) {
            const style = window.getComputedStyle(galleryContainer);
            const gap = parseFloat(style.columnGap || style.gap) || 24;
            return Math.round(firstItem.offsetWidth + gap);
        }
        return 340;
    };

    const smoothScrollTo = (target, duration = 400) => {
        if (!galleryContainer) return;
        if (scrollAnimId) {
            cancelAnimationFrame(scrollAnimId);
            scrollAnimId = null;
        }

        const maxScroll = galleryContainer.scrollWidth - galleryContainer.clientWidth;
        const clampedTarget = Math.max(0, Math.min(maxScroll, Math.round(target)));
        const start = galleryContainer.scrollLeft;
        const change = clampedTarget - start;

        if (Math.abs(change) < 2) {
            targetScrollPos = null;
            return;
        }

        const startTime = performance.now();
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(1, elapsed / duration);
            const ease = easeOutCubic(progress);
            galleryContainer.scrollLeft = start + change * ease;

            if (progress < 1) {
                scrollAnimId = requestAnimationFrame(animate);
            } else {
                galleryContainer.scrollLeft = clampedTarget;
                scrollAnimId = null;
                targetScrollPos = null;
            }
        };

        scrollAnimId = requestAnimationFrame(animate);
    };

    const scrollGalleryByDirection = (dir) => {
        if (!galleryContainer) return;
        stopMomentum();

        const colWidth = getColumnWidth();
        const maxScroll = galleryContainer.scrollWidth - galleryContainer.clientWidth;
        if (maxScroll <= 0) return;

        const current = (targetScrollPos !== null) ? targetScrollPos : galleryContainer.scrollLeft;

        let target;
        if (dir > 0) {
            target = (Math.floor((current + 5) / colWidth) + 1) * colWidth;
            if (target > maxScroll) target = maxScroll;
        } else {
            target = (Math.ceil((current - 5) / colWidth) - 1) * colWidth;
            if (target < 0) target = 0;
        }

        targetScrollPos = target;
        smoothScrollTo(target, 420);
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
            scrollGalleryByDirection(-1);
        });
        prevBtn.addEventListener('mousedown', (e) => e.stopPropagation());
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            scrollGalleryByDirection(1);
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

    
    // Broker info listeners
    if (agentAddressInput) {
        agentAddressInput.addEventListener('input', (e) => {
            const el = document.getElementById('editable-agent-address');
            const row = document.getElementById('editable-agent-address-row');
            if (el) el.textContent = e.target.value;
            if (row) row.style.display = e.target.value ? 'flex' : 'none';
        });
    }
    if (agentIcoInput) {
        agentIcoInput.addEventListener('input', (e) => {
            const el = document.getElementById('editable-agent-ico');
            const row = document.getElementById('editable-agent-ico-row');
            if (el) el.textContent = e.target.value;
            if (row) row.style.display = e.target.value ? 'flex' : 'none';
        });
    }
    if (agentHoursInput) {
        agentHoursInput.addEventListener('input', (e) => {
            const el = document.getElementById('editable-agent-hours');
            const row = document.getElementById('editable-agent-hours-row');
            if (el) el.textContent = e.target.value;
            if (row) row.style.display = e.target.value ? 'flex' : 'none';
        });
    }
    // Agent name live-update
    if (agentNameInput) {
        agentNameInput.addEventListener('input', (e) => {
            const display = document.getElementById('editable-agent-name');
            if (display) display.textContent = e.target.value || 'Michal Švec';
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

    // --- Partners Logic & Unified Admin ---
    const partnersGrid = document.getElementById('partners-grid');
    const adminPartnersList = document.getElementById('admin-partners-list');
    const partnerLogoSizeInput = document.getElementById('partner-logo-size-input');
    const partnerLogoSizeVal = document.getElementById('partner-logo-size-val');
    const addPartnerBtn = document.getElementById('add-partner-btn');
    const clearAllPartnersBtn = document.getElementById('clear-all-partners-btn');

    // Render Web Partners Grid
    const renderPartners = async () => {
        if (!partnersGrid) return;
        partnersGrid.innerHTML = '';

        const activePartners = (partnersData || []).filter(p => p && p.logo);
        const contactContainer = document.querySelector('.contact-container');
        const partnersSection = document.querySelector('.partners-section');

        if (activePartners.length === 0) {
            if (contactContainer) contactContainer.classList.add('no-partners');
            if (partnersSection) partnersSection.style.display = 'none';
            return;
        } else {
            if (contactContainer) contactContainer.classList.remove('no-partners');
            if (partnersSection) partnersSection.style.display = 'block';
        }

        for (const partner of activePartners) {
            let logoSrc = partner.logo;
            if (logoSrc && logoSrc.startsWith('db:')) {
                try {
                    const data = await MediaDB.load(logoSrc.split(':')[1]);
                    if (data) logoSrc = data;
                } catch (e) {
                    console.warn('Error loading partner logo from MediaDB:', e);
                }
            }

            const item = document.createElement('a');
            item.href = partner.url || '#';
            if (partner.url) {
                item.target = '_blank';
                item.rel = 'noopener noreferrer';
            } else {
                item.removeAttribute('target');
                item.removeAttribute('rel');
                item.style.cursor = 'default';
            }
            item.className = 'partner-item';
            item.style.cssText = 'display: flex; align-items: center; justify-content: center; padding: 0.5rem; height: var(--partner-card-height, 70px); background: transparent !important; border: none !important; box-shadow: none !important; cursor: pointer; text-decoration: none; width: 100%; box-sizing: border-box;';

            const img = document.createElement('img');
            img.src = logoSrc;
            img.alt = 'Partner';
            const baseScale = (partner.scale !== undefined && partner.scale !== null) ? (Number(partner.scale) / 100) : 1;
            img.style.cssText = `width: 100%; height: var(--partner-logo-height, 50px); max-height: var(--partner-logo-height, 50px); object-fit: contain; filter: grayscale(1); opacity: 0.55; transition: all 0.35s ease; display: block; pointer-events: none; transform: scale(${baseScale});`;

            item.addEventListener('mouseenter', () => {
                img.style.filter = 'grayscale(0) saturate(1.2)';
                img.style.opacity = '1';
                img.style.transform = `scale(${baseScale * 1.08})`;
            });
            item.addEventListener('mouseleave', () => {
                img.style.filter = 'grayscale(1)';
                img.style.opacity = '0.55';
                img.style.transform = `scale(${baseScale})`;
            });

            item.appendChild(img);

            partnersGrid.appendChild(item);
        }
    };

    // Render Admin Partners Panel
    const renderAdminPartners = async () => {
        if (!adminPartnersList) return;
        adminPartnersList.innerHTML = '';

        if (!partnersData || partnersData.length === 0) {
            adminPartnersList.innerHTML = `
                <div style="text-align: center; padding: 1.5rem; background: rgba(0,0,0,0.02); border-radius: 8px; border: 1px dashed #ccc; color: #888; font-size: 0.85rem;">
                    Žádní partneři nejsou nastaveni.<br>
                    Klikněte na <strong>➕ Přidat partnera</strong> pro vložení prvního partnera.
                </div>
            `;
            return;
        }

        for (let index = 0; index < partnersData.length; index++) {
            const partner = partnersData[index];
            if (!partner) continue;

            let resolvedLogo = '';
            if (partner.logo) {
                if (partner.logo.startsWith('db:')) {
                    try {
                        const data = await MediaDB.load(partner.logo.split(':')[1]);
                        if (data) resolvedLogo = data;
                    } catch(e) {}
                } else {
                    resolvedLogo = partner.logo;
                }
            }

            const scale = (partner.scale !== undefined && partner.scale !== null) ? Number(partner.scale) : 100;

            const block = document.createElement('div');
            block.className = 'partner-admin-block';
            block.style.cssText = 'border: 1px solid #e2e8f0; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; background: #ffffff;';

            block.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 700; font-size: 0.95rem;">Partner ${index + 1}</span>
                        ${resolvedLogo ? '<span style="background: #e6f4ea; color: #137333; font-size: 0.72rem; padding: 2px 7px; border-radius: 10px; font-weight: 600;">Aktivní</span>' : '<span style="background: #f1f3f4; color: #5f6368; font-size: 0.72rem; padding: 2px 7px; border-radius: 10px;">Bez loga</span>'}
                    </div>
                    <button type="button" class="btn" style="background: #e74c3c; color: #fff; font-weight: 600; padding: 4px 10px; font-size: 0.78rem; border-radius: 4px; border: none; cursor: pointer;" onclick="window.removePartner(${index})" title="Smazat tohoto partnera">🗑️ Smazat partnera</button>
                </div>

                <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.85rem;">
                    <div class="partner-preview-box" style="width: 110px; height: 60px; border: 1px dashed #cbd5e1; border-radius: 6px; background: #f8fafc; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; padding: 4px; box-sizing: border-box;">
                        ${resolvedLogo ? `<img src="${resolvedLogo}" alt="Náhled ${index + 1}" style="max-width: 100%; max-height: 100%; object-fit: contain; transform: scale(${scale / 100});">` : '<span style="font-size: 0.72rem; color: #94a3b8; text-align: center;">Žádné<br>logo</span>'}
                    </div>
                    <div style="flex: 1;">
                        <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Logo (Upload)</label>
                        <input type="file" id="partner-file-input-${index}" accept="image/*" style="font-size: 0.78rem; width: 100%;">
                        ${resolvedLogo ? `<button type="button" style="background: none; border: none; color: #e74c3c; font-size: 0.74rem; cursor: pointer; text-decoration: underline; margin-top: 4px; padding: 0;" onclick="window.clearPartnerLogo(${index})">Odstranit pouze logo</button>` : ''}
                    </div>
                </div>

                <div class="control-group" style="margin-bottom: 0.6rem;">
                    <label style="font-size: 0.78rem; font-weight: 600; margin-bottom: 0.25rem;">Odkaz (URL)</label>
                    <input type="text" value="${partner.url || ''}" placeholder="https://..." oninput="window.updatePartnerUrl(${index}, this.value)">
                </div>

                <div class="control-group" style="margin-bottom: 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; margin-bottom: 0.2rem;">
                        <label style="margin: 0; font-size: 0.75rem; opacity: 0.8;">Optické měřítko loga</label>
                        <span id="partner-scale-label-${index}" style="font-weight: 600;">${scale}%</span>
                    </div>
                    <input type="range" min="60" max="140" value="${scale}" step="5" oninput="window.updatePartnerScale(${index}, this.value)">
                </div>
            `;

            adminPartnersList.appendChild(block);

            // Bind file upload for this block
            const fileInput = block.querySelector(`#partner-file-input-${index}`);
            if (fileInput) {
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    if (file.size > 10 * 1024 * 1024) {
                        alert(`Soubor ${file.name} je příliš velký (max 10MB).`);
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const rawBase64 = ev.target.result;
                        const img = new Image();
                        img.onload = async () => {
                            let finalData = rawBase64;
                            try {
                                const trimmed = trimImageCanvas(img);
                                if (trimmed) finalData = trimmed;
                            } catch(err) {
                                console.warn('Trim canvas failed:', err);
                            }

                            const key = `partner_logo_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                            await MediaDB.save(key, finalData);

                            // Clean up previous MediaDB key if exists
                            if (partner.logo && partner.logo.startsWith('db:')) {
                                try { await MediaDB.delete(partner.logo.split(':')[1]); } catch(e){}
                            }

                            partner.logo = `db:${key}`;
                            saveToStorage(true);
                            await renderAdminPartners();
                            await renderPartners();
                        };
                        img.src = rawBase64;
                    };
                    reader.readAsDataURL(file);
                });
            }
        }
    };

    // Global partner helper functions
    window.removePartner = async (index) => {
        if (!confirm(`Opravdu chcete smazat Partnera ${index + 1}?`)) return;
        const partner = partnersData[index];
        if (partner && partner.logo && partner.logo.startsWith('db:')) {
            try { await MediaDB.delete(partner.logo.split(':')[1]); } catch(e) {}
        }
        partnersData.splice(index, 1);
        saveToStorage(true);
        await renderAdminPartners();
        await renderPartners();
    };

    window.clearPartnerLogo = async (index) => {
        const partner = partnersData[index];
        if (!partner) return;
        if (partner.logo && partner.logo.startsWith('db:')) {
            try { await MediaDB.delete(partner.logo.split(':')[1]); } catch(e) {}
        }
        partner.logo = '';
        saveToStorage(true);
        await renderAdminPartners();
        await renderPartners();
    };

    window.updatePartnerUrl = (index, value) => {
        if (partnersData[index]) {
            partnersData[index].url = value;
            saveToStorage(true);
            renderPartners();
        }
    };

    window.updatePartnerScale = (index, value) => {
        if (partnersData[index]) {
            partnersData[index].scale = Number(value);
            const label = document.getElementById(`partner-scale-label-${index}`);
            if (label) label.textContent = `${value}%`;
            saveToStorage(true);
            renderPartners();
        }
    };

    if (addPartnerBtn) {
        addPartnerBtn.addEventListener('click', () => {
            partnersData.push({ id: Date.now(), logo: '', url: '', scale: 100 });
            saveToStorage(true);
            renderAdminPartners();
            renderPartners();
        });
    }

    if (clearAllPartnersBtn) {
        clearAllPartnersBtn.addEventListener('click', async () => {
            if (!confirm('Opravdu chcete smazat všechny partnery a jejich loga?')) return;
            for (const partner of partnersData) {
                if (partner && partner.logo && partner.logo.startsWith('db:')) {
                    try { await MediaDB.delete(partner.logo.split(':')[1]); } catch(e) {}
                }
            }
            partnersData = [];
            saveToStorage(true);
            await renderAdminPartners();
            await renderPartners();
        });
    }

    if (partnerLogoSizeInput) {
        partnerLogoSizeInput.addEventListener('input', (e) => {
            const val = e.target.value;
            root.style.setProperty('--partner-logo-height', `${val}px`);
            root.style.setProperty('--partner-card-height', `${Number(val) + 15}px`);
            if (partnerLogoSizeVal) partnerLogoSizeVal.textContent = `${val} px`;
            saveToStorage(true);
        });
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

            const globalStrokeMode = unitsConfig.strokeMode || 'always'; // 'always', 'hover', 'none'
            const globalStrokeColor = unitsConfig.strokeColorHex || '#ffffff';
            const globalStrokeWidth = (unitsConfig.strokeWidth !== undefined) ? unitsConfig.strokeWidth : 2;

            for (let i = 1; i <= unitsConfig.count; i++) {
                const data = unitsData[i];
                if (!data) continue;

                const pointsStr = (unitsConfig.polygons && unitsConfig.polygons[i]) ? unitsConfig.polygons[i].trim() : '';
                if (!pointsStr) continue;

                const uSettings = (unitsConfig.polygonSettings && unitsConfig.polygonSettings[i]) ? unitsConfig.polygonSettings[i] : {};
                const permFill = uSettings.permanentFill === true;
                const uFillColor = uSettings.fillColor || unitsConfig.hoverColorHex || '#c5a059';
                const uFillOpacity = (uSettings.fillOpacity !== undefined) ? uSettings.fillOpacity : (unitsConfig.hoverOpacity || 40);

                // Determine idle fill
                let idleFill = 'rgba(0, 0, 0, 0)';
                if (permFill) {
                    idleFill = hexToRgba(uFillColor, uFillOpacity);
                } else if (data.status === 'status-reserved') {
                    idleFill = hexToRgba(unitsConfig.reservedColorHex || '#e67e22', unitsConfig.reservedOpacity || 40);
                } else if (data.status === 'status-sold') {
                    idleFill = hexToRgba(unitsConfig.soldColorHex || '#e74c3c', unitsConfig.soldOpacity || 45);
                }

                // Determine hover fill - sold/reserved/permFill units keep their fill without flashing/disappearing
                let hoverFill = hexToRgba(unitsConfig.hoverColorHex || '#c5a059', unitsConfig.hoverOpacity || 40);
                if (permFill || data.status === 'status-sold' || data.status === 'status-reserved') {
                    hoverFill = idleFill;
                }

                // Determine stroke
                const unitStrokeMode = uSettings.strokeMode || 'global';
                const effectiveStrokeMode = (unitStrokeMode === 'global') ? globalStrokeMode : unitStrokeMode;

                let idleStroke = 'none';
                let idleStrokeWidth = '0px';
                if (effectiveStrokeMode === 'always') {
                    idleStroke = globalStrokeColor;
                    idleStrokeWidth = `${globalStrokeWidth}px`;
                }

                let hoverStroke = 'none';
                let hoverStrokeWidth = '0px';
                if (effectiveStrokeMode !== 'none') {
                    hoverStroke = globalStrokeColor;
                    hoverStrokeWidth = `${Math.max(globalStrokeWidth, 2.5)}px`;
                }

                // Create SVG Polygon
                const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                poly.setAttribute('class', `unit-polygon ${data.status}`);
                poly.setAttribute('points', pointsStr);
                poly.setAttribute('data-unit', i);
                
                // Set inline styles directly for 100% reliable rendering
                poly.setAttribute('fill', idleFill);
                poly.setAttribute('stroke', idleStroke);
                poly.setAttribute('stroke-width', idleStrokeWidth);
                poly.style.fill = idleFill;
                poly.style.stroke = idleStroke;
                poly.style.strokeWidth = idleStrokeWidth;

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

                // Interactivity for Polygon
                poly.addEventListener('mouseenter', (e) => {
                    if (window.isPolygonEditingActive) return;
                    poly.style.fill = hoverFill;
                    poly.style.stroke = hoverStroke;
                    poly.style.strokeWidth = hoverStrokeWidth;
                    poly.setAttribute('fill', hoverFill);
                    poly.setAttribute('stroke', hoverStroke);
                    poly.setAttribute('stroke-width', hoverStrokeWidth);

                    if (popover) {
                        const containerRect = document.getElementById('units-main-container').getBoundingClientRect();
                        const clientX = (cx / 1000) * containerRect.width;
                        const clientY = (cy / 1000) * containerRect.height;
                        
                        if (data.status === 'status-sold') {
                            popover.innerHTML = `
                                <div style="display: flex; align-items: center; justify-content: center; padding: 4px 10px;">
                                    <span style="background: #e74c3c; color: #ffffff; font-weight: 800; font-size: 0.88rem; padding: 6px 16px; border-radius: 6px; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(231,76,60,0.35);">PRODÁNO</span>
                                </div>
                            `;
                        } else {
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
                        }
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
                    poly.style.fill = idleFill;
                    poly.style.stroke = idleStroke;
                    poly.style.strokeWidth = idleStrokeWidth;
                    poly.setAttribute('fill', idleFill);
                    poly.setAttribute('stroke', idleStroke);
                    poly.setAttribute('stroke-width', idleStrokeWidth);

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

        // Automatické překreslení přehledové tabulky jednotek
        renderUnitsTable();
    };

    const getUnitKartaPdf = (unitId) => {
        const u = unitsData[unitId];
        if (!u) return null;
        ensureUnitDynamicFields(u);

        if (u.customFiles && Array.isArray(u.customFiles) && u.customFiles.length > 0) {
            const match = u.customFiles.find(f => f && f.url && (f.name || '').toLowerCase().includes('karta'));
            if (match) return { url: match.url, fileName: match.fileName || `${u.name || 'Jednotka ' + unitId} - Karta bytu.pdf`, name: match.name || 'Karta bytu' };
            if (u.customFiles[0] && u.customFiles[0].url) {
                return { url: u.customFiles[0].url, fileName: u.customFiles[0].fileName || `${u.name || 'Jednotka ' + unitId} - Karta bytu.pdf`, name: u.customFiles[0].name || 'Karta bytu' };
            }
        }

        if (u.pdfKarta) {
            return { url: u.pdfKarta, fileName: `${u.name || 'Jednotka ' + unitId} - Karta bytu.pdf`, name: 'Karta bytu' };
        }

        return null;
    };

    const getUnitStandardyPdf = (unitId) => {
        const u = unitsData[unitId];
        if (!u) return null;
        ensureUnitDynamicFields(u);

        if (u.customFiles && Array.isArray(u.customFiles) && u.customFiles.length > 0) {
            const match = u.customFiles.find(f => f && f.url && (f.name || '').toLowerCase().includes('standard'));
            if (match) return { url: match.url, fileName: match.fileName || `${u.name || 'Jednotka ' + unitId} - Standardy.pdf`, name: match.name || 'Standardy' };
            if (u.customFiles[1] && u.customFiles[1].url) {
                return { url: u.customFiles[1].url, fileName: u.customFiles[1].fileName || `${u.name || 'Jednotka ' + unitId} - Standardy.pdf`, name: u.customFiles[1].name || 'Standardy' };
            }
        }

        if (u.pdfStandardy) {
            return { url: u.pdfStandardy, fileName: `${u.name || 'Jednotka ' + unitId} - Standardy.pdf`, name: 'Standardy' };
        }

        return null;
    };

    const renderUnitsTable = () => {
        const tbody = document.getElementById('units-table-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const count = unitsConfig.count || 3;
        for (let i = 1; i <= count; i++) {
            const data = unitsData[i];
            if (!data) continue;
            ensureUnitDynamicFields(data);

            const tr = document.createElement('tr');
            tr.id = `units-table-row-${i}`;
            tr.dataset.unitId = i;

            // Extract layout, area, garden, price
            let layout = data.layout || '---';
            let area = data.area ? (data.area.includes('m²') ? data.area : `${data.area} m²`) : '---';
            let garden = data.garden ? (data.garden.includes('m²') ? data.garden : `${data.garden} m²`) : '—';
            let price = data.price || 'Na dotaz';

            if (data.customSpecs && Array.isArray(data.customSpecs)) {
                data.customSpecs.forEach(s => {
                    const l = (s.label || '').toLowerCase();
                    if (l.includes('dispozice') && s.value && layout === '---') layout = s.value;
                    if (l.includes('plocha') && s.value && area === '---') area = s.value.includes('m²') ? s.value : `${s.value} m²`;
                    if (l.includes('zahrada') && s.value && (garden === '—' || garden === '---')) garden = s.value.includes('m²') ? s.value : `${s.value} m²`;
                    if (l.includes('cena') && s.value && price === 'Na dotaz') price = s.value;
                });
            }

            const statusClass = data.status || 'status-available';
            const statusText = data.statusText || (statusClass === 'status-sold' ? 'Prodáno' : (statusClass === 'status-reserved' ? 'Rezervováno' : 'Volno'));

            const kartaPdf = getUnitKartaPdf(i);
            const hasKarta = !!(kartaPdf && kartaPdf.url);

            const standardyPdf = getUnitStandardyPdf(i);
            const hasStandardy = !!(standardyPdf && standardyPdf.url);

            tr.innerHTML = `
                <td>
                    <div class="unit-name-cell">
                        <span class="unit-num-badge">${i}</span>
                        <span class="unit-name-title">${escapeHtml(data.name || `Jednotka ${i}`)}</span>
                    </div>
                </td>
                <td><span class="unit-layout-tag">${escapeHtml(layout)}</span></td>
                <td><span class="unit-area-val">${escapeHtml(area)}</span></td>
                <td><span class="unit-garden-val">${escapeHtml(garden)}</span></td>
                <td><span class="unit-price-val">${escapeHtml(price)}</span></td>
                <td><span class="unit-status ${statusClass}">${escapeHtml(statusText)}</span></td>
                <td>
                    <button type="button" class="unit-table-btn btn-karta ${hasKarta ? 'has-pdf' : 'no-pdf'}" onclick="event.stopPropagation(); window.openUnitPdf(${i}, 'karta');" title="${hasKarta ? 'Zobrazit náhled nahraného PDF karty bytu' : 'PDF karty bytu zatím nebylo nahráno'}">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        <span>${hasKarta ? 'Náhled PDF' : 'Nenahráno'}</span>
                    </button>
                </td>
                <td>
                    <button type="button" class="unit-table-btn btn-standards ${hasStandardy ? 'has-pdf' : 'no-pdf'}" onclick="event.stopPropagation(); window.openUnitPdf(${i}, 'standardy');" title="${hasStandardy ? 'Zobrazit náhled nahraného PDF standardů' : 'PDF standardů zatím nebylo nahráno'}">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        <span>${hasStandardy ? 'Náhled PDF' : 'Nenahráno'}</span>
                    </button>
                </td>
                <td>
                    <button type="button" class="unit-table-btn btn-detail" onclick="event.stopPropagation(); window.openUnit(${i});" title="Otevřít detail a poptávkový formulář">
                        <span>Detail</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </td>
            `;

            tr.addEventListener('click', () => {
                window.openUnit(i);
            });

            // Highlight polygon or pin on hover
            tr.addEventListener('mouseenter', () => {
                const poly = document.querySelector(`polygon[data-unit-id="${i}"]`);
                if (poly) poly.dispatchEvent(new MouseEvent('mouseenter'));
            });
            tr.addEventListener('mouseleave', () => {
                const poly = document.querySelector(`polygon[data-unit-id="${i}"]`);
                if (poly) poly.dispatchEvent(new MouseEvent('mouseleave'));
            });

            tbody.appendChild(tr);
        }
    };
    window.renderUnitsTable = renderUnitsTable;

    window.openUnitPdf = (unitId, type) => {
        const data = unitsData[unitId];
        if (!data) return;
        ensureUnitDynamicFields(data);

        const modal = document.getElementById('pdf-preview-modal') || document.getElementById('unit-card-preview-modal');
        const body = document.getElementById('pdf-preview-body') || document.getElementById('card-preview-body');
        if (!modal || !body) return;

        const isKarta = type === 'karta';
        const docInfo = isKarta ? getUnitKartaPdf(unitId) : getUnitStandardyPdf(unitId);
        const unitName = data.name || `Jednotka ${unitId}`;
        const docLabel = isKarta ? 'Karta bytu' : 'Standardy bytu';
        const modalTitle = `${unitName} – ${docLabel}`;

        if (docInfo && docInfo.url) {
            const isImage = docInfo.url.startsWith('data:image/') || /\.(png|jpe?g|webp|gif)$/i.test(docInfo.fileName || '');
            const safeFileName = docInfo.fileName || (isKarta ? `${unitName}_karta.pdf` : `${unitName}_standardy.pdf`);

            body.innerHTML = `
                <div class="pdf-modal-head">
                    <div class="pdf-modal-title-wrap">
                        <span class="pdf-badge-tag">${escapeHtml(docLabel.toUpperCase())}</span>
                        <h3 class="pdf-modal-title">${escapeHtml(modalTitle)}</h3>
                        <span class="pdf-filename-tag">${escapeHtml(safeFileName)}</span>
                    </div>
                    <div class="pdf-modal-btn-group">
                        <a href="${docInfo.url}" download="${escapeHtml(safeFileName)}" class="btn-pdf-act btn-pdf-dl" title="Stáhnout soubor do počítače">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            <span>Stáhnout PDF</span>
                        </a>
                        <a href="${docInfo.url}" target="_blank" rel="noopener" class="btn-pdf-act btn-pdf-nw" title="Otevřít v novém okně prohlížeče">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            <span>Otevřít v novém okně</span>
                        </a>
                    </div>
                </div>
                <div class="pdf-modal-viewer">
                    ${isImage ? `
                        <div style="height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.03); border-radius: 8px;">
                            <img src="${docInfo.url}" alt="${escapeHtml(modalTitle)}" style="max-width: 100%; max-height: 75vh; object-fit: contain; border-radius: 6px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                        </div>
                    ` : `
                        <object data="${docInfo.url}" type="application/pdf" class="pdf-embed-object">
                            <iframe src="${docInfo.url}#view=FitH" class="pdf-embed-iframe" title="${escapeHtml(modalTitle)}">
                                <div style="padding: 2rem; text-align: center; color: #fff;">
                                    <p>Váš prohlížeč nepodporuje přímý náhled PDF v okně.</p>
                                    <a href="${docInfo.url}" download="${escapeHtml(safeFileName)}" class="btn" style="background: var(--accent-color); color:#fff; padding: 8px 16px;">Stáhnout PDF soubor</a>
                                </div>
                            </iframe>
                        </object>
                    `}
                </div>
            `;
        } else {
            body.innerHTML = `
                <div class="pdf-modal-head">
                    <div class="pdf-modal-title-wrap">
                        <span class="pdf-badge-tag">${escapeHtml(docLabel.toUpperCase())}</span>
                        <h3 class="pdf-modal-title">${escapeHtml(modalTitle)}</h3>
                    </div>
                </div>
                <div class="pdf-modal-empty-state">
                    <div class="pdf-empty-icon-box">📄</div>
                    <h4>PDF soubor zatím nebyl nahrán</h4>
                    <p>K jednotce <strong>${escapeHtml(unitName)}</strong> zatím v administraci nebyl nahrán soubor PDF pro <em>${escapeHtml(docLabel)}</em>.<br>Můžete jej nahrát v administraci v sekci <strong>Nastavení webu &gt; Správa jednotek &gt; Dokumenty ke stažení</strong>.</p>
                    <button type="button" class="btn" onclick="window.closePdfPreviewModal()" style="background: var(--primary-color, #1a1a1a); color: #fff; padding: 10px 24px; border-radius: 8px; font-weight: 600; margin-top: 1rem;">Rozumím</button>
                </div>
            `;
        }

        modal.classList.add('active');
    };

    window.closePdfPreviewModal = () => {
        const modal = document.getElementById('pdf-preview-modal') || document.getElementById('unit-card-preview-modal');
        if (modal) {
            modal.classList.remove('active');
            const body = document.getElementById('pdf-preview-body') || document.getElementById('card-preview-body');
            if (body) {
                setTimeout(() => {
                    if (!modal.classList.contains('active')) body.innerHTML = '';
                }, 200);
            }
        }
    };

    window.previewUnitCard = (id) => window.openUnitPdf(id, 'karta');
    window.previewUnitStandards = (id) => window.openUnitPdf(id, 'standardy');
    window.closeUnitCardModal = window.closePdfPreviewModal;
    window.closeStandardsModal = window.closePdfPreviewModal;

    const pdfPreviewModalEl = document.getElementById('pdf-preview-modal');
    if (pdfPreviewModalEl) {
        pdfPreviewModalEl.addEventListener('click', (e) => {
            if (e.target === pdfPreviewModalEl) window.closePdfPreviewModal();
        });
    }

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
    
    updateContent(contactTitleInput, contactTitle, 'Zeptejte se na vše, co vás zajímá');
    updateContent(contactTextInput, contactText, 'Máte dotazy k projektu? Kontaktujte nás. S koupí domu a s financováním vám poradí realitní makléř a specialista na financování.');
    updateContent(contactPhoneInput, contactPhone, '+420 721 543 474');
    updateContent(contactEmailInput, contactEmail, 'Michal.svec@realitik.cz');

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

    fbLinkInput.addEventListener('input', (e) => fbLink.href = e.target.value || 'https://www.facebook.com/profile.php?id=61576137536672');
    igLinkInput.addEventListener('input', (e) => igLink.href = e.target.value || 'https://www.instagram.com/domyledenice/');
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
        const lat = parseFloat(gpsLatInput.value) || 48.932424;
        const lng = parseFloat(gpsLngInput.value) || 14.616280;
        mapCoords = { lat, lng };
        initMap(lat, lng);
        updateCadastralLayer();
        if (typeof saveToStorage === 'function') saveToStorage(true);
    };
    gpsLatInput.addEventListener('change', handleGPSUpdate);
    gpsLngInput.addEventListener('change', handleGPSUpdate);
    if (cadastralMapInput) {
        cadastralMapInput.addEventListener('change', () => {
            updateCadastralLayer();
            if (typeof saveToStorage === 'function') saveToStorage(true);
        });
    }

    const mapCadastralBtn = document.getElementById('map-cadastral-btn');
    if (mapCadastralBtn) {
        mapCadastralBtn.addEventListener('click', () => {
            if (cadastralMapInput) {
                cadastralMapInput.checked = !cadastralMapInput.checked;
                updateCadastralLayer();
                if (typeof saveToStorage === 'function') saveToStorage(true);
            }
        });
    }

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

    
    // --- Helper for Unit Dynamic Fields ---
    const ensureUnitDynamicFields = (u) => {
        if (!u) return;
        if (!u.customSpecs || !Array.isArray(u.customSpecs)) {
            u.customSpecs = [];
            if (u.layout) u.customSpecs.push({ label: 'Dispozice', value: u.layout });
            if (u.area) u.customSpecs.push({ label: 'Užitná plocha', value: u.area.includes('m²') ? u.area : `${u.area} m²` });
            if (u.garden) u.customSpecs.push({ label: 'Zahrada', value: u.garden.includes('m²') ? u.garden : `${u.garden} m²` });
            if (u.parking) u.customSpecs.push({ label: 'Parkování', value: u.parking });
            if (u.price) u.customSpecs.push({ label: 'Cena', value: u.price });
            if (u.customSpecs.length === 0) {
                u.customSpecs = [
                    { label: 'Dispozice', value: '' },
                    { label: 'Užitná plocha', value: '' },
                    { label: 'Zahrada', value: '' },
                    { label: 'Parkování', value: '' },
                    { label: 'Cena', value: '' }
                ];
            }
        }
        if (!u.customFiles || !Array.isArray(u.customFiles)) {
            u.customFiles = [];
            if (u.pdfKarta) u.customFiles.push({ name: 'Karta bytu (PDF)', url: u.pdfKarta, fileName: 'karta_bytu.pdf' });
            if (u.pdfStandardy) u.customFiles.push({ name: 'Standardy bytu (PDF)', url: u.pdfStandardy, fileName: 'standardy.pdf' });
            if (u.customFiles.length === 0) {
                u.customFiles = [
                    { name: 'Karta bytu (PDF)', url: '', fileName: '' },
                    { name: 'Standardy bytu (PDF)', url: '', fileName: '' }
                ];
            }
        }
    };

    window.renderUnitAdminDynamic = (unitId) => {
        const data = unitsData[unitId];
        if (!data) return;
        ensureUnitDynamicFields(data);

        const specsContainer = document.getElementById(`unit-${unitId}-specs-list`);
        if (specsContainer) {
            specsContainer.innerHTML = '';
            data.customSpecs.forEach((spec, idx) => {
                const row = document.createElement('div');
                row.className = 'unit-spec-row';
                row.innerHTML = `
                    <input type="text" class="unit-spec-key-input admin-input" value="${escapeHtml(spec.label || '')}" placeholder="Název (např. Zahrada)" onchange="window.updateUnitSpec(${unitId}, ${idx}, 'label', this.value)">
                    <input type="text" class="unit-spec-val-input admin-input" value="${escapeHtml(spec.value || '')}" placeholder="Hodnota (např. 210 m²)" onchange="window.updateUnitSpec(${unitId}, ${idx}, 'value', this.value)">
                    <button type="button" class="btn-remove-row" title="Smazat parametr" onclick="window.removeUnitSpec(${unitId}, ${idx})">✕</button>
                `;
                specsContainer.appendChild(row);
            });
        }

        const filesContainer = document.getElementById(`unit-${unitId}-files-list`);
        if (filesContainer) {
            filesContainer.innerHTML = '';
            data.customFiles.forEach((file, idx) => {
                const row = document.createElement('div');
                row.className = 'unit-file-row';
                const hasFile = !!file.url;
                row.innerHTML = `
                    <input type="text" class="unit-file-name-input admin-input" value="${escapeHtml(file.name || '')}" placeholder="Název souboru (např. Půdorys)" onchange="window.updateUnitFileName(${unitId}, ${idx}, this.value)">
                    <label class="unit-file-upload-btn" title="${hasFile ? (file.fileName || 'Nahraný soubor') : 'Nahrát soubor'}">
                        <span>${hasFile ? '✅ ' + (file.fileName || 'Nahráno') : '📎 Vybrat soubor'}</span>
                        <input type="file" style="display:none;" onchange="window.uploadUnitFile(${unitId}, ${idx}, this)">
                    </label>
                    <button type="button" class="btn-remove-row" title="Smazat dokument" onclick="window.removeUnitFile(${unitId}, ${idx})">✕</button>
                `;
                filesContainer.appendChild(row);
            });
        }
    };

    window.renderAllUnitsAdminDynamic = () => {
        for (let i = 1; i <= 9; i++) {
            window.renderUnitAdminDynamic(i);
        }
    };

    window.addUnitSpec = (unitId) => {
        if (!unitsData[unitId]) return;
        ensureUnitDynamicFields(unitsData[unitId]);
        unitsData[unitId].customSpecs.push({ label: 'Nový parametr', value: '' });
        window.renderUnitAdminDynamic(unitId);
        saveToStorage(true);
    };

    window.updateUnitSpec = (unitId, idx, key, val) => {
        if (!unitsData[unitId]) return;
        ensureUnitDynamicFields(unitsData[unitId]);
        if (unitsData[unitId].customSpecs[idx]) {
            unitsData[unitId].customSpecs[idx][key] = val;
            const lbl = (unitsData[unitId].customSpecs[idx].label || '').toLowerCase();
            if (key === 'value') {
                if (lbl.includes('cena')) unitsData[unitId].price = val;
                if (lbl.includes('dispozice')) unitsData[unitId].layout = val;
                if (lbl.includes('plocha')) unitsData[unitId].area = val.replace(/[^0-9]/g, '');
                if (lbl.includes('zahrada')) unitsData[unitId].garden = val.replace(/[^0-9]/g, '');
                if (lbl.includes('park')) unitsData[unitId].parking = val;
            }
        }
        saveToStorage(true);
        renderUnitZones();
    };

    window.removeUnitSpec = (unitId, idx) => {
        if (!unitsData[unitId]) return;
        ensureUnitDynamicFields(unitsData[unitId]);
        unitsData[unitId].customSpecs.splice(idx, 1);
        window.renderUnitAdminDynamic(unitId);
        saveToStorage(true);
        renderUnitZones();
    };

    window.addUnitFile = (unitId) => {
        if (!unitsData[unitId]) return;
        ensureUnitDynamicFields(unitsData[unitId]);
        unitsData[unitId].customFiles.push({ name: 'Nový dokument (PDF)', url: '', fileName: '' });
        window.renderUnitAdminDynamic(unitId);
        saveToStorage(true);
    };

    window.updateUnitFileName = (unitId, idx, name) => {
        if (!unitsData[unitId]) return;
        ensureUnitDynamicFields(unitsData[unitId]);
        if (unitsData[unitId].customFiles[idx]) {
            unitsData[unitId].customFiles[idx].name = name;
        }
        saveToStorage(true);
        if (typeof renderUnitsTable === 'function') renderUnitsTable();
    };

    window.uploadUnitFile = (unitId, idx, inputEl) => {
        if (!inputEl || !inputEl.files || !inputEl.files[0]) return;
        const file = inputEl.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            if (!unitsData[unitId]) return;
            ensureUnitDynamicFields(unitsData[unitId]);
            if (!unitsData[unitId].customFiles[idx]) {
                unitsData[unitId].customFiles[idx] = { name: file.name.replace(/\.[^/.]+$/, ''), url: '', fileName: '' };
            }
            unitsData[unitId].customFiles[idx].url = e.target.result;
            unitsData[unitId].customFiles[idx].fileName = file.name;

            const nameLower = (unitsData[unitId].customFiles[idx].name || '').toLowerCase();
            if (nameLower.includes('karta') || idx === 0) {
                unitsData[unitId].pdfKarta = e.target.result;
            }
            if (nameLower.includes('standard') || idx === 1) {
                unitsData[unitId].pdfStandardy = e.target.result;
            }

            window.renderUnitAdminDynamic(unitId);
            saveToStorage(true);
            if (typeof renderUnitsTable === 'function') renderUnitsTable();
        };
        reader.readAsDataURL(file);
    };

    window.removeUnitFile = (unitId, idx) => {
        if (!unitsData[unitId]) return;
        ensureUnitDynamicFields(unitsData[unitId]);
        const removed = unitsData[unitId].customFiles.splice(idx, 1);
        if (removed && removed[0]) {
            const rName = (removed[0].name || '').toLowerCase();
            if (rName.includes('karta') || idx === 0) delete unitsData[unitId].pdfKarta;
            if (rName.includes('standard') || idx === 1) delete unitsData[unitId].pdfStandardy;
        }
        window.renderUnitAdminDynamic(unitId);
        saveToStorage(true);
        if (typeof renderUnitsTable === 'function') renderUnitsTable();
    };

    // --- Modal Logic ---
        window.openUnit = (id) => {
        const data = unitsData[id];
        if (!data) return;
        ensureUnitDynamicFields(data);

        const modalUnitName = document.getElementById('modal-unit-name');
        const modalUnitDesc = document.getElementById('modal-unit-desc');
        if (modalUnitName) modalUnitName.textContent = data.name || `Jednotka ${id}`;
        if (modalUnitDesc) modalUnitDesc.textContent = data.desc || '';

        // Dynamic specs in modal
        const specTable = document.getElementById('modal-spec-table') || document.querySelector('#unit-modal .spec-table');
        if (specTable) {
            specTable.innerHTML = '';
            if (data.customSpecs && data.customSpecs.length > 0) {
                data.customSpecs.forEach(spec => {
                    if (spec.label || spec.value) {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `<td>${escapeHtml(spec.label || '')}</td><td><strong>${escapeHtml(spec.value || '')}</strong></td>`;
                        specTable.appendChild(tr);
                    }
                });
            } else {
                if (data.layout) specTable.innerHTML += `<tr><td>Dispozice</td><td><strong>${escapeHtml(data.layout)}</strong></td></tr>`;
                if (data.area) specTable.innerHTML += `<tr><td>Užitná plocha</td><td><strong>${escapeHtml(data.area)} m²</strong></td></tr>`;
                if (data.garden) specTable.innerHTML += `<tr><td>Zahrada</td><td><strong>${escapeHtml(data.garden)} m²</strong></td></tr>`;
                if (data.parking) specTable.innerHTML += `<tr><td>Parkování</td><td><strong>${escapeHtml(data.parking)}</strong></td></tr>`;
                if (data.price) specTable.innerHTML += `<tr><td>Cena</td><td><strong>${escapeHtml(data.price)}</strong></td></tr>`;
            }
        }

        // Dynamic files in modal
        const docContainer = document.getElementById('modal-doc-buttons') || document.querySelector('#unit-modal .doc-buttons');
        if (docContainer) {
            docContainer.innerHTML = '';
            if (data.customFiles && data.customFiles.length > 0) {
                data.customFiles.forEach(f => {
                    const btn = document.createElement('a');
                    btn.className = 'btn-secondary';
                    btn.style.display = 'inline-flex';
                    btn.style.alignItems = 'center';
                    btn.style.gap = '8px';
                    btn.style.marginRight = '8px';
                    btn.style.marginBottom = '8px';
                    btn.innerHTML = `
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        <span>${escapeHtml(f.name || 'Dokument ke stažení')}</span>
                    `;
                    if (f.url) {
                        btn.href = f.url;
                        btn.download = f.fileName || `${(f.name || 'dokument').replace(/\s+/g, '_')}.pdf`;
                        btn.target = '_blank';
                    } else {
                        btn.href = '#';
                        btn.style.opacity = '0.45';
                        btn.style.cursor = 'not-allowed';
                        btn.title = 'Dokument zatím nebyl nahrán';
                        btn.onclick = (e) => { e.preventDefault(); alert('Tento dokument zatím není nahraný v administraci.'); };
                    }
                    docContainer.appendChild(btn);
                });
            }
        }
        
        if (modal) modal.classList.add('active');
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
                partnerLogoSize: partnerLogoSizeInput ? partnerLogoSizeInput.value : '50',
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
                agentAddress: agentAddressInput ? agentAddressInput.value : '',
                agentIco: agentIcoInput ? agentIcoInput.value : '',
                agentHours: agentHoursInput ? agentHoursInput.value : '',
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
                    if (config.styles.partnerLogoSize !== undefined && partnerLogoSizeInput) {
                        const pSize = config.styles.partnerLogoSize;
                        partnerLogoSizeInput.value = pSize;
                        root.style.setProperty('--partner-logo-height', pSize + 'px');
                        root.style.setProperty('--partner-card-height', (Number(pSize) + 15) + 'px');
                        if (partnerLogoSizeVal) partnerLogoSizeVal.textContent = pSize + ' px';
                    }
                }

                if (config.unitsConfig) {
                    unitsConfig = {
                        ...unitsConfig,
                        ...config.unitsConfig,
                        polygons: {
                            ...unitsConfig.polygons,
                            ...(config.unitsConfig.polygons || {})
                        },
                        polygonSettings: {
                            ...unitsConfig.polygonSettings,
                            ...(config.unitsConfig.polygonSettings || {})
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

                    if (!unitsConfig.strokeMode || unitsConfig.strokeMode === 'hover') unitsConfig.strokeMode = 'always';
                    if (polygonStrokeModeInput) polygonStrokeModeInput.value = unitsConfig.strokeMode;
                    if (polygonStrokeColorInput) polygonStrokeColorInput.value = unitsConfig.strokeColorHex || '#ffffff';
                    if (polygonStrokeWidthInput) polygonStrokeWidthInput.value = (unitsConfig.strokeWidth !== undefined) ? unitsConfig.strokeWidth : 2;
                    if (polygonStrokeWidthNumber) polygonStrokeWidthNumber.value = (unitsConfig.strokeWidth !== undefined) ? unitsConfig.strokeWidth : 2;
                    if (polygonReservedColorInput) polygonReservedColorInput.value = unitsConfig.reservedColorHex || '#e67e22';
                    if (polygonSoldColorInput) polygonSoldColorInput.value = unitsConfig.soldColorHex || '#e74c3c';
                    if (polygonReservedOpacityInput) polygonReservedOpacityInput.value = unitsConfig.reservedOpacity || 40;
                    if (polygonReservedOpacityNumber) polygonReservedOpacityNumber.value = unitsConfig.reservedOpacity || 40;

                    initPerUnitPolygonControls();

                    if (typeof window.applyTriplexTransform === 'function') {
                        window.applyTriplexTransform(false);
                    }
                } else {
                    initPerUnitPolygonControls();
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
                            try {
                                const data = await MediaDB.load('agent');
                                if (data && agentPhotoDisplay) {
                                    agentPhotoDisplay.src = data;
                                    agentPhotoDisplay.style.display = 'block';
                                    if (agentPhotoPlaceholder) agentPhotoPlaceholder.style.display = 'none';
                                }
                            } catch(e) {}
                        }
                    } catch (e) {
                        console.error('Error loading media from IndexedDB:', e);
                    }
                }

                if (config.location && config.location.lat && config.location.lat !== 50.0755) {
                    mapCoords = config.location;
                    if (gpsLatInput) gpsLatInput.value = mapCoords.lat;
                    if (gpsLngInput) gpsLngInput.value = mapCoords.lng;
                } else {
                    mapCoords = { lat: 48.932424, lng: 14.616280 };
                    if (gpsLatInput) gpsLatInput.value = mapCoords.lat;
                    if (gpsLngInput) gpsLngInput.value = mapCoords.lng;
                }

                if (config.partners && Array.isArray(config.partners)) {
                    partnersData = config.partners.map((p, idx) => ({
                        id: p.id || (idx + 1),
                        logo: p.logo || '',
                        url: p.url || '',
                        scale: (p.scale !== undefined && p.scale !== null) ? Number(p.scale) : 100
                    }));
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

                const defaultAgentName = 'Michal Švec';
                const defaultContactTitle = 'Zeptejte se na vše, co vás zajímá';
                const defaultContactText = 'Máte dotazy k projektu? Kontaktujte nás. S koupí domu a s financováním vám poradí realitní makléř a specialista na financování.';
                const defaultContactPhone = '+420 721 543 474';
                const defaultContactEmail = 'Michal.svec@realitik.cz';
                const defaultAgentAddress = 'Žižkova třída 309/12, 370 01 České Budějovice';
                const defaultAgentIco = '76630048';
                const defaultAgentHours = 'Po–Pá: 8:00 – 16:00';
                const defaultFbLink = 'https://www.facebook.com/profile.php?id=61576137536672';
                const defaultIgLink = 'https://www.instagram.com/domyledenice/';

                let configChanged = false;
                if (!c.agentName || c.agentName.trim() === '' || c.agentName === 'Jan Novák') {
                    c.agentName = defaultAgentName;
                    configChanged = true;
                }
                if (!c.contactPhone || c.contactPhone.trim() === '' || c.contactPhone.includes('123 456') || c.contactPhone.replace(/\s/g, '') === '+420123456789') {
                    c.contactPhone = defaultContactPhone;
                    configChanged = true;
                }
                if (!c.contactEmail || c.contactEmail.trim() === '' || c.contactEmail.includes('modernibydleni.cz')) {
                    c.contactEmail = defaultContactEmail;
                    configChanged = true;
                }
                if (!c.agentAddress || c.agentAddress.trim() === '' || c.agentAddress.includes('Václavské')) {
                    c.agentAddress = defaultAgentAddress;
                    configChanged = true;
                }
                if (!c.agentIco || c.agentIco.trim() === '' || c.agentIco === '12345678') {
                    c.agentIco = defaultAgentIco;
                    configChanged = true;
                }
                if (!c.agentHours || c.agentHours.trim() === '') {
                    c.agentHours = defaultAgentHours;
                    configChanged = true;
                }
                if (!c.fbLink || c.fbLink.trim() === '' || c.fbLink === '#') {
                    c.fbLink = defaultFbLink;
                    configChanged = true;
                }
                if (!c.igLink || c.igLink.trim() === '' || c.igLink === '#') {
                    c.igLink = defaultIgLink;
                    configChanged = true;
                }
                if (!c.contactTitle || c.contactTitle.trim() === '' || c.contactTitle === 'Máte dotaz?') {
                    c.contactTitle = defaultContactTitle;
                    configChanged = true;
                }
                if (!c.contactText || c.contactText.trim() === '' || c.contactText.includes('Náš tým je vám k dispozici')) {
                    c.contactText = defaultContactText;
                    configChanged = true;
                }

                if (configChanged) {
                    config.content = c;
                    try {
                        localStorage.setItem('web_prodej_ultra_v3_config', JSON.stringify(config));
                    } catch(e) {}
                }

                // Agent photo handling
                if (agentPhotoDisplay) {
                    if (!siteMedia.agent || !siteMedia.agent.startsWith('db:')) {
                        agentPhotoDisplay.src = 'michal-svec.jpg';
                        agentPhotoDisplay.style.display = 'block';
                        if (agentPhotoPlaceholder) agentPhotoPlaceholder.style.display = 'none';
                    }
                }

                // Agent info (text)
                const agentNameDisplay = document.getElementById('editable-agent-name');
                if (agentNameDisplay) agentNameDisplay.textContent = c.agentName;
                if (agentNameInput) agentNameInput.value = c.agentName;

                if (agentAddressInput) agentAddressInput.value = c.agentAddress;
                const addrEl = document.getElementById('editable-agent-address');
                const addrRow = document.getElementById('editable-agent-address-row');
                if (addrEl) addrEl.textContent = c.agentAddress;
                if (addrRow) addrRow.style.display = c.agentAddress ? 'flex' : 'none';

                if (agentIcoInput) agentIcoInput.value = c.agentIco;
                const icoEl = document.getElementById('editable-agent-ico');
                const icoRow = document.getElementById('editable-agent-ico-row');
                if (icoEl) icoEl.textContent = c.agentIco;
                if (icoRow) icoRow.style.display = c.agentIco ? 'flex' : 'none';

                if (agentHoursInput) agentHoursInput.value = c.agentHours;
                const hoursEl = document.getElementById('editable-agent-hours');
                const hoursRow = document.getElementById('editable-agent-hours-row');
                if (hoursEl) hoursEl.textContent = c.agentHours;
                if (hoursRow) hoursRow.style.display = c.agentHours ? 'flex' : 'none';

                const contactTitleDisplay = document.getElementById('editable-contact-title');
                if (contactTitleDisplay) contactTitleDisplay.textContent = c.contactTitle;
                if (contactTitleInput) contactTitleInput.value = c.contactTitle;

                const contactTextDisplay = document.getElementById('editable-contact-text');
                if (contactTextDisplay) contactTextDisplay.textContent = c.contactText;
                if (contactTextInput) contactTextInput.value = c.contactText;

                const contactPhoneDisplay = document.getElementById('editable-contact-phone');
                if (contactPhoneDisplay) contactPhoneDisplay.textContent = c.contactPhone;
                if (contactPhoneInput) contactPhoneInput.value = c.contactPhone;

                const contactEmailDisplay = document.getElementById('editable-contact-email');
                if (contactEmailDisplay) contactEmailDisplay.textContent = c.contactEmail;
                if (contactEmailInput) contactEmailInput.value = c.contactEmail;

                if (fbLinkInput) fbLinkInput.value = c.fbLink;
                const fbLinkEl = document.getElementById('fb-link');
                if (fbLinkEl) fbLinkEl.href = c.fbLink;

                if (igLinkInput) igLinkInput.value = c.igLink;
                const igLinkEl = document.getElementById('ig-link');
                if (igLinkEl) igLinkEl.href = c.igLink;

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
            } else {
                if (agentPhotoDisplay) {
                    agentPhotoDisplay.src = 'michal-svec.jpg';
                    agentPhotoDisplay.style.display = 'block';
                    if (agentPhotoPlaceholder) agentPhotoPlaceholder.style.display = 'none';
                }
                if (agentNameInput) agentNameInput.value = 'Michal Švec';
                if (contactTitleInput) contactTitleInput.value = 'Zeptejte se na vše, co vás zajímá';
                if (contactTextInput) contactTextInput.value = 'Máte dotazy k projektu? Kontaktujte nás. S koupí domu a s financováním vám poradí realitní makléř a specialista na financování.';
                if (contactPhoneInput) contactPhoneInput.value = '+420 721 543 474';
                if (contactEmailInput) contactEmailInput.value = 'Michal.svec@realitik.cz';
                if (agentAddressInput) agentAddressInput.value = 'Žižkova třída 309/12, 370 01 České Budějovice';
                if (agentIcoInput) agentIcoInput.value = '76630048';
                if (agentHoursInput) agentHoursInput.value = 'Po–Pá: 8:00 – 16:00';
                if (fbLinkInput) fbLinkInput.value = 'https://www.facebook.com/profile.php?id=61576137536672';
                if (igLinkInput) igLinkInput.value = 'https://www.instagram.com/domyledenice/';
                if (gpsLatInput) gpsLatInput.value = '48.932424';
                if (gpsLngInput) gpsLngInput.value = '14.616280';
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
    let isPolygonDragging = false;
    let polygonDragIndex = -1;
    let polyDragStartX = 0;
    let polyDragStartY = 0;
    let polyHasDragged = false;
    let polyIgnoreNextClick = false;
    window.isPolygonEditingActive = false;

    const unitsMainContainer = document.getElementById('units-main-container');
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

    const updateLiveIndicators = () => {
        if (activeEditingUnit) {
            const count = currentPolygonPoints.length;
            const countText = count === 1 ? '1 bod' : (count < 5 && count > 1 ? `${count} body` : `${count} bodů`);
            const ptsEl = document.getElementById(`polygon-live-pts-${activeEditingUnit}`);
            if (ptsEl) ptsEl.textContent = countText;
            const mainBtn = document.getElementById(`polygon-main-btn-${activeEditingUnit}`);
            if (mainBtn) {
                mainBtn.innerHTML = `💾 ULOŽIT POLYGON (${countText})`;
                mainBtn.style.background = '#27ae60';
                mainBtn.style.color = '#ffffff';
                mainBtn.style.fontWeight = '700';
                mainBtn.style.boxShadow = '0 0 12px rgba(39, 174, 96, 0.5)';
                mainBtn.title = 'Kliknutím polygon uložíte a změny se trvale vykreslí na webu';
            }
            const nameEl = document.getElementById('polygon-editor-active-unit-name');
            const countEl = document.getElementById('polygon-editor-live-count');
            if (nameEl) nameEl.textContent = `Jednotka ${activeEditingUnit}`;
            if (countEl) countEl.textContent = countText;
            if (editorActiveUnitText) editorActiveUnitText.textContent = `Jednotka ${activeEditingUnit} (${countText})`;
        }
    };

    const renderEditorLayer = () => {
        if (!svgEditorLayer) return;
        svgEditorLayer.innerHTML = '';
        if (!window.isPolygonEditingActive) return;

        updateLiveIndicators();

        const pointsString = currentPolygonPoints.map(p => `${Math.round(p.x)},${Math.round(p.y)}`).join(' ');

        if (currentPolygonPoints.length > 0) {
            // Preview polygon
            const previewPoly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            previewPoly.setAttribute('class', 'editor-polygon-preview');
            previewPoly.setAttribute('id', 'live-editor-polygon-preview');
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
                    edgeLine.setAttribute('id', `editor-edge-${i}`);
                    edgeLine.setAttribute('x1', p1.x);
                    edgeLine.setAttribute('y1', p1.y);
                    edgeLine.setAttribute('x2', p2.x);
                    edgeLine.setAttribute('y2', p2.y);
                    edgeLine.setAttribute('title', 'Kliknutím sem přidáte nový bod na hranu');

                    edgeLine.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (isPolygonDragging || polyIgnoreNextClick) return;
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
                circle.setAttribute('class', 'editor-handle' + (polygonDragIndex === index ? ' dragging' : ''));
                circle.setAttribute('id', `editor-handle-${index}`);
                circle.setAttribute('cx', p.x);
                circle.setAttribute('cy', p.y);
                circle.setAttribute('r', '3.5');
                circle.setAttribute('pointer-events', 'all');
                circle.setAttribute('data-point-index', index);
                circle.setAttribute('title', `Bod ${index + 1} (Uchopte a táhněte pro posun / Dvojklik pro smazání)`);

                const startHandleDrag = (clientX, clientY, e) => {
                    if (e.button === 2) return;
                    e.stopPropagation();
                    isPolygonDragging = true;
                    document.body.classList.add('polygon-is-dragging');
                    polygonDragIndex = index;
                    polyDragStartX = clientX;
                    polyDragStartY = clientY;
                    polyHasDragged = false;
                    circle.classList.add('dragging');
                };

                circle.addEventListener('mousedown', (e) => startHandleDrag(e.clientX, e.clientY, e));
                circle.addEventListener('touchstart', (e) => {
                    if (e.touches.length > 0) startHandleDrag(e.touches[0].clientX, e.touches[0].clientY, e);
                }, { passive: false });

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
                    } else {
                        alert('Polygon musí mít minimálně 3 body.');
                    }
                });

                svgEditorLayer.appendChild(circle);
            });
        }
    };

    window.togglePolygonEditor = (unitIndex) => {
        const uIdx = Number(unitIndex);
        if (window.isPolygonEditingActive && Number(activeEditingUnit) === uIdx) {
            window.saveCurrentPolygon();
        } else {
            window.startPolygonEditor(uIdx);
        }
    };

    window.startPolygonEditor = (unitIndex) => {
        const uIdx = Number(unitIndex);
        activeEditingUnit = uIdx;
        window.isPolygonEditingActive = true;
        isPolygonDragging = false;
        polygonDragIndex = -1;
        polyHasDragged = false;
        polyIgnoreNextClick = false;

        unitsConfig.mode = 'polygons';
        if (unitsModeInput) unitsModeInput.value = 'polygons';

        const overlay = document.getElementById('unit-overlay');
        if (overlay) overlay.style.display = 'none';

        if (editorToolbar) {
            editorToolbar.style.display = 'flex';
        }
        
        // Parse existing points
        currentPolygonPoints = [];
        const rawPoints = (unitsConfig.polygons && unitsConfig.polygons[uIdx]) ? unitsConfig.polygons[uIdx].trim() : '';
        if (rawPoints) {
            rawPoints.split(/\s+/).filter(Boolean).forEach(pair => {
                const [x, y] = pair.split(',').map(Number);
                if (!isNaN(x) && !isNaN(y)) currentPolygonPoints.push({ x, y });
            });
        }

        if (svgOverlay) {
            svgOverlay.style.display = 'block';
            svgOverlay.classList.add('editor-active');
        }
        if (unitsMainContainer) unitsMainContainer.classList.add('editor-crosshair-canvas');

        updateAdminUnitsVisibility();
        renderEditorLayer();
        
        // Scroll to units section
        const unitsSection = document.getElementById('units');
        if (unitsSection) unitsSection.scrollIntoView({ behavior: 'smooth' });
    };

    const closePolygonEditor = () => {
        if (editorToolbar) editorToolbar.style.display = 'none';
        window.isPolygonEditingActive = false;
        activeEditingUnit = null;
        currentPolygonPoints = [];
        isPolygonDragging = false;
        polygonDragIndex = -1;
        polyHasDragged = false;
        polyIgnoreNextClick = false;
        document.body.classList.remove('polygon-is-dragging');
        if (unitsMainContainer) unitsMainContainer.classList.remove('editor-crosshair-canvas');
        if (svgOverlay) {
            svgOverlay.classList.remove('editor-active');
            if (unitsConfig.mode === 'polygons') {
                svgOverlay.style.display = 'block';
            }
        }
        if (svgEditorLayer) svgEditorLayer.innerHTML = '';
        updateAdminUnitsVisibility();
        renderUnitZones();
    };

    window.closePolygonEditor = () => {
        closePolygonEditor();
    };

    window.saveCurrentPolygon = () => {
        if (!activeEditingUnit) return;
        const uIdx = Number(activeEditingUnit);
        if (currentPolygonPoints.length < 3) {
            alert('Polygon musí mít alespoň 3 body! Klikněte do obrázku budovy pro přidání dalších bodů obrysu.');
            return;
        }
        if (!unitsConfig.polygons) unitsConfig.polygons = {};
        const ptsStr = currentPolygonPoints.map(p => `${Math.round(p.x)},${Math.round(p.y)}`).join(' ');
        unitsConfig.polygons[uIdx] = ptsStr;
        unitsConfig.mode = 'polygons';
        if (unitsModeInput) unitsModeInput.value = 'polygons';

        if ((unitsConfig.count || 0) < uIdx) {
            unitsConfig.count = uIdx;
            if (unitsCountInput) unitsCountInput.value = uIdx;
        }

        if (!unitsConfig.strokeMode || unitsConfig.strokeMode === 'hover') unitsConfig.strokeMode = 'always';
        if (polygonStrokeModeInput) polygonStrokeModeInput.value = unitsConfig.strokeMode;
        
        // Force save to localStorage
        saveToStorage(true);
        
        closePolygonEditor();
        updateAdminUnitsVisibility();
        renderUnitZones();

        // Highlight the newly saved polygon briefly so user sees the exact shape that was saved
        setTimeout(() => {
            const savedPoly = document.querySelector(`.unit-polygon[data-unit="${uIdx}"]`);
            if (savedPoly) {
                savedPoly.style.transition = 'all 0.4s ease';
                savedPoly.style.stroke = '#2ecc71';
                savedPoly.style.strokeWidth = '4px';
                savedPoly.style.fill = 'rgba(46, 204, 113, 0.4)';
                setTimeout(() => {
                    if (typeof renderUnitZones === 'function') renderUnitZones();
                }, 1400);
            }
        }, 50);
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
        const uIdx = Number(unitIndex);
        if (confirm(`Opravdu chcete smazat polygon pro Jednotku ${uIdx}?`)) {
            if (!unitsConfig.polygons) unitsConfig.polygons = {};
            unitsConfig.polygons[uIdx] = '';
            if (window.isPolygonEditingActive && Number(activeEditingUnit) === uIdx) {
                closePolygonEditor();
            }
            saveToStorage(true);
            updateAdminUnitsVisibility();
            renderUnitZones();
        }
    };

    // Keyboard shortcuts for polygon editor
    window.addEventListener('keydown', (e) => {
        if (!window.isPolygonEditingActive) return;
        if (e.key === 'Enter') {
            e.preventDefault();
            window.saveCurrentPolygon();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            window.closePolygonEditor();
        } else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
            e.preventDefault();
            window.undoPolygonPoint();
        }
    });

    if (editorBtnSave) editorBtnSave.addEventListener('click', window.saveCurrentPolygon);
    if (editorBtnUndo) editorBtnUndo.addEventListener('click', window.undoPolygonPoint);
    if (editorBtnClear) editorBtnClear.addEventListener('click', window.clearCurrentPoints);
    if (editorBtnCancel) editorBtnCancel.addEventListener('click', window.closePolygonEditor);

    // SVG click to add points
    if (svgOverlay) {
        svgOverlay.addEventListener('click', (e) => {
            if (!window.isPolygonEditingActive) return;
            if (isPolygonDragging || polyIgnoreNextClick) {
                polyIgnoreNextClick = false;
                return;
            }

            const rect = svgOverlay.getBoundingClientRect();
            const x = Math.max(0, Math.min(1000, Math.round(((e.clientX - rect.left) / rect.width) * 1000)));
            const y = Math.max(0, Math.min(1000, Math.round(((e.clientY - rect.top) / rect.height) * 1000)));

            const insertIdx = findBestInsertIndex({ x, y }, currentPolygonPoints);
            currentPolygonPoints.splice(insertIdx, 0, { x, y });
            renderEditorLayer();
        });
    }

    // Smooth handle dragging across window without DOM teardown
    const handleMove = (clientX, clientY) => {
        if (!window.isPolygonEditingActive || !isPolygonDragging || polygonDragIndex === -1 || !svgOverlay) return;
        
        const dist = Math.hypot(clientX - polyDragStartX, clientY - polyDragStartY);
        if (dist > 3) polyHasDragged = true;

        const rect = svgOverlay.getBoundingClientRect();
        const x = Math.max(0, Math.min(1000, Math.round(((clientX - rect.left) / rect.width) * 1000)));
        const y = Math.max(0, Math.min(1000, Math.round(((clientY - rect.top) / rect.height) * 1000)));

        currentPolygonPoints[polygonDragIndex] = { x, y };

        // Fast update existing elements in DOM directly
        const circle = document.getElementById(`editor-handle-${polygonDragIndex}`);
        if (circle) {
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
        }

        const previewPoly = document.getElementById('live-editor-polygon-preview');
        if (previewPoly) {
            previewPoly.setAttribute('points', currentPolygonPoints.map(p => `${Math.round(p.x)},${Math.round(p.y)}`).join(' '));
        }

        // Update connected lines
        const prevIdx = (polygonDragIndex - 1 + currentPolygonPoints.length) % currentPolygonPoints.length;
        const prevLine = document.getElementById(`editor-edge-${prevIdx}`);
        if (prevLine) {
            prevLine.setAttribute('x2', x);
            prevLine.setAttribute('y2', y);
        }

        const currLine = document.getElementById(`editor-edge-${polygonDragIndex}`);
        if (currLine) {
            currLine.setAttribute('x1', x);
            currLine.setAttribute('y1', y);
        }
    };

    window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            if (isPolygonDragging) e.preventDefault();
            handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: false });

    const stopDragging = () => {
        if (isPolygonDragging) {
            document.body.classList.remove('polygon-is-dragging');
            if (polyHasDragged) {
                polyIgnoreNextClick = true;
                setTimeout(() => { polyIgnoreNextClick = false; }, 150);
            }
            isPolygonDragging = false;
            polygonDragIndex = -1;
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
        try { window.renderAllUnitsAdminDynamic(); } catch(e) { console.error('renderAllUnitsAdminDynamic error:', e); }
        try { await renderUnitZones(); } catch(e) { console.error('renderUnitZones error:', e); }
        try { await renderGallery(); } catch(e) { console.error('renderGallery error:', e); }
        try { await renderAdminPartners(); } catch(e) { console.error('renderAdminPartners error:', e); }
        try { await renderPartners(); } catch(e) { console.error('renderPartners error:', e); }
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
