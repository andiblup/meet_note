// postcss.config.js
const path = require('path');

module.exports = {
  plugins: [
    require('postcss-import'),

    require('postcss-url')({
      url: 'copy',
      // point directly at the folder that actually contains the font files:
      basePath: path.resolve(__dirname, 'node_modules', 'boxicons', 'fonts'),
      // where to copy them into your public tree:
      assetsPath: path.resolve(__dirname, 'public', 'fonts', 'boxicons'),
      // grab everything in that folder:
      filter: '**/*',
      // don’t recreate subfolders:
      flatten: true,
      // keep original filenames (no hashing):
      useHash: false
    }),

    require('tailwindcss'),
    require('autoprefixer'),
  ]
};

// // postcss.config.js
// const path = require('path');
// const postcssImport = require('postcss-import');
// const postcssUrl    = require('postcss-url');
// const tailwindcss   = require('tailwindcss');
// const autoprefixer  = require('autoprefixer');

// module.exports = async () => {
//   // dynamic import of the ESM-only daisyUI
//   const { default: daisyui } = await import('daisyui');

//   return {
//     plugins: [
//       postcssImport(),
//       postcssUrl({
//         url:      'copy',
//         basePath: path.resolve(__dirname, 'node_modules/boxicons/fonts'),
//         assetsPath: path.resolve(__dirname, 'public/fonts/boxicons'),
//         filter:   '**/*',
//         flatten:  true,
//         useHash:  false
//       }),
//       tailwindcss(),
//       daisyui({
//         themes: ['light','dark'],
//         logs:   false
//       }),
//       autoprefixer()
//     ]
//   };
// };


