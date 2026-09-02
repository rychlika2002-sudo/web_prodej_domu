/**
 * Modul: Katastr & Geodata (ČÚZK, WMS, Ortofoto, Leaflet)
 * Zcela nezávislý a izolovaný modul pro zobrazení a interakci s mapou.
 */

export default {
    id: 'map',
    name: 'Katastr & Geodata',
    mapInstance: null,
    baseLayer: null,
    orthoLayer: null,
    cadastralLayer: null,
    marker: null,
    currentBaseType: 'base', // 'base' | 'ortho'
    showCadastre: true,

    async init(AppState, containerEl) {
        this.container = containerEl;
        this.appState = AppState;

        const state = AppState.data;
        const DEFAULT_ZOOM = 16;
        let lat = parseFloat(state.gpsLat) || 50.0755;
        let lng = parseFloat(state.gpsLng) || 14.4378;

        const mapContainer = containerEl.querySelector('#map') || document.getElementById('map');
        if (!mapContainer) {
            console.warn('[MapModule] Element #map nenalezen.');
            return;
        }

        // Kontrola knihovny Leaflet
        if (typeof window.L === 'undefined') {
            await this.loadLeafletLibrary();
        }

        if (typeof window.L === 'undefined') {
            throw new Error('Nelze načíst mapu: Knihovna Leaflet není dostupná.');
        }

        const L = window.L;

        try {
            // Inicializace mapy s měřítkem
            if (!this.mapInstance) {
                this.mapInstance = L.map(mapContainer, {
                    center: [lat, lng],
                    zoom: DEFAULT_ZOOM,
                    zoomControl: true,
                    scrollWheelZoom: false
                });

                L.control.scale({ metric: true, imperial: false, position: 'bottomleft' }).addTo(this.mapInstance);
            } else {
                this.mapInstance.setView([lat, lng], DEFAULT_ZOOM);
            }

            // 1. Základní vrstva (CartoDB Voyager)
            this.baseLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
                maxZoom: 19
            });

            // 2. Letecká / Ortofoto vrstva (Esri World Imagery s vysokým rozlišením pro ČR)
            this.orthoLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics',
                maxZoom: 19
            });

            // Výchozí přidání základní vrstvy
            this.baseLayer.addTo(this.mapInstance);

            // 3. Katastrální vrstva ČÚZK (WMS)
            this.cadastralLayer = L.tileLayer.wms('https://services.cuzk.gov.cz/wms/wms.asp', {
                layers: 'KN',
                format: 'image/png',
                transparent: true,
                version: '1.3.0',
                attribution: 'Katastrální mapa &copy; ČÚZK',
                minZoom: 14,
                maxZoom: 21,
                opacity: 0.85
            });

            if (this.showCadastre) {
                this.cadastralLayer.addTo(this.mapInstance);
            }

            // 4. Připojení interaktivního draggable markeru
            const redPinIcon = L.divIcon({
                html: `<div class="map-animated-pin">
                    <svg width="42" height="42" viewBox="0 0 24 24" fill="#e74c3c" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.45)); transform: translateY(-4px);"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3.2" fill="#ffffff" stroke="none"></circle></svg>
                </div>`,
                className: 'custom-pin-icon',
                iconSize: [42, 42],
                iconAnchor: [21, 38]
            });

            if (this.marker) {
                this.marker.setLatLng([lat, lng]);
            } else {
                this.marker = L.marker([lat, lng], { icon: redPinIcon, draggable: true }).addTo(this.mapInstance);
                this.marker.on('dragend', (e) => {
                    const pos = e.target.getLatLng();
                    this.updateCoordsDisplay(pos.lat, pos.lng);
                    this.updateCuzkLink(pos.lat, pos.lng);
                });
            }

            // Kliknutí do mapy posune marker
            this.mapInstance.on('click', (e) => {
                if (this.marker) {
                    this.marker.setLatLng(e.latlng);
                    this.updateCoordsDisplay(e.latlng.lat, e.latlng.lng);
                    this.updateCuzkLink(e.latlng.lat, e.latlng.lng);
                }
            });

            // Sledování pohybu mapy pro info badge
            this.mapInstance.on('move', () => {
                const center = this.mapInstance.getCenter();
                const zoom = this.mapInstance.getZoom();
                this.updateCoordsDisplay(center.lat, center.lng, zoom);
            });

            // Inicializace ovládací lišty a tlačítek
            this.bindToolbarEvents();
            this.updateCoordsDisplay(lat, lng, DEFAULT_ZOOM);
            this.updateCuzkLink(lat, lng);

            // Aktualizace velikosti po vykreslení
            setTimeout(() => {
                if (this.mapInstance) this.mapInstance.invalidateSize();
            }, 300);

        } catch (err) {
            console.error('[MapModule Init Error]', err);
            throw err;
        }

        // EventBus listeners
        AppState.on('change:gpsLat', (newLat) => this.setCenter(newLat, AppState.data.gpsLng));
        AppState.on('change:gpsLng', (newLng) => this.setCenter(AppState.data.gpsLat, newLng));
    },

    bindToolbarEvents() {
        // Přepínače vrstev
        const btnBase = this.container.querySelector('#layer-btn-base');
        const btnOrtho = this.container.querySelector('#layer-btn-ortho');
        const btnCuzk = this.container.querySelector('#layer-btn-cuzk');

        if (btnBase) {
            btnBase.onclick = () => {
                if (this.mapInstance && this.baseLayer && this.orthoLayer) {
                    this.mapInstance.removeLayer(this.orthoLayer);
                    this.mapInstance.addLayer(this.baseLayer);
                    btnBase.classList.add('active');
                    if (btnOrtho) btnOrtho.classList.remove('active');
                    this.currentBaseType = 'base';
                }
            };
        }

        if (btnOrtho) {
            btnOrtho.onclick = () => {
                if (this.mapInstance && this.baseLayer && this.orthoLayer) {
                    this.mapInstance.removeLayer(this.baseLayer);
                    this.mapInstance.addLayer(this.orthoLayer);
                    btnOrtho.classList.add('active');
                    if (btnBase) btnBase.classList.remove('active');
                    this.currentBaseType = 'ortho';
                }
            };
        }

        if (btnCuzk) {
            btnCuzk.onclick = () => {
                if (!this.mapInstance || !this.cadastralLayer) return;
                if (this.mapInstance.hasLayer(this.cadastralLayer)) {
                    this.mapInstance.removeLayer(this.cadastralLayer);
                    btnCuzk.classList.remove('active');
                    this.showCadastre = false;
                } else {
                    this.mapInstance.addLayer(this.cadastralLayer);
                    btnCuzk.classList.add('active');
                    this.showCadastre = true;
                }
            };
        }

        // Vyhledávání adresy
        const searchInput = this.container.querySelector('#map-search-input');
        const searchBtn = this.container.querySelector('#map-search-btn');

        const doSearch = async () => {
            const query = searchInput ? searchInput.value.trim() : '';
            if (!query) return;
            await this.searchLocation(query);
        };

        if (searchBtn) searchBtn.onclick = doSearch;
        if (searchInput) {
            searchInput.onkeydown = (e) => {
                if (e.key === 'Enter') doSearch();
            };
        }

        // Tlačítko uložení GPS do projektu
        const saveGpsBtn = this.container.querySelector('#btn-save-project-gps');
        if (saveGpsBtn) {
            saveGpsBtn.onclick = () => {
                const pos = this.marker ? this.marker.getLatLng() : this.mapInstance.getCenter();
                this.appState.set({
                    gpsLat: parseFloat(pos.lat.toFixed(6)),
                    gpsLng: parseFloat(pos.lng.toFixed(6))
                });
                this.appState.save();

                saveGpsBtn.textContent = '✓ GPS Uložena!';
                saveGpsBtn.style.background = '#10b981';
                setTimeout(() => {
                    saveGpsBtn.textContent = '📌 Uložit GPS projektu';
                    saveGpsBtn.style.background = '';
                }, 2000);
            };
        }
    },

    async searchLocation(query) {
        const searchBtn = this.container.querySelector('#map-search-btn');
        if (searchBtn) searchBtn.disabled = true;

        try {
            // Geokódování přes OSM Nominatim (s omezením na ČR)
            const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=cz&limit=1&q=${encodeURIComponent(query)}`;
            const res = await fetch(url, { headers: { 'Accept-Language': 'cs' } });
            const data = await res.json();

            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);

                this.setCenter(lat, lon, 17);
                if (this.marker) this.marker.setLatLng([lat, lon]);
                this.updateCuzkLink(lat, lon);
            } else {
                alert(`Lokalita "${query}" nebyla nalezena. Zkuste upřesnit název obce nebo ulice.`);
            }
        } catch (err) {
            console.error('[Map Search Error]', err);
            alert('Chyba při vyhledávání lokality.');
        } finally {
            if (searchBtn) searchBtn.disabled = false;
        }
    },

    setCenter(lat, lng, zoom) {
        lat = parseFloat(lat);
        lng = parseFloat(lng);
        if (isNaN(lat) || isNaN(lng) || !this.mapInstance) return;

        const targetZoom = zoom || this.mapInstance.getZoom() || 16;
        this.mapInstance.flyTo([lat, lng], targetZoom, { duration: 1.2 });
        if (this.marker) this.marker.setLatLng([lat, lng]);
        this.updateCoordsDisplay(lat, lng, targetZoom);
        this.updateCuzkLink(lat, lng);
    },

    updateCoordsDisplay(lat, lng, zoom) {
        const coordsEl = this.container.querySelector('#map-coords-display');
        const zoomEl = this.container.querySelector('#map-zoom-display');
        if (coordsEl && lat && lng) {
            coordsEl.textContent = `GPS: ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`;
        }
        if (zoomEl && zoom !== undefined) {
            zoomEl.textContent = `Zoom: ${zoom}`;
        }
    },

    updateCuzkLink(lat, lng) {
        const cuzkBtn = this.container.querySelector('#btn-open-cuzk-kn');
        if (cuzkBtn && lat && lng) {
            // Odkaz do aplikace Nahlížení do KN (geoviewer ČÚZK)
            cuzkBtn.href = `https://nahlizenidokn.cuzk.cz/ZobrazitMapu.aspx?y=${lat}&x=${lng}`;
        }
    },

    async loadLeafletLibrary() {
        return new Promise((resolve) => {
            if (window.L) return resolve();
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => resolve();
            script.onerror = () => resolve();
            document.head.appendChild(script);
        });
    },

    destroy() {
        if (this.mapInstance) {
            this.mapInstance.remove();
            this.mapInstance = null;
        }
    }
};
