// Copies the built website into ./www for Capacitor. Never touches the original site/repo.
// Usage:
//   node scripts/sync-web.mjs                 -> keep current www/ (only re-applies the app tweaks)
//   node scripts/sync-web.mjs ../dist         -> copy a freshly built `dist/` folder of the website, then apply tweaks
//   node scripts/sync-web.mjs ./SCAN-LEARN-ACT.html   -> use a single-file build as www/index.html
import fs from 'node:fs';
import path from 'node:path';

const www = path.resolve('www');
const src = process.argv[2] ? path.resolve(process.argv[2]) : null;

if (src) {
  if (!fs.existsSync(src)) { console.error('Not found:', src); process.exit(1); }
  if (fs.statSync(src).isDirectory()) {
    fs.rmSync(www, { recursive: true, force: true });
    fs.cpSync(src, www, { recursive: true });
    // These PWA/GitHub-Pages-only files are not needed inside the app (the app already ships all files offline).
    for (const f of ['sw.js', 'manifest.webmanifest', 'CNAME', '.nojekyll']) fs.rmSync(path.join(www, f), { force: true });
  } else {
    fs.mkdirSync(www, { recursive: true });
    fs.copyFileSync(src, path.join(www, 'index.html'));
  }
}

// App-only tweak: remove viewport-fit=cover so the native webview is placed inside the system bars
// (status bar / notch / home indicator) on both Android and iOS. The website itself is not changed.
const idx = path.join(www, 'index.html');
let html = fs.readFileSync(idx, 'utf8');
html = html.replace(/,\s*viewport-fit=cover/, '');
// The service worker is only for the website; the app bundles everything already.
html = html.replace(/navigator\.serviceWorker\.register\([^)]*\)/g, 'Promise.resolve()');
fs.writeFileSync(idx, html);
console.log('www ready:', idx);
