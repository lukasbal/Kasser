# Kasseskabet

En lille app til at holde øje med jeres CS2 kasse-investeringer - én visning til Far, én til Søn. Priser hentes automatisk fra [CSFloat](https://csfloat.com)'s offentlige API.

## Sådan virker det

- Antal kasser pr. person er hentet fra jeres Excel-ark og ligger i `src/data/holdings.js`.
- Appen henter den billigste aktive CSFloat-annonce for hver kasse og regner værdien om til DKK.
- I skal selv indtaste jeres gennemsnitlige **købspris pr. stk.** i tabellen for at se profit - arket havde ikke et entydigt tal for det. Det gemmes automatisk i browseren (så det er der næste gang, men kun på den computer/browser).
- To varer kunne appen ikke slå op automatisk:
  - Fars M9 Bayonet Doppler (Phase 3) - Doppler-faser kan ikke findes præcist via CSFloats almindelige søgning, så prisen skal indtastes manuelt.
  - Sønnens "Sealed Genesis Terminal" og "Sealed Dead Hand Terminal" - navnene matchede ikke en kendt CS2-kasse. Ret `marketHashName` i `src/data/holdings.js`, hvis I finder det rigtige navn, så bliver de også hentet automatisk.

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
