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
