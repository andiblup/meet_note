// // public/js/quill-notes.js
// (() => {
//     const $ = (s, r = document) => r.querySelector(s);
//     const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

//     // ---- Grund-Refs
//     const toolbarEl = $('#toolbar');
//     const statusEl = $('#status');

//     if (!window.Quill) {
//         console.error('[quill-notes] Quill not loaded.');
//         return;
//     }
//     const Delta = Quill.import('delta');

//     // ---- Socket.IO
//     const socket = window.io ? window.io() : null;
//     if (!socket) {
//         console.warn('[quill-notes] Socket.IO client not found.');
//     }

//     // ---- Room (einfach „default“ – kann später dynamisch werden)
//     const ROOM_ID = (new URLSearchParams(location.search).get('room')) || 'default';

//     // ---- Editor-Instanzen erzeugen
//     const editors = new Map(); // noteId -> { quill, el }
//     const editorEls = $$('.editor[data-note-id]');
//     if (!editorEls.length) {
//         console.warn('[quill-notes] Keine .editor[data-note-id] gefunden.');
//     }

//     // Wir erstellen GENAU EIN Toolbar-Modul auf dem ersten Editor
//     // und "stecken" es beim Fokus auf andere Editoren um.
//     let toolbarOwner = null;
//     let toolbarModule = null;

//     function makeQuill(el, withToolbar) {
//         const opts = {
//             theme: 'snow',
//             modules: {
//                 // Toolbar nur beim ersten Editor direkt binden
//                 toolbar: withToolbar ? toolbarEl : false,
//                 history: {
//                     delay: 500,
//                     maxStack: 100,
//                     userOnly: true
//                 },
//                 clipboard: true
//             },
//             bounds: el,
//             placeholder: 'Schreib hier …',
//         };
//         const q = new Quill(el, opts);

//         // Erstes Mal: Toolbar-Modul merken
//         if (withToolbar) {
//             toolbarOwner = q;
//             toolbarModule = q.getModule('toolbar');
//         }

//         return q;
//     }

//     // Alle Editor-DIVs instantiieren
//     editorEls.forEach((el, idx) => {
//         const noteId = el.getAttribute('data-note-id') || `note${idx + 1}`;
//         const useToolbar = idx === 0; // Toolbar nur an den ersten hängen
//         const quill = makeQuill(el, useToolbar);

//         editors.set(noteId, { quill, el, noteId });

//         // Selektion -> Toolbar dem aktiven Editor geben
//         quill.on('selection-change', (range, _old, source) => {
//             if (source !== 'user') return;            // nur echte User-Fokuswechsel
//             if (!range) return;                       // Blur
//             if (toolbarModule && toolbarOwner !== quill) {
//                 // "Besitzer" der Toolbar tauschen:
//                 toolbarOwner = quill;
//                 // Quill speichert Referenz in Module-Instanz; wir tauschen sie aus:
//                 toolbarModule.quill = quill;
//                 // kleinen Refresh triggern (Format-Buttons aktualisieren)
//                 // durch ein künstliches selection-change Ereignis:
//                 try {
//                     quill.emitter.emit(Quill.events.SELECTION_CHANGE, range, range, 'api');
//                 } catch { }
//             }
//         });

//         // Text-Änderungen an den Server als Delta schicken
//         quill.on('text-change', (delta, _old, source) => {
//             if (source !== 'user' || !socket) return;
//             socket.emit('delta', { noteId, delta, ts: Date.now() });
//         });
//     });

//     // ---- Socket verdrahten
//     if (socket) {
//         socket.on('connect', () => {
//             socket.emit('join', ROOM_ID);
//             setStatus('Verbunden');
//         });
//         socket.on('disconnect', () => setStatus('Getrennt'));
//         socket.on('connect_error', err => setStatus('Fehler: ' + (err?.message || err)));

//         // Initialzustand für den Room (alle Notizen mit fullDelta)
//         socket.on('init', (state) => {
//             if (!state || !state.notes) return;
//             for (const [noteId, fullDelta] of Object.entries(state.notes)) {
//                 const entry = editors.get(noteId);
//                 if (!entry) continue; // falls es in der UI (noch) keinen Container gibt
//                 try {
//                     entry.quill.setContents(new Delta(fullDelta), 'silent');
//                 } catch (e) {
//                     console.warn('[quill-notes] setContents failed for', noteId, e);
//                     // Fallback: leeren
//                     entry.quill.setContents(new Delta(), 'silent');
//                 }
//             }
//         });

//         // Deltas von anderen Clients anwenden
//         socket.on('delta', ({ noteId, delta }) => {
//             const entry = editors.get(noteId);
//             if (!entry) return;
//             try {
//                 entry.quill.updateContents(new Delta(delta), 'silent');
//             } catch (e) {
//                 console.warn('[quill-notes] updateContents failed for', noteId, e);
//             }
//         });
//     }

//     // ---- Helper
//     function setStatus(msg) {
//         if (statusEl) statusEl.textContent = msg;
//     }

//     // ---- UX: Klick in Editor wechselt Toolbar zur Instanz (falls ohne Cursor)
//     editorEls.forEach(el => {
//         el.addEventListener('mousedown', () => {
//             // beim Klick fokussiert Quill, selection-change-Handler übernimmt den Rest
//         });
//     });

//     // ---- Dark-Mode Kompatibilität (Option): Quill Themes reagieren eher auf CSS-Variablen.
//     // Wenn du die Snow-Farben im Dark-Mode anpassen willst, style in CSS mit :root/.dark Variablen.

// })();

// public/js/quill-notes.js
(() => {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    const toolbarEl = $('#toolbar');
    const statusEl = $('#status');

    if (!window.Quill) { console.error('[quill-notes] Quill not loaded'); return; }
    const Delta = Quill.import('delta');

    // --- Socket.IO
    const socket = window.io ? window.io() : null;
    if (!socket) console.warn('[quill-notes] Socket.IO client missing');

    // --- Room (später ggf. dynamisch)
    const ROOM_ID = (new URLSearchParams(location.search).get('room')) || 'default';

    // --- State
    const editors = new Map();      // noteId -> { quill, el, noteId }
    let toolbarOwner = null;        // Quill-Instanz, die aktuell "die Toolbar" führt
    let toolbarModule = null;       // Toolbar-Modul (einzig)
    let suppressOwnEcho = false;    // wenn wir remote Deltas anwenden

    // --- Toolbar an eine Instanz „umstöpseln“
    function adoptToolbarFor(quill, range = null) {
        if (!toolbarModule || toolbarOwner === quill) return;
        toolbarOwner = quill;
        toolbarModule.quill = quill;
        // kleinen Format-Refresh triggern
        try {
            quill.emitter.emit(Quill.events.SELECTION_CHANGE, range, range, 'api');
        } catch { }
    }

    // --- Editor erzeugen
    function createQuillFor(el, attachToolbar = false) {
        const opts = {
            theme: 'snow',
            modules: {
                toolbar: attachToolbar ? toolbarEl : false,
                history: { delay: 500, maxStack: 100, userOnly: true },
                clipboard: true,
            },
            bounds: el,
            placeholder: 'Schreib hier …',
        };
        const quill = new Quill(el, opts);

        if (attachToolbar) {
            toolbarOwner = quill;
            toolbarModule = quill.getModule('toolbar');
        }
        return quill;
    }

    // --- Alle vorhandenen Editor-Container initialisieren
    function initExistingEditors() {
        const nodes = $$('.editor[data-note-id]');
        nodes.forEach((el, idx) => addEditor(el.getAttribute('data-note-id') || `note${idx + 1}`, el, idx === 0));
    }

    // --- Öffentliche API: später neue Notiz/Editor hinzufügen
    function addEditor(noteId, containerEl = null, attachToolbar = false) {
        if (!noteId) throw new Error('noteId required');
        if (editors.has(noteId)) return editors.get(noteId);

        const el = containerEl || (() => {
            const d = document.createElement('div');
            d.className = 'editor'; d.dataset.noteId = noteId;
            // Du kannst hier einen Ziel-Container wählen; zur Demo ans Ende von <main>
            const main = document.querySelector('main .grid') || document.querySelector('main');
            const card = document.createElement('div');
            card.className = 'card p-2 bg-white';
            const h3 = document.createElement('h3');
            h3.className = 'mb-2 font-medium';
            h3.textContent = `Notiz ${noteId}`;
            card.append(h3, d);
            main?.appendChild(card);
            return d;
        })();

        const quill = createQuillFor(el, attachToolbar);
        editors.set(noteId, { quill, el, noteId });

        // Fokuswechsel -> Toolbar an diese Instanz
        quill.on('selection-change', (range, _old, source) => {
            if (!range || source !== 'user') return;
            adoptToolbarFor(quill, range);
        });

        // User-Änderungen -> Delta senden
        quill.on('text-change', (delta, _old, source) => {
            if (!socket || source !== 'user') return;
            socket.emit('delta', { noteId, delta, ts: Date.now() });
        });

        return editors.get(noteId);
    }

    // --- Socket verdrahten
    if (socket) {
        socket.on('connect', () => {
            socket.emit('join', ROOM_ID);
            setStatus('Verbunden');
        });
        socket.on('disconnect', () => setStatus('Getrennt'));
        socket.on('connect_error', err => setStatus(`Fehler: ${err?.message || err}`));

        // Vollinhalte beim Beitritt
        socket.on('init', (state) => {
            if (!state?.notes) return;
            for (const [noteId, fullDelta] of Object.entries(state.notes)) {
                if (!editors.has(noteId)) continue; // nur vorhandene Container
                try {
                    suppressOwnEcho = true;
                    editors.get(noteId).quill.setContents(new Delta(fullDelta), 'silent');
                } finally { suppressOwnEcho = false; }
            }
        });

        // Remote-Deltas einspielen
        socket.on('delta', ({ noteId, delta }) => {
            const entry = editors.get(noteId);
            if (!entry) return;
            try {
                suppressOwnEcho = true;
                entry.quill.updateContents(new Delta(delta), 'silent');
            } finally { suppressOwnEcho = false; }
        });
    }

    // --- UX & Helpers
    function setStatus(msg) { if (statusEl) statusEl.textContent = msg; }

    // --- Boot
    initExistingEditors();

    // --- Optionale Hilfen: Export/Import Deltas (nützlich beim Debuggen)
    window.NotesUI = {
        addEditor,                                   // NotesUI.addEditor('noteC')
        getDelta: (noteId) => editors.get(noteId)?.quill.getContents() || new Delta(),
        setDelta: (noteId, delta) => {
            const e = editors.get(noteId); if (!e) return;
            e.quill.setContents(new Delta(delta), 'silent');
        },
        getText: (noteId) => editors.get(noteId)?.quill.getText() || '',
        focus: (noteId) => editors.get(noteId)?.quill.focus(),
        list: () => Array.from(editors.keys()),
    };

    //   document.dispatchEvent(new CustomEvent('quill-notes:ready', { detail: { NotesUI: window.NotesUI } }));

    document.getElementById('main').addEventListener('dblclick', () => {
        console.log('Doppelklick erkannt');
        const noteId = `note${editors.size + 1}`;
        NotesUI.addEditor(noteId, null, false);
    });

})();
