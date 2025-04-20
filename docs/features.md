# ✨ Features - Meet_Note

## Aktuelle Funktionen

- Lokaler Serverbetrieb (sicher & schnell)
- Netzwerkzugriff ohne Internet
- Host- & Join-Funktionalität
- Dateiorientiertes Notizmanagement
- Live-Synchronisation (Socket.IO)
- Passwortschutz optional
- Export als PDF
- Suche & Filter
- Tags und Kategorien
- Dark/Light Mode
- PWA-Unterstützung (offlinefähig)
- Benutzerfreundliches UI

## Geplante Features

- Benutzerrollen (Admin, Editor, Viewer)
- OneNote und Markdown Exporte
- Lokaler DNS-Server (z.B. meetnote.local)
- Plugin-System für Erweiterungen

## Rollenbasiertes Zugriffssystem

| Rolle | Berechtigungen |
|:------|:---------------|
| Host (Admin) | Erstellen, Bearbeiten, Löschen von Dateien; Session verwalten |
| Teilnehmer (Collaborator) | Bearbeiten von bestehenden Inhalten; keine neuen Dateien anlegen oder löschen |

Rollen werden beim Starten oder Beitreten zu einer Session automatisch vergeben.
