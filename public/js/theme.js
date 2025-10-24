// // public/js/theme.js
// const THEME_KEY = 'meetnote:theme';
// const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;

// export function getTheme() {
//   return localStorage.getItem(THEME_KEY) || (prefersDark ? 'dark' : 'light');
// }

// export function setTheme(theme) {
//   const t = theme || 'light';
//   document.documentElement.setAttribute('data-theme', t);
//   localStorage.setItem(THEME_KEY, t);
// }

// export function initTheme() {
//   setTheme(getTheme());

//   // Optional: reagiere auf OS-Wechsel live
//   if (window.matchMedia) {
//     const mq = window.matchMedia('(prefers-color-scheme: dark)');
//     mq.addEventListener?.('change', () => {
//       // Nur automatisch wechseln, wenn der User nicht explizit selbst gewählt hat:
//       if (!localStorage.getItem(THEME_KEY)) setTheme(mq.matches ? 'dark' : 'light');
//     });
//   }
// }

const THEME_FAMILY_KEY = 'meetnote:theme-family';
const THEME_MODE_KEY   = 'meetnote:theme-mode';

export function getTheme() {
  const family = localStorage.getItem(THEME_FAMILY_KEY) || 'classic';
  const mode   = localStorage.getItem(THEME_MODE_KEY)   || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  return { family, mode };
}

export function setTheme({ family, mode }) {
  const f = family || 'classic';
  const m = mode || 'light';
  document.documentElement.setAttribute('data-theme', f);
  document.documentElement.setAttribute('data-mode', m);
  localStorage.setItem(THEME_FAMILY_KEY, f);
  localStorage.setItem(THEME_MODE_KEY, m);
}

export function initThemeControls({ familySelId = 'theme-family', modeSelId = 'theme-mode' } = {}) {
  const { family, mode } = getTheme();
  setTheme({ family, mode });

  const familySel = document.getElementById(familySelId);
  const modeSel   = document.getElementById(modeSelId);

  if (familySel) {
    familySel.value = family;
    familySel.addEventListener('change', e => setTheme({ family: e.target.value, mode: getTheme().mode }));
  }
  if (modeSel) {
    modeSel.value = mode;
    modeSel.addEventListener('change', e => setTheme({ family: getTheme().family, mode: e.target.value }));
  }
}
