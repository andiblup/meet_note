const chalk = require('chalk');
const symbols = require('log-symbols');

// const ts = () => chalk.gray(new Date().toLocaleTimeString());
function ts() {
    const raw = new Date().toLocaleTimeString();        // 22:20:42
    return raw
        .replace(/\d+/g, d => chalk.magenta(d))          // Ziffern pink
        .replace(/:/g, ':' + chalk.gray(''));           // ':' grau (wirkt nur einmal)
}

// function colorize(arguments) {
//     return arguments.replace(/\b(Server|Client)\b/gi, t => chalk.keyword('orange')(t)) // Server / Client orange
//         .replace(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g, ip => chalk.magenta(ip)) // IPv4-Adressen pink
//         .replace('reason:', chalk.cyan('reason:'))
//         .replace('http://', chalk.grey('http://'))
//         .replace(/:\d+/g, t => chalk.grey(t))
//         .replace('started at:', chalk.white('started at:'))
//         .replace('joined', chalk.green('joined'))
//         .replace('left', chalk.red('left'))
//         .replace('id:', chalk.cyan('id:'));
//     // num_dash after id: or reason:
// }

function colorize(line) {
    return line
        // Server / Client orange
        .replace(/\b(Server|Client)\b/g, t => chalk.keyword('orange')(t))

        // IP-Adresse + optionaler Port zuerst (damit 192.168.8.82:6060 mitgefasst wird)
        .replace(/\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?/g, addr => chalk.magenta(addr))

        // http:// grau
        .replace(/http:\/\//g, chalk.grey('http://'))

        // reason: und id: cyan
        .replace(/reason:/g, chalk.cyan('reason:'))
        .replace(/id:/g, chalk.cyan('id:'))

        // "started at:" komplett weiß
        .replace(/started at:/g, chalk.white('started at:'))

        // joined / left grün bzw. rot
        .replace(/\bjoined\b/g, t => chalk.green(t))
        .replace(/\bleft\b/g, t => chalk.red(t));
}

// function colorize(line) {
//     return line
//         // Server / Client orange
//         .replace(/\b(Server|Client)\b/g, t => chalk.keyword('orange')(t))

//         // http:// dunkelgrau
//         .replace(/http:\/\//g, chalk.grey('http://'))

//         // Timestamp (hh:mm:ss) grau belassen, damit es nicht mit Port kollidiert
//         .replace(/\b\d{1,2}:\d{2}:\d{2}\b/g, t => chalk.grey(t))

//         // IP-Adresse plus optionaler Port (192.168.0.1:6060) magenta
//         .replace(
//             /\b\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?\b/g,
//             addr => chalk.magenta(addr)
//         )

//         // reason: cyan
//         .replace(/reason:/g, chalk.cyan('reason:'))

//         // id: cyan
//         .replace(/id:/g, chalk.cyan('id:'))

//         // "started at:" komplett weiß
//         .replace(/started at:/g, chalk.white('started at:'))

//         // joined / left grün bzw. rot
//         .replace(/\bjoined\b/g, t => chalk.green(t))
//         .replace(/\bleft\b/g, t => chalk.red(t))

//     // alles andere (z.B. die eigentlichen Client-IDs) bleibt default (weiß)
// }

function base(colorFn, icon, args) {

    console.log(`${ts()} ${icon} ${colorize(args.join(' '))}`);

}
function base_no_time(colorFn, icon, args) {

    console.log(`${icon} ${colorize(args.join(' '))}`);

}


module.exports = {
    ok: (...m) => base(chalk.green, symbols.success, m),
    info: (...m) => base(chalk.cyan, symbols.info, m),
    warn: (...m) => base(chalk.keyword('orange'), symbols.warning, m),
    err: (...m) => base(chalk.red, symbols.error, m),

    /** Zeile unverändert durchreichen (bereits formatiert) */
    raw: line => console.log(line),
    // special: line => baseMod(chalk.green, symbols.success, line),

    ok_no_time: (...m) => base_no_time(chalk.green, symbols.success, m),
    info_no_time: (...m) => base_no_time(chalk.cyan, symbols.info, m),
    warn_no_time: (...m) => base_no_time(chalk.keyword('orange'), symbols.warning, m),
    err_no_time: (...m) => base_no_time(chalk.red, symbols.error, m),
};






// // utils/logger.js  – CommonJS, Color-Mix
// const chalk   = require('chalk');
// const symbols = require('log-symbols');

// /* ---------- Zeitstempel ------------------------------------------------ */
// function ts() {
//   const raw = new Date().toLocaleTimeString();        // 22:20:42
//   return raw
//     .replace(/\d+/g, d  => chalk.magenta(d))          // Ziffern pink
//     .replace(/:/g,   ':' + chalk.gray(''));           // ':' grau (wirkt nur einmal)
// }

// /* ---------- Nachricht einfärben ---------------------------------------- */
// function colorize(msg) {
//   return msg
//     // Server / Client orange
//     .replace(/\b(Server|Client)\b/gi, t => chalk.keyword('orange')(t))
//     // IPv4-Adressen pink
//     .replace(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g, ip => chalk.magenta(ip));
// }

// /* ---------- Low-level Log-Funktion ------------------------------------ */
// function out(icon, msg) {
//   console.log(`${ts()} ${icon} ${colorize(msg)}`);
// }

// /* ---------- Exporte ---------------------------------------------------- */
// module.exports = {
//   ok  : (...m) => out(symbols.success, m.join(' ')),
//   info: (...m) => out(symbols.info,    m.join(' ')),
//   warn: (...m) => out(symbols.warning, m.join(' ')),
//   err : (...m) => out(symbols.error,   m.join(' ')),

//   /* Rohdurchleitung, aber koloriert */
//   raw(line) { console.log(colorize(line)); }
// };

