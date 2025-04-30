
# Meet Note 📝

*A modern, secure and modular network note-taking app for meetings, projects and distributed teams.*

---

> **Important Notice & Disclaimer**  
> This project is released under the permissive **MIT License**—use, study, modify and redistribute it without restriction, but **without any warranty or liability** on the author’s side.  

---

## 🤲 Openness & Future Contribution

* A formal **contributing guide** is not yet in place; it will be added in a future milestone.  
* Feel free to fork, improve and experiment. If you build useful enhancements, please consider opening a pull-request so the whole community can benefit.  
* The author is committed to fostering an open and vibrant ecosystem around Meet Note and welcomes all forms of collaboration.

---

## 💸 Pricing & Editions (Pre-Release)

All prices and edition names mentioned in this repository are **early-stage ideas** and **may change** before any official launch.  
Premium editions are *not* scheduled for the near future; there is a possibility that **every feature will remain fully open-source** with an optional donation model instead.

---

## 📣 Stay in Touch

Questions, ideas or feedback? Drop me a line at **alfred.narjes@gmail.com** — I’m happy to hear from you!

---

## 🚀 Vision

* **Host once – join from anywhere** (browser, desktop or PWA)  
* **Works offline-first** on local IP or mDNS address  
* **Blazing-fast & user-centric:** zero-clicks from idea to note  
* **Privacy-first & GDPR-compliant:** data never leaves your network  
* **Modular & extensible:** plug-in friendly architecture  

---

## 🏗️ Tech Stack

| Layer | Choice | Why |
| :- | :- | :- |
| **Server** | Node.js · Express · CORS | lightweight & familiar |
| **Realtime** | Socket.IO | bi-directional live-sync |
| **Frontend** | HTML5 · TailwindCSS · DaisyUI | modern utility CSS |
| **Editor** | Custom WYSIWYG + Prism.js | rich-text & code in one |
| **Desktop** | ElectronJS | Windows, macOS, Linux |
| **Mobile** | PWA (Capacitor optional) | installable offline |
| **Storage** | JSON or SQLite | local & GDPR friendly |
| **Security** | HTTPS · bcrypt · SHA-256 | secure by default |
| **Export** | pdf-lib (+ Markdown / OneNote planned) | archive & share |
| **Local DNS** | Avahi / mDNS | zero-config discovery |

---

## 📦 Requirements

* Node.js **LTS**
* npm
* Git

---

## ✨ Feature Matrix

| Area  | Highlights |
| :- | :- |
| 🌍 **Network** | Join via local URL / IP, optional mDNS discovery |
| 🛡 **Access** | Password / token gated rooms *(planned)* |
| 🧩 **Editor** | Rich-text, code-blocks, tables, embeds |
| 📂 **Files** | Live explorer with download & sharing |
| 📥 **Export** | PDF *(today)*, Markdown / OneNote *(planned)* |
| 🔔 **Notify** | Push reminders for tasks & notes *(mobile)* |
| 🎨 **Themes** | Dark / light + custom primary / secondary |
| 🔍 **Search** | Instant filter, search & jump |
| 📶 **Offline** | Full PWA support; data stays local |
| 📚 **Docs** | Complete user & developer docs |

---

## 🗺️ Roadmap

> **Legend**  **[x] done**  **[ ] open**

### Phase 0 – Core Infrastructure
- [x] Server / client scaffold  
- [x] Live-server port check  
- [x] Host / Join landing page  
- [x] Electron shell  
- [x] Host · Client · Electron flow  
- [x] Offline serving of Tailwind & DaisyUI  

---

### Phase 1 – Editing Essentials
*File management, rich-text & code*
- [x] File explorer & document storage
- [x] Responsive design (desktop)
- [ ] Responsive design (mobile)
- [x] Rich-text basics (bold, italic …)
- [x] Code blocks with Prism.js
- [ ] Full Prism.js syntax highlighting
- [x] Theme switching (light/dark)
- [ ] Live cursor / “user is editing” indicator
- [ ] Ordered & unordered lists
- [x] Tables (insert/edit; tab navigation)
- [ ] Embed media (iframe, images, GIFs)
- [ ] Horizontal rule in notes
- [ ] Emoji panel
- [x] Better logging
- [ ] HTML preview / interpretation
- [ ] Tab ↹ indents
- [ ] Replace native alerts with custom modals
- [x] Full-screen toggle
- [ ] Modify or hide Electron top-bar
- [x] Persist settings & auto-save
- [x] Return to main menu after session
- [ ] UI/UX polish & accessibility review
- [ ] Code clean-up

---

### Phase 2 – Settings & Personalisation
- [x] Show/copy host IP with feedback
- [x] Autosave interval selector
- [x] Primary colour switcher (web)
- [ ] Primary colour switcher (desktop)
- [ ] Secondary colour switcher (web + desktop)
- [ ] Theme & colour reset
- [ ] Settings module refactor

---

### Phase 3 – Security & Access Control
- [ ] Password / token protected access
- [ ] User & file permissions
- [ ] Encrypted transport (HTTPS / WSS)
- [ ] Legal pages (Impressum & Privacy Policy)
- [ ] Electron sandbox: block arbitrary navigation

---

### Phase 4 – Export, Backup & Sync
- [ ] PDF export
- [ ] Markdown export/import
- [ ] OneNote export
- [ ] Backup & restore (single or all files)
- [ ] Cloud sync (Dropbox, Google Drive, OneDrive)
- [ ] Change-tracking & inline comments

---

### Phase 5 – Desktop Release
- [ ] Windows installer
- [ ] macOS DMG
- [ ] Linux AppImage / DEB / RPM
- [ ] Automated release pipeline
- [ ] Store submissions (optional)
- [ ] Auto-update / in-app update check

---

### Phase 6 – Mobile & PWA
- [ ] PWA manifest & offline assets
- [ ] CapacitorJS wrapper builds (iOS / Android)
- [ ] Push notifications (reminders)

---

### Phase 7 – Licensing & Monetisation
- [ ] Freemium gating logic
- [ ] One-time key system for Pro unlock
- [ ] Subscription backend for accounts
- [ ] Donation / sponsorship banner
- [ ] Company licence with source-access

---

### Phase 8 – Network & Deployment Extras
- [ ] Local DNS via mDNS/Avahi
- [ ] LAN scan for running Meet Note instances
- [ ] Port-forward helper & public URL via relay/CDN
- [ ] Stand-alone `server.js` deployment (no Electron)
- [ ] SQLite storage option

---

### Ongoing – UI/UX Excellence
- [x] Icon set → Boxicons
- [ ] Final design polish
- [ ] Accessibility audit
- [ ] Micro-interactions & animations
- [ ] Plugin architecture (stretch)

---

### Experimental – Nice to Haves
- [ ] Dynamic debug: real-time file explorer sync

---

## 🏃‍♂️ Scripts

| NPM Script | Beschreibung |
| :- | :- |
| `npm run dev` | Startet **nur** den Node-Server (Express) – ideal fürs reine Backend-Debugging |
| `npm run electron` | Führt zunächst `build:css` aus und startet anschließend die Electron-App |
| `npm run build:css` | Baut ausschließlich die Tailwind-CSS-Datei (Prod & Dev) |

<details>
<summary>Originale <code>package.json</code>-Snippets</summary>

#### electron (app launch)
```json
"electron": "npm run build:css && electron ."
```

#### dev
```json
"dev": "node server/server.js"
```

#### build:css
**old**
```json
"build:css": "postcss public/styles/styles.css -o public/styles/output.css --env production"
```

**new**
```json
"build:css": "node utils/build-css.js"
```
</details>

## 💸 Licensing & Editions

Meet Note’s core is released under the permissive **MIT license**. Commercial editions finance ongoing development and unlock advanced productivity features.

### WIP
**The here provided version is only under MIT License and can freely be used. A Premium, Team, Enterprise and cleaned Free Version may will be added soon.
watch the Pricing & Editions (Pre-Release) Part on top off this page for more informations!**

**All prices are only **

| Edition | Price | Ideal for | Unlocks |
| :- | :-: | :- | :- |
| **Community** | Free | Individuals, students, hobby projects | All core functionality · Self-hosting |
| **Pro** | €3 / month<br>or €30 / year | Power users on up to x devices | Password-protected rooms · Backup & Restore · Advanced exports (Markdown, OneNote) · Theme editor |
| **Team** | €5 / user / month | Small companies & classrooms | Everything in Pro + LAN-scan discovery · Change tracking · Inline comments · Cloud-sync connectors |
| **Enterprise** | Quote | Large organisations & compliance demands | SSO (SAML/OIDC) · Priority support · On-prem license · Custom feature work |

*All paid plans include a **14-day free trial** and can be cancelled at any time.*

### How we sustain development

Your subscription keeps the project healthy, covers infrastructure, and allows us to ship new releases every month.  
Can’t pay? Keep using the Community edition – no strings attached.

---

## 🤝 Contributing

### WIP
**A Contributing system will be added soon. Watch the disclaimer and contribution part on the top off this page!**

We ❤️ pull requests! To get started:

1. Fork the repository and create a feature branch.  
2. Follow the code style defined in **`.editorconfig`** and run `npm test` before pushing.  
3. Sign the **Developer Certificate of Origin (DCO)** in your first commit.  
4. Open a draft PR early and link it to an issue – feedback is welcome!

Please read our [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) beforehand.

---

## 📜 Open-Source License

```text
MIT License

Copyright (c) 2025 Meet Note Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Third-party libraries remain under their respective licenses – see THIRD_PARTY.md (THIRD_PARTY.md not added yet).

© 2025 Meet Note Contributors · Built with 💙 in Europe
```


<!-- # Meet_Note 📝

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
| Server                  | Node.js + Express + CORS               | Schnell und leicht |
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

---
## Dynamic Debug
- [ ] File explorer realtime sync, (express cors)

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

- [x] File Explorer & Dokumentbasierte Speicherung
- [x] Responsive/Fluid Design
- [ ] Responsive/Fluid Design für Mobile
- [x] Basis Editor (Bold, Italic, etc.)
- [x] Code-Block Prism.js
- [ ] Prism.js Syntax Highlighting
- [x] Theme Switching Light/Dark
- [~] Settings System
- [x] Persistente Einstellungen
- [x] Live-Autosave
- [ ] Feedback dass ein User gerade diese Notiz bearbeitet
- [ ] UI/UX Verbesserungen, Accessability und Text Bearbeitung
- [x] App, Session beenden zurück zum Hauptmenü
- [x] Tabellen-Editor (Einfügen, Zeilen/Spalten hinzufügen/löschen)
- [x] Tabellen-Tab-wechsel
- [ ] unordered und ordered list einfügen und anzeige implementieren
- [x] Fullscreen
- [ ] Modifikation Top Electron bar oder disable
- [ ] einbetten Von Inhalten, IFrame, Bild, Gif
- [ ] hr in note 
- [x] hr block
- [ ] Emoji-Paneel
- [x] Besseres Logging
- [ ] HTML interpretation
- [ ] Offline Funktionalität (localhost)
- [ ] Themes anpassen (light/dark)
- [ ] Clean up Code
- [ ] Alle confirms zu custom modals umbauen
- [ ] Tab Einrückungen implementieren

### Phase ?: Einstellungen

- [x] Anzeige und Kopieren von IP
- [x] Anzeige wenn bereits IP kopiert
- [x] Fullscreen
- [x] Autosave intervall (disabled)
- [x] Primärfarbe ändern (Browser)
- [ ] Primärfarbe ändern (App)
- [ ] Sekundärfarbe ändern (Browser)
- [ ] Sekundärfarbe ändern (App)
- [ ] Fallback/Reset zu standard Theme und Farben
- [x] Tab Einrückungen

### Phase 3: Sicherheit & Rollen

- [ ] Passwortgeschützter Zugang
- [ ] Benutzer-/Dateiverwaltung
- [ ] Verschlüsselte Übertragung (WSS/HTTPS)
- [ ] Impressum und Privacy Policy
- [ ] Zulassen blockieren app zugang zu normalem web? Derweil kann man in electron jede webseite aufsuchen

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

- [x] Icon System :arrow_right: Boxicons
- [ ] UI/UX Verbesserungen :arrow_right: Frontend/Design Finalisierung

### Phase: Lizenzierung

- [ ] Logik für Aufteilung und Freischaltung der Por und Free Version
- [ ] In App implementierung zu Zahlungsmitteln, evtl. Routing zu Produkt Webside
- [ ] Account System, ein User zahlt im Monat für Account (Pro auf jedem Gerät) (Monatlich)
- [ ] Key System für Profreischaltung pro Gerät (Einmalig) 
- [ ] Spendensystem, Firmenbanner Einbettung auf Homepage

### Phase Experimentell: Nice to haves

- [ ] Webserver Deployment (Relay Server, CDN, Client selber host Möglichkeit), verbindung über Webserver(Node) URL, ohne Electron launch nur server.js
- [ ] SQLite3 statt dokumentenbasiertes Speichern

### UI Erweiterungen nach view

#### Hauptmenü
- [ ] Über Meet Note
- [ ] Auf Updates prüfen (erst spät)
- [ ] Plugins (erst spät, wenn überhaupt)
- [ ] Einstellungen

---

## Lizenzmodell und Releaseplan

### Möglichkeit 1: Free und Premiumware

#### Freemium


#### Premium

- Zusätzliche UI Funktionen
- Backup/Restore
- Passwortgeschützter Zugang
- Passwortschutz und ausblenden von Files
- LAN-Scan (automatische Suche nach laufenden Meet-Note-Instanzen)
- Deploy mit URL statt IP:PORT + Firewall-Test / Port-Forwarding-Hilfe
- Suchen und Ersetzen in File und allen Files
- Installation spezifischer Version
- Export OneNote, Markdown, PDF?
- Import Markdown
- Änderungsverfolgung (Track Changes)
- Kommentarfunktion (In-Text Kommentare, To-Dos)
- Cloud-Sync (Dropbox, Google Drive, OneDrive)
- Komplette Theme anpassungen

#### Freie Firmenlizenz
- Einmalige Bezahlung
- Sourcecode Zugang
- Erlauben der Weiterentwicklung
- Dokumentation
- Weitervergabe der Software innerhalb des Unternehmens

### Scripts

#### electron (app launch)

````json
"electron": "npm run build:css && electron ."
```

#### dev

```json
"dev": "node server/server.js"
```

#### Build

altes build css 
```json
"build:css": "postcss public/styles/styles.css -o public/styles/output.css --env production"
```
neues
```json
"build:css": "node utils/build-css.js"
``` -->

