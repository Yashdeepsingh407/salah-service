# Salah Haus- & Gartenservice – Website

Statische Website für GitHub Pages mit Terminplaner (Anfrage per WhatsApp) und einem einfachen Admin-Bereich, in dem Salah seine freien Zeiten selbst einträgt.

## Ordner

| Datei | Wofür |
|---|---|
| `index.html` | Die Website |
| `admin.html` | Salahs Bereich für freie Zeiten (mit Zugangsschlüssel, nicht in Google sichtbar) |
| `slots.json` | Die freien Zeiten (wird vom Admin-Panel geschrieben) |
| `config.js` | Einstellungen: GitHub-Repository, WhatsApp-Nummer, E-Mail |
| `slots.js` | Gemeinsame Logik für Website und Admin |
| `impressum.html`, `datenschutz.html` | Vorlagen – gelb markierte Stellen ausfüllen! |
| `img/`, `fonts/` | Bilder und lokal eingebundene Schriften |

## Schritt 1: Auf GitHub Pages veröffentlichen

1. Neues Repository auf GitHub anlegen, z. B. `salah-service`.
2. Alle Dateien aus diesem Ordner hochladen.
3. Im Repository: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, Branch `main`, Ordner `/ (root)` → Save.
4. Nach ca. 1 Minute ist die Seite unter `https://<github-name>.github.io/salah-service/` online.

**Eigene Domain** (z. B. `salah-service.de`): unter Settings → Pages bei *Custom domain* eintragen und beim Domain-Anbieter (Porkbun) die DNS-Einträge setzen, die GitHub anzeigt. Danach „Enforce HTTPS“ anhaken.

Solange keine freien Zeiten eingetragen sind, bietet der Terminplaner alle Tage nach Öffnungszeiten an.

## Schritt 2: Zugangsschlüssel für das Admin-Panel (einmalig, ca. 2 Minuten)

Die freien Zeiten liegen in `slots.json` hier im Repository. Das Admin-Panel speichert sie mit einem GitHub-Zugangsschlüssel, der **nur** dieses Repository ändern darf.

1. <https://github.com/settings/personal-access-tokens/new> öffnen.
2. **Token name:** `Salah Admin` · **Expiration:** 1 Jahr (oder „No expiration“, falls angeboten).
3. **Repository access:** *Only select repositories* → `salah-service`.
4. **Permissions → Repository permissions → Contents:** *Read and write*. Sonst nichts ändern.
5. **Generate token**, den Schlüssel (beginnt mit `github_pat_`) kopieren.
6. Auf Salahs Handy `https://salah-service.de/admin.html` öffnen, Schlüssel einfügen, **Anmelden**. Fertig, er bleibt dort gespeichert.

Läuft der Schlüssel ab, meldet das Admin-Panel das. Dann einfach einen neuen erstellen und einfügen.

## So benutzt Salah den Admin-Bereich

1. Auf dem Handy `https://salah-service.de/admin.html` öffnen (beim ersten Mal Schlüssel einfügen).
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
- Öffnungszeiten / Zeitfenster (Sonntag hat dieselben Zeiten wie Samstag): `slots.js` (`HOURS`, `WINDOWS`).
- Leistungen: in `index.html` die Liste `SERVICES` im Script.
