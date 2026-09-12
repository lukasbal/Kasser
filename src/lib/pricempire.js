// Klient til Pricempires developer-API (https://pricempire.com/docs).
// Kræver en gratis API-nøgle fra pricempire.com (Trader-planen er gratis og
// inkluderer 30.000 kald/måned - langt mere end denne app nogensinde bruger,
// da vi henter ALLE priser i ét samlet kald i stedet for ét kald pr. kasse).
//
// sources=csfloat betyder vi beder om CSFloat-baserede priser specifikt,
// selvom Pricempire dækker 40+ markedspladser.
//
// Bemærk: Pricempires prisdata er opdelt pr. Steam-varenavn, ikke pr.
// Doppler-fase - den kan derfor ikke skelne mellem fx Phase 3 og de andre
// Doppler-faser af samme kniv. Den slags varer må stadig indtastes manuelt.

const PRICEMPIRE_ENDPOINT = 'https://api.pricempire.com/v4/paid/items/prices';
const CACHE_KEY = 'kasseskabet:pricempire-cache:v1';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min
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

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(entry) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // ikke kritisk
  }
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return res.json();
}

function buildUrl(apiKey) {
  const params = new URLSearchParams({
    api_key: apiKey,
    app_id: '730', // CS2
    sources: 'csfloat',
    currency: 'USD',
  });
  return `${PRICEMPIRE_ENDPOINT}?${params.toString()}`;
}

// Henter ALLE priser i ét kald og bygger et opslagsopslag
// market_hash_name -> pris i USD. Kastes en fejl hvis nøglen mangler eller
// kaldet fejler helt (direkte og via proxykæden).
export async function fetchAllPrices() {
  const { pricempireApiKey } = getSettings();
  if (!pricempireApiKey) {
    throw new Error('Ingen Pricempire API-nøgle er indtastet');
  }

  const cached = readCache();
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.prices;
  }

  const directUrl = buildUrl(pricempireApiKey);
  let data;
  try {
    data = await fetchJson(directUrl);
  } catch {
    let lastErr = new Error('Intet direkte kald og ingen proxy virkede');
    let succeeded = false;
    for (const prefix of DEFAULT_PROXY_PREFIXES) {
      try {
        data = await fetchJson(prefix + encodeURIComponent(directUrl));
        succeeded = true;
        break;
      } catch (err) {
        lastErr = err;
      }
    }
    if (!succeeded) throw new Error(`Kunne ikke hente priser (${lastErr.message})`);
  }

  const items = Array.isArray(data) ? data : data?.data ?? [];
  const prices = {};
  for (const item of items) {
    const csfloatPrice = (item.prices || []).find((p) => p.provider_key === 'csfloat');
    if (csfloatPrice?.price != null) {
      prices[item.market_hash_name] = csfloatPrice.price;
    }
  }

  writeCache({ fetchedAt: Date.now(), prices });
  return prices;
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
