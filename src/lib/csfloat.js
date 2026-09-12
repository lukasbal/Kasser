// Lille klient til CSFloats offentlige listings-endpoint.
// Docs: https://docs.csfloat.com/ - "Get All Listings" kræver ingen API-nøgle
// for almindelige GET-kald, kun for at oprette/redigere annoncer.
//
// Vi henter den billigste aktive "buy now"-annonce for hvert marketHashName
// (og evt. paintIndex, til Doppler-faser) og bruger den som proxy for
// kassens/knivens nuværende markedspris.
//
// CSFloat sender ikke nødvendigvis CORS-headers, der tillader kald direkte
// fra en browser på et andet domæne (fx jeres GitHub Pages-side). Vi prøver
// derfor et direkte kald først, og falder automatisk tilbage til en
// CORS-proxy, hvis det direkte kald fejler. I kan også indtaste jeres egen
// proxy/API i appens indstillinger, hvis I får bygget en.

const CSFLOAT_ENDPOINT = 'https://csfloat.com/api/v1/listings';
const CACHE_KEY = 'kasseskabet:price-cache:v3';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min - CSFloat priser ændrer sig langsomt for kasser
const SETTINGS_KEY = 'kasseskabet:settings:v1';
const DEFAULT_PROXY_PREFIX = 'https://api.allorigins.win/raw?url=';

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

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return res.json();
}

async function fetchLowestListingPriceCents(marketHashName, paintIndex, defIndex) {
  const directUrl = buildUrl(marketHashName, paintIndex, defIndex);
  const { proxyPrefix } = getSettings();
  const usedProxy = proxyPrefix === 'none' ? null : proxyPrefix || DEFAULT_PROXY_PREFIX;

  let data;
  try {
    data = await fetchJson(directUrl);
  } catch (directErr) {
    if (!usedProxy) throw directErr;
    try {
      data = await fetchJson(usedProxy + encodeURIComponent(directUrl));
    } catch {
      throw new Error('Kunne ikke hente pris (direkte og via proxy fejlede)');
    }
  }

  const listings = Array.isArray(data) ? data : data?.data ?? [];
  if (!listings.length) {
    throw new Error('Ingen aktive annoncer fundet');
  }
  return listings[0].price; // i cent (USD)
}

// Henter priser for en liste af { marketHashName, paintIndex? }. Kalder
// onItemResolved løbende, så UI'et kan opdateres i takt med at priser kommer
// ind, i stedet for at vente på dem alle sammen.
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
