export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  source: string;
  url: string;
  category: 'official' | 'release' | 'gameplay' | 'trailers' | 'leaks';
  isUnconfirmed?: boolean;
}

export const INITIAL_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'Grand Theft Auto VI - Watch Trailer 1 Now',
    description: 'Rockstar Games presents the official first trailer for Grand Theft Auto VI. Welcome to the state of Leonida, home to the neon-lit streets of Vice City and beyond.',
    publishedAt: '2023-12-05',
    source: 'Rockstar Newswire',
    url: 'https://www.rockstargames.com/VI',
    category: 'official',
    isUnconfirmed: false,
  },
  {
    id: 'news-2',
    title: 'Grand Theft Auto VI Coming 2025',
    description: 'Grand Theft Auto VI is coming to PlayStation 5 computer entertainment systems and Xbox Series X|S games and entertainment systems in 2025.',
    publishedAt: '2023-12-04',
    source: 'Take-Two Interactive',
    url: 'https://www.rockstargames.com/newswire',
    category: 'release',
    isUnconfirmed: false,
  },
  {
    id: 'news-3',
    title: 'Introducing Vice City & State of Leonida',
    description: 'Grand Theft Auto VI heads to the state of Leonida, home to the neon-soaked streets of Vice City and beyond in the biggest, most immersive evolution of the Grand Theft Auto series yet.',
    publishedAt: '2023-12-06',
    source: 'Rockstar Newswire',
    url: 'https://www.rockstargames.com/VI',
    category: 'official',
    isUnconfirmed: false,
  }
];
