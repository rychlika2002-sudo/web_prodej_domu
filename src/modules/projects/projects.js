/**
 * Modul: Projects (Správa a přehled projektů)
 */

export default {
    id: 'projects',
    name: 'Správa Projektu',

    async init(AppState, containerEl) {
        this.container = containerEl;
        this.appState = AppState;
        this.render(AppState.data);

        // Naslouchání na změny stavu
        AppState.on('state:loaded', (data) => this.render(data));
        AppState.on('change:heroTitle', (val) => this.setText('#editable-hero-title', val));
        AppState.on('change:heroText', (val) => this.setText('#editable-hero-text', val));
        AppState.on('change:aboutTitle', (val) => this.setText('#editable-about-title', val));
        AppState.on('change:aboutText', (val) => this.setText('#editable-about-text', val));
        AppState.on('change:projectCards', () => this.renderCards(AppState.data.projectCards));
    },

    render(data) {
        if (!data) return;
        this.setText('#editable-hero-title', data.heroTitle);
        this.setText('#editable-hero-text', data.heroText);
        this.setText('#editable-about-title', data.aboutTitle);
        this.setText('#editable-about-text', data.aboutText);
        this.renderCards(data.projectCards);
    },

    renderCards(cards) {
        const container = this.container.querySelector('#cards-container') || document.getElementById('cards-container');
        if (!container || !cards) return;

        container.innerHTML = cards.map((card, idx) => `
            <div class="card">
                <div class="card-icon" style="font-size: 1.8rem; margin-bottom: 0.8rem; color: var(--accent-color, #c5a059);">
                    ${this.getCardIcon(idx)}
                </div>
                <h3>${card.title || `Vlastnost ${idx + 1}`}</h3>
                <p>${card.desc || ''}</p>
            </div>
        `).join('');
    },

    getCardIcon(idx) {
        const icons = ['✨', '🌿', '📍', '🏗️', '🔋', '💎'];
        return icons[idx % icons.length];
    },

    setText(selector, text) {
        const el = this.container.querySelector(selector) || document.querySelector(selector);
        if (el && text !== undefined) el.textContent = text;
    }
};
