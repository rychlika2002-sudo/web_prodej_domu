/**
 * Modul: Units (Správa a interaktivní výběr jednotek / etap)
 */

export default {
    id: 'units',
    name: 'Jednotky & Etapy',

    async init(AppState, containerEl) {
        this.container = containerEl;
        this.appState = AppState;

        this.bindEvents();
        this.render();

        AppState.on('state:loaded', () => this.render());
        AppState.on('change:unitsConfig', () => this.render());
        AppState.on('change:unitsData', () => this.render());
    },

    bindEvents() {
        const modal = this.container.querySelector('#unit-modal') || document.getElementById('unit-modal');
        const closeBtn = this.container.querySelector('#modal-close-btn') || document.getElementById('modal-close-btn');
        const reserveBtn = this.container.querySelector('#modal-reserve-btn') || document.getElementById('modal-reserve-btn');

        if (closeBtn) {
            closeBtn.onclick = () => this.closeModal();
        }
        if (reserveBtn) {
            reserveBtn.onclick = () => this.closeModal();
        }
        if (modal) {
            modal.onclick = (e) => {
                if (e.target === modal) this.closeModal();
            };
        }
    },

    render() {
        const config = this.appState.data.unitsConfig || {};
        const units = this.appState.data.unitsData || {};
        const overlay = this.container.querySelector('#unit-overlay') || document.getElementById('unit-overlay');
        if (!overlay) return;

        overlay.innerHTML = '';
        const count = parseInt(config.count) || 3;
        const mode = config.mode || 'slices';

        if (mode === 'slices') {
            overlay.className = 'unit-overlay unit-overlay-slices';
            for (let i = 1; i <= count; i++) {
                const uData = units[i] || { name: `Jednotka ${i}`, status: 'status-available', statusText: 'Volno' };
                const sliceWidth = config.widths ? (config.widths[i] || 100 / count) : (100 / count);
                
                const sliceEl = document.createElement('div');
                sliceEl.className = 'unit-slice';
                sliceEl.style.width = `${sliceWidth}%`;
                sliceEl.innerHTML = `
                    <div class="unit-badge ${uData.status || 'status-available'}">
                        <strong>${uData.name || `Etapa ${i}`}</strong>
                        <span>${uData.statusText || 'Volno'}</span>
                    </div>
                `;
                sliceEl.addEventListener('click', () => this.openModal(i));
                overlay.appendChild(sliceEl);
            }
        } else {
            overlay.className = 'unit-overlay unit-overlay-pins';
            for (let i = 1; i <= count; i++) {
                const uData = units[i] || { name: `Jednotka ${i}`, status: 'status-available', statusText: 'Volno' };
                const pin = (config.pins && config.pins[i]) ? config.pins[i] : { x: 50, y: 50, s: 100 };

                const pinEl = document.createElement('div');
                pinEl.className = 'unit-pin-marker';
                pinEl.style.left = `${pin.x}%`;
                pinEl.style.top = `${pin.y}%`;
                pinEl.style.transform = `translate(-50%, -50%) scale(${(pin.s || 100) / 100})`;
                pinEl.innerHTML = `
                    <div class="unit-pin-badge ${uData.status || 'status-available'}">
                        <span>${uData.name || `Jednotka ${i}`}</span>
                    </div>
                `;
                pinEl.addEventListener('click', () => this.openModal(i));
                overlay.appendChild(pinEl);
            }
        }
    },

    openModal(unitId) {
        const uData = this.appState.data.unitsData[unitId];
        if (!uData) return;

        const modal = this.container.querySelector('#unit-modal') || document.getElementById('unit-modal');
        if (!modal) return;

        this.setText('#modal-unit-name', uData.name);
        this.setText('#modal-unit-desc', uData.desc);
        this.setText('#spec-layout', uData.layout || '—');
        this.setText('#spec-area', uData.area ? `${uData.area} m²` : '—');
        this.setText('#spec-garden', uData.garden ? `${uData.garden} m²` : '—');
        this.setText('#spec-parking', uData.parking || '—');
        this.setText('#spec-price', uData.price || '—');

        const btnKarta = this.container.querySelector('#btn-karta-bytu') || document.getElementById('btn-karta-bytu');
        const btnStandardy = this.container.querySelector('#btn-standardy') || document.getElementById('btn-standardy');

        if (btnKarta) {
            btnKarta.style.display = uData.pdfKarta ? 'inline-flex' : 'none';
            btnKarta.href = uData.pdfKarta || '#';
        }
        if (btnStandardy) {
            btnStandardy.style.display = uData.pdfStandardy ? 'inline-flex' : 'none';
            btnStandardy.href = uData.pdfStandardy || '#';
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeModal() {
        const modal = this.container.querySelector('#unit-modal') || document.getElementById('unit-modal');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    },

    setText(selector, text) {
        const el = this.container.querySelector(selector) || document.querySelector(selector);
        if (el && text !== undefined) el.textContent = text;
    }
};
