# Meet_Note 📝

Eine moderne, sichere, modulare Netzwerk-Notiz-App für Meetings, Projekte und Teams.

---

## 🎯 Projektziel

- Ein Nutzer hostet, alle anderen können über Browser, Electron oder PWA beitreten
- Zugriff über lokale IP oder lokalen DNS
- Offline-First: Auch ohne Internet nutzbar
- Maximale Nutzerfreundlichkeit und Geschwindigkeit
- Fokus auf Datenschutz und DSGVO-Konformität
- Schnelle Erweiterbarkeit (Modularer Aufbau)

---

## 🛠️ Techstack Übersicht

| Bereich                | Technologie                             | Grund |
|:------------------------|:----------------------------------------|:------|
| Server                  | Node.js + Express                      | Schnell und leicht |
| Realtime-Kommunikation  | Socket.IO                              | Live-Synchronisation |
| Frontend                | HTML5 + TailwindCSS + DaisyUI           | Modern und responsiv |
| Editor                  | Eigenbau-Editor + Prism.js             | Text-/Codebearbeitung |
| Syntax Highlighting     | Prism.js                               | Dark/Light Themes, viele Sprachen |
| Desktop-App             | ElectronJS                             | Windows, macOS, Linux |
| Mobile-App              | PWA (CapacitorJS optional)             | Mobile Installation |
| Datenhaltung            | JSON-Dateien oder SQLite               | Lokal und DSGVO-konform |
| Sicherheit              | HTTPS, bcrypt, SHA-256 Hashing         | Schutz sensibler Daten |
| Export                  | pdf-lib (später onenote, md Export)    | Sicherung von Notizen |
| Lokaler DNS optional    | Avahi/mDNS                              | Einfache Verbindung |

---

## 📦 Lokale Voraussetzungen

- Node.js (aktuelle LTS Version)
- npm
- Git
- VSCode oder anderer Editor
- (Optional für Mobile Builds: Android Studio, Xcode)

---

## ✨ Hauptfunktionen

| Feature Bereich         | Beschreibung |
|:-------------------------|:-------------|
| 🌍 Netzwerkzugriff         | Zugriff über lokale URL/IP |
| 🔒 Passwortschutz         | Zugriff nur mit Token oder Passwort |
| 🧩 Modularer Editor       | Textbearbeitung + Codebearbeitung |
| 📂 Datei-Management       | Zugriff auf freigegebene Dateien |
| 📥 Download-Funktion      | Einzeln oder gesammelt |
| 🧾 PDF-Export             | Lokale Sicherung |
| 🔔 Push-Notifications     | Aufgaben/Notizen Erinnerungen |
| 🎨 Dark/Light Mode         | Theme umschaltbar |
| 🔍 Suche & Filter         | Schnellere Navigation |
| 🛡️ Verschlüsselte Kommunikation | HTTPS & lokale Hashing |
| 📶 Offline-First (PWA)    | Nutzung auch ohne Netz |
| 📚 Dokumentation         | Vollständige Entwickler- und Nutzer-Doku |

---

## 🛠 Entwicklungsplan (aktualisiert)

### Phase 1: Basis

- [x] Server/Client Infrastruktur
- [x] Live-Server Portprüfung
- [x] Host/Join Auswahlseite
- [x] Electron App
- [x] Host / Client / Electron Client System
- [x] 'Offline' bereitstellung Tailwind & Daisy ind Web und Electron

### Phase 2: Editor-Funktionalität

- [ ] File Explorer & Dokumentbasierte Speicherung
- [ ] Responsive/Fluid Design
- [ ] Basis Editor (Bold, Italic, etc.)
- [ ] Code-Block + Prism.js Syntax Highlighting
- [x] Theme Switching Light/Dark
- [~] Settings System
- [ ] Persistente Einstellungen
- [ ] Live-Autosave
- [ ] Feedback dass ein User gerade diese Notiz bearbeitet
- [ ] UI/UX Verbesserungen, Accessability und Text Bearbeitung

### Phase 3: Sicherheit & Rollen

- [ ] Passwortgeschützter Zugang
- [ ] Benutzer-/Dateiverwaltung
- [ ] Verschlüsselte Übertragung (WSS/HTTPS)

### Phase 4: Export/Backup

- [ ] PDF-Export
- [ ] Backup/Restore einzelner oder aller Dateien

### Phase 5: App Deploy

- [ ] Windows
- [ ] MAC
- [ ] Linux
- [ ] Release
- [ ] Downloadbereitstellung und evtl. Store Veröffentlichung

### Phase 6: Mobile/PWA

- [ ] PWA Manifest, Offline-Mode
- [ ] (Optional) CapacitorJS Wrapper Builds

### Phase Agil: UI/UX

- [ ] Icon System
- [ ] UI/UX Verbesserungen :arrow_right: Frontend/Design Finalisierung

### Phase Experimentell: Nice to haves

- [ ] Webserver Deployment (Relay Server, CDN, Client selber host Möglichkeit), verbindung über Webserver(Node) URL, ohne Electron node node server.js
- [ ] SQLite3 statt dokumentenbasiertes Speichern



altes build css 
```json
"build:css": "postcss public/styles/styles.css -o public/styles/output.css --env production"
```
neues
```json
"build:css": "postcss public/styles/styles.css -o public/styles/output.css --env production"
```