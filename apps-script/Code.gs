/**
 * Backend für Salahs freie Zeiten – läuft kostenlos in Google Apps Script.
 * Einrichtung: siehe README.md im Website-Ordner.
 *
 * WICHTIG: Ändere die PIN unten, bevor du die Web-App bereitstellst.
 */
const PIN = "1234";

const MAX_FAILS = 8;          // Falsche PIN-Versuche, bevor gesperrt wird
const LOCK_SECONDS = 15 * 60; // Sperrzeit nach zu vielen Fehlversuchen

const ALLOWED = {
  weekday: ["frueh", "vormittag", "nachmittag", "abend"],
  weekend: ["vormittag", "nachmittag"]
};

/** Website liest die freien Zeiten (öffentlich, nur lesen). */
function doGet() {
  return json({ ok: true, slots: loadSlots() });
}

/** Admin-Bereich speichert (nur mit richtiger PIN). */
function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); }
  catch (err) { return json({ ok: false, error: "bad_request" }); }

  const cache = CacheService.getScriptCache();
  const fails = Number(cache.get("fails") || 0);
  if (fails >= MAX_FAILS) return json({ ok: false, error: "locked" });

  if (String(body.pin || "") !== PIN) {
    cache.put("fails", String(fails + 1), LOCK_SECONDS);
    return json({ ok: false, error: "pin" });
  }
  cache.remove("fails");

  if (body.action === "check") return json({ ok: true, slots: loadSlots() });

  if (body.action === "save") {
    const clean = cleanSlots(body.slots);
    PropertiesService.getScriptProperties().setProperty("slots", JSON.stringify(clean));
    return json({ ok: true, slots: clean });
  }

  return json({ ok: false, error: "unknown_action" });
}

function loadSlots() {
  const raw = PropertiesService.getScriptProperties().getProperty("slots");
  try { return cleanSlots(raw ? JSON.parse(raw) : {}); } catch (err) { return {}; }
}

function cleanSlots(slots) {
  const tz = "Europe/Berlin";
  const today = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd");
  const out = {};
  Object.keys(slots || {}).slice(0, 120).forEach(function (k) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || k < today) return;
    const wd = new Date(k + "T12:00:00").getDay();
    const allowed = (wd === 6 || wd === 0) ? ALLOWED.weekend : ALLOWED.weekday;
    const v = (Array.isArray(slots[k]) ? slots[k] : []).filter(function (id) { return allowed.indexOf(id) !== -1; });
    if (v.length) out[k] = v;
  });
  return out;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
