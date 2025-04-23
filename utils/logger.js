const chalk = require('chalk');
const symbols = require('log-symbols');

// const ts = () => chalk.gray(new Date().toLocaleTimeString());
function ts() {
    const raw = new Date().toLocaleTimeString();        // 22:20:42
    return raw
        .replace(/\d+/g, d => chalk.magenta(d))          // Ziffern pink
        .replace(/:/g, ':' + chalk.gray(''));           // ':' grau (wirkt nur einmal)
}

function colorize(arguments){
    return arguments.replace(/\b(Server|Client)\b/gi, t => chalk.keyword('orange')(t)) // Server / Client orange
    .replace(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g, ip => chalk.magenta(ip)) // IPv4-Adressen pink
    .replace('reason:', chalk.cyan('reason:'))
    .replace('http://', chalk.grey('http://'))
    .replace(/:\d+/g, t => chalk.grey(t))
    .replace('started at:', chalk.white('started at:'))
    .replace('joined', chalk.green('joined'))
    .replace('left', chalk.red('left'))
    .replace('id:', chalk.cyan('id:'));
    // num_dash after id: or reason:
}

// let onceFullColored = false;
let onceFullColored = true;
function base(colorFn, icon, args) {


    // console.log("newArgs");
    // console.log(newArgs);


    // if (!onceFullColored) {
    //     //! BUG: First arg cant be modified, this line needs to get executed
    //     console.log(`${ts()} ${icon} ${colorFn(...args)}`);


    //     onceFullColored = true;
    // }
    // else {

        // let newArgs = args.join(' ')
        //     .replace(/\b(Server|Client)\b/gi, t => chalk.keyword('orange')(t)) // Server / Client orange
        //     .replace(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g, ip => chalk.magenta(ip)); // IPv4-Adressen pink
        // console.log(`${ts()} ${icon} ${newArgs}`);
        console.log(`${ts()} ${icon} ${colorize(args.join(' '))}`);
    // }
}


module.exports = {
    ok: (...m) => base(chalk.green, symbols.success, m),
    info: (...m) => base(chalk.cyan, symbols.info, m),
    warn: (...m) => base(chalk.keyword('orange'), symbols.warning, m),
    err: (...m) => base(chalk.red, symbols.error, m),

    /** Zeile unverändert durchreichen (bereits formatiert) */
    raw: line => console.log(line),
    // special: line => baseMod(chalk.green, symbols.success, line),
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

