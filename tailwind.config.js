/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './public/**/*.html',        // alle HTML‑Views
      './public/**/*.js',          // Klassen in JavaScript
      './launcher/*.html',         // optional Launcher
      './launcher/*.js'
    ],
    theme: { extend: {} },
    plugins: [require('daisyui')]   // DaisyUI übernimmt die Komponenten
  };
  