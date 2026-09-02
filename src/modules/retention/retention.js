/**
 * Modul: Retence & Akumulace (návrh objemu nádrže na srážkové vody)
 */

export default {
    id: 'retention',
    name: 'Retence & Akumulace',

    async init(AppState, containerEl) {
        this.container = containerEl;
        this.bindEvents();
    },

    bindEvents() {
        const calcBtn = this.container.querySelector('#ret-calc-btn');
        if (calcBtn) calcBtn.onclick = () => this.calculate();

        const inputs = this.container.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.calculate());
        });
    },

    calculate() {
        const roofArea = parseFloat(this.container.querySelector('#ret-roof-area')?.value) || 0;
        const psi = parseFloat(this.container.querySelector('#ret-roof-type')?.value) || 0.9;
        const gardenArea = parseFloat(this.container.querySelector('#ret-garden-area')?.value) || 0;
        const people = parseInt(this.container.querySelector('#ret-people')?.value) || 0;

        const rainAnnual = 650; // mm/rok (průměr ČR)
        const annualYield = (roofArea * rainAnnual * psi * 0.9) / 1000; // m3/rok

        // Potřeba vody: zálivka cca 150 l/m2/rok + domácnost cca 15 m3/osoba/rok
        const annualNeed = (gardenArea * 0.15) + (people * 15);

        // Objem nádrže na 21 denní zásobu ze zisku nebo potřeby
        const minNeedOrYield = Math.min(annualYield, annualNeed > 0 ? annualNeed : annualYield);
        let recommendedVolume = (minNeedOrYield / 365) * 21;
        recommendedVolume = Math.max(3.0, Math.ceil(recommendedVolume * 2) / 2); // Zaokrouhlení na půl m3 nahoru

        const resVol = this.container.querySelector('#ret-res-volume');
        const resAnn = this.container.querySelector('#ret-res-annual');
        const resDetail = this.container.querySelector('#ret-res-detail');

        if (resVol) resVol.textContent = `${recommendedVolume.toFixed(1)} m³ (${(recommendedVolume * 1000).toLocaleString('cs-CZ')} l)`;
        if (resAnn) resAnn.textContent = `${annualYield.toFixed(1)} m³/rok`;
        if (resDetail) {
            resDetail.innerHTML = `Při ročních srážkách 650 mm zachytí střecha <strong>${annualYield.toFixed(1)} m³</strong> vody. Roční potřeba domu a zahrady je cca <strong>${annualNeed.toFixed(1)} m³</strong>.`;
        }
    }
};
