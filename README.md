# Fars kasse-portefølje

Én selvstændig HTML-fil. Ingen build, ingen server, ingen GitHub Actions.

## Hvordan priser hentes

Ved åbning beder siden om en **CSFloat API-nøgle** (find/opret én under "Developer" på
csfloat.com/profile). Nøglen bruges direkte fra browseren til at kalde CSFloat's officielle
API (`https://csfloat.com/api/v1/listings`) og hentes ikke via nogen mellemmand.

**Nøglen gemmes ingen steder** — ikke i en fil, ikke i localStorage, ikke i cookies. Den
lever kun i sidens hukommelse, mens den er åben, og skal tastes ind igen næste gang siden
åbnes. Kun de beregnede kroneværdier (til grafen) gemmes lokalt i browseren — aldrig nøglen.

## Hvis en pris ikke hentes korrekt

Doppler-kniven matches på wear (fx "Factory New") — ikke den præcise fase, da faser ikke er
en del af Steams navngivning. Ret linjen markeret `KNIFE` øverst i filen, hvis kniven har en
anden wear.

Antal af hver kasse står i `HOLDINGS` øverst i filen — ret dem der, hvis beholdningen ændrer sig.

## Hoste gratis (GitHub Pages)

1. Læg `index.html` i repoet, commit, push
2. Settings → Pages → Deploy from branch → `main` / root
3. Siden er klar på `https://<bruger>.github.io/<repo>/`

## Kør lokalt

Åbn `index.html` direkte i en browser, eller:

```bash
python3 -m http.server 8000
```
