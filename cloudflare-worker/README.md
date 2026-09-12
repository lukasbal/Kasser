# CSFloat-proxy (Cloudflare Worker)

CSFloats API blokerer nogle gange kald udefra (bot-beskyttelse) - det rammer
især kendte, offentlige CORS-proxyer. Denne lille Cloudflare Worker er jeres
egen proxy, som ikke er på nogen blokeringsliste, og den er gratis at køre
(Cloudflare Workers' gratis niveau tillader 100.000 kald/dag - langt mere end
appen nogensinde bruger).

## Deploy (ca. 5 minutter, ingen kode-erfaring nødvendig)

1. Opret en gratis konto på [dash.cloudflare.com](https://dash.cloudflare.com) (kræver kun en e-mail).
2. I venstremenuen: **Workers & Pages** → **Create** → **Create Worker**.
3. Giv den et navn, fx `kasseskabet-proxy`, og tryk **Deploy** (den deployer en standard-skabelon først - det er OK).
4. Tryk **Edit code**. Slet alt indholdet i editoren, og indsæt hele indholdet af `worker.js` fra denne mappe.
5. Tryk **Deploy** igen (øverst til højre).
6. Du får nu en adresse der ligner `https://kasseskabet-proxy.dit-brugernavn.workers.dev`.

## Brug den i appen

Åbn appen → nederst → **Avanceret: CSFloat-adgang** → indtast:

```
https://kasseskabet-proxy.dit-brugernavn.workers.dev/?url=
```

(husk `/?url=` til sidst - appen sætter selv resten af adressen på). Tryk **Gem og genindlæs**.

## Har I fået en CSFloat developer-nøgle? (anbefalet, mest sikkert)

I stedet for at skrive nøglen ind i selve appen (hvor den ligger i browserens
lokale lager), kan I sætte den som en **secret** direkte på denne Worker - så
forlader den aldrig Cloudflares servere, og ingen der bruger appen kan se den:

1. På Workerens side i Cloudflare-dashboardet: **Settings** → **Variables and Secrets**.
2. Tilføj en ny **Secret** med navnet `CSFLOAT_API_KEY` og værdien er selve nøglen.
3. Gem - Workeren bruger den automatisk fra nu af (koden i `worker.js` tjekker allerede for den).

Med nøglen sat her behøver I ikke også indtaste den i appens "CSFloat
API-nøgle"-felt - lad det stå tomt.

## Hvis den stadig fejler

Hvis I ser en fejl i browserens konsol der nævner jeres worker-adresse med en
403 fra CSFloat, betyder det at Cloudflares egne IP-adresser (som Workers
kører på) også er blokeret hos CSFloat - i så fald skal proxyen køre et andet
sted, fx en gratis Vercel- eller Render-funktion i stedet, som bruger en
anden IP-pulje. Koden i `worker.js` kan genbruges næsten uændret; kun
eksportformatet skal tilpasses den platform, I vælger.
