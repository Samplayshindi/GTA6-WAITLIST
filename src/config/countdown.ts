export interface GtaVideo {
  id: string;
  title: string;
  releaseDate: string;
  runtime: string;
  youtubeId: string;
  officialUrl: string;
  description: string;
  isFeatured?: boolean;
  thumbnailUrl: string;
  badge: string;
}

export const OFFICIAL_VIDEOS: GtaVideo[] = [
  {
    id: 'launch-trailer',
    title: 'Grand Theft Auto VI Launch Trailer',
    releaseDate: 'October 15, 2026',
    runtime: '2:45',
    youtubeId: 'QdBZY2fkU-0',
    officialUrl: 'https://www.rockstargames.com/VI/media/videos',
    description: 'The definitive launch broadcast capturing Lucia and Jason across high-stakes Vice City heists, dynamic weather systems, and the vast frontiers of Leonida on PlayStation 5 and Xbox Series X|S.',
    isFeatured: true,
    thumbnailUrl: '/official-gta-vi-hero.jpg',
    badge: 'LAUNCH TRAILER',
  },
  {
    id: 'extended-look',
    title: 'Grand Theft Auto VI: An Extended Look',
    releaseDate: 'August 27, 2026',
    runtime: '26:48',
    youtubeId: 'QdBZY2fkU-0',
    officialUrl: 'https://www.rockstargames.com/VI/media/videos',
    description: 'A 26-minute in-depth gameplay deep dive showcasing protagonist dual-control mechanics, criminal syndicates, wildlife simulation in the Gator Keys, and Vice City nightlife.',
    isFeatured: true,
    thumbnailUrl: '/official-gta-vi-cover.png',
    badge: 'EXTENDED LOOK',
  },
  {
    id: 'trailer-2',
    title: 'Grand Theft Auto VI Trailer 2',
    releaseDate: 'May 6, 2025',
    runtime: '2:14',
    youtubeId: 'QdBZY2fkU-0',
    officialUrl: 'https://www.rockstargames.com/VI/media/videos',
    description: 'The second official cinematic reveal introducing the expanding syndicate tensions across greater Leonida, criminal factions, and the sun-bleached coastal highways of Vice City.',
    isFeatured: false,
    thumbnailUrl: '/official-gta-vi-hero.jpg',
    badge: 'TRAILER 2',
  },
  {
    id: 'trailer-1',
    title: 'Grand Theft Auto VI Trailer 1',
    releaseDate: 'December 4, 2023',
    runtime: '1:31',
    youtubeId: 'QdBZY2fkU-0',
    officialUrl: 'https://www.rockstargames.com/VI/media/videos',
    description: 'The historic record-shattering debut introducing protagonists Lucia and Jason to the world. Soundtracked by Tom Petty - Love Is a Long Road.',
    isFeatured: false,
    thumbnailUrl: 'https://i.ytimg.com/vi/QdBZY2fkU-0/maxresdefault.jpg',
    badge: 'TRAILER 1',
  },
];

export const RELEASE_SPECS = {
  gameTitle: 'Grand Theft Auto VI',
  developer: 'Rockstar North',
  publisher: 'Rockstar Games',
  parentCompany: 'Take-Two Interactive',
  setting: 'State of Leonida (Vice City & Surrounds)',
  platforms: ['PlayStation 5', 'Xbox Series X', 'Xbox Series S'],
  releaseDate: 'November 19, 2026',
  preloadDate: 'November 12, 2026',
  officialWebsite: 'https://www.rockstargames.com/VI',
  videoGalleryUrl: 'https://www.rockstargames.com/VI/media/videos',
  newswireUrl: 'https://www.rockstargames.com/newswire',
};
