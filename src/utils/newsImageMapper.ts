export const OFFICIAL_GTA_IMAGE_CATALOG = [
  {
    key: 'character',
    url: '/official-gta-vi-hero.jpg',
    keywords: ['lucia', 'jason', 'protagonist', 'character', 'cast', 'actor', 'motion capture', 'dual', 'couple', 'syndicate']
  },
  {
    key: 'cover',
    url: '/official-gta-vi-cover.png',
    keywords: ['rockstar', 'announcement', 'official', 'statement', 'box art', 'cover', 'story', 'narrative', 'take-two', 'earnings']
  },
  {
    key: 'gameplay',
    url: '/images/extended-look-4k.jpg',
    keywords: ['gameplay', 'extended look', 'deep dive', 'mechanics', 'crowd', 'simulation', 'physics', 'rage', 'engine', 'ps5', 'xbox']
  },
  {
    key: 'trailer',
    url: '/images/launch-trailer-4k.jpg',
    keywords: ['trailer', 'launch', 'cinematic', 'video', 'broadcast', 'reveal', 'teaser', 'watch', 'youtube']
  },
  {
    key: 'nightlife',
    url: '/images/vice-city-style-4k.jpg',
    keywords: ['nightlife', 'ocean drive', 'club', 'radio', 'station', 'soundtrack', 'music', 'synth', 'tom petty', 'audio', 'vinyl']
  },
  {
    key: 'vehicle',
    url: '/images/grotti-cheetah-4k.jpg',
    keywords: ['vehicle', 'car', 'cheetah', 'grotti', 'supercar', 'driving', 'automotive', 'highway', 'chase', 'police', 'traffic']
  },
  {
    key: 'waterways',
    url: '/images/squalo-speedboat-4k.jpg',
    keywords: ['gator keys', 'waterway', 'speedboat', 'squalo', 'boat', 'maritime', 'ecology', 'wildlife', 'alligator', 'florida', 'map']
  },
  {
    key: 'cityscape',
    url: '/images/vice-city-pack-4k.jpg',
    keywords: ['vice city', 'leonida', 'city', 'beach', 'palms', 'open world', 'scale', 'landmass', 'architecture', 'downtown']
  },
  {
    key: 'preload',
    url: '/images/hero-4k.jpg',
    keywords: ['preload', 'download', 'storage', 'gb', 'size', 'release', 'launch date', 'window', 'schedule', 'marketwatch', 'forbes']
  }
];

export function getDeterministicArticleImage(title: string, description: string = ''): string {
  const combined = `${title} ${description}`.toLowerCase();

  for (const item of OFFICIAL_GTA_IMAGE_CATALOG) {
    if (item.keywords.some((kw) => combined.includes(kw))) {
      return item.url;
    }
  }

  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % OFFICIAL_GTA_IMAGE_CATALOG.length;
  return OFFICIAL_GTA_IMAGE_CATALOG[index].url;
}
