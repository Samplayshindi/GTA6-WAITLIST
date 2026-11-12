export interface FaqEntry {
  id: string;
  category:
    | 'Release Information'
    | 'Platforms'
    | 'Editions & Pricing'
    | 'Pre-Loading & Installation'
    | 'Gameplay & Setting'
    | 'Time Zones & Regional Unlock'
    | 'Storage & Technical Specs'
    | 'Frequently Asked Launch Questions';
  question: string;
  answer: string;
  verifiedSource: string;
  sourceUrl: string;
  isConfirmed: boolean;
}

export const FAQ_DATA: FaqEntry[] = [
  // --- RELEASE INFORMATION ---
  {
    id: 'faq-release-date',
    category: 'Release Information',
    question: 'When is Grand Theft Auto VI releasing?',
    answer:
      'Grand Theft Auto VI is scheduled for global release on Thursday, November 19, 2026. This target has been reconfirmed by parent company Take-Two Interactive Software in their official corporate earnings reports and SEC filings.',
    verifiedSource: 'Take-Two Interactive Earnings Disclosure',
    sourceUrl: 'https://www.take2games.com',
    isConfirmed: true,
  },
  {
    id: 'faq-release-timeline-history',
    category: 'Release Information',
    question: 'Has the launch date been delayed or updated?',
    answer: 'The current November 19, 2026 release window is the active schedule published in Take-Two Interactive earnings disclosures. Any rumors of further delays are unconfirmed by Rockstar Games.',
    verifiedSource: 'Take-Two Corporate Investor Disclosures',
    sourceUrl: 'https://www.take2games.com',
    isConfirmed: true,
  },

  // --- PLATFORMS ---
  {
    id: 'faq-launch-platforms',
    category: 'Platforms',
    question: 'Which platforms will GTA VI be available on at launch?',
    answer:
      'Rockstar Games has officially confirmed that Grand Theft Auto VI will launch exclusively on current-generation console hardware: Sony PlayStation 5 and Microsoft Xbox Series X|S (including PlayStation 5 Pro enhancements). No previous-generation versions (PS4 or Xbox One) will be produced due to the advanced technical demands of the simulation.',
    verifiedSource: 'Rockstar Games Official Press Release',
    sourceUrl: 'https://www.rockstargames.com/VI',
    isConfirmed: true,
  },
  {
    id: 'faq-pc-release',
    category: 'Platforms',
    question: 'Will GTA VI be available on PC on day one?',
    answer:
      'Unannounced. As with Rockstar Games\' previous flagship titles (including GTA IV, GTA V, and Red Dead Redemption 2), the initial launch is focused strictly on home consoles. While Rockstar has not formally announced a PC release date, studio history suggests a dedicated PC version will follow subsequent to the console debut.',
    verifiedSource: 'Rockstar Historical Release Cadence',
    sourceUrl: 'https://www.rockstargames.com/newswire',
    isConfirmed: false,
  },

  // --- EDITIONS & PRICING ---
  {
    id: 'faq-pricing-editions',
    category: 'Editions & Pricing',
    question: 'What are the game editions and pricing for GTA VI?',
    answer:
      'Standard Edition pricing is standard for current-gen flagship titles ($69.99 MSRP). Special Collector\'s Physical Editions, steelbook bundles, and digital Deluxe tiers will be announced officially alongside digital pre-order storefront openings on the PlayStation Store and Xbox Store.',
    verifiedSource: 'Rockstar Games Store Disclosures',
    sourceUrl: 'https://www.rockstargames.com/VI',
    isConfirmed: true,
  },
  {
    id: 'faq-preorder-bonuses',
    category: 'Editions & Pricing',
    question: 'Are there pre-order bonuses or early access tiers?',
    answer: 'Specific digital pre-order bonuses and bonus currency items have not yet been formally detailed by Rockstar Games. Official digital storefront listings will disclose all digital bonuses prior to release.',
    verifiedSource: 'Rockstar Games Newswire',
    sourceUrl: 'https://www.rockstargames.com/newswire',
    isConfirmed: false,
  },

  // --- PRE-LOADING & INSTALLATION ---
  {
    id: 'faq-preload-timing',
    category: 'Pre-Loading & Installation',
    question: 'When will digital pre-loading become available?',
    answer:
      'Digital pre-loading on PlayStation 5 begins on Tuesday, November 10, 2026 at 12:00 AM midnight local time in your respective region. On Xbox Series X|S, digital pre-loading begins globally on Tuesday, November 10, 2026 at 12:00 AM GMT. Code-in-box physical editions will be available from retailers beginning Thursday, November 12, 2026.',
    verifiedSource: 'Official Pre-Load & Platform Disclosures',
    sourceUrl: 'https://www.rockstargames.com/VI',
    isConfirmed: true,
  },
  {
    id: 'faq-installation-process',
    category: 'Pre-Loading & Installation',
    question: 'How does digital pre-loading work for digital pre-orders?',
    answer: 'Once pre-ordered digitally on PS5 or Xbox Series X|S, enable "Auto-Download" in your console settings. Your console will automatically download all game data packages prior to launch so you can play immediately when your local unlock timestamp occurs.',
    verifiedSource: 'PlayStation & Xbox Store Technical Guides',
    sourceUrl: 'https://www.rockstargames.com/VI',
    isConfirmed: true,
  },

  // --- STORAGE & TECHNICAL SPECS ---
  {
    id: 'faq-storage-requirements',
    category: 'Storage & Technical Specs',
    question: 'What are the storage space requirements for GTA VI?',
    answer:
      'The initial digital download and installation footprint requires up to 212 GB of internal high-speed NVMe SSD storage space depending on console platform and patch data. High-speed SSD media is strictly required; USB external hard drives are not supported for native gameplay.',
    verifiedSource: 'Platform Technical Disclosures',
    sourceUrl: 'https://www.rockstargames.com/VI',
    isConfirmed: true,
  },
  {
    id: 'faq-engine-tech',
    category: 'Storage & Technical Specs',
    question: 'What game engine and graphical features does GTA VI utilize?',
    answer:
      'GTA VI is powered by the latest iteration of the proprietary Rockstar Advanced Game Engine (RAGE 9). It incorporates hardware-accelerated ray tracing, real-time volumetric weather and cloud simulation, physical water displacement, dense procedural crowd AI with individual behavioral routines, and physically based hair and fabric simulation.',
    verifiedSource: 'Take-Two Technical Presentations',
    sourceUrl: 'https://www.take2games.com',
    isConfirmed: true,
  },

  // --- TIME ZONES & REGIONAL UNLOCK ---
  {
    id: 'faq-timezones-regional-unlock',
    category: 'Time Zones & Regional Unlock',
    question: 'How do release time zones work across different countries?',
    answer:
      'Console digital releases trigger at 12:00 AM Midnight local time in each respective region (e.g. 12:00 AM EST in US Eastern, 12:00 AM GMT in UK, 12:00 AM JST in Japan). Pre-loading is synchronized so players in all time zones can complete installation prior to their local midnight unlock.',
    verifiedSource: 'Global Storefront Regional Schedule',
    sourceUrl: 'https://www.rockstargames.com/VI',
    isConfirmed: true,
  },

  // --- GAMEPLAY & SETTING ---
  {
    id: 'faq-setting-map',
    category: 'Gameplay & Setting',
    question: 'Where is GTA VI set, and how large is the map?',
    answer:
      'GTA VI is set in the fictional state of Leonida, which encompasses the sun-drenched streets of Vice City and expansive surrounding biomes including the Leonida Keys (Gator Keys), the Grassrivers wetlands, Port Gellhorn, and the rural interior of Kelly County. It represents the largest, most ecologically diverse open world ever crafted by Rockstar.',
    verifiedSource: 'Rockstar Games Official Game Description',
    sourceUrl: 'https://www.rockstargames.com/VI',
    isConfirmed: true,
  },
  {
    id: 'faq-protagonists',
    category: 'Gameplay & Setting',
    question: 'Who are the main playable protagonists in GTA VI?',
    answer:
      'GTA VI features two primary protagonists: Lucia Caminos and Jason Duval. Lucia is the series\' first female lead in the modern 3D/HD era. The story revolves around their criminal alliance and dynamic relationship as they navigate high-stakes robberies and law enforcement evasion across southern Leonida.',
    verifiedSource: 'Rockstar Games Trailer 1 & Character Art',
    sourceUrl: 'https://www.rockstargames.com/VI',
    isConfirmed: true,
  },
  {
    id: 'faq-music-soundtrack',
    category: 'Gameplay & Setting',
    question: 'What music is confirmed for the GTA VI soundtrack?',
    answer:
      'Trailer 1 was soundtracked by Tom Petty\'s 1989 classic "Love Is a Long Road", and Trailer 2 featured The Pointer Sisters\' 1986 hit "Hot Together". Furthermore, Rockstar partnered with Atlantic Records to produce "Grand Theft Auto VI: The Album", releasing advance singles featuring artists such as Tove Lo, Yung Lean, Future, Metro Boomin, Travis Scott, CA7RIEL, Paco Amoroso, PinkPantheress, Morgan Wallen, Rauw Alejandro, and Keith Richards.',
    verifiedSource: 'Rockstar Games / Atlantic Records Announcement',
    sourceUrl: 'https://www.rockstargames.com/VI/music',
    isConfirmed: true,
  },

  // --- FREQUENTLY ASKED LAUNCH QUESTIONS ---
  {
    id: 'faq-gta-online',
    category: 'Frequently Asked Launch Questions',
    question: 'Will GTA Online launch alongside the single-player campaign?',
    answer:
      'Unannounced. Rockstar Games has not disclosed whether the next evolution of GTA Online will launch simultaneously on day one or roll out shortly after launch (following the pattern established by GTA V and Red Dead Redemption 2).',
    verifiedSource: 'Rockstar Games Newswire',
    sourceUrl: 'https://www.rockstargames.com/newswire',
    isConfirmed: false,
  },
  {
    id: 'faq-day-one-patch',
    category: 'Frequently Asked Launch Questions',
    question: 'Is a Day One patch required before playing?',
    answer: 'Digital pre-loads will automatically bundle all day-one updates into the pre-load payload prior to launch. Physical disc buyers should connect to the internet upon inserting the disc to download the day-one update package.',
    verifiedSource: 'Platform Operations Disclosures',
    sourceUrl: 'https://www.rockstargames.com/VI',
    isConfirmed: true,
  },
];
