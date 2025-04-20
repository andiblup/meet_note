# Meet_Note

Eine einfache, moderne und sichere Netzwerk-Notiz-App zum schnellen Austausch von Notizen in Meetings.

---

## 🎯 Projektziel

- Einfache Nutzung: **Ein Nutzer installiert/hostet**, alle anderen können über Browser oder App beitreten
- **Schneller Zugriff** im lokalen Netzwerk (ohne Internet)
- **Moderne, klare Oberfläche** (Tailwind, DaisyUI)
- **Maximale Sicherheit** (HTTPS, Passwort-Hashing, DSGVO-konform)
- **Offline-First** (PWA-Ready)
- Host- und Client-Funktion in einer App
- Browser-, Desktop- und Mobilezugriff (Electron + PWA)
- DSGVO-konform, sicher, leicht zu bedienen

---

## 🛠️ Techstack

| Bereich                | Technologie                             | Grund |
|:------------------------|:----------------------------------------|:------|
| Server                  | Node.js + Express                      | Schnell und leicht |
| Realtime-Kommunikation  | Socket.IO                              | Live-Synchronisation |
| Frontend                | HTML5 + TailwindCSS + DaisyUI           | Modern und responsiv |
| Datenhaltung            | JSON-Dateien (später SQLite möglich)   | Schnell, lokal, DSGVO-konform |
| Desktop-App             | ElectronJS                             | Windows, macOS, Linux Apps |
| Mobile-App              | PWA (CapacitorJS optional)             | Mobile Installation |
| Sicherheit              | HTTPS, bcrypt, SHA-256 Passwort-Hashing | Schutz und DSGVO |
| Export                  | PDF-Export (pdf-lib, jspdf)             | Sicherung von Notizen |
| Lokaler DNS optional    | Avahi/mDNS                              | Einfachere Verbindung (z.B. `meetnote.local`) |

---

## 🛠️ Techstack Übersicht

### Basistechnologien

| Technologie | Beschreibung |
|:------------|:--------------|
| Node.js (>=18.x) | Laufzeitumgebung für Server & Build-Tools |
| npm (>=9.x) | Paketmanager für Node |
| Express | Server-Framework für HTTP API |
| Socket.IO | Echtzeitkommunikation Server/Client |
| TailwindCSS | Modernes CSS-Framework |
| DaisyUI | Komponentenerweiterung für Tailwind |
| Electron | Desktop-App-Framework für Windows, Mac, Linux |
| CapacitorJS | Mobile-Wrapper für Android/iOS Apps |
| sqlite3 oder better-sqlite3 | Lokale SQLite-Datenbankanbindung |
| bcrypt oder crypto | Passwort-Hashing und Sicherheit |
| pdf-lib oder jspdf | PDF-Export-Generierung |
| dotenv | Umgebungsvariablen verwalten |
| Avahi/mDNS (optional) | Lokaler DNS-Name im Netzwerk |

---

## 📦 Tools (lokal zu installieren)

- Node.js (empfohlen: [Node LTS Version](https://nodejs.org/en))
- Git (Version Control)
- VSCode oder anderer Editor
- (Optional für Mobile Builds: Android Studio, Xcode)

---

## ✨ Features

| Bereich                  | Feature |
|:--------------------------|:--------|
| 🌍 Netzwerkzugriff         | Zugriff über lokale URL (IP/DNS) |
| 🔒 Passwortschutz         | Zugriff nur mit Token/Passwort |
| 🔒 Verschlüsselte Kommunikation | HTTPS, WSS |
| 📂 Datei-Management       | Nur freigegebene Dateien sichtbar |
| 📥 Download-Funktion      | Dateien einzeln oder gesammelt downloaden |
| 🧾 PDF-Export             | Export als PDF |
| 🌎 Mehrsprachigkeit       | Deutsch/Englisch Unterstützung |
| 🔍 Suche & Filter         | Dateien und Inhalte durchsuchen |
| 🏷️ Tags & Kategorien     | Strukturierung |
| 📈 Statistiken            | Aufgabenstatus, Fortschritt |
| 🧩 Plugin-System          | Erweiterungen möglich |
| 📦 Backup/Restore         | Manuelle und automatische Sicherung |
| 👥 Benutzerverwaltung    | Admin / Editor / Viewer Rollen |
| 📶 Offline-First          | Auch offline nutzbar (PWA) |
| 📚 Dokumentation          | Anleitung für Benutzer/Admins |
| 🌙 Dark/Light Mode        | Tag- und Nachtmodus |
| 📄 Versionshistorie       | Änderungen an Notizen nachverfolgbar |
| 🎨 Themes                 | Farbthemes auswählbar |
| 📊 Dashboard              | Übersicht über Aufgaben & Deadlines |
| 🔥 Schnellnotizen         | Direkt schnelles Notieren möglich |

---

## 🛠 Entwicklungsplan

### Phase 1: Basisfunktionalität

- [ ] Projektstruktur aufsetzen
- [ ] Express + Socket.IO Server bauen
- [ ] Grundlegendes Frontend (Tailwind + DaisyUI)
- [ ] Host-/Beitreten-Logik
- [ ] JSON-Datei-Speicherung für Notizen

---

### Phase 2: Sicherheit

- [ ] SSL/TLS einrichten (Self-Signed)
- [ ] Passwort-/Token-Absicherung
- [ ] Passwort-Hashing (bcrypt oder SHA-256)

---

### Phase 3: Benutzerfreundlichkeit

- [ ] Dark/Light Mode
- [ ] Schnellnotizen-Funktion
- [ ] Suche & Filter
- [ ] Tags und Kategorien

---

### Phase 4: Erweiterte Features

- [ ] Export als PDF
- [ ] Backup/Restore Funktion
- [ ] Benutzerverwaltung
- [ ] Dashboard Übersicht
- [ ] Versionshistorie

---

### Phase 5: Plattformübergreifend

- [ ] Electron App erstellen (.exe, .app, .deb)
- [ ] PWA Manifest + Service Worker
- [ ] CapacitorJS Mobile-Builds vorbereiten

---

## 📦 Startverzeichnisstruktur

```plaintext
meet_note/
├── server/
│   ├── server.js         # Express + Socket.IO Server
│   ├── db/               # Ordner für gespeicherte Dateien (JSON oder SQLite)
│   ├── config.js         # Server Konfiguration (Port, SSL, etc.)
├── public/
│   ├── index.html        # Haupt-Frontend
│   ├── app.js            # Frontend-Logik (Socket.IO, API Calls)
│   ├── styles.css        # TailwindCSS Build
│   ├── pwa/              # Manifest + Service Worker
│   └── assets/           # Icons, Logos, Images
├── electron/
│   ├── main.js           # Electron Main Process
│   └── package.json      # Electron App Konfiguration
├── README.md             # Projektbeschreibung
├── package.json          # Node.js Projektdatei
└── .gitignore            # Git Ignore Regeln
```