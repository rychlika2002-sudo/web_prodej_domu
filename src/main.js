/**
 * Hlavní vstupní bod modulární ARD aplikace (src/main.js)
 * Spouští všechny karty v izolovaných Error Boundaries.
 */

import { AppState } from './core/app-state.js';
import { moduleLoader } from './core/module-loader.js';

// Importy jednotlivých karet
import projectsModule from './modules/projects/projects.js';
import unitsModule from './modules/units/units.js';
import mapModule from './modules/map/map.js';
import galleryModule from './modules/gallery/gallery.js';
import contactsModule from './modules/contacts/contacts.js';
import jesModule from './modules/jes/jes.js';
import thuModule from './modules/thu/thu.js';
import waterModule from './modules/water/water.js';
import canalModule from './modules/canal/canal.js';
import retentionModule from './modules/retention/retention.js';
import dispoModule from './modules/dispo/dispo.js';
import storageModule from './modules/storage/storage.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('%c[ARD Modulární systém inicializace]', 'color: #3b82f6; font-weight: bold; font-size: 1.1rem;');

    // 1. Načtení globálního stavu
    AppState.load();

    // 2. Registrace modulů
    moduleLoader.register('projects', projectsModule);
    moduleLoader.register('units', unitsModule);
    moduleLoader.register('map', mapModule);
    moduleLoader.register('gallery', galleryModule);
    moduleLoader.register('contacts', contactsModule);
    moduleLoader.register('jes', jesModule);
    moduleLoader.register('thu', thuModule);
    moduleLoader.register('water', waterModule);
    moduleLoader.register('canal', canalModule);
    moduleLoader.register('retention', retentionModule);
    moduleLoader.register('dispo', dispoModule);
    moduleLoader.register('storage', storageModule);

    // 3. Bezpečné připojení (mount) každé karty do DOMu
    // Pokud mapa nebo jakákoliv jiná karta selže, zbytek běží bez přerušení!
    await moduleLoader.mount('projects', document.getElementById('module-slot-projects'));
    await moduleLoader.mount('units', document.getElementById('module-slot-units'));
    await moduleLoader.mount('map', document.getElementById('module-slot-map'));
    await moduleLoader.mount('gallery', document.getElementById('module-slot-gallery'));
    await moduleLoader.mount('contacts', document.getElementById('module-slot-contacts'));

    // Inženýrské karty
    await moduleLoader.mount('jes', document.getElementById('tab-pane-jes'));
    await moduleLoader.mount('thu', document.getElementById('tab-pane-thu'));
    await moduleLoader.mount('water', document.getElementById('tab-pane-water'));
    await moduleLoader.mount('canal', document.getElementById('tab-pane-canal'));
    await moduleLoader.mount('retention', document.getElementById('tab-pane-retention'));
    await moduleLoader.mount('dispo', document.getElementById('tab-pane-dispo'));
    await moduleLoader.mount('storage', document.getElementById('tab-pane-storage'));

    // 4. Inicializace globálních UI prvků (Navigace, Téma, Admin panel)
    initGlobalUi();
});

function initGlobalUi() {
    // Přepínání inženýrských karet (Tabs)
    const tabBtns = document.querySelectorAll('#eng-tabs-nav .card-tab-btn');
    const tabPanes = document.querySelectorAll('.eng-tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            tabPanes.forEach(pane => {
                pane.style.display = (pane.id === `tab-pane-${targetTab}`) ? 'block' : 'none';
            });
        });
    });

    // Přepínač tmavého / světlého režimu
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    const updateThemeIcon = (isDark) => {
        if (sunIcon && moonIcon) {
            sunIcon.style.display = isDark ? 'block' : 'none';
            moonIcon.style.display = isDark ? 'none' : 'block';
        }
    };

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            AppState.set('theme', isDark ? 'dark' : 'light');
            updateThemeIcon(isDark);
        });
    }

    if (AppState.data.theme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon(true);
    }

    // Mobilní menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
    }

    // Admin Panel Toggle
    const adminToggle = document.getElementById('admin-toggle');
    const adminPanel = document.getElementById('admin-panel');
    if (adminToggle && adminPanel) {
        adminToggle.addEventListener('click', () => {
            adminPanel.classList.toggle('active');
        });
    }

    // Accordiony v Admin panelu
    const accordions = document.querySelectorAll('.accordion-header');
    accordions.forEach(header => {
        header.addEventListener('click', () => {
            const section = header.parentElement;
            section.classList.toggle('active');
        });
    });

    // Uložení nastavení
    const saveBtn = document.getElementById('save-settings');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const latInp = document.getElementById('gps-lat-input');
            const lngInp = document.getElementById('gps-lng-input');
            const cadInp = document.getElementById('cadastral-map-input');
            const logoInp = document.getElementById('logo-input');
            const subInp = document.getElementById('subtitle-input');

            if (latInp) AppState.data.gpsLat = parseFloat(latInp.value) || 50.0755;
            if (lngInp) AppState.data.gpsLng = parseFloat(lngInp.value) || 14.4378;
            if (cadInp) AppState.data.showCadastre = cadInp.checked;
            if (logoInp && logoInp.value) AppState.data.logoText = logoInp.value;
            if (subInp) AppState.data.subtitle = subInp.value;

            AppState.save();
            alert('Nastavení projektu bylo úspěšně uloženo!');
        });
    }

    // Cookie Banner
    const cookieBanner = document.getElementById('cookie-banner');
    const cookieAccept = document.getElementById('cookie-accept-btn');
    const cookieReject = document.getElementById('cookie-reject-btn');

    if (!localStorage.getItem('cookie_consent') && cookieBanner) {
        cookieBanner.style.display = 'block';
    }

    if (cookieAccept) {
        cookieAccept.addEventListener('click', () => {
            localStorage.setItem('cookie_consent', 'all');
            if (cookieBanner) cookieBanner.style.display = 'none';
        });
    }

    if (cookieReject) {
        cookieReject.addEventListener('click', () => {
            localStorage.setItem('cookie_consent', 'necessary');
            if (cookieBanner) cookieBanner.style.display = 'none';
        });
    }
}
