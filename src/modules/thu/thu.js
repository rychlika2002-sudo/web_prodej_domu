/**
 * Modul: THU 2026 (Cenové ukazatele RTS / JKSO)
 */

export default {
    id: 'thu',
    name: 'THU 2026 Ukazatele',

    async init(AppState, containerEl) {
        this.container = containerEl;
        this.bindEvents();
    },

    bindEvents() {
        const calcBtn = this.container.querySelector('#thu-calc-btn');
        if (calcBtn) calcBtn.onclick = () => this.calculate();

        const inputs = this.container.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.calculate());
        });
    },

    calculate() {
        const baseRate = parseFloat(this.container.querySelector('#thu-type')?.value) || 8200;
        const volume = parseFloat(this.container.querySelector('#thu-volume')?.value) || 0;
        const locKoef = parseFloat(this.container.querySelector('#thu-loc-koef')?.value) || 1.0;
        const dphRate = parseFloat(this.container.querySelector('#thu-dph')?.value) || 0.12;

        const totalBezDph = Math.round(volume * baseRate * locKoef);
        const totalSDph = Math.round(totalBezDph * (1 + dphRate));

        const resBez = this.container.querySelector('#thu-res-bez-dph');
        const resS = this.container.querySelector('#thu-res-s-dph');
        const breakdown = this.container.querySelector('#thu-res-breakdown');

        if (resBez) resBez.textContent = `${totalBezDph.toLocaleString('cs-CZ')} Kč`;
        if (resS) resS.textContent = `${totalSDph.toLocaleString('cs-CZ')} Kč`;
        if (breakdown) {
            breakdown.innerHTML = `${volume} m³ × ${baseRate.toLocaleString('cs-CZ')} Kč/m³ × koef. ${locKoef} + ${(dphRate * 100).toFixed(0)} % DPH`;
        }
    }
};
