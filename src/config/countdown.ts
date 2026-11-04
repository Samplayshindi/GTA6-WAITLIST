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
  canEmbed: boolean;
  buttonText: string;
}

export const OFFICIAL_VIDEOS: GtaVideo[] = [
  {
    id: 'launch-trailer',
    title: 'Grand Theft Auto VI Launch Trailer',
    releaseDate: 'October 15, 2026',
    runtime: '2:45',
    youtubeId: 'rz1B4B2yBZY',
    canEmbed: false,
    officialUrl: 'https://youtu.be/rz1B4B2yBZY',
    description: 'The definitive launch broadcast capturing Lucia and Jason across high-stakes Vice City heists, dynamic weather systems, and the vast frontiers of Leonida on PlayStation 5 and Xbox Series X|S.',
    isFeatured: true,
    thumbnailUrl: '/images/launch-trailer-4k.jpg',
    badge: 'LAUNCH TRAILER · 4K UHD',
    buttonText: 'WATCH VIDEO',
  },
  {
    id: 'extended-look',
    title: 'Grand Theft Auto VI: An Extended Look',
    releaseDate: 'August 27, 2026',
    runtime: '26:48',
    youtubeId: 'tJbzMqJGH4k',
    canEmbed: false,
    officialUrl: 'https://youtu.be/tJbzMqJGH4k',
    description: 'A 26-minute in-depth gameplay deep dive showcasing protagonist dual-control mechanics, criminal syndicates, wildlife simulation in the Gator Keys, and Vice City nightlife.',
    isFeatured: true,
    thumbnailUrl: '/images/extended-look-4k.jpg',
    badge: 'EXTENDED LOOK · 4K UHD',
    buttonText: 'WATCH VIDEO',
  },
  {
    id: 'trailer-2',
    title: 'Grand Theft Auto VI Trailer 2',
    releaseDate: 'May 6, 2025',
    runtime: '2:14',
    youtubeId: 'VQRLujxTm3c',
    canEmbed: false,
    officialUrl: 'https://youtu.be/VQRLujxTm3c',
    description: 'The second official cinematic reveal introducing the expanding syndicate tensions across greater Leonida, criminal factions, and the sun-bleached coastal highways of Vice City.',
    isFeatured: false,
    thumbnailUrl: '/images/trailer-2-4k.jpg',
    badge: 'TRAILER 2 · 4K UHD',
    buttonText: 'WATCH NOW',
  },
  {
    id: 'trailer-1',
    title: 'Grand Theft Auto VI Trailer 1',
    releaseDate: 'December 4, 2023',
    runtime: '1:31',
    youtubeId: 'QdBZY2fkU-0',
    canEmbed: false,
    officialUrl: 'https://youtu.be/QdBZY2fkU-0',
    description: 'The historic record-shattering debut introducing protagonists Lucia and Jason to the world. Soundtracked by Tom Petty - Love Is a Long Road.',
    isFeatured: false,
    thumbnailUrl: '/images/trailer-1-4k.jpg',
    badge: 'TRAILER 1 · 4K UHD',
    buttonText: 'WATCH VIDEO',
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
