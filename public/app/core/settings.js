// Apply saved theme
export function applySavedTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// Save new theme
export function saveTheme(theme) {
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
}

// /public/app/core/settings.js

/**
 * Load settings from the server (local file).
 */
export async function loadSettings() {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      return await res.json();
    }
    throw new Error('Settings fetch failed');
  } catch (err) {
    console.error('❗️ Error loading settings:', err);
    return {
      theme: 'light',
      autosave: true,
      autosaveInterval: 5000
    };
  }
}

/**
 * Save settings to the server (update local file).
 * @param {Object} settings 
 */
export async function saveSettings(settings) {
  try {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    console.log('💾 Settings gespeichert');
  } catch (err) {
    console.error('❗️ Error saving settings:', err);
  }
}
