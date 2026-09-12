# Kasseskabet

En lille app til at holde øje med jeres CS2 kasse-investeringer - én visning til Far, én til Søn. Priser hentes automatisk fra [CSFloat](https://csfloat.com)'s offentlige API.

## Sådan virker det

- Antal kasser pr. person er hentet fra jeres Excel-ark og ligger i `src/data/holdings.js`.
- Appen henter den billigste aktive CSFloat-annonce for hver kasse/kniv og regner værdien om til DKK.
- **Profit** regnes ikke ud fra en indtastet købspris (arket havde ikke ét entydigt tal for det pr. kasse). I stedet bruges jeres egne historiske tal:
  - **Far**: kassepriserne fra jeres første pristjek (2025-01-10) som baseline pr. kasse, og kniven bruger den faktiske anskaffelsespris (6354,32 kr. købt + 297,68 kr. i gebyrer = 6652 kr).
  - **Søn**: ingen pr.-kasse baseline findes i arket, så profit vises samlet siden første logning af porteføljeværdien (2025-01-07, 18.280,29 kr).
- Der er en graf over samlet porteføljeværdi over tid, bygget af jeres historiske tal fra arket. Hver gang appen åbnes, gemmes dagens samlede værdi også lokalt i browseren, så grafen fortsætter fremover.
- Fars M9 Bayonet Doppler hentes automatisk som **Phase 3** - Doppler-faser bestemmes af "paint index" (fast pr. fase, ens på tværs af knive), ikke af paint seed, så det kan slås præcist op uden manuel indtastning.

## Hvis priser ikke kan hentes (CORS/403-fejl)

CSFloat sender ikke altid CORS-headers, der tillader kald direkte fra en browser på jeres GitHub Pages-domæne, og deres bot-beskyttelse kan også give et direkte 403 Forbidden. Appen prøver derfor et direkte kald først, og falder automatisk tilbage til en kæde af offentlige CORS-proxyer, hvis det fejler.

Har I fået en CSFloat API-nøgle, kan den indtastes under "Avanceret: CSFloat-adgang" nederst i appen - den sendes kun med på det direkte kald til csfloat.com og gemmes kun lokalt i browseren.

## Kør appen lokalt

```bash
npm install
npm run dev
```

Åbn linket der vises i terminalen (typisk `http://localhost:5173`).

## Læg den på GitHub med GitHub Desktop

1. Åbn GitHub Desktop → **File → Add local repository** → vælg denne mappe.
2. Hvis den spørger om at initialisere et git-repo, sig ja.
3. Skriv en commit-besked (fx "Første version") og tryk **Commit to main**.
4. Tryk **Publish repository** øverst. Du kan vælge om det skal være privat eller offentligt.
5. Gå ind på repoet på github.com → **Settings → Pages** → under "Build and deployment" vælg **Source: GitHub Actions**.
6. Push'et starter automatisk en workflow (fanen **Actions** i repoet), som bygger og lægger appen op. Efter et minuts tid ligger den på `https://<dit-brugernavn>.github.io/<repo-navn>/`.

Fremover: hver gang I laver ændringer og trykker **Commit** + **Push origin** i GitHub Desktop, opdaterer siden sig selv.

### Hvis `.github`-mappen ikke dukker op i GitHub Desktop

Mappen starter med et punktum og er teknisk set skjult i Windows Stifinder, men GitHub Desktop viser og committer den fint alligevel - den behøver ikke være synlig i Stifinder for at blive committet. Tjek under "Changes" i GitHub Desktop, at filerne i `.github/workflows/` er med i den første commit.

## Justere data

- Antal, navne og hvilke varer der findes: `src/data/holdings.js`.
- Hvor ofte priser caches (for at skåne CSFloats API): `src/lib/csfloat.js`, konstanten `CACHE_TTL_MS`.
