export interface FaqEntry {
  id: string;
  category: 'Release Information' | 'Platforms' | 'PC Availability' | 'Gameplay & Setting' | 'Music & Audio' | 'Technical & Visuals' | 'Editions & Preorders';
  question: string;
  answer: string;
  verifiedSource: string;
  sourceUrl: string;
}

export const FAQ_DATA: FaqEntry[] = [
  {
    id: 'faq-release-date',
    category: 'Release Information',
    question: 'When is Grand Theft Auto VI releasing?',
    answer: 'Grand Theft Auto VI is scheduled for global release on Thursday, November 19, 2026. This target has been reconfirmed by parent company Take-Two Interactive Software in their official corporate earnings reports and SEC filings.',
    verifiedSource: 'Take-Two Interactive Earnings Disclosure',
    sourceUrl: 'https://www.take2games.com',
  },
  {
    id: 'faq-preload-timing',
    category: 'Release Information',
    question: 'When will digital pre-loading become available, and how large is the download?',
    answer: 'Digital pre-loading on PlayStation 5 begins on Tuesday, November 10, 2026 at midnight local time in your respective time zone. On Xbox Series X|S, digital pre-loading begins globally on Tuesday, November 10, 2026 at 12 a.m. GMT. The pre-load file requires up to 212 GB of high-speed NVMe SSD storage depending on your platform and device. Physical code-in-box editions will be available from retailers beginning Thursday, November 12, 2026.',
    verifiedSource: 'Official Pre-Load & Platform Disclosures',
    sourceUrl: 'https://www.rockstargames.com/VI',
  },
  {
    id: 'faq-launch-platforms',
    category: 'Platforms',
    question: 'Which platforms will GTA VI be available on at launch?',
    answer: 'Rockstar Games has officially confirmed that Grand Theft Auto VI will launch exclusively on current-generation console hardware: Sony PlayStation 5 and Microsoft Xbox Series X|S. No previous-generation versions (PS4 or Xbox One) will be produced due to the advanced technical demands of the simulation.',
    verifiedSource: 'Rockstar Games Official Press Release',
    sourceUrl: 'https://www.rockstargames.com/VI',
  },
  {
    id: 'faq-pc-release',
    category: 'PC Availability',
    question: 'Will GTA VI be available on PC on day one?',
    answer: 'No. As with Rockstar Games\' previous flagship titles (including GTA IV, GTA V, and Red Dead Redemption 2), the initial launch is focused strictly on home consoles. While Rockstar has not officially confirmed a PC release date, historic studio cadence suggests a dedicated PC version will follow subsequent to the console debut once platform-specific optimization is complete.',
    verifiedSource: 'Rockstar Historical Release Cadence',
    sourceUrl: 'https://www.rockstargames.com/newswire',
  },
  {
    id: 'faq-setting-map',
    category: 'Gameplay & Setting',
    question: 'Where is GTA VI set, and how large is the map?',
    answer: 'GTA VI is set in the fictional state of Leonida, which encompasses the sun-drenched streets of Vice City and expansive surrounding biomes including the Leonida Keys (Gator Keys), the Grassrivers wetlands, Port Gellhorn, and the rural interior of Kelly County. It represents the largest, most ecologically diverse open world ever crafted by Rockstar.',
    verifiedSource: 'Rockstar Games Official Game Description',
    sourceUrl: 'https://www.rockstargames.com/VI',
  },
  {
    id: 'faq-protagonists',
    category: 'Gameplay & Setting',
    question: 'Who are the main playable protagonists in GTA VI?',
    answer: 'GTA VI features two primary protagonists: Lucia Caminos and Jason Duval. Lucia is the series\' first female lead in the modern 3D/HD era. The story revolves around their criminal alliance and dynamic relationship as they navigate high-stakes robberies and law enforcement evasion across southern Leonida.',
    verifiedSource: 'Rockstar Games Trailer 1 & Character Art',
    sourceUrl: 'https://www.rockstargames.com/VI',
  },
  {
    id: 'faq-music-soundtrack',
    category: 'Music & Audio',
    question: 'What music is confirmed for the GTA VI soundtrack?',
    answer: 'Trailer 1 was soundtracked by Tom Petty\'s 1989 classic "Love Is a Long Road", and Trailer 2 featured The Pointer Sisters\' 1986 hit "Hot Together". Furthermore, Rockstar partnered with Atlantic Records to produce "Grand Theft Auto VI: The Album", releasing advance singles featuring artists such as Yung Lean, Future, Metro Boomin, Travis Scott, CA7RIEL, Paco Amoroso, PinkPantheress, Morgan Wallen, Rauw Alejandro, and Keith Richards.',
    verifiedSource: 'Rockstar Games / Atlantic Records Announcement',
    sourceUrl: 'https://www.rockstargames.com/VI/music',
  },
  {
    id: 'faq-engine-tech',
    category: 'Technical & Visuals',
    question: 'What game engine and graphical features does GTA VI utilize?',
    answer: 'GTA VI is powered by the latest iteration of the proprietary Rockstar Advanced Game Engine (RAGE 9). It incorporates hardware-accelerated ray tracing, real-time volumetric weather and cloud simulation, physical water displacement, dense procedural crowd AI with individual behavioral routines, and physically based hair and fabric simulation.',
    verifiedSource: 'Take-Two Technical Presentations',
    sourceUrl: 'https://www.take2games.com',
  },
  {
    id: 'faq-editions-preorders',
    category: 'Editions & Preorders',
    question: 'Have pre-orders and collector\'s editions been announced yet?',
    answer: 'Official pre-orders, pricing tiers, and special collector\'s physical editions have not yet been formally opened by Rockstar Games. Official digital storefront listings and retailer pre-orders will be announced closer to the promotional launch campaign.',
    verifiedSource: 'Rockstar Games Newswire',
    sourceUrl: 'https://www.rockstargames.com/newswire',
  },
];
