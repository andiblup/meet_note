#!/usr/bin/env node
//! ------------------------------------------------------------------
//? Build CSS with PostCSS + Tailwind + Spinner (CommonJS, Node ≥14)
//! -----------------------------------------------------------------
const { spawnSync } = require('child_process');
const path = require('path');
const ora = require('ora');

const input = path.join(__dirname, '..', 'public', 'styles', 'styles.css');
const output = path.join(__dirname, '..', 'public', 'styles', 'output.css');

/* ---------- Spinner starten ------------------------------------ */
const spinner = ora({ text: 'Building CSS …', spinner: 'dots' }).start();

/* ---------- PostCSS-CLI ausführen ------------------------------ */
const res = spawnSync(
    // process.platform === 'win32' ? 'npx.cmd' : 'npx',
    'npx',
    ['postcss', input, '-o', output, '--env', 'production'],
    { stdio: 'inherit', shell: true }                                // CLI-Ausgabe durchreichen
);

/* ---------- Ergebnis auswerten --------------------------------- */
if (res.status === 0) {
    spinner.succeed('CSS build finished');
    process.exit(0);
} else {
    spinner.fail('CSS build failed');
    process.exit(res.status || 1);
}


