/* Gemeinsame Logik für Website und Admin-Bereich:
   Zeitfenster, Laden und Speichern der freien Zeiten. */
window.SALAH = (function () {
  const cfg = window.SALAH_CONFIG || {};
  const DEMO_KEY = "salah-demo-slots";

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

  const mode = cfg.API_URL ? "live" : "demo";

  // Lädt die freien Zeiten. Gibt null zurück, wenn (noch) nichts eingetragen ist
  // oder das Laden fehlschlägt – dann zeigt die Website die normalen Öffnungszeiten.
  async function load() {
    if (mode === "demo") {
      try { const raw = localStorage.getItem(DEMO_KEY); return raw ? cleanSlots(JSON.parse(raw)) : null; }
      catch { return null; }
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(cfg.API_URL + "?t=" + Date.now(), { signal: ctrl.signal });
      const data = await res.json();
      return data && data.ok ? cleanSlots(data.slots) : null;
    } catch { return null; }
    finally { clearTimeout(timer); }
  }

  async function post(body) {
    // text/plain verhindert einen CORS-Preflight bei Google Apps Script
    const res = await fetch(cfg.API_URL, { method: "POST", body: JSON.stringify(body) });
    return res.json();
  }

  async function checkPin(pin) {
    if (mode === "demo") return { ok: true };
    try { return await post({ action: "check", pin }); }
    catch { return { ok: false, error: "network" }; }
  }

  async function save(slots, pin) {
    const clean = cleanSlots(slots);
    if (mode === "demo") {
      try { localStorage.setItem(DEMO_KEY, JSON.stringify(clean)); return { ok: true, slots: clean }; }
      catch { return { ok: false, error: "storage" }; }
    }
    try { return await post({ action: "save", pin, slots: clean }); }
    catch { return { ok: false, error: "network" }; }
  }

  return { cfg, mode, HOURS, WINDOWS, windowsFor, upcomingDays, iso, fromIso, pad, load, save, checkPin };
})();
