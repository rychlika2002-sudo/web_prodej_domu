/**
 * AppState - Centrální stav aplikace, EventBus a IndexedDB úložiště
 * Zajišťuje bezpečné sdílení dat mezi kartami bez přímých závislostí.
 */

export const MediaDB = {
    dbName: 'WebProdejMediaDB',
    dbVersion: 1,
    storeName: 'media',
    open() {
        return new Promise((resolve, reject) => {
            if (typeof indexedDB === 'undefined') {
                return reject(new Error('IndexedDB není podporováno v tomto prostředí.'));
            }
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
        try {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(this.storeName, 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.put(base64, key);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (e) {
            console.warn('[MediaDB Save Error]', e);
        }
    },
    async load(key) {
        try {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(this.storeName, 'readonly');
                const store = transaction.objectStore(this.storeName);
                const request = store.get(key);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error || 'Not found');
            });
        } catch (e) {
            console.warn('[MediaDB Load Error]', e);
            return null;
        }
    },
    async clear() {
        try {
            const db = await this.open();
            const transaction = db.transaction(this.storeName, 'readwrite');
            transaction.objectStore(this.storeName).clear();
        } catch (e) {
            console.warn('[MediaDB Clear Error]', e);
        }
    }
};

export const AppState = {
    STORAGE_KEY: 'web_prodej_ultra_v3_config',
    listeners: {},
    
    // Výchozí data
    data: {
        theme: 'light',
        logoText: 'MODERNÍ BYDLENÍ',
        subtitle: '',
        logoSize: 40,
        primaryColor: '#1a1a1a',
        accentColor: '#c5a059',
        fontHeading: "'Outfit', sans-serif",
        heroTitle: 'Domov, kde začíná vaše nová etapa',
        heroText: 'Objevte moderní architekturu v srdci přírody. Nabízíme exkluzivní rodinné domy s důrazem na detail a udržitelnost.',
        aboutTitle: 'O projektu',
        aboutText: 'Moderní design, funkčnost a nejvyšší standardy provedení. Každý detail je promyšlen tak, aby splňoval nároky moderní rodiny.',
        contactTitle: 'Máte dotaz?',
        contactText: 'Náš tým je vám k dispozici pro prohlídku nebo konzultaci.',
        agentName: 'Jan Novák',
        contactPhone: '+420 123 456 789',
        contactEmail: 'info@modernibydleni.cz',
        fbLink: '',
        igLink: '',
        gpsLat: 50.0755,
        gpsLng: 14.4378,
        showCadastre: false,
        unitsConfig: {
            mode: 'slices',
            count: 3,
            hoverColorHex: '#c5a059',
            pinColorHex: '#c5a059',
            hoverOpacity: 40,
            widths: { 1: 33.3, 2: 33.3, 3: 33.3, 4: 25, 5: 20, 6: 16, 7: 14, 8: 12, 9: 11 },
            pins: {
                1: {x: 50, y: 50, s: 100}, 2: {x: 50, y: 50, s: 100}, 3: {x: 50, y: 50, s: 100},
                4: {x: 50, y: 50, s: 100}, 5: {x: 50, y: 50, s: 100}, 6: {x: 50, y: 50, s: 100},
                7: {x: 50, y: 50, s: 100}, 8: {x: 50, y: 50, s: 100}, 9: {x: 50, y: 50, s: 100}
            }
        },
        unitsData: {
            1: { name: 'Etapa A', desc: 'Luxusní bytová jednotka s vlastní zahradou a dvěma parkovacími místy.', layout: '5+kk', area: '145', garden: '210', parking: '2 místa', price: '8 490 000 Kč', status: 'status-available', statusText: 'Volno', pdfKarta: '', pdfStandardy: '' },
            2: { name: 'Etapa B', desc: 'Moderní rodinné bydlení s prostornou terasou v patře.', layout: '4+kk', area: '132', garden: '180', parking: '2 místa', price: '7 990 000 Kč', status: 'status-reserved', statusText: 'Rezervováno', pdfKarta: '', pdfStandardy: '' },
            3: { name: 'Etapa C', desc: 'Útulný dům ideální pro mladou rodinu s výhledem do zeleně.', layout: '4+kk', area: '128', garden: '150', parking: '2 místa', price: '7 490 000 Kč', status: 'status-sold', statusText: 'Prodáno', pdfKarta: '', pdfStandardy: '' },
            4: { name: 'Jednotka 4', desc: '', layout: '', area: '', garden: '', parking: '', price: '', status: 'status-available', statusText: 'Volno', pdfKarta: '', pdfStandardy: '' },
            5: { name: 'Jednotka 5', desc: '', layout: '', area: '', garden: '', parking: '', price: '', status: 'status-available', statusText: 'Volno', pdfKarta: '', pdfStandardy: '' },
            6: { name: 'Jednotka 6', desc: '', layout: '', area: '', garden: '', parking: '', price: '', status: 'status-available', statusText: 'Volno', pdfKarta: '', pdfStandardy: '' },
            7: { name: 'Jednotka 7', desc: '', layout: '', area: '', garden: '', parking: '', price: '', status: 'status-available', statusText: 'Volno', pdfKarta: '', pdfStandardy: '' },
            8: { name: 'Jednotka 8', desc: '', layout: '', area: '', garden: '', parking: '', price: '', status: 'status-available', statusText: 'Volno', pdfKarta: '', pdfStandardy: '' },
            9: { name: 'Jednotka 9', desc: '', layout: '', area: '', garden: '', parking: '', price: '', status: 'status-available', statusText: 'Volno', pdfKarta: '', pdfStandardy: '' }
        },
        partners: [
            { id: 1, logo: '', url: '' }, { id: 2, logo: '', url: '' }, { id: 3, logo: '', url: '' },
            { id: 4, logo: '', url: '' }, { id: 5, logo: '', url: '' }, { id: 6, logo: '', url: '' }
        ],
        projectCards: [
            { id: 1, title: 'Kvalitní materiály', desc: 'Používáme prémiové cihlové zdivo, trojskla a špičkové izolace.' },
            { id: 2, title: 'Nízké náklady', desc: 'Energetická třída A/B s tepelným čerpadlem a přípravou na FVE.' },
            { id: 3, title: 'Klidná lokalita', desc: 'V dosahu přírody s výbornou dopravní dostupností a občanskou vybaveností.' }
        ],
        siteMedia: {
            hero: '',
            heroDark: '',
            triplex: '',
            gallery: ['gallery-1.jpg', 'gallery-2.jpg'],
            logo: '',
            agentPhoto: ''
        }
    },

    // EventBus
    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
        return () => this.off(event, callback);
    },

    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    },

    emit(event, payload) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(cb => {
            try {
                cb(payload, this.data);
            } catch (err) {
                console.error(`[EventBus Error on "${event}"]`, err);
            }
        });
    },

    // Načtení z localStorage
    load() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                this.data = { ...this.data, ...parsed };
                if (parsed.unitsConfig) this.data.unitsConfig = { ...this.data.unitsConfig, ...parsed.unitsConfig };
                if (parsed.unitsData) this.data.unitsData = { ...this.data.unitsData, ...parsed.unitsData };
                if (parsed.siteMedia) this.data.siteMedia = { ...this.data.siteMedia, ...parsed.siteMedia };
            }
        } catch (e) {
            console.error('[AppState Load Error]', e);
        }
        this.emit('state:loaded', this.data);
        return this.data;
    },

    // Uložení do localStorage
    save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
            this.emit('state:saved', this.data);
            return true;
        } catch (e) {
            console.error('[AppState Save Error]', e);
            return false;
        }
    },

    // Pomocná metoda pro bezpečný update
    set(keyOrObj, value) {
        if (typeof keyOrObj === 'string') {
            this.data[keyOrObj] = value;
            this.emit(`change:${keyOrObj}`, value);
        } else if (typeof keyOrObj === 'object') {
            Object.assign(this.data, keyOrObj);
            Object.keys(keyOrObj).forEach(k => this.emit(`change:${k}`, keyOrObj[k]));
        }
        this.emit('change', this.data);
    }
};
