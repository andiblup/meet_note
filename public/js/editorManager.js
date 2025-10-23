export class EditorManager {
  constructor({ toolbarSelector, editorSelector, socket, onInit }) {
    this.socket = socket;
    this.toolbarEl = document.querySelector(toolbarSelector);
    this.editors = new Map(); // noteId -> { quill, suppress }
    this.activeNoteId = null;
    this.onInit = onInit;

    this._initEditors(editorSelector);
    this._wireSocket();
  }

  _initEditors(selector) {
    const nodes = document.querySelectorAll(selector);
    nodes.forEach((node, i) => {
      const noteId = node.dataset.noteId || `note-${i}`;
      const quill = new Quill(node, {
        theme: 'snow',
        modules: {
          toolbar: this.toolbarEl,   // <-- gemeinsame Toolbar
          clipboard: true,
          history: { delay: 400, maxStack: 200, userOnly: true }
        },
        placeholder: 'Schreibe…',
      });

      const state = { quill, suppress: false };
      this.editors.set(noteId, state);

      // Focus-Handling — aktive Note bestimmt, worauf die Toolbar wirkt
      quill.root.addEventListener('focus', () => { this.activeNoteId = noteId; });
      if (i === 0) this.activeNoteId = noteId;

      // Deltas vom User an Server schicken
      quill.on('text-change', (delta, _old, source) => {
        if (source !== 'user' || state.suppress) return;
        this.socket.sendDelta(noteId, delta);
      });
    });
  }

  _wireSocket() {
    this.socket.onInit((serverState) => {
      // serverState: { notes: { [noteId]: fullDelta }, updatedAt }
      if (serverState?.notes) {
        Object.entries(serverState.notes).forEach(([noteId, fullDelta]) => {
          const st = this.editors.get(noteId);
          if (st && fullDelta) {
            st.suppress = true;
            st.quill.setContents(fullDelta);
            st.suppress = false;
          }
        });
      }
      this.onInit?.(serverState);
    });

    this.socket.onDelta(({ noteId, delta }) => {
      const st = this.editors.get(noteId);
      if (!st || !delta) return;
      st.suppress = true;
      st.quill.updateContents(delta);
      st.suppress = false;
    });
  }

  joinRoom(roomId) {
    // beim Raumwechsel: einfach init vom Server abwarten
    // (Server schickt kompletten Stand aller Notizen im Room)
  }
}
