export interface CountdownConfig {
  officialReleaseDate: string; // ISO 8601 string or Date parseable
  preloadEstimatedDate: string; // ISO 8601 string
  timezone: string; // Configured target timezone
  timezoneDisplay: string;
}

export const COUNTDOWN_CONFIG: CountdownConfig = {
  // Official release target: November 19, 2026 00:00:00 America/New_York (EST)
  officialReleaseDate: '2026-11-19T00:00:00-05:00',
  // Preload placeholder: December 15, 2026 12:00:00 AM America/New_York (EST)
  // Note: Unconfirmed placeholder estimate
  preloadEstimatedDate: '2026-12-15T00:00:00-05:00',
  timezone: 'America/New_York',
  timezoneDisplay: 'EST (Eastern Standard Time)',
};

export const TRAILERS_DATA = [
  {
    id: 'trailer-1',
    title: 'Grand Theft Auto VI Trailer 1',
    releaseDate: 'December 5, 2023',
    youtubeId: 'QdBZY2fkU-0',
    youtubeUrl: 'https://www.youtube.com/watch?v=QdBZY2fkU-0',
    description: 'Our first official look at the state of Leonida, Vice City, and protagonists Lucia and Jason. Soundtracked by Tom Petty - Love Is a Long Road.',
    duration: '1:31',
    viewCount: '215M+ Views',
    isOfficial: true,
  },
  {
    id: 'trailer-2',
    title: 'Grand Theft Auto VI Trailer 2',
    releaseDate: 'Pending Official Announcement',
    youtubeId: '',
    youtubeUrl: 'https://www.rockstargames.com/VI',
    description: 'Upcoming second official trailer from Rockstar Games. Awaiting official premiere date.',
    duration: 'TBA',
    viewCount: 'Awaiting Premiere',
    isOfficial: true,
    isUpcoming: true,
  }
];

export const RELEASE_SPECS = {
  gameTitle: 'Grand Theft Auto VI',
  developer: 'Rockstar North',
  publisher: 'Rockstar Games',
  parentCompany: 'Take-Two Interactive',
  setting: 'State of Leonida (Vice City & Surrounds)',
  platforms: ['PlayStation 5', 'Xbox Series X', 'Xbox Series S'],
  engine: 'Rockstar Advanced Game Engine (RAGE 9)',
  rating: 'Rating Pending (Expected ESRB M / PEGI 18)',
  officialWebsite: 'https://www.rockstargames.com/VI',
  newswireUrl: 'https://www.rockstargames.com/newswire',
};
