/**
 * Modul: Dispoziční řešení a Tabulka místností
 */

export default {
    id: 'dispo',
    name: 'Dispozice & Místnosti',
    rooms: [
        { num: '1.01', name: 'Zádveří / Chodba', floor: '1.NP', area: 8.5, surface: 'Keramická dlažba' },
        { num: '1.02', name: 'Technická místnost + WC', floor: '1.NP', area: 5.2, surface: 'Keramická dlažba' },
        { num: '1.03', name: 'Obývací pokoj + KK', floor: '1.NP', area: 42.8, surface: 'Dřevěná plovoucí' },
        { num: '1.04', name: 'Spíž', floor: '1.NP', area: 3.4, surface: 'Keramická dlažba' },
        { num: '2.01', name: 'Chodba a schodiště', floor: '2.NP', area: 9.6, surface: 'Dřevěný masiv' },
        { num: '2.02', name: 'Koupelna s WC', floor: '2.NP', area: 9.0, surface: 'Keramická dlažba' },
        { num: '2.03', name: 'Ložnice rodičů', floor: '2.NP', area: 16.5, surface: 'Laminátová podlaha' },
        { num: '2.04', name: 'Dětský pokoj 1', floor: '2.NP', area: 14.5, surface: 'Laminátová podlaha' },
        { num: '2.05', name: 'Dětský pokoj 2 / Pracovna', floor: '2.NP', area: 15.0, surface: 'Laminátová podlaha' }
    ],

    async init(AppState, containerEl) {
        this.container = containerEl;
        this.render();
        this.bindEvents();
    },

    bindEvents() {
        const addBtn = this.container.querySelector('#dispo-add-row');
        const exportBtn = this.container.querySelector('#dispo-export-csv');

        if (addBtn) {
            addBtn.onclick = () => {
                const nextNum = `1.0${this.rooms.length + 1}`;
                this.rooms.push({ num: nextNum, name: 'Nová místnost', floor: '1.NP', area: 10.0, surface: 'Vinyl' });
                this.render();
            };
        }

        if (exportBtn) {
            exportBtn.onclick = () => this.exportCsv();
        }
    },

    render() {
        const tbody = this.container.querySelector('#dispo-tbody');
        if (!tbody) return;

        tbody.innerHTML = this.rooms.map((r, i) => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px;"><input type="text" class="form-input" value="${r.num}" data-idx="${i}" data-field="num" style="width: 70px;"></td>
                <td style="padding: 8px;"><input type="text" class="form-input" value="${r.name}" data-idx="${i}" data-field="name"></td>
                <td style="padding: 8px;"><input type="text" class="form-input" value="${r.floor}" data-idx="${i}" data-field="floor" style="width: 70px;"></td>
                <td style="padding: 8px;"><input type="number" step="0.1" class="form-input room-area-input" value="${r.area}" data-idx="${i}" data-field="area" style="width: 90px;"></td>
                <td style="padding: 8px;"><input type="text" class="form-input" value="${r.surface}" data-idx="${i}" data-field="surface"></td>
                <td style="padding: 8px; text-align: center;">
                    <button class="room-del-btn" data-idx="${i}" style="background: none; border: none; cursor: pointer; color: #ef4444; font-size: 1.1rem;" title="Smazat">🗑️</button>
                </td>
            </tr>
        `).join('');

        this.updateTotal();

        // Bind input handlers
        tbody.querySelectorAll('input').forEach(inp => {
            inp.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.idx);
                const field = e.target.dataset.field;
                if (field === 'area') {
                    this.rooms[idx].area = parseFloat(e.target.value) || 0;
                    this.updateTotal();
                } else {
                    this.rooms[idx][field] = e.target.value;
                }
            });
        });

        tbody.querySelectorAll('.room-del-btn').forEach(btn => {
            btn.onclick = (e) => {
                const idx = parseInt(e.currentTarget.dataset.idx);
                this.rooms.splice(idx, 1);
                this.render();
            };
        });
    },

    updateTotal() {
        const total = this.rooms.reduce((sum, r) => sum + (parseFloat(r.area) || 0), 0);
        const totalEl = this.container.querySelector('#dispo-total-area');
        if (totalEl) totalEl.textContent = `${total.toFixed(1)} m²`;
    },

    exportCsv() {
        let csv = 'Cislo;Nazev mistnosti;Podlazi;Plocha_m2;Podlaha\n';
        this.rooms.forEach(r => {
            csv += `${r.num};"${r.name}";${r.floor};${r.area};"${r.surface}"\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'tabulka_mistnosti_dispozice.csv';
        link.click();
    }
};
