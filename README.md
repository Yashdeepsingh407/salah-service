# Salah Haus- & Gartenservice – Website

Statische Website für GitHub Pages mit Terminplaner (Anfrage per WhatsApp) und einem einfachen Admin-Bereich, in dem Salah seine freien Zeiten selbst einträgt.

## Ordner

| Datei | Wofür |
|---|---|
| `index.html` | Die Website |
| `admin.html` | Salahs Bereich für freie Zeiten (PIN-geschützt, nicht in Google sichtbar) |
| `config.js` | Einstellungen: Backend-Adresse, WhatsApp-Nummer, E-Mail |
| `slots.js` | Gemeinsame Logik für Website und Admin |
| `apps-script/Code.gs` | Das Backend (kommt in Google Apps Script, **nicht** auf GitHub nötig) |
| `impressum.html`, `datenschutz.html` | Vorlagen – gelb markierte Stellen ausfüllen! |
| `img/`, `fonts/` | Bilder und lokal eingebundene Schriften |

## Schritt 1: Auf GitHub Pages veröffentlichen

1. Neues Repository auf GitHub anlegen, z. B. `salah-service`.
2. Alle Dateien aus diesem Ordner hochladen (Ordner `apps-script` kann man weglassen).
3. Im Repository: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, Branch `main`, Ordner `/ (root)` → Save.
4. Nach ca. 1 Minute ist die Seite unter `https://<github-name>.github.io/salah-service/` online.

**Eigene Domain** (z. B. `salah-service.de`): unter Settings → Pages bei *Custom domain* eintragen und beim Domain-Anbieter (Porkbun) die DNS-Einträge setzen, die GitHub anzeigt. Danach „Enforce HTTPS“ anhaken.

Ohne Schritt 2 läuft der Terminplaner trotzdem: Dann werden alle Tage nach Öffnungszeiten angeboten.

## Schritt 2: Backend für freie Zeiten (einmalig, ca. 5 Minuten)

Am besten mit Salahs Google-Konto machen.

1. <https://script.google.com> öffnen → **Neues Projekt**.
2. Den Inhalt von `apps-script/Code.gs` komplett hineinkopieren (vorhandenen Code ersetzen).
3. Ganz oben `const PIN = "1234";` auf eine eigene PIN ändern (z. B. 6 Ziffern). Speichern.
4. **Bereitstellen → Neue Bereitstellung** → Zahnrad → **Web-App**
   - Ausführen als: **Ich**
   - Zugriff: **Jeder**
   → Bereitstellen, Zugriff erlauben (Google warnt, weil die App nicht geprüft ist: *Erweitert → Zu … wechseln*).
5. Die **Web-App-URL** kopieren (endet auf `/exec`).
6. In `config.js` bei `API_URL` eintragen und auf GitHub neu hochladen.

Fertig. Ab jetzt zeigt die Website nur noch die Zeiten an, die Salah als frei markiert.

> Code später geändert? Dann **Bereitstellen → Bereitstellungen verwalten → Bearbeiten → Version: Neue Version**, sonst bleibt die alte Version aktiv. Die URL bleibt gleich.

## So benutzt Salah den Admin-Bereich

1. Auf dem Handy `…/admin.html` öffnen, PIN eingeben.
2. **Zum Home-Bildschirm hinzufügen** (iPhone: Teilen → Zum Home-Bildschirm, Android: Menü → Zum Startbildschirm). Dann ist es ein App-Symbol „Freie Zeiten“.
3. Zeitfenster antippen = frei (grün). Nochmal tippen = nicht frei. „Ganzer Tag frei“ und „Alles frei“ pro Woche gehen auch.
4. Alles speichert automatisch.

Hinweise:
- Tage ohne grüne Zeitfenster sind auf der Website ausgegraut („voll“).
- Hat Salah noch **gar nichts** eingetragen, zeigt die Website alle Tage nach Öffnungszeiten.
- „So bald wie möglich“ können Kunden immer wählen.
- Ein Termin ist erst fest, wenn Salah ihn per WhatsApp bestätigt. Danach das Zeitfenster im Admin auf „nicht frei“ tippen.

## Anpassen

- Telefonnummer, E-Mail: `config.js` und in `index.html` die `tel:`-Links.
- Öffnungszeiten / Zeitfenster (Sonntag hat dieselben Zeiten wie Samstag): `slots.js` (`HOURS`, `WINDOWS`) **und** `apps-script/Code.gs` (`ALLOWED`) gleich halten.
- Leistungen: in `index.html` die Liste `SERVICES` im Script.
