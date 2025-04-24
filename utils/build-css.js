//! ------------------------------------------------------------------
//? Build CSS with PostCSS + Tailwind + Spinner (CommonJS, Node ≥14)
//! -----------------------------------------------------------------
// const { spawnSync } = require('child_process');
// const path = require('path');
// const ora = require('ora');
// const log = require('../utils/logger.js');

// const input = path.resolve(__dirname, '..', 'public/styles/styles.css');
// const output = path.resolve(__dirname, '..', 'public/styles/output.css');

// // Immer Farben erlauben
// process.env.FORCE_COLOR = '1';

// // Spinner starten
// const spinner = ora({ text: 'Building CSS …', spinner: 'dots' }).start();

// // Lokaler Pfad zur PostCSS‐CLI
// const postcssCli = path.join(
//     __dirname, '..', 'node_modules', '.bin',
//     process.platform === 'win32' ? 'postcss.cmd' : 'postcss'
// );

// const res = spawnSync(
//     postcssCli,
//     [input, '-o', output, '--env', 'production'],
//     {
//         stdio: 'inherit',
//         // on Windows batch scripts need a shell
//         shell: process.platform === 'win32'
//     }
// );

// if (res.error) {
//     spinner.fail(`Spawn-Error: ${res.error.message}`);
//     process.exit(1);
// }

// if (res.status === 0) {
//     spinner.succeed('CSS build finished');
//     process.exit(0);
// } else {
//     spinner.fail('CSS build failed');
//     process.exit(res.status || 1);
// }



// const { spawn } = require('child_process');
// const path      = require('path');
// const ora       = require('ora');
// const log       = require('../utils/logger.js');

// const input  = path.resolve(__dirname, '..', 'public/styles/styles.css');
// const output = path.resolve(__dirname, '..', 'public/styles/output.css');

// process.env.FORCE_COLOR = '1';

// const spinner = ora({ text: 'Building CSS …', spinner: 'dots' }).start();

// const cmd     = process.platform === 'win32' ? 'postcss.cmd' : 'postcss';
// const binPath = path.join(__dirname, '..', 'node_modules', '.bin', cmd);

// const ps = spawn(binPath, [input, '-o', output, '--env', 'production'], {
//   stdio: 'inherit',
//   shell: process.platform === 'win32'
// });

// ps.on('error', err => {
//   spinner.fail(`Spawn error: ${err.message}`);
//   process.exit(1);
// });

// ps.on('close', code => {
//   if (code === 0) {
//     spinner.succeed('CSS build finished');
//     process.exit(0);
//   } else {
//     spinner.fail('CSS build failed');
//     process.exit(code);
//   }
// });


const { spawn } = require('child_process');
const path      = require('path');
const ora       = require('ora');
const log       = require('../utils/logger.js');

const input  = path.resolve(__dirname, '..', 'public/styles/styles.css');
const output = path.resolve(__dirname, '..', 'public/styles/output.css');

// immer Farbe erzwingen
process.env.FORCE_COLOR = '1';

// Spinner starten
const spinner = ora({ text: 'Building CSS …', spinner: 'dots' }).start();

// CLI-Pfad ermitteln
const bin = path.join(
  __dirname, '..', 'node_modules', '.bin',
  process.platform==='win32' ? 'postcss.cmd' : 'postcss'
);

// child mit stdout als Pipe, stderr weiterhin an Terminal
const ps = spawn(bin, [input, '-o', output, '--env', 'production'], {
  shell: process.platform==='win32',
  stdio: ['ignore', 'pipe', 'inherit']
});

ps.stdout.on('data', chunk => {
  let str = chunk.toString();
  // Banner-Kommentar am Anfang entfernen
  str = str.replace(/^\/\*![\s\S]*?\*\/\r?\n?/, '');
  process.stdout.write(str);
});

ps.on('error', err => {
  spinner.fail(`Spawn-Error: ${err.message}`);
  process.exit(1);
});

ps.on('close', code => {
  if (code === 0) {
    spinner.succeed('CSS build finished');
    process.exit(0);
  } else {
    spinner.fail('CSS build failed');
    process.exit(code);
  }
});

