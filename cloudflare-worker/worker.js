// Lille proxy til CSFloats API, så appen kan hente priser uden at blive
// blokeret af CORS eller CSFloats bot-beskyttelse (som ofte blokerer kendte,
// offentlige CORS-proxyer, men typisk ikke almindelige cloud-funktioner).
//
// Deploy: se README.md i denne mappe.
//
// Bruges sådan fra appen (indtast i "Avanceret: CSFloat-adgang"):
//   https://<dit-worker-navn>.<din-cloudflare-bruger>.workers.dev/?url=
//
// Valgfrit: hvis I har en CSFloat developer-nøgle, kan I sætte den som en
// "secret" på selve denne Worker (se README) i stedet for at indtaste den i
// appen. Så forlader nøglen aldrig Cloudflares servere og ligger ikke i
// browseren hos den, der bruger appen.

export default {
  async fetch(request, env) {
    const incoming = new URL(request.url);

    // Simpelt CORS-preflight-svar
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
      });
    }

    const target = incoming.searchParams.get('url');
    if (!target || !target.startsWith('https://csfloat.com/api/')) {
      return new Response('Kun kald til csfloat.com/api tillades', { status: 400 });
    }

    const headers = {
      // Nogle bot-filtre blokerer requests uden en almindelig browser-agent.
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
      Accept: 'application/json',
    };
    // CSFLOAT_API_KEY er en "secret" I selv sætter på Workeren (se README) -
    // den er ikke i denne kode og ikke synlig for nogen, der bruger appen.
    if (env.CSFLOAT_API_KEY) {
      headers['Authorization'] = env.CSFLOAT_API_KEY;
    }

    const upstream = await fetch(target, { headers });

    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300',
      },
    });
  },
};
