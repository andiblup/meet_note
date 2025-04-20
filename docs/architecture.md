# 📐 Architektur - Meet_Note

## Systemübersicht
- **Server:** Node.js + Express
- **Websocket:** Socket.IO für Echtzeitkommunikation
- **Frontend:** HTML5, TailwindCSS, DaisyUI
- **Syntax Highlighting:** Prism.js
- **Desktop:** Electron App
- **Mobile:** PWA via Capacitor (optional)
- **Speicherung:** Lokale JSON-Dateien (SQLite geplant)

## Kommunikationsfluss
- Clients verbinden sich über WebSocket (Socket.IO)
- Änderungen werden live synchronisiert
- Daten werden lokal auf dem Host gespeichert

## Seitenübersicht

- `/index.html`: Startseite mit Auswahl \"Session starten\" oder \"Beitreten\"
- `/host.html`: Editor-Seite für den Host (Admin-Rolle)
- `/join.html`: Editor-Seite für Teilnehmer (Collaborator-Rolle)

Jede Seite lädt die entsprechende Konfiguration basierend auf der zugewiesenen Rolle (Admin oder Collaborator).

