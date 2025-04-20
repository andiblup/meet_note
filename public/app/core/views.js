// const viewRoutes = {
//   '#role': 'role',
//   '#editor': 'editor',
//   '#settings': 'settings'
// };

// export async function loadViewByHash(hash) {
//   const viewName = viewRoutes[hash] || 'role'; // Fallback zu role
//   console.log('📥 Lade View:', viewName);
//   await loadView(viewName);
// }

// // export async function loadView(viewName) {
// //   const mainContent = document.getElementById('mainContent');

// //   if (!mainContent) {
// //     console.error('❌ Kein mainContent gefunden!');
// //     return;
// //   }

// //   try {
// //     const res = await fetch(`/views/${viewName}/${viewName}.html`);
// //     if (!res.ok) throw new Error(`HTTP Fehler: ${res.status}`);
// //     const html = await res.text();
// //     mainContent.innerHTML = html;

// //     console.log(`✅ View HTML geladen: ${viewName}`);

// //     // **NEU: Skript erst NACH dem Einfügen importieren!**
// //     await new Promise((resolve) => setTimeout(resolve, 50)); // mini delay

// //     const script = document.createElement('script');
// //     script.type = 'module';
// //     script.src = `/views/${viewName}/${viewName}.js`;
// //     document.body.appendChild(script);

// //     console.log(`✅ View JS geladen: ${viewName}`);

// //   } catch (error) {
// //     console.error('❌ Fehler beim Laden der View:', error);
// //     mainContent.innerHTML = `<div class="text-center p-8 text-red-500">Fehler beim Laden der Seite: ${error.message}</div>`;
// //   }
// // }

// // /public/app/core/views.js

// export async function loadView(viewName) {
//   const mainContent = document.getElementById('mainContent');

//   try {
//     const res = await fetch(`/views/${viewName}/${viewName}.html`);
//     if (!res.ok) throw new Error(`HTTP Fehler: ${res.status}`);
    
//     const html = await res.text();
//     mainContent.innerHTML = html;

//     // 🚀 Jetzt wichtig: Script neu laden!
//     const existingScript = document.getElementById('dynamicViewScript');
//     if (existingScript) existingScript.remove(); // altes Script löschen

//     const script = document.createElement('script');
//     script.id = 'dynamicViewScript';
//     script.type = 'module';
//     script.src = `/views/${viewName}/${viewName}.js`;
//     document.body.appendChild(script);

//     console.log(`✅ View und JS geladen: ${viewName}`);
    
//   } catch (error) {
//     console.error('❌ Fehler beim Laden der View:', error);
//     mainContent.innerHTML = `<div class="p-8 text-center text-red-500">Fehler beim Laden der Seite.</div>`;
//   }
// }


// /public/app/core/views.js

const viewRoutes = {
  '#role': 'role',
  '#editor': 'editor',
  '#settings': 'settings'
};

export async function loadViewByHash(rawHash) {
  const hash = rawHash || window.location.hash || '#role';
  const viewName = viewRoutes[hash] || 'role';
  console.log('📥 Lade View:', viewName);
  await loadView(viewName);
}

export async function loadView(viewName) {
  const mainContent = document.getElementById('mainContent');

  if (!mainContent) {
    console.error('❌ Kein mainContent gefunden!');
    return;
  }

  try {
    const res = await fetch(`/views/${viewName}/${viewName}.html`);
    if (!res.ok) throw new Error(`HTTP Fehler: ${res.status}`);
    const html = await res.text();
    mainContent.innerHTML = html;

    console.log(`✅ View HTML geladen: ${viewName}`);

    // 🚀 Modul richtig NEU importieren:
    await import(`/views/${viewName}/${viewName}.js?ts=${Date.now()}`);

    console.log(`✅ View JS neu importiert: ${viewName}`);

  } catch (error) {
    console.error('❌ Fehler beim Laden der View:', error);
    mainContent.innerHTML = `<div class="text-center p-8 text-red-500">Fehler beim Laden der Seite: ${error.message}</div>`;
  }
}
