
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

    // const AUTO_CREATE_FROM_SERVER = false;
    const AUTO_CREATE_FROM_SERVER = true;

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

    // Hilfsfunktion zum Leeren
    function resetAllNotes() {
        // alle DOM-Karten entfernen
        const wrap = document.getElementById('notes');
        if (wrap) wrap.innerHTML = '';
        editors.clear();
        // Toolbar-Eigentümer zurücksetzen (falls du das aus der älteren Version hast)
        toolbarOwner = null;
        toolbarModule = null;
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
        // socket.on('init', (state) => {
        //     const notes = state?.notes || {};
        //     const owners = state?.meta?.owners || {};
        //     Object.entries(notes).forEach(([noteId, full]) => {
        //         const entry = editors.get(noteId);
        //         if (entry) {
        //             entry.ownerId = entry.ownerId || owners[noteId] || entry.ownerId || null;
        //             updateNoteAlignment(entry.rootEl, entry.ownerId);
        //             try { entry.quill.setContents(new Delta(full), 'silent'); } catch { }
        //         } else if (AUTO_CREATE_FROM_SERVER) {
        //             // optionales Verhalten (default: AUS)
        //             const e = addNote(noteId, `Notiz ${noteId}`, owners[noteId] || null);
        //             try { e.quill.setContents(new Delta(full), 'silent'); } catch { }
        //         } else {
        //             // ignorieren, aber debuggen
        //             // console.debug('[notes] skipped server note (no local card):', noteId);
        //         }
        //     });
        // });

        //! ///////////////////////////////////

        // socket.on('init', (state) => {
        //     const notes = state?.notes || {};
        //     const owners = state?.meta?.owners || {};
        //     Object.entries(notes).forEach(([noteId, full]) => {
        //         let entry = editors.get(noteId);
        //         if (!entry && AUTO_CREATE_FROM_SERVER) {
        //             entry = addNote(noteId, `Notiz ${noteId}`, owners[noteId] || null);
        //         }
        //         if (entry) {
        //             entry.ownerId = entry.ownerId || owners[noteId] || entry.ownerId || null;
        //             updateNoteAlignment(entry.rootEl, entry.ownerId);
        //             try { entry.quill.setContents(new Delta(full), 'silent'); } catch { }
        //         }
        //     });
        // });

        //! ///////////////////////////////////
        socket.on('init', (state) => {
            // Beim Raumwechsel: alles flushen
            resetAllNotes();

            const notes = state?.notes || {};
            const owners = state?.meta?.owners || {};

            Object.entries(notes).forEach(([noteId, full]) => {
                let entry = editors.get(noteId);
                if (!entry && AUTO_CREATE_FROM_SERVER) {
                    entry = addNote(noteId, `Notiz ${noteId}`, owners[noteId] || null);
                }
                if (entry) {
                    entry.ownerId = entry.ownerId || owners[noteId] || null;
                    updateNoteAlignment(entry.rootEl, entry.ownerId);
                    try { entry.quill.setContents(new Delta(full), 'silent'); } catch { }
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

    function destroyAllEditors() {
        editors.forEach(e => {
            try { e.quill.off('text-change'); } catch { }
            try { e.rootEl.remove(); } catch { }
        });
        editors.clear();
    }

    // Komplett zurücksetzen und Notizen eines Room-States laden
    function resetAndLoad(state) {
        // state: { roomId, notes, meta:{owners:{}}, updatedAt }
        const notes = state?.notes || {};
        const owners = state?.meta?.owners || {};

        destroyAllEditors();

        // Reihenfolge stabil: IDs sortieren
        const ids = Object.keys(notes).sort((a, b) => a.localeCompare(b));
        if (ids.length === 0) {
            // Falls leer: eine frische Notiz für mich anlegen
            const nid = 'note-' + Date.now().toString(36).slice(-6);
            const e = addNote(nid, `Notiz ${nid}`, myId);
            return;
        }

        ids.forEach((noteId, idx) => {
            const e = addNote(noteId, `Notiz ${noteId}`, owners[noteId] || null);
            try { e.quill.setContents(new Delta(notes[noteId]), 'silent'); } catch { }
            // Fokus auf die erste Note
            if (idx === 0) setTimeout(() => e.quill.focus(), 0);
        });
    }

    // optional nützlich, falls du manuell leeren willst
    function clearAll() { destroyAllEditors(); }

    

    // ----- Exporte
    window.NotesUI = {
        ...window.NotesUI,
        resetAndLoad,
        clearAll,
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
