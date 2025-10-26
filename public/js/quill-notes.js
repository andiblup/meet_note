
// (() => {
//     const $ = (s, r = document) => r.querySelector(s);
//     const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

//     const toolbarEl = $('#toolbar');
//     const statusEl = $('#status');

//     if (!window.Quill) { console.error('[quill-notes] Quill not loaded'); return; }
//     const Delta = Quill.import('delta');

//     // --- Socket.IO
//     const socket = window.io ? window.io() : null;
//     if (!socket) console.warn('[quill-notes] Socket.IO client missing');

//     // --- Room (später ggf. dynamisch)
//     const ROOM_ID = (new URLSearchParams(location.search).get('room')) || 'default';

//     // --- State
//     const editors = new Map();      // noteId -> { quill, el, noteId }
//     let toolbarOwner = null;        // Quill-Instanz, die aktuell "die Toolbar" führt
//     let toolbarModule = null;       // Toolbar-Modul (einzig)
//     let suppressOwnEcho = false;    // wenn wir remote Deltas anwenden

//     // --- Toolbar an eine Instanz „umstöpseln“
//     function adoptToolbarFor(quill, range = null) {
//         if (!toolbarModule || toolbarOwner === quill) return;
//         toolbarOwner = quill;
//         toolbarModule.quill = quill;
//         // kleinen Format-Refresh triggern
//         try {
//             quill.emitter.emit(Quill.events.SELECTION_CHANGE, range, range, 'api');
//         } catch { }
//     }

//     // --- Editor erzeugen
//     function createQuillFor(el, attachToolbar = false) {
//         const opts = {
//             theme: 'snow',
//             modules: {
//                 toolbar: attachToolbar ? toolbarEl : false,
//                 history: { delay: 500, maxStack: 100, userOnly: true },
//                 clipboard: true,
//             },
//             bounds: el,
//             placeholder: 'Schreib hier …',
//         };
//         const quill = new Quill(el, opts);

//         if (attachToolbar) {
//             toolbarOwner = quill;
//             toolbarModule = quill.getModule('toolbar');
//         }
//         return quill;
//     }

//     // --- Alle vorhandenen Editor-Container initialisieren
//     function initExistingEditors() {
//         const nodes = $$('.editor[data-note-id]');
//         nodes.forEach((el, idx) => addEditor(el.getAttribute('data-note-id') || `note${idx + 1}`, el, idx === 0));
//     }

//     // --- Öffentliche API: später neue Notiz/Editor hinzufügen
//     function addEditor(noteId, containerEl = null, attachToolbar = false) {
//         if (!noteId) throw new Error('noteId required');
//         if (editors.has(noteId)) return editors.get(noteId);

//         const el = containerEl || (() => {
//             const d = document.createElement('div');
//             d.className = 'editor'; d.dataset.noteId = noteId;
//             // Du kannst hier einen Ziel-Container wählen; zur Demo ans Ende von <main>
//             const main = document.querySelector('main .grid') || document.querySelector('main');
//             const card = document.createElement('div');
//             card.className = 'card p-2 bg-white';
//             const h3 = document.createElement('h3');
//             h3.className = 'mb-2 font-medium';
//             h3.textContent = `Notiz ${noteId}`;
//             card.append(h3, d);
//             main?.appendChild(card);
//             return d;
//         })();

//         const quill = createQuillFor(el, attachToolbar);
//         editors.set(noteId, { quill, el, noteId });

//         // Fokuswechsel -> Toolbar an diese Instanz
//         quill.on('selection-change', (range, _old, source) => {
//             if (!range || source !== 'user') return;
//             adoptToolbarFor(quill, range);
//         });

//         // User-Änderungen -> Delta senden
//         quill.on('text-change', (delta, _old, source) => {
//             if (!socket || source !== 'user') return;
//             socket.emit('delta', { noteId, delta, ts: Date.now() });
//         });

//         return editors.get(noteId);
//     }

//     // --- Socket verdrahten
//     if (socket) {
//         socket.on('connect', () => {
//             socket.emit('join', ROOM_ID);
//             setStatus('Verbunden');
//         });
//         socket.on('disconnect', () => setStatus('Getrennt'));
//         socket.on('connect_error', err => setStatus(`Fehler: ${err?.message || err}`));

//         // Vollinhalte beim Beitritt
//         socket.on('init', (state) => {
//             if (!state?.notes) return;
//             for (const [noteId, fullDelta] of Object.entries(state.notes)) {
//                 if (!editors.has(noteId)) continue; // nur vorhandene Container
//                 try {
//                     suppressOwnEcho = true;
//                     editors.get(noteId).quill.setContents(new Delta(fullDelta), 'silent');
//                 } finally { suppressOwnEcho = false; }
//             }
//         });

//         // Remote-Deltas einspielen
//         socket.on('delta', ({ noteId, delta }) => {
//             const entry = editors.get(noteId);
//             if (!entry) return;
//             try {
//                 suppressOwnEcho = true;
//                 entry.quill.updateContents(new Delta(delta), 'silent');
//             } finally { suppressOwnEcho = false; }
//         });
//     }

//     // --- UX & Helpers
//     function setStatus(msg) { if (statusEl) statusEl.textContent = msg; }

//     // --- Boot
//     initExistingEditors();

//     // --- Optionale Hilfen: Export/Import Deltas (nützlich beim Debuggen)
//     window.NotesUI = {
//         addEditor,                                   // NotesUI.addEditor('noteC')
//         getDelta: (noteId) => editors.get(noteId)?.quill.getContents() || new Delta(),
//         setDelta: (noteId, delta) => {
//             const e = editors.get(noteId); if (!e) return;
//             e.quill.setContents(new Delta(delta), 'silent');
//         },
//         getText: (noteId) => editors.get(noteId)?.quill.getText() || '',
//         focus: (noteId) => editors.get(noteId)?.quill.focus(),
//         list: () => Array.from(editors.keys()),
//     };

//     //   document.dispatchEvent(new CustomEvent('quill-notes:ready', { detail: { NotesUI: window.NotesUI } }));

//     document.getElementById('main').addEventListener('dblclick', () => {
//         console.log('Doppelklick erkannt');
//         const noteId = `note${editors.size + 1}`;
//         NotesUI.addEditor(noteId, null, false);
//     });

// })();


//! ------------------------------------

// public/js/quill-notes.js
(() => {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    const notesWrap = $('#notes');            // deine Spalte
    const toolbarEl = $('#toolbar');
    const statusEl = $('#status');

    if (!window.Quill) { console.error('[notes] Quill missing'); return; }
    const Delta = Quill.import('delta');
    const socket = window.io ? window.io() : null;
    // const ROOM_ID = 'default';
    const ROOM_ID = new URL(location.href).searchParams.get('room') || 'default';


    // ---- WICHTIG: Keine Auto-Erzeugung von Cards durch Serverzustand
    const AUTO_CREATE_FROM_SERVER = false;

    // noteId -> { quill, rootEl, editorEl, ownerId }
    const editors = new Map();

    let myId = null;
    let toolbarOwner = null;
    let toolbarModule = null;

    function setStatus(t) { if (statusEl) statusEl.textContent = t; }

    function adoptToolbarFor(quill, range = null) {
        if (!toolbarModule || toolbarOwner === quill) return;
        toolbarOwner = quill;
        toolbarModule.quill = quill;
        try { quill.emitter.emit(Quill.events.SELECTION_CHANGE, range, range, 'api'); } catch { }
    }

    function createQuill(editorEl, attachToolbar = false) {
        const q = new Quill(editorEl, {
            theme: 'snow',
            modules: {
                toolbar: attachToolbar ? toolbarEl : false,
                history: { delay: 500, maxStack: 100, userOnly: true },
                clipboard: true,
            },
            bounds: editorEl,
            placeholder: 'Schreib hier …',
        });
        if (attachToolbar) {
            toolbarOwner = q;
            toolbarModule = q.getModule('toolbar');
        }
        // Fokus -> Toolbar umstecken
        q.on('selection-change', (range, _old, source) => {
            if (range && source === 'user') adoptToolbarFor(q, range);
        });
        return q;
    }

    function updateNoteAlignment(cardEl, ownerId) {
        cardEl.dataset.owner = ownerId || '';
        const isMe = !!myId && ownerId === myId;
        cardEl.classList.toggle('note--me', isMe);
        cardEl.classList.toggle('note--other', !isMe);
        if (!cardEl.classList.contains('note--me') && !cardEl.classList.contains('note--other')) {
            cardEl.classList.add('note--other');
        }
    }

    // ----- Vorhandene (statische) Noten instantiieren (aus dem HTML)
    (function initExistingEditors() {
        const cards = $$('.note[data-note-id]');
        cards.forEach((card, idx) => {
            const noteId = card.dataset.noteId;
            const ownerId = card.dataset.owner || null;
            const editorEl = $('.editor', card);
            const attachToolbar = idx === 0; // nur erste Instanz bekommt Toolbar
            const q = createQuill(editorEl, attachToolbar);
            updateNoteAlignment(card, ownerId);
            // User-Änderungen senden
            q.on('text-change', (delta, _old, source) => {
                if (source !== 'user' || !socket) return;
                socket.emit('delta', { noteId, delta, ts: Date.now() });
            });
            editors.set(noteId, { quill: q, rootEl: card, editorEl, ownerId });
        });
    })();

    // ----- Öffentliche API: kontrolliert neue Note hinzufügen
    function addNote(noteId, title = null, ownerId = myId) {
        if (!noteId) throw new Error('noteId required');
        if (editors.has(noteId)) return editors.get(noteId);

        // Card bauen
        const card = document.createElement('div');
        card.className = 'note';
        card.dataset.noteId = noteId;
        card.dataset.owner = ownerId || '';

        updateNoteAlignment(card, ownerId);

        const cardInner = document.createElement('div');
        cardInner.className = 'card p-2';

        const h3 = document.createElement('h3');
        h3.className = 'mb-2 font-medium';
        h3.textContent = title ?? `Notiz ${noteId}`;

        const editor = document.createElement('div');
        editor.className = 'editor';

        cardInner.append(h3, editor);
        card.append(cardInner);
        notesWrap.appendChild(card);

        // Quill dran (Toolbar bleibt bei der bisher aktiven Instanz; Fokus steckt sie um)
        const q = createQuill(editor, editors.size === 0 /* falls erste Note */);

        q.on('text-change', (delta, _old, source) => {
            if (source !== 'user' || !socket) return;
            socket.emit('delta', { noteId, delta, ts: Date.now() });
        });

        const entry = { quill: q, rootEl: card, editorEl: editor, ownerId };
        editors.set(noteId, entry);
        // direkt fokussieren
        setTimeout(() => q.focus(), 0);
        return entry;
    }

    // ----- Socket verdrahten
    if (socket) {
        socket.on('connect', () => { socket.emit('join', ROOM_ID); setStatus('Verbunden'); });
        socket.on('disconnect', () => setStatus('Getrennt'));

        // socket.on('whoami', ({ userId }) => {
        //   myId = userId;
        //   editors.forEach(e => updateNoteAlignment(e.rootEl, e.ownerId));
        // });
        socket.on('whoami', ({ userId }) => {
            myId = userId;
            editors.forEach(e => {
                if (!e.ownerId) e.ownerId = myId;      // ← fehlende Owner mir geben
                updateNoteAlignment(e.rootEl, e.ownerId);
            });
        });

        // Initialzustand vom Server – wir füllen NUR vorhandene Noten
        socket.on('init', (state) => {
            const notes = state?.notes || {};
            const owners = state?.meta?.owners || {};
            Object.entries(notes).forEach(([noteId, full]) => {
                const entry = editors.get(noteId);
                if (entry) {
                    entry.ownerId = entry.ownerId || owners[noteId] || entry.ownerId || null;
                    updateNoteAlignment(entry.rootEl, entry.ownerId);
                    try { entry.quill.setContents(new Delta(full), 'silent'); } catch { }
                } else if (AUTO_CREATE_FROM_SERVER) {
                    // optionales Verhalten (default: AUS)
                    const e = addNote(noteId, `Notiz ${noteId}`, owners[noteId] || null);
                    try { e.quill.setContents(new Delta(full), 'silent'); } catch { }
                } else {
                    // ignorieren, aber debuggen
                    // console.debug('[notes] skipped server note (no local card):', noteId);
                }
            });
        });

        // Eingehende Änderungen – ebenfalls NUR anwenden, wenn die Note existiert
        socket.on('delta', ({ noteId, delta, author }) => {
            const entry = editors.get(noteId);
            if (!entry) {
                // kein Auto-Erzeugen — sauber ignorieren
                // console.debug('[notes] incoming delta for unknown noteId, ignored:', noteId);
                return;
            }
            entry.ownerId = entry.ownerId || author || null;
            updateNoteAlignment(entry.rootEl, entry.ownerId);
            try { entry.quill.updateContents(new Delta(delta), 'silent'); } catch { }
        });
    }

    // ----- Exporte
    window.NotesUI = {
        addNote,                                // NotesUI.addNote('noteC', 'Projekt X')
        getDelta: (id) => editors.get(id)?.quill.getContents() || new Delta(),
        setDelta: (id, d) => {
            const e = editors.get(id); if (!e) return;
            e.quill.setContents(new Delta(d), 'silent');
        },
        getText: (id) => editors.get(id)?.quill.getText() || '',
        list: () => Array.from(editors.keys()),
        focus: (id) => editors.get(id)?.quill.focus(),
    };
})();
