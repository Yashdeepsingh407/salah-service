/* Gemeinsame Logik für Website und Admin-Bereich:
   Zeitfenster, Laden und Speichern der freien Zeiten. */
window.SALAH = (function () {
  const cfg = window.SALAH_CONFIG || {};

  // Öffnungszeiten (0 = Sonntag)
  const HOURS = { 0: [9, 18], 1: [6, 20], 2: [6, 20], 3: [6, 20], 4: [6, 20], 5: [6, 20], 6: [9, 18] };

  const WINDOWS = {
    weekday: [
      { id: "frueh", name: "Früh", time: "06–10 Uhr" },
      { id: "vormittag", name: "Vormittag", time: "10–13 Uhr" },
      { id: "nachmittag", name: "Nachmittag", time: "13–17 Uhr" },
      { id: "abend", name: "Abend", time: "17–20 Uhr" }
    ],
    weekend: [
      { id: "vormittag", name: "Vormittag", time: "09–13 Uhr" },
      { id: "nachmittag", name: "Nachmittag", time: "13–18 Uhr" }
    ]
  };

  const pad = n => String(n).padStart(2, "0");
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromIso = s => new Date(s + "T12:00:00");

  function windowsFor(dateIso) {
    const wd = fromIso(dateIso).getDay();
    return (wd === 6 || wd === 0) ? WINDOWS.weekend : WINDOWS.weekday;
  }

  function upcomingDays(n, startOffset) {
    const out = [];
    for (let i = startOffset; i < startOffset + n; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      out.push(iso(d));
    }
    return out;
  }

  function cleanSlots(slots) {
    const today = iso(new Date());
    const out = {};
    Object.keys(slots || {}).forEach(k => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || k < today) return;
      const allowed = windowsFor(k).map(w => w.id);
      const v = (slots[k] || []).filter(id => allowed.includes(id));
      if (v.length) out[k] = v;
    });
    return out;
  }

  const mode = "live";
  const API = `https://api.github.com/repos/${cfg.GITHUB_OWNER}/${cfg.GITHUB_REPO}/contents/${cfg.SLOTS_FILE}`;
  let lastSha = null;

  function timeoutFetch(url, opts, ms) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms || 8000);
    return fetch(url, Object.assign({}, opts, { signal: ctrl.signal })).finally(() => clearTimeout(t));
  }

  // Dekodiert Base64 aus der GitHub-API als UTF-8
  const fromB64 = b64 => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, "")), c => c.charCodeAt(0)));
  const toB64 = str => btoa(String.fromCharCode(...new TextEncoder().encode(str)));

  // Lädt die freien Zeiten. Gibt null zurück, wenn nichts eingetragen ist
  // oder das Laden fehlschlägt – dann zeigt die Website die normalen Öffnungszeiten.
  async function load() {
    // 1. Direkt aus GitHub (immer aktuell)
    try {
      const res = await timeoutFetch(API + "?ref=" + cfg.GITHUB_BRANCH + "&t=" + Date.now(), { headers: { Accept: "application/vnd.github.raw+json" }, cache: "no-store" });
      if (res.status === 404) return null;
      if (res.ok) return cleanSlots(await res.json());
    } catch {}
    // 2. Ersatz: Kopie auf GitHub Pages (kann ein paar Minuten alt sein)
    try {
      const res = await timeoutFetch(cfg.SLOTS_FILE + "?t=" + Date.now(), { cache: "no-store" });
      if (res.ok) return cleanSlots(await res.json());
    } catch {}
    return null;
  }

  const authHeaders = token => ({ Authorization: "Bearer " + token, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" });

  // Liest die Datei mit dem Schlüssel (liefert auch die Version "sha" fürs Speichern)
  async function readWithToken(token) {
    const res = await timeoutFetch(API + "?ref=" + cfg.GITHUB_BRANCH + "&t=" + Date.now(), { headers: authHeaders(token), cache: "no-store" });
    if (res.status === 401) return { ok: false, error: "pin" };
    if (res.status === 404) { lastSha = null; return { ok: true, slots: {} }; }
    if (!res.ok) return { ok: false, error: "network" };
    const data = await res.json();
    lastSha = data.sha;
    let slots = {};
    try { slots = JSON.parse(fromB64(data.content || "")); } catch {}
    return { ok: true, slots: cleanSlots(slots) };
  }

  async function checkPin(token) {
    if (!token || token.length < 20) return { ok: false, error: "pin" };
    try { return await readWithToken(token); }
    catch { return { ok: false, error: "network" }; }
  }

  async function save(slots, token, retried) {
    const clean = cleanSlots(slots);
    const body = {
      message: "Freie Zeiten aktualisiert",
      content: toB64(JSON.stringify(clean, null, 1) + "\n"),
      branch: cfg.GITHUB_BRANCH,
      committer: { name: "Salah Admin", email: "admin@salah-service.de" }
    };
    if (lastSha) body.sha = lastSha;
    try {
      const res = await timeoutFetch(API, { method: "PUT", headers: authHeaders(token), body: JSON.stringify(body) }, 15000);
      if (res.ok) { lastSha = (await res.json()).content.sha; return { ok: true, slots: clean }; }
      if (res.status === 401) return { ok: false, error: "pin" };
      if (res.status === 403 || res.status === 404) return { ok: false, error: "forbidden" };
      if ((res.status === 409 || res.status === 422) && !retried) {
        // Datei wurde zwischendurch geändert (z. B. auf einem anderen Gerät): Version neu holen und nochmal
        const r = await readWithToken(token);
        if (r.ok) return save(slots, token, true);
      }
      return { ok: false, error: "network" };
    } catch { return { ok: false, error: "network" }; }
  }

  return { cfg, mode, HOURS, WINDOWS, windowsFor, upcomingDays, iso, fromIso, pad, load, save, checkPin };
})();
