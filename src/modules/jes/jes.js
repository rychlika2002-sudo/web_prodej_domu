/**
 * Modul: JES (Jednotné environmentální stanovisko) & Odnětí ZPF
 */

export default {
    id: 'jes',
    name: 'JES & Odnětí ZPF',

    async init(AppState, containerEl) {
        this.container = containerEl;
        this.bindEvents();
    },

    bindEvents() {
        const calcBtn = this.container.querySelector('#jes-calc-btn');
        if (calcBtn) {
            calcBtn.onclick = () => this.calculate();
        }

        const inputs = this.container.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.calculate());
        });
    },

    calculate() {
        const area = parseFloat(this.container.querySelector('#jes-area')?.value) || 0;
        const baseRate = parseFloat(this.container.querySelector('#jes-base-rate')?.value) || 0;
        const trida = this.container.querySelector('#jes-trida')?.value || '3';

        const koefMap = { '1': 9.0, '2': 6.0, '3': 4.0, '4': 3.0, '5': 1.0 };
        const koef = koefMap[trida] || 1.0;

        const total = Math.round(area * baseRate * koef);

        const resTotal = this.container.querySelector('#jes-result-total');
        const resBreakdown = this.container.querySelector('#jes-result-breakdown');

        if (resTotal) resTotal.textContent = `${total.toLocaleString('cs-CZ')} Kč`;
        if (resBreakdown) {
            resBreakdown.innerHTML = `Výpočet: <strong>${area} m²</strong> × <strong>${baseRate.toFixed(2)} Kč/m²</strong> × koef. <strong>${koef.toFixed(1)}</strong> (třída ${trida}) = <strong>${total.toLocaleString('cs-CZ')} Kč</strong>`;
        }
    }
};
