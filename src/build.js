/**
 * Build Script (src/build.js)
 * Sestaví modulární zdrojové kódy z `src/` do distribučního `index.html`, `app.js` a `styles.css`.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.resolve(__dirname);

function build() {
    console.log('🚀 Spouštím sestavení ARD aplikace...');

    // 1. Načtení kostry shell.html
    const shellPath = path.join(SRC_DIR, 'core', 'shell.html');
    if (!fs.existsSync(shellPath)) {
        console.error('❌ Chyba: shell.html nebyl nalezen.');
        return;
    }
    let htmlContent = fs.readFileSync(shellPath, 'utf8');

    // 2. Moduly k vložení do šablony
    const modules = [
        { id: 'projects', placeholder: '<!-- MODULE_PROJECTS_HTML -->' },
        { id: 'units', placeholder: '<!-- MODULE_UNITS_HTML -->' },
        { id: 'map', placeholder: '<!-- MODULE_MAP_HTML -->' },
        { id: 'gallery', placeholder: '<!-- MODULE_GALLERY_HTML -->' },
        { id: 'contacts', placeholder: '<!-- MODULE_CONTACTS_HTML -->' },
        { id: 'jes', placeholder: '<!-- MODULE_JES_HTML -->' },
        { id: 'thu', placeholder: '<!-- MODULE_THU_HTML -->' },
        { id: 'water', placeholder: '<!-- MODULE_WATER_HTML -->' },
        { id: 'canal', placeholder: '<!-- MODULE_CANAL_HTML -->' },
        { id: 'retention', placeholder: '<!-- MODULE_RETENTION_HTML -->' },
        { id: 'dispo', placeholder: '<!-- MODULE_DISPO_HTML -->' },
        { id: 'storage', placeholder: '<!-- MODULE_STORAGE_HTML -->' }
    ];

    modules.forEach(mod => {
        const modHtmlPath = path.join(SRC_DIR, 'modules', mod.id, `${mod.id}.html`);
        if (fs.existsSync(modHtmlPath)) {
            const modHtml = fs.readFileSync(modHtmlPath, 'utf8');
            htmlContent = htmlContent.replace(mod.placeholder, modHtml);
            console.log(`  ✓ Modul [${mod.id}] vložen.`);
        } else {
            console.warn(`  ⚠️ Šablona pro modul [${mod.id}] nenalezena: ${modHtmlPath}`);
        }
    });

    // Upravíme script tag na ES module src/main.js
    htmlContent = htmlContent.replace(
        '<script type="module" src="app.js"></script>',
        '<script type="module" src="src/main.js"></script>'
    );

    // 3. Zápis do kořenového index.html
    const outHtmlPath = path.join(ROOT_DIR, 'index.html');
    fs.writeFileSync(outHtmlPath, htmlContent, 'utf8');
    console.log(`✅ Vygenerován hlavní soubor: ${outHtmlPath}`);

    // 4. Kopie stylů do kořene
    const srcCssPath = path.join(SRC_DIR, 'core', 'styles.css');
    const outCssPath = path.join(ROOT_DIR, 'styles.css');
    if (fs.existsSync(srcCssPath)) {
        fs.copyFileSync(srcCssPath, outCssPath);
        console.log(`✅ Aktualizovány globální styly: ${outCssPath}`);
    }

    console.log('\n🎉 Sestavení proběhlo úspěšně! Aplikace je plně modulární.');
}

// Spuštění sestavení
build();

// Podpora pro --watch
if (process.argv.includes('--watch')) {
    console.log('👀 Sledování změn v src/ aktivováno...');
    fs.watch(SRC_DIR, { recursive: true }, (eventType, filename) => {
        if (filename && (filename.endsWith('.html') || filename.endsWith('.css') || filename.endsWith('.js'))) {
            console.log(`🔄 Změna v souboru ${filename}, přebudovávám...`);
            build();
        }
    });
}
