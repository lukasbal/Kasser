// Beholdning hentet fra "CS2 Investering - Far & Søn" arket.
// Antal er taget direkte fra arket. Snit-købspris er IKKE udfyldt automatisk,
// fordi arket ikke indeholder en entydig gennemsnits-anskaffelsespris pr. kasse
// (kun en handelslog + et øjebliksbillede af markedsværdi). Indtast jeres egne
// købspriser i appen (gemmes i browserens localStorage) for at se profit.
//
// marketHashName er det navn, CSFloat bruger til at slå varen op. Nogle er
// markeret unresolved: true, fordi navnet i arket ikke matcher en kendt,
// officiel CS2-kasse - ret dem her, hvis I kender det rigtige navn.

export const PEOPLE = {
  far: {
    label: 'Far',
    subtitle: "Fars CS2 kasse-investeringer",
    holdings: [
      { id: 'far-recoil', name: 'Recoil Case', marketHashName: 'Recoil Case', quantity: 1124 },
      { id: 'far-revolution', name: 'Revolution Case', marketHashName: 'Revolution Case', quantity: 536 },
      { id: 'far-dn', name: 'Dreams & Nightmares Case', marketHashName: 'Dreams & Nightmares Case', quantity: 292 },
      { id: 'far-fracture', name: 'Fracture Case', marketHashName: 'Fracture Case', quantity: 494 },
      { id: 'far-gallery', name: 'Gallery Case', marketHashName: 'Gallery Case', quantity: 80 },
      { id: 'far-clutch', name: 'Clutch Case', marketHashName: 'Clutch Case', quantity: 620 },
    ],
    knife: {
      id: 'far-knife',
      name: 'M9 Bayonet | Doppler (Factory New) - Phase 3',
      marketHashName: '★ M9 Bayonet | Doppler (Factory New)',
      quantity: 1,
      note: 'Doppler-fase (Phase 3) kan ikke slås entydigt op via CSFloats almindelige søgning (kræver paint seed-filter for fasen), så prisen for kniven skal indtastes manuelt.',
      manualPriceOnly: true,
    },
  },
  soen: {
    label: 'Søn',
    subtitle: 'Mine CS2 kasse-investeringer',
    holdings: [
      { id: 'soen-cs20', name: 'CS20 Case', marketHashName: 'CS20 Case', quantity: 193 },
      { id: 'soen-chroma2', name: 'Chroma 2 Case', marketHashName: 'Chroma 2 Case', quantity: 40 },
      { id: 'soen-chroma3', name: 'Chroma 3 Case', marketHashName: 'Chroma 3 Case', quantity: 17 },
      { id: 'soen-chroma', name: 'Chroma Case', marketHashName: 'Chroma Case', quantity: 30 },
      { id: 'soen-clutch', name: 'Clutch Case', marketHashName: 'Clutch Case', quantity: 142 },
      { id: 'soen-dangerzone', name: 'Danger Zone Case', marketHashName: 'Danger Zone Case', quantity: 78 },
      { id: 'soen-dn', name: 'Dreams & Nightmares Case', marketHashName: 'Dreams & Nightmares Case', quantity: 194 },
      { id: 'soen-falchion', name: 'Falchion Case', marketHashName: 'Falchion Case', quantity: 69 },
      { id: 'soen-fracture', name: 'Fracture Case', marketHashName: 'Fracture Case', quantity: 203 },
      { id: 'soen-gallery', name: 'Gallery Case', marketHashName: 'Gallery Case', quantity: 66 },
      { id: 'soen-gamma2', name: 'Gamma 2 Case', marketHashName: 'Gamma 2 Case', quantity: 52 },
      { id: 'soen-gamma', name: 'Gamma Case', marketHashName: 'Gamma Case', quantity: 20 },
      { id: 'soen-glove', name: 'Glove Case', marketHashName: 'Glove Case', quantity: 21 },
      { id: 'soen-horizon', name: 'Horizon Case', marketHashName: 'Horizon Case', quantity: 201 },
      { id: 'soen-kilowatt', name: 'Kilowatt Case', marketHashName: 'Kilowatt Case', quantity: 19 },
      { id: 'soen-breakout', name: 'Operation Breakout Weapon Case', marketHashName: 'Operation Breakout Weapon Case', quantity: 21 },
      { id: 'soen-brokenfang', name: 'Operation Broken Fang Case', marketHashName: 'Operation Broken Fang Case', quantity: 39 },
      { id: 'soen-phoenix', name: 'Operation Phoenix Weapon Case', marketHashName: 'Operation Phoenix Weapon Case', quantity: 14 },
      { id: 'soen-riptide', name: 'Operation Riptide Case', marketHashName: 'Operation Riptide Case', quantity: 39 },
      { id: 'soen-vanguard', name: 'Operation Vanguard Weapon Case', marketHashName: 'Operation Vanguard Weapon Case', quantity: 6 },
      { id: 'soen-wildfire', name: 'Operation Wildfire Case', marketHashName: 'Operation Wildfire Case', quantity: 31 },
      { id: 'soen-prisma2', name: 'Prisma 2 Case', marketHashName: 'Prisma 2 Case', quantity: 60 },
      { id: 'soen-prisma', name: 'Prisma Case', marketHashName: 'Prisma Case', quantity: 75 },
      { id: 'soen-recoil', name: 'Recoil Case', marketHashName: 'Recoil Case', quantity: 248 },
      { id: 'soen-revolution', name: 'Revolution Case', marketHashName: 'Revolution Case', quantity: 130 },
      { id: 'soen-revolver', name: 'Revolver Case', marketHashName: 'Revolver Case', quantity: 25 },
      { id: 'soen-shadow', name: 'Shadow Case', marketHashName: 'Shadow Case', quantity: 38 },
      { id: 'soen-shatteredweb', name: 'Shattered Web Case', marketHashName: 'Shattered Web Case', quantity: 12 },
      { id: 'soen-snakebite', name: 'Snakebite Case', marketHashName: 'Snakebite Case', quantity: 286 },
      { id: 'soen-spectrum2', name: 'Spectrum 2 Case', marketHashName: 'Spectrum 2 Case', quantity: 32 },
      { id: 'soen-spectrum', name: 'Spectrum Case', marketHashName: 'Spectrum Case', quantity: 24 },
      {
        id: 'soen-genesis-terminal',
        name: 'Sealed Genesis Terminal',
        marketHashName: null,
        quantity: 1,
        unresolved: true,
        note: 'Kunne ikke genkendes som en officiel CS2-kasse ud fra navnet i arket. Ret marketHashName i src/data/holdings.js, så den kan slås op.',
      },
      {
        id: 'soen-deadhand-terminal',
        name: 'Sealed Dead Hand Terminal',
        marketHashName: null,
        quantity: 2,
        unresolved: true,
        note: 'Kunne ikke genkendes som en officiel CS2-kasse ud fra navnet i arket. Ret marketHashName i src/data/holdings.js, så den kan slås op.',
      },
    ],
  },
};
