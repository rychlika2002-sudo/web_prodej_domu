/**
 * Modul: Vnitřní vodovod (dimenzování a hydraulický propočet)
 */

export default {
    id: 'water',
    name: 'Vnitřní vodovod',

    async init(AppState, containerEl) {
        this.container = containerEl;
        this.bindEvents();
    },

    bindEvents() {
        const calcBtn = this.container.querySelector('#water-calc-btn');
        if (calcBtn) calcBtn.onclick = () => this.calculate();

        const inputs = this.container.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.calculate());
        });
    },

    calculate() {
        const nUmyvadla = parseInt(this.container.querySelector('#water-umyvadla')?.value) || 0;
        const nVany = parseInt(this.container.querySelector('#water-vany')?.value) || 0;
        const nWc = parseInt(this.container.querySelector('#water-wc')?.value) || 0;
        const nSpotrebice = parseInt(this.container.querySelector('#water-spotrebice')?.value) || 0;
        const speed = parseFloat(this.container.querySelector('#water-speed')?.value) || 1.5;

        // Součet jmenovitých výtoků (l/s)
        const sumQ = (nUmyvadla * 0.2) + (nVany * 0.3) + (nWc * 0.1) + (nSpotrebice * 0.2);

        // Výpočtový průtok Qd pro bytové domy / RD: Qd = sqrt(sum(q_i^2)) nebo empirický koeficient
        // Dle ČSN 75 5455: Qd = sqrt(0.25 * sumQ)
        const qd = Math.max(0.2, Math.sqrt(sumQ * 0.15));
        const qdM3h = qd * 3.6;

        // Vnitřní průměr potrubí d = sqrt((4 * Qd) / (pi * v))
        // Qd v m3/s: qd / 1000
        const dMetres = Math.sqrt((4 * (qd / 1000)) / (Math.PI * speed));
        const dMm = dMetres * 1000;

        let dnText = 'DN 20 (PE 25×2.3)';
        if (dMm > 19 && dMm <= 26) dnText = 'DN 25 (PE 32×3.0)';
        else if (dMm > 26 && dMm <= 34) dnText = 'DN 32 (PE 40×3.7)';
        else if (dMm > 34) dnText = 'DN 40 (PE 50×4.6)';

        const resQd = this.container.querySelector('#water-res-qd');
        const resDn = this.container.querySelector('#water-res-dn');
        const resDetail = this.container.querySelector('#water-res-detail');

        if (resQd) resQd.textContent = `${qd.toFixed(2)} l/s (${qdM3h.toFixed(2)} m³/h)`;
        if (resDn) resDn.textContent = dnText;
        if (resDetail) {
            resDetail.innerHTML = `Vnitřní průměr d = <strong>${dMm.toFixed(1)} mm</strong> při rychlosti v = <strong>${speed.toFixed(1)} m/s</strong>.`;
        }
    }
};
