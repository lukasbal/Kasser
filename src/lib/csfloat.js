// Lille klient til CSFloats offentlige listings-endpoint.
// Docs: https://docs.csfloat.com/ - "Get All Listings" kræver ingen API-nøgle
// for almindelige GET-kald, kun for at oprette/redigere annoncer.
//
// Vi henter den billigste aktive "buy now"-annonce for hvert marketHashName
// og bruger den som proxy for kassens nuværende markedspris.

const CSFLOAT_ENDPOINT = 'https://csfloat.com/api/v1/listings';
const CACHE_KEY = 'kasseskabet:price-cache:v1';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min - CSFloat priser ændrer sig langsomt for kasser

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

async function fetchLowestListingPriceCents(marketHashName) {
  const url = `${CSFLOAT_ENDPOINT}?market_hash_name=${encodeURIComponent(
    marketHashName
  )}&sort_by=lowest_price&limit=1&category=1`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`CSFloat svarede ${res.status}`);
  }
  const data = await res.json();
  const listings = Array.isArray(data) ? data : data?.data ?? [];
  if (!listings.length) {
    throw new Error('Ingen aktive annoncer fundet');
  }
  return listings[0].price; // i cent (USD)
}

// Henter priser for en liste af marketHashNames. Kalder onItemResolved
// løbende, så UI'et kan opdateres i takt med at priser kommer ind, i stedet
// for at vente på dem alle sammen.
export async function fetchPrices(marketHashNames, { onItemResolved } = {}) {
  const cache = readCache();
  const now = Date.now();
  const results = {};

  for (const name of marketHashNames) {
    if (!name) continue;

    const cached = cache[name];
    if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
      results[name] = { usdCents: cached.usdCents, fromCache: true, error: null };
      onItemResolved?.(name, results[name]);
      continue;
    }

    try {
      const usdCents = await fetchLowestListingPriceCents(name);
      cache[name] = { usdCents, fetchedAt: now };
      results[name] = { usdCents, fromCache: false, error: null };
    } catch (err) {
      results[name] = {
        usdCents: cached?.usdCents ?? null,
        fromCache: Boolean(cached),
        error: err.message || 'Ukendt fejl',
      };
    }
    onItemResolved?.(name, results[name]);

    // Skån CSFloats API lidt - vent kort mellem hvert kald.
    await new Promise((r) => setTimeout(r, 250));
  }

  writeCache(cache);
  return results;
}

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
