# Kasseskabet

En lille app til at holde øje med jeres CS2 kasse-investeringer - én visning til Far, én til Søn. Priser hentes fra [Pricempire](https://pricempire.com)'s developer-API, filtreret til CSFloat-priser.

## Sådan virker det

- Antal kasser pr. person er hentet fra jeres Excel-ark og ligger i `src/data/holdings.js`.
- Appen henter alle priser i ét samlet kald og regner værdien om til DKK.
- **Profit** regnes ikke ud fra en indtastet købspris (arket havde ikke ét entydigt tal for det pr. kasse). I stedet bruges jeres egne historiske tal:
  - **Far**: kassepriserne fra jeres første pristjek (2025-01-10) som baseline pr. kasse, og kniven bruger den faktiske anskaffelsespris (6354,32 kr. købt + 297,68 kr. i gebyrer = 6652 kr).
  - **Søn**: ingen pr.-kasse baseline findes i arket, så profit vises samlet siden første logning af porteføljeværdien (2025-01-07, 18.280,29 kr).
- Der er en graf over samlet porteføljeværdi over tid, bygget af jeres historiske tal fra arket. Hver gang appen åbnes, gemmes dagens samlede værdi også lokalt i browseren, så grafen fortsætter fremover.
- Fars M9 Bayonet Doppler (Phase 3) skal indtastes manuelt - Pricempire har kun én pris pr. Steam-varenavn og kan derfor ikke skelne mellem Doppler-faser.

## API-nøgle

Appen kræver en gratis Pricempire API-nøgle:

1. Opret en gratis konto på [pricempire.com](https://pricempire.com).
2. Under abonnement, vælg den gratis **Trader**-plan (ingen betalingskort krævet, 30.000 kald/måned).
3. Find din API-nøgle under din konto/API-sektion.
4. Åbn appen → nederst → **Avanceret: Pricempire-adgang** → indtast nøglen → **Gem og genindlæs**.

Nøglen gemmes kun lokalt i browseren, aldrig i selve appens kode/git.

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
- Hvor ofte priser caches: `src/lib/pricempire.js`, konstanten `CACHE_TTL_MS`.
