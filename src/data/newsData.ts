export interface NewsArticleData {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: 'official' | 'release' | 'gameplay' | 'trailers' | 'leaks';
  isUnconfirmed: boolean;
  thumbnailUrl?: string;
}

export const INITIAL_NEWS_ARTICLES: NewsArticleData[] = [
  {
    id: 'art-rockstar-gta-vi-trailer-1',
    title: 'Grand Theft Auto VI Official Trailer 1 Debut',
    description: 'Rockstar Games officially released Trailer 1 for Grand Theft Auto VI, introducing Lucia and Jason in the state of Leonida.',
    url: 'https://www.rockstargames.com/VI',
    source: 'Rockstar Newswire',
    publishedAt: '2023-12-05T00:00:00.000Z',
    category: 'official',
    isUnconfirmed: false,
    thumbnailUrl: '/images/trailer-1-landscape.jpg',
  },
  {
    id: 'art-rockstar-take-two-earnings-2026',
    title: 'Take-Two Reconfirms GTA VI Fall 2026 Release Window',
    description: 'Take-Two Interactive Software reconfirms Grand Theft Auto VI is scheduled to launch in November 2026 across PlayStation 5 and Xbox Series X|S.',
    url: 'https://www.rockstargames.com/newswire',
    source: 'Rockstar Newswire',
    publishedAt: '2026-05-16T14:00:00.000Z',
    category: 'release',
    isUnconfirmed: false,
    thumbnailUrl: '/images/hero-4k.jpg',
  },
  {
    id: 'art-rockstar-extended-gameplay-preview',
    title: 'Grand Theft Auto VI: An Extended Look Deep Dive',
    description: 'A 26-minute in-depth gameplay feature exploring protagonist dual-control mechanics, criminal syndicates, and Vice City nightlife.',
    url: 'https://www.rockstargames.com/VI/media/videos',
    source: 'Rockstar Newswire',
    publishedAt: '2026-08-27T16:00:00.000Z',
    category: 'gameplay',
    isUnconfirmed: false,
    thumbnailUrl: '/images/extended-look-4k.jpg',
  },
  {
    id: 'art-rockstar-launch-trailer-broadcast',
    title: 'Grand Theft Auto VI Official Launch Trailer',
    description: 'The definitive launch broadcast capturing Lucia and Jason across high-stakes Vice City heists and Leonida frontiers.',
    url: 'https://www.rockstargames.com/VI',
    source: 'Rockstar Newswire',
    publishedAt: '2026-10-15T13:00:00.000Z',
    category: 'trailers',
    isUnconfirmed: false,
    thumbnailUrl: '/images/launch-trailer-4k.jpg',
  },
];
