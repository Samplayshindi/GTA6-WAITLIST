export interface SoundtrackTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  durationSec: number;
  isPlayable: boolean;
}
export const OFFICIAL_ALBUM_ARTWORK_URL = 'https://www.rockstargames.com/VI/_next/static/media/The_Album_Cover_Art_square.0s5-7fm8xnns8.jpg';

export const OFFICIAL_SOUNDTRACK_TRACKS: SoundtrackTrack[] = [
  {
    id: 'track-1',
    title: 'Love Is A Long Road',
    artist: 'Tom Petty',
    coverUrl: OFFICIAL_ALBUM_ARTWORK_URL,
    audioUrl: 'https://youtu.be/1l4vLIsZly4',
    durationSec: 247,
    isPlayable: true,
  },
  {
    id: 'track-2',
    title: 'Vice City Sunset',
    artist: 'Tangerine Dream',
    coverUrl: OFFICIAL_ALBUM_ARTWORK_URL,
    audioUrl: 'https://youtu.be/1l4vLIsZly4',
    durationSec: 210,
    isPlayable: true,
  },
  {
    id: 'track-3',
    title: 'Ocean Drive Neon',
    artist: 'Jan Hammer',
    coverUrl: OFFICIAL_ALBUM_ARTWORK_URL,
    audioUrl: 'https://youtu.be/1l4vLIsZly4',
    durationSec: 195,
    isPlayable: true,
  },
  {
    id: 'track-4',
    title: 'Leonida Keys Ride',
    artist: 'Miami Sound Machine',
    coverUrl: OFFICIAL_ALBUM_ARTWORK_URL,
    audioUrl: 'https://youtu.be/1l4vLIsZly4',
    durationSec: 225,
    isPlayable: true,
  },
  {
    id: 'track-5',
    title: 'Port Gellhorn Beat',
    artist: 'Rick Ross ft. T-Pain',
    coverUrl: OFFICIAL_ALBUM_ARTWORK_URL,
    audioUrl: 'https://youtu.be/1l4vLIsZly4',
    durationSec: 215,
    isPlayable: true,
  },
  {
    id: 'track-6',
    title: 'Swamp Airboat Stomp',
    artist: 'Outkast',
    coverUrl: OFFICIAL_ALBUM_ARTWORK_URL,
    audioUrl: 'https://youtu.be/1l4vLIsZly4',
    durationSec: 230,
    isPlayable: true,
  },
  {
    id: 'track-7',
    title: 'Downtown Nightclub Terrace',
    artist: 'Kavinsky',
    coverUrl: OFFICIAL_ALBUM_ARTWORK_URL,
    audioUrl: 'https://youtu.be/1l4vLIsZly4',
    durationSec: 205,
    isPlayable: true,
  },
  {
    id: 'track-8',
    title: 'Washington Beach Funk',
    artist: 'Kool & The Gang',
    coverUrl: OFFICIAL_ALBUM_ARTWORK_URL,
    audioUrl: 'https://youtu.be/1l4vLIsZly4',
    durationSec: 240,
    isPlayable: true,
  },
  {
    id: 'track-9',
    title: 'Highway 95 Getaway',
    artist: 'Phil Collins',
    coverUrl: OFFICIAL_ALBUM_ARTWORK_URL,
    audioUrl: 'https://youtu.be/1l4vLIsZly4',
    durationSec: 280,
    isPlayable: true,
  },
  {
    id: 'track-10',
    title: 'Blood In Your Eyes',
    artist: 'Tove Lo',
    coverUrl: OFFICIAL_ALBUM_ARTWORK_URL,
    audioUrl: 'https://youtu.be/UqdOZmMQfSk',
    durationSec: 161,
    isPlayable: true,
  },
];

export const SOUNDTRACK_LIBRARY = OFFICIAL_SOUNDTRACK_TRACKS;
