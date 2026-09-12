// Beholdning hentet fra "CS2 Investering - Far & Søn" arket.
//
// Profit regnes IKKE ud fra en indtastet købspris pr. kasse (arket havde ikke
// et entydigt tal for det). I stedet bruges jeres egne historiske tal:
// - Far: kassepriser fra første pristjek (2025-01-10) som baseline pr. kasse,
//   og kniven bruger den faktiske anskaffelsespris (købt til 6354,32 + 297,68
//   i gebyrer = 6652 kr).
// - Søn: ingen pr.-kasse baseline findes i arket, så der vises samlet profit
//   siden første logning af porteføljeværdien (2025-01-07, 18280,29 kr).
//
// marketHashName er det navn, CSFloat bruger til at slå varen op.
// paintIndex bruges kun for Doppler-kniven til at ramme den rigtige fase
// (faser bestemmes af paint index, ikke paint seed - 420 = Phase 3 for
// almindelig Doppler, gælder på tværs af knivtyper).

export const PEOPLE = {
  far: {
    label: 'Far',
    subtitle: 'Fars CS2 kasse-investeringer',
    baselineDate: '2025-01-10',
    holdings: [
      { id: 'far-recoil', name: 'Recoil Case', marketHashName: 'Recoil Case', quantity: 1124, baselinePriceDkk: 1.38 },
      { id: 'far-revolution', name: 'Revolution Case', marketHashName: 'Revolution Case', quantity: 536, baselinePriceDkk: 3.12 },
      { id: 'far-dn', name: 'Dreams & Nightmares Case', marketHashName: 'Dreams & Nightmares Case', quantity: 292, baselinePriceDkk: 10.36 },
      { id: 'far-fracture', name: 'Fracture Case', marketHashName: 'Fracture Case', quantity: 494, baselinePriceDkk: 1.89 },
      { id: 'far-gallery', name: 'Gallery Case', marketHashName: 'Gallery Case', quantity: 80, baselinePriceDkk: 5.44 },
      { id: 'far-clutch', name: 'Clutch Case', marketHashName: 'Clutch Case', quantity: 620, baselinePriceDkk: 2.98 },
    ],
    knife: {
      id: 'far-knife',
      name: 'M9 Bayonet | Doppler (Factory New) - Phase 3',
      marketHashName: '★ M9 Bayonet | Doppler (Factory New)',
      paintIndex: 420, // Phase 3 - fast finish-nummer, samme på tværs af Doppler-knive
      quantity: 1,
      baselineTotalDkk: 6652, // faktisk anskaffelsespris: 6354,32 købt + 297,68 i gebyrer
    },
    // Historik til graf: samlet værdi af kasser pr. måned, fra "FAR - MÅNEDSOPGØR".
    valueHistory: [
      { date: '2025-01-10', value: 9733.2 },
      { date: '2025-02-03', value: 10168.28 },
      { date: '2025-02-20', value: 11942.2 },
      { date: '2025-02-22', value: 13159.48 },
      { date: '2025-03-11', value: 11419.88 },
      { date: '2025-04-06', value: 9598.2 },
      { date: '2025-05-08', value: 11006.2 },
      { date: '2025-06-24', value: 11957.06 },
      { date: '2025-07-28', value: 13057.42 },
      { date: '2025-09-26', value: 13621.7 },
      { date: '2025-10-24', value: 11507.54 },
      { date: '2025-10-25', value: 13464.4 },
      { date: '2026-01-27', value: 9769.42 },
      { date: '2026-05-09', value: 12329.32 },
    ],
    // Knivens værdihistorik (separat, fra samme ark).
    knifeValueHistory: [
      { date: '2025-10-26', value: 7241 },
      { date: '2025-11-02', value: 9700 },
      { date: '2025-11-05', value: 7743 },
      { date: '2026-01-27', value: 6200 },
      { date: '2026-05-09', value: 6350 },
    ],
  },
  soen: {
    label: 'Søn',
    subtitle: 'Mine CS2 kasse-investeringer',
    baselineDate: '2025-01-07',
    baselineTotalDkk: 18280.29,
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
        marketHashName: 'Sealed Genesis Terminal',
        defIndex: 5176,
        quantity: 1,
      },
      {
        id: 'soen-deadhand-terminal',
        name: 'Sealed Dead Hand Terminal',
        marketHashName: 'Sealed Dead Hand Terminal',
        defIndex: 5181,
        quantity: 2,
      },
    ],
    // Historik til graf: samlet porteføljeværdi, fra "SØN - MASTER SHEET".
    valueHistory: [
      { date: '2025-01-07', value: 18280.29 },
      { date: '2025-02-04', value: 19912.1 },
      { date: '2025-02-20', value: 22858.96 },
      { date: '2025-02-22', value: 24383.92 },
      { date: '2025-06-25', value: 27938.07 },
      { date: '2025-07-28', value: 30094.15 },
      { date: '2025-10-06', value: 29199.91 },
      { date: '2025-10-23', value: 27593.61 },
      { date: '2025-10-26', value: 26256.35 },
      { date: '2025-12-05', value: 29787.39 },
      { date: '2026-02-20', value: 25938.46 },
      { date: '2026-05-09', value: 27706.07 },
    ],
  },
};
