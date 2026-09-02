/**
 * ModuleLoader - Zabezpečený správce a načítač karet/modulů s Error Boundary
 * Pokud jakýkoliv modul (např. mapa) selže, chyba je izolována a nerozbije ostatní moduly.
 */

import { AppState } from './app-state.js';

export class ModuleLoader {
    constructor() {
        this.modules = new Map();
        this.activeModules = new Set();
        this.registry = {};
    }

    /**
     * Registrace modulu (pro přímé bundling nebo dynamické načítání)
     */
    register(id, moduleDefinition) {
        this.registry[id] = moduleDefinition;
    }

    /**
     * Bezpečné spuštění modulu v daném kontejneru
     */
    async mount(id, containerEl, options = {}) {
        if (!containerEl) {
            console.warn(`[ModuleLoader] Kontejner pro modul "${id}" nebyl nalezen v DOM.`);
            return null;
        }

        try {
            let moduleObj = this.registry[id];

            // Pokud modul ještě není v paměti a máme dynamický import
            if (!moduleObj && options.importPath) {
                const imported = await import(options.importPath);
                moduleObj = imported.default || imported;
                this.register(id, moduleObj);
            }

            if (!moduleObj) {
                throw new Error(`Modul "${id}" není registrován v ModuleLoaderu.`);
            }

            // Pokud modul definuje HTML template v JS a kontejner je prázdný
            if (moduleObj.template && containerEl.children.length === 0) {
                containerEl.innerHTML = typeof moduleObj.template === 'function' 
                    ? moduleObj.template(AppState.data) 
                    : moduleObj.template;
            }

            // Spuštění lifecycle metody init s izolací chyb
            if (typeof moduleObj.init === 'function') {
                await moduleObj.init(AppState, containerEl, options);
            }

            this.activeModules.add(id);
            this.modules.set(id, { definition: moduleObj, container: containerEl });

            console.log(`%c[Module "${id}"] úspěšně inicializován.`, 'color: #27ae60; font-weight: bold;');
            return moduleObj;

        } catch (error) {
            // ERROR BOUNDARY: Chyba v tomto modulu NEZASTAVÍ aplikaci
            console.error(`%c[ModuleLoader CHYBA v modulu "${id}"]:`, 'color: #e74c3c; font-weight: bold;', error);
            
            this.renderErrorBadge(id, containerEl, error);
            return null;
        }
    }

    /**
     * Bezpečné zobrazení chybového stavu uvnitř daného modulu
     */
    renderErrorBadge(moduleId, containerEl, error) {
        if (!containerEl) return;
        const errorBox = document.createElement('div');
        errorBox.className = 'card-module-error';
        errorBox.style.cssText = `
            padding: 1.5rem;
            margin: 1rem 0;
            background: #fff3f3;
            border: 2px solid #e74c3c;
            border-radius: 8px;
            color: #c0392b;
            font-family: sans-serif;
            font-size: 0.9rem;
            box-shadow: 0 4px 12px rgba(231,76,60,0.15);
        `;
        errorBox.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 0.5rem;">
                <span style="font-size: 1.4rem;">⚠️</span>
                <strong style="font-size: 1rem;">Chyba v modulu [${moduleId}]</strong>
            </div>
            <p style="margin: 0.3rem 0; opacity: 0.9;">Tato karta narazila na problém, ale <strong>zbytek aplikace běží zcela v pořádku</strong>.</p>
            <code style="display: block; background: #ffe6e6; padding: 6px 10px; border-radius: 4px; margin-top: 8px; font-size: 0.8rem; overflow-x: auto;">
                ${error.message || error}
            </code>
        `;
        containerEl.prepend(errorBox);
    }

    /**
     * Uvolnění modulu
     */
    destroy(id) {
        const item = this.modules.get(id);
        if (item && typeof item.definition.destroy === 'function') {
            try {
                item.definition.destroy();
            } catch (e) {
                console.warn(`[ModuleLoader] Chyba při destroy modulu ${id}:`, e);
            }
        }
        this.modules.delete(id);
        this.activeModules.delete(id);
    }
}

export const moduleLoader = new ModuleLoader();
