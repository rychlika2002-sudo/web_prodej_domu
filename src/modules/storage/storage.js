/**
 * Modul: Storage (Projektový archiv a přenos konfigurace)
 */

import { MediaDB } from '../../core/app-state.js';

export default {
    id: 'storage',
    name: 'Projektový archiv',

    async init(AppState, containerEl) {
        this.container = containerEl;
        this.appState = AppState;
        this.bindEvents();
    },

    bindEvents() {
        const exportBtn = this.container.querySelector('#storage-export-btn');
        const importTrigger = this.container.querySelector('#storage-import-trigger');
        const importInput = this.container.querySelector('#storage-import-input');

        if (exportBtn) {
            exportBtn.onclick = () => this.exportBackup();
        }

        if (importTrigger && importInput) {
            importTrigger.onclick = () => importInput.click();
            importInput.onchange = (e) => this.importBackup(e);
        }
    },

    async exportBackup() {
        try {
            const data = this.appState.data;
            const exportData = {
                config: data,
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                mediaData: {}
            };

            // Načtení všech uložených médií z IndexedDB
            const media = data.siteMedia || {};
            for (const key in media) {
                const val = media[key];
                if (typeof val === 'string' && val.startsWith('db:')) {
                    const dbKey = val.replace('db:', '');
                    const base64 = await MediaDB.load(dbKey);
                    if (base64) exportData.mediaData[dbKey] = base64;
                }
            }

            const jsonStr = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ard_projekt_zaloha_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            alert('Chyba při exportu: ' + err.message);
        }
    },

    async importBackup(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const imported = JSON.parse(text);

            if (imported.config) {
                // Obnova médií do IndexedDB
                if (imported.mediaData) {
                    for (const dbKey in imported.mediaData) {
                        await MediaDB.save(dbKey, imported.mediaData[dbKey]);
                    }
                }
                this.appState.data = { ...this.appState.data, ...imported.config };
                this.appState.save();
                alert('Projekt byl úspěšně obnoven ze zálohy! Aplikace se nyní obnoví.');
                window.location.reload();
            } else {
                alert('Neplatný formát záložního souboru.');
            }
        } catch (err) {
            alert('Chyba při nahrávání konfigurace: ' + err.message);
        }
    }
};
