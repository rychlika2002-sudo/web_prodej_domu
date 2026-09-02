/**
 * Modul: Contacts (Účastníci projektu, Makléř a Partneři)
 */

import { MediaDB } from '../../core/app-state.js';

export default {
    id: 'contacts',
    name: 'Kontakty & Partneři',

    async init(AppState, containerEl) {
        this.container = containerEl;
        this.appState = AppState;

        this.render();

        AppState.on('state:loaded', () => this.render());
        AppState.on('change:agentName', () => this.render());
        AppState.on('change:contactPhone', () => this.render());
        AppState.on('change:contactEmail', () => this.render());
        AppState.on('change:partners', () => this.renderPartners());
    },

    async render() {
        const data = this.appState.data;
        if (!data) return;

        this.setText('#editable-contact-title', data.contactTitle);
        this.setText('#editable-contact-text', data.contactText);
        this.setText('#editable-agent-name', data.agentName);
        this.setText('#editable-contact-phone', data.contactPhone);
        this.setText('#editable-contact-email', data.contactEmail);

        const phoneLink = this.container.querySelector('#editable-contact-phone-link');
        const emailLink = this.container.querySelector('#editable-contact-email-link');
        const ctaBtn = this.container.querySelector('#editable-contact-btn');
        const fbLink = this.container.querySelector('#fb-link');
        const igLink = this.container.querySelector('#ig-link');

        if (phoneLink) phoneLink.href = `tel:${(data.contactPhone || '').replace(/\s+/g, '')}`;
        if (emailLink) emailLink.href = `mailto:${data.contactEmail || ''}`;
        if (ctaBtn) ctaBtn.href = `mailto:${data.contactEmail || ''}?subject=Zájem o projekt`;

        if (fbLink) {
            fbLink.style.display = data.fbLink ? 'inline-flex' : 'none';
            fbLink.href = data.fbLink || '#';
        }
        if (igLink) {
            igLink.style.display = data.igLink ? 'inline-flex' : 'none';
            igLink.href = data.igLink || '#';
        }

        // Foto makléře
        const photoImg = this.container.querySelector('#agent-photo-display');
        const photoPlaceholder = this.container.querySelector('#agent-photo-placeholder');
        if (photoImg && photoPlaceholder) {
            const photoVal = data.siteMedia ? data.siteMedia.agentPhoto : null;
            if (photoVal) {
                let src = photoVal;
                if (src.startsWith('db:')) {
                    src = await MediaDB.load(src.replace('db:', ''));
                }
                if (src) {
                    photoImg.src = src;
                    photoImg.style.display = 'block';
                    photoPlaceholder.style.display = 'none';
                }
            } else {
                photoImg.style.display = 'none';
                photoPlaceholder.style.display = 'block';
            }
        }

        this.renderPartners();
    },

    async renderPartners() {
        const grid = this.container.querySelector('#partners-grid') || document.getElementById('partners-grid');
        if (!grid) return;

        const partners = this.appState.data.partners || [];
        const validPartners = [];

        for (const p of partners) {
            if (p.logo) {
                let logoSrc = p.logo;
                if (logoSrc.startsWith('db:')) {
                    logoSrc = await MediaDB.load(logoSrc.replace('db:', ''));
                }
                if (logoSrc) validPartners.push({ ...p, logoSrc });
            }
        }

        if (validPartners.length === 0) {
            grid.innerHTML = `
                <div style="opacity: 0.4; font-size: 0.85rem; text-align: center; grid-column: 1/-1;">
                    Partneři a dodavatelé stavby budou doplněni.
                </div>
            `;
            return;
        }

        grid.innerHTML = validPartners.map(p => `
            <div class="partner-item" style="display: flex; justify-content: center; align-items: center; padding: 10px;">
                ${p.url ? `<a href="${p.url}" target="_blank" rel="noopener">` : ''}
                    <img src="${p.logoSrc}" alt="Partner" style="max-height: 45px; max-width: 120px; object-fit: contain; filter: grayscale(100%); opacity: 0.7; transition: all 0.2s ease;"
                         onmouseover="this.style.filter='grayscale(0%)'; this.style.opacity='1';"
                         onmouseout="this.style.filter='grayscale(100%)'; this.style.opacity='0.7';">
                ${p.url ? `</a>` : ''}
            </div>
        `).join('');
    },

    setText(selector, text) {
        const el = this.container.querySelector(selector) || document.querySelector(selector);
        if (el && text !== undefined) el.textContent = text;
    }
};
