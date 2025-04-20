
# 📚 Funktionen-Dokumentation – Meet_Note

---

## 📖 Projektbeschreibung

**Meet_Note** ist eine moderne, moderne, sichere Netzwerk-Notizapplikation.  
Ein Nutzer kann eine Sitzung hosten, andere Teilnehmer (Clients) können im selben Netzwerk schnell beitreten.  
Die App läuft lokal über IP/Port oder Domain und funktioniert auch als PWA oder Electron-Desktop-App.

**Strukturübersicht:**
- `/public/` – Frontend: Editor, Toolbar, Speicherung, Settings
- `/server/` – Backend: Express-Server, WebSocket-Kommunikation
- `/electron/` – Desktop-Version: Electron App Wrapper

**Technologien:**
- Node.js, Express, Socket.IO
- TailwindCSS, DaisyUI, PrismJS
- Electron
- PWA Support
- SQLite3 (später möglich)

---

# 📂 Funktionen-Übersicht

## 📁 public/app.js

### chooseMode(mode)
- **Beschreibung:** Wählt die Benutzerrolle ("host" oder "client") und navigiert zur entsprechenden Seite.
- **Parameter:** `mode` (String): 'host' oder 'client'
- **Rückgabe:** Keine
- **Beispiel:** `chooseMode('host')`

## 📁 public/editor/editor.js

### initEditor()
- **Beschreibung:** Initialisiert den Editor und stellt die Verbindung zum Server her.
- **Parameter:** Keine
- **Rückgabe:** Keine

### applyFormat(command, value)
- **Beschreibung:** Wendet ein Textformat auf den ausgewählten Inhalt an.
- **Parameter:** `command` (String), `value` (String, optional)
- **Rückgabe:** Keine

### insertCodeBlock(language)
- **Beschreibung:** Fügt einen formatierten Codeblock in den Editor ein.
- **Parameter:** `language` (String): Programmiersprache
- **Rückgabe:** Keine

### applyTheme(theme)
- **Beschreibung:** Wendet das gewählte Theme auf den Editor an (dark/light).
- **Parameter:** `theme` (String): 'dark' oder 'light'
- **Rückgabe:** Keine

## 📁 public/editor/toolbar.js

### createToolbar(role)
- **Beschreibung:** Erzeugt die Toolbar dynamisch je nach Benutzerrolle (Host/Client).
- **Parameter:** `role` (String): Benutzerrolle
- **Rückgabe:** Keine

### createButton(icon, onClick)
- **Beschreibung:** Erzeugt einen Button mit einem Icon und Click-Handler.
- **Parameter:** `icon` (String), `onClick` (Funktion)
- **Rückgabe:** Button Element

## 📁 public/editor/storage.js

### saveContent()
- **Beschreibung:** Speichert den aktuellen Editor-Inhalt an den Server.
- **Parameter:** Keine
- **Rückgabe:** Keine

### loadContent()
- **Beschreibung:** Lädt gespeicherten Editor-Inhalt vom Server.
- **Parameter:** Keine
- **Rückgabe:** Keine

### endSession()
- **Beschreibung:** Host beendet die aktuelle Sitzung.
- **Parameter:** Keine
- **Rückgabe:** Keine

### leaveSession()
- **Beschreibung:** Client verlässt die aktuelle Sitzung.
- **Parameter:** Keine
- **Rückgabe:** Keine

## 📁 public/editor/utils.js

### getRole()
- **Beschreibung:** Gibt die aktuell gespeicherte Rolle zurück.
- **Parameter:** Keine
- **Rückgabe:** `String` ('host' oder 'client')

### createElementWithClass(tag, className)
- **Beschreibung:** Erstellt ein HTML-Element mit einer bestimmten Klasse.
- **Parameter:** `tag` (String), `className` (String)
- **Rückgabe:** HTML-Element

## 📁 server/server.js

### Express Endpoints
- `/files`: Listet alle verfügbaren Notizdateien auf.
- `/file/:id`: Lädt eine spezifische Notizdatei.
- `/save`: Speichert eine Notizdatei.
- `/rename`: Benennt eine Notizdatei um.
- `/delete`: Löscht eine Notizdatei.

### Socket.IO Events
- `editor-update`: Empfängt Editor-Änderungen und broadcastet sie an Clients.

### getIPAddress()
- **Beschreibung:** Findet und gibt die lokale IP-Adresse des Hosts zurück.
- **Parameter:** Keine
- **Rückgabe:** Lokale IP-Adresse (String)

## 📁 electron/main.js

### Electron Initialisierung
- **Beschreibung:** Erstellt das Hauptfenster der Electron App und lädt das Frontend.
- **Details:** Verwaltet das Verhalten bei App-Events wie 'ready', 'window-all-closed', 'activate'.

---

# 📈 Code Flow Diagramm (Kurzfassung)

```plaintext
[Start]
 ↓
[User wählt Host oder Client]
 ↓
[Host startet Session]         [Client joint Session]
 ↓                                   ↓
[Editor-Interface erzeugen]      [Editor-Interface erzeugen]
 ↓                                   ↓
[Socket.IO-Verbindung aufbauen]
 ↓
[Änderungen in Echtzeit synchronisieren]
 ↓
[Dateien werden beim Host gespeichert]
```
