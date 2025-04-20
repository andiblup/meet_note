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
