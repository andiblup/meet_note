# 🧪 Entwicklung - Meet_Note

## Einrichtung

1. Repository klonen
2. `install.ps1` ausführen um dependencies zu installieren, bsp. Node, Express. 
3. `npm install` ausführen
4. `.env` Datei anlegen (bzw. `.env.example` kopieren)
5. Lokalen Server starten via:
   ```bash
   npm run electron
   ```

## Seiten und Navigation

- `index.html` wird als erstes aufgerufen.
- Nutzer wählt zwischen:
  - \"Session starten\" → Weiterleitung auf `host.html`
  - \"Beitreten\" → Weiterleitung auf `join.html`
- Auf Basis der gewählten Aktion wird automatisch die entsprechende Rolle (Host oder Teilnehmer) gesetzt.

Hinweis: Alle Seiten müssen die gleiche Socket.IO Verbindung zum Server nutzen.
