// /** @type {import('tailwindcss').Config} */
// module.exports = {
//     content: [
//         './public/**/*.html',        // alle HTML‑Views
//         './public/**/*.js',          // Klassen in JavaScript
//         './launcher/*.html',         // optional Launcher
//         './launcher/*.js'
//     ],
//     theme: { extend: {} },
//     plugins: [require('daisyui')],
//     daisyui: {
//         themes: ["light", "dark"],
//     }
// };

/** @type {import('tailwindcss').Config} */
module.exports = {
content: [
"./public/**/*.html",
"./public/**/*.js",
"./electron/**/*.js"
],
theme: { extend: {} },
plugins: [],
};