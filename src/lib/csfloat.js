// Lille klient til CSFloats officielle API (https://docs.csfloat.com/).
// GET-kald til /listings kræver ingen nøgle ifølge dokumentationen, men
// CSFloats bot-beskyttelse kan alligevel give 403 uden en gyldig
// developer-nøgle. Med en nøgle (Authorization-header) sendes kaldet som en
// autoriseret, legitim klient i stedet for et anonymt/proxy-kald, hvilket
// typisk undgår den blokering.
//
// Vi henter den billigste aktive "buy now"-annonce for hvert marketHashName
// (og evt. paintIndex til Doppler-faser, def_index til at præcisere varer med
// generiske navne) og bruger den som proxy for varens nuværende markedspris.

const CSFLOAT_ENDPOINT = 'https://csfloat.com/api/v1/listings';
const CACHE_KEY = 'kasseskabet:price-cache:v4';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min - CSFloat priser ændrer sig langsomt for kasser
const SETTINGS_KEY = 'kasseskabet:settings:v1';
const DEFAULT_PROXY_PREFIXES = [
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://corsproxy.io/?url=',
  'https://api.allorigins.win/raw?url=',
];

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ikke kritisk
  }
}

function cacheKeyFor(marketHashName, paintIndex, defIndex) {
  return [marketHashName, paintIndex ?? '', defIndex ?? ''].join('#');
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage kan være fuld eller blokeret - ikke kritisk, vi prøver bare igen næste gang
  }
}

function buildUrl(marketHashName, paintIndex, defIndex) {
  const params = new URLSearchParams({
    market_hash_name: marketHashName,
    sort_by: 'lowest_price',
    limit: '1',
    category: '1',
  });
  if (paintIndex != null) params.set('paint_index', String(paintIndex));
  if (defIndex != null) params.set('def_index', String(defIndex));
  return `${CSFLOAT_ENDPOINT}?${params.toString()}`;
}

async function fetchJson(url, headers) {
  const res = await fetch(url, headers ? { headers } : undefined);
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return res.json();
}

function normalizeListingsToPrice(data) {
  const listings = Array.isArray(data) ? data : data?.data ?? [];
  if (!listings.length) {
    throw new Error('Ingen aktive annoncer fundet');
  }
  return listings[0].price; // i cent (USD)
}

async function fetchLowestListingPriceCents(marketHashName, paintIndex, defIndex) {
  const directUrl = buildUrl(marketHashName, paintIndex, defIndex);
  const { csfloatApiKey } = getSettings();

  try {
    // API-nøglen sendes KUN på det direkte kald til csfloat.com - aldrig til
    // en offentlig tredjeparts-proxy, da det ville sende jeres hemmelige
    // nøgle til en fremmed server.
    const data = await fetchJson(directUrl, csfloatApiKey ? { Authorization: csfloatApiKey } : undefined);
    return normalizeListingsToPrice(data);
  } catch {
    // direkte kald fejlede (typisk CORS eller bot-beskyttelse) - prøv proxykæden herunder
  }

  let lastErr = new Error('Intet direkte kald og ingen proxy virkede');
  for (const prefix of DEFAULT_PROXY_PREFIXES) {
    try {
      const data = await fetchJson(prefix + encodeURIComponent(directUrl));
      return normalizeListingsToPrice(data);
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(`Kunne ikke hente pris (${lastErr.message})`);
}

// Henter priser for en liste af { marketHashName, paintIndex?, defIndex? }.
// Kalder onItemResolved løbende, så UI'et kan opdateres i takt med at priser
// kommer ind, i stedet for at vente på dem alle sammen.
export async function fetchPrices(lookups, { onItemResolved } = {}) {
  const cache = readCache();
  const now = Date.now();
  const results = {};

  for (const { marketHashName, paintIndex, defIndex } of lookups) {
    if (!marketHashName) continue;
    const key = cacheKeyFor(marketHashName, paintIndex, defIndex);

    const cached = cache[key];
    if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
      results[key] = { usdCents: cached.usdCents, fromCache: true, error: null };
      onItemResolved?.(key, results[key]);
      continue;
    }

    try {
      const usdCents = await fetchLowestListingPriceCents(marketHashName, paintIndex, defIndex);
      cache[key] = { usdCents, fetchedAt: now };
      results[key] = { usdCents, fromCache: false, error: null };
    } catch (err) {
      results[key] = {
        usdCents: cached?.usdCents ?? null,
        fromCache: Boolean(cached),
        error: err.message || 'Ukendt fejl',
      };
    }
    onItemResolved?.(key, results[key]);

    // Skån CSFloats API lidt - vent kort mellem hvert kald.
    await new Promise((r) => setTimeout(r, 250));
  }

  writeCache(cache);
  return results;
}

export { cacheKeyFor };

// USD/DKK-kurs. Hentes fra en gratis, nøglefri kurs-API og caches i en time.
const FX_CACHE_KEY = 'kasseskabet:usd-dkk:v1';
const FX_TTL_MS = 60 * 60 * 1000;
const FALLBACK_USD_DKK = 6.9;

export async function fetchUsdToDkk() {
  try {
    const raw = localStorage.getItem(FX_CACHE_KEY);
    if (raw) {
      const cached = JSON.parse(raw);
      if (Date.now() - cached.fetchedAt < FX_TTL_MS) return cached.rate;
    }
  } catch {
    // ignorer og hent frisk kurs
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await res.json();
    const rate = data?.rates?.DKK;
    if (!rate) throw new Error('Ingen DKK-kurs i svaret');
    try {
      localStorage.setItem(FX_CACHE_KEY, JSON.stringify({ rate, fetchedAt: Date.now() }));
    } catch {
      // ikke kritisk
    }
    return rate;
  } catch {
    return FALLBACK_USD_DKK;
  }
}
