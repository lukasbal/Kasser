const STORAGE_KEY = 'kasseskabet:value-log:v1';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(log) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch {
    // ikke kritisk
  }
}

// Gemmer dagens samlede porteføljeværdi for en person, så grafen kan
// fortsætte historikken fra arket, selvom siden er statisk og ikke har en
// database. Værdien overskrives, hvis appen åbnes flere gange samme dag.
export function logTodaysValue(personKey, totalValueDkk) {
  if (!Number.isFinite(totalValueDkk) || totalValueDkk <= 0) return;
  const log = load();
  const today = new Date().toISOString().slice(0, 10);
  log[personKey] = log[personKey] || {};
  log[personKey][today] = totalValueDkk;
  save(log);
}

export function getLoggedHistory(personKey) {
  const log = load();
  const entries = log[personKey] || {};
  return Object.entries(entries)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
