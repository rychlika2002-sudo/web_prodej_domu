/**
 * Modul: Vnitřní kanalizace (výpočet průtoku splaškových vod dle ČSN EN 12056)
 */

export default {
    id: 'canal',
    name: 'Vnitřní kanalizace',

    async init(AppState, containerEl) {
        this.container = containerEl;
        this.bindEvents();
    },

    bindEvents() {
        const calcBtn = this.container.querySelector('#canal-calc-btn');
        if (calcBtn) calcBtn.onclick = () => this.calculate();

        const inputs = this.container.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.calculate());
        });
    },

    calculate() {
        const nUmyvadla = parseInt(this.container.querySelector('#canal-umyvadla')?.value) || 0;
        const nVany = parseInt(this.container.querySelector('#canal-vany')?.value) || 0;
        const nDrezy = parseInt(this.container.querySelector('#canal-drezy')?.value) || 0;
        const nWc = parseInt(this.container.querySelector('#canal-wc')?.value) || 0;
        const k = parseFloat(this.container.querySelector('#canal-k')?.value) || 0.5;

        // Suma DU (l/s)
        const sumDu = (nUmyvadla * 0.5) + (nVany * 0.8) + (nDrezy * 0.8) + (nWc * 2.0);

        // Qww = K * sqrt(sum(DU))
        const qww = k * Math.sqrt(sumDu);

        let dnText = 'DN 110 (min. spád 2 %)';
        if (qww > 4.2 && qww <= 7.0) dnText = 'DN 125 (min. spád 1.5 %)';
        else if (qww > 7.0) dnText = 'DN 160 (min. spád 1.5 %)';

        const resQww = this.container.querySelector('#canal-res-qww');
        const resDn = this.container.querySelector('#canal-res-dn');
        const resDetail = this.container.querySelector('#canal-res-detail');

        if (resQww) resQww.textContent = `${qww.toFixed(2)} l/s`;
        if (resDn) resDn.textContent = dnText;
        if (resDetail) {
            resDetail.innerHTML = `Celková suma ΣDU = <strong>${sumDu.toFixed(2)} l/s</strong>. Vypočtený průtok splašků <strong>${qww.toFixed(2)} l/s</strong> bezpečně odvede potrubí ${dnText}.`;
        }
    }
};
