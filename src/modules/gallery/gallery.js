/**
 * Modul: Gallery (Fotodokumentace, Lightbox a Prezentace)
 */

import { MediaDB } from '../../core/app-state.js';

export default {
    id: 'gallery',
    name: 'Fotodokumentace',
    currentIndex: 0,
    photos: [],

    async init(AppState, containerEl) {
        this.container = containerEl;
        this.appState = AppState;

        this.bindEvents();
        await this.loadGallery();

        AppState.on('change:siteMedia', () => this.loadGallery());
    },

    bindEvents() {
        const modal = this.container.querySelector('#lightbox-modal') || document.getElementById('lightbox-modal');
        const closeBtn = this.container.querySelector('#lightbox-close') || document.getElementById('lightbox-close');

        if (closeBtn) closeBtn.onclick = () => this.closeLightbox();
        if (modal) {
            modal.onclick = (e) => {
                if (e.target === modal) this.closeLightbox();
            };
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeLightbox();
        });
    },

    async loadGallery() {
        const media = this.appState.data.siteMedia || {};
        const galleryList = Array.isArray(media.gallery) ? media.gallery : ['gallery-1.jpg', 'gallery-2.jpg'];
        
        this.photos = [];
        for (const item of galleryList) {
            if (typeof item === 'string' && item.startsWith('db:')) {
                const key = item.replace('db:', '');
                const base64 = await MediaDB.load(key);
                if (base64) this.photos.push(base64);
            } else if (item) {
                this.photos.push(item);
            }
        }

        this.render();
    },

    render() {
        const grid = this.container.querySelector('#gallery-container') || document.getElementById('gallery-container');
        if (!grid) return;

        if (this.photos.length === 0) {
            grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; opacity: 0.5; padding: 2rem;">V galerii zatím nejsou žádné fotografie.</p>`;
            return;
        }

        grid.innerHTML = this.photos.map((src, idx) => `
            <div class="gallery-item" style="cursor: pointer; overflow: hidden; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                <img src="${src}" alt="Foto ${idx + 1}" style="width: 100%; height: 260px; object-fit: cover; transition: transform 0.3s ease;" 
                     onmouseover="this.style.transform='scale(1.04)'" 
                     onmouseout="this.style.transform='scale(1)'"
                     onerror="this.parentElement.style.display='none'">
            </div>
        `).join('');

        // Přidání kliknutí pro lightbox
        const items = grid.querySelectorAll('.gallery-item');
        items.forEach((item, index) => {
            item.onclick = () => this.openLightbox(index);
        });
    },

    openLightbox(index) {
        if (!this.photos[index]) return;
        this.currentIndex = index;
        const modal = this.container.querySelector('#lightbox-modal') || document.getElementById('lightbox-modal');
        const img = this.container.querySelector('#lightbox-img') || document.getElementById('lightbox-img');

        if (modal && img) {
            img.src = this.photos[index];
            modal.style.display = 'flex';
            setTimeout(() => { modal.style.opacity = '1'; }, 10);
            document.body.style.overflow = 'hidden';
        }
    },

    closeLightbox() {
        const modal = this.container.querySelector('#lightbox-modal') || document.getElementById('lightbox-modal');
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
    }
};
