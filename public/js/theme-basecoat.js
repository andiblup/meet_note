(() => {
  const MODE_KEY = 'themeMode'; 
  const BRAND_KEY = 'themeBrand'; 

  const applyMode = (mode) => {
    const dark = mode === 'dark' || (
      !mode && matchMedia('(prefers-color-scheme: dark)').matches
    );
    document.documentElement.classList.toggle('dark', !!dark);
    localStorage.setItem(MODE_KEY, dark ? 'dark' : 'light');
  };

  const applyBrand = (brand) => {
    const b = brand || 'default';
    if (b === 'default') {
      document.documentElement.removeAttribute('data-brand');
    } else {
      document.documentElement.setAttribute('data-brand', b);
    }
    localStorage.setItem(BRAND_KEY, b);
  };

  // Initial herstellen
  applyMode(localStorage.getItem(MODE_KEY));
  applyBrand(localStorage.getItem(BRAND_KEY) || 'default');

  // Events
  document.addEventListener('basecoat:theme', (e) => {
    const mode = e.detail?.mode; // 'light' | 'dark' | undefined (toggle)
    if (!mode) {
      const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      applyMode(current === 'dark' ? 'light' : 'dark');
    } else {
      applyMode(mode);
    }
  });

  document.addEventListener('basecoat:brand', (e) => {
    const brand = e.detail?.brand; // 'default' | 'supabase'
    if (brand) applyBrand(brand);
  });

  // (function () {
  const selectRoot = document.getElementById('select-445592');
  const triggerText = selectRoot?.querySelector('.truncate');
  const hiddenInput = selectRoot?.querySelector('input[name="select-445592-value"]');
  const options = selectRoot?.querySelectorAll('[role="option"]');

  // gespeichertes Theme holen (default wenn nichts da)
  const saved = localStorage.getItem('themeBrand') || 'default';

  // Label im Button anpassen
  if (triggerText) triggerText.textContent = saved.charAt(0).toUpperCase() + saved.slice(1);

  // Hidden-Input aktualisieren
  if (hiddenInput) hiddenInput.value = saved;

  // aria-selected setzen
  options?.forEach(opt => {
    opt.setAttribute('aria-selected', opt.dataset.value === saved ? 'true' : 'false');
  });
  // })();
})();
