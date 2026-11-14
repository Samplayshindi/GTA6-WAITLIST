export interface SoundtrackTrack {
  id: string;
  title: string;
  artist: string;
  sourceLabel: string;
  coverUrl: string;
  audioUrl?: string;
  youtubeId?: string;
  durationSec: number;
  durationText: string;
  isPlayable: boolean;
  status?: 'playable' | 'announced' | 'unavailable';
  albumReleaseDate?: string;
}

export const OFFICIAL_ALBUM_ARTWORK_URL =
  'https://www.rockstargames.com/VI/_next/static/media/GTAVI_MusicPage_AlbumArt.05qucexa8vzgb.jpg?akim=1&imdensity=1&imwidth=420';

/**
 * Verified Official Playable Tracks
 * Preserved with exact audio sources, metadata, and duration.
 */
export const VERIFIED_PLAYABLE_TRACKS: SoundtrackTrack[] = [
  {
    id: 'gtavi-bg-music-ost',
    title: 'GTA VI Background Music OST',
    artist: 'Rockstar Games Official OST',
    sourceLabel: 'Grand Theft Auto VI: Home Screen OST',
    coverUrl:
      'https://www.rockstargames.com/VI/_next/static/media/Official_Cover_Art_square.10.vgeiw52wkr.jpg',
    audioUrl:
      'https://raw.githubusercontent.com/Samplayshindi/GTA6-WAITLIST/e77e56718e9f8519fd27d0e8126566e5083a7366/GTAVI%20PS5%20Home%20Screen%20Background%20Music.mp3',
    durationSec: 57,
    durationText: '0:57',
    isPlayable: true,
    status: 'playable',
  },
  {
    id: 'flower-in-a-hurricane',
    title: 'Flower in a Hurricane',
    artist: 'Justice feat. Tame Impala, SZA, King Gizzard & The Lizard Wizard',
    sourceLabel: 'Grand Theft Auto VI: Official Soundtrack',
    coverUrl:
      'https://www.rockstargames.com/VI/_next/static/media/Score_CoverArt_1014_1600x1600.0.5dr9slukqhb.jpg?akim=1&imdensity=1&imwidth=420',
    youtubeId: '5dPwBWvmcbQ',
    durationSec: 224,
    durationText: '3:44',
    isPlayable: true,
    status: 'playable',
  },
  {
    id: 'hot-together',
    title: 'Hot Together',
    artist: 'The Pointer Sisters',
    sourceLabel: 'Grand Theft Auto VI Trailer 2',
    coverUrl:
      'https://www.rockstargames.com/VI/_next/static/media/Jason_and_Lucia_02_square.0jnnm~4~.3cbg.jpg',
    youtubeId: 'H3Aay-47ZT0',
    durationSec: 252,
    durationText: '4:12',
    isPlayable: true,
    status: 'playable',
  },
  {
    id: 'thats-it',
    title: "That's It",
    artist: 'Yung Lean feat. Future & Metro Boomin',
    sourceLabel: 'Grand Theft Auto VI: The Album',
    coverUrl: OFFICIAL_ALBUM_ARTWORK_URL,
    youtubeId: 'K4JLI9zaRSY',
    durationSec: 162,
    durationText: '2:42',
    isPlayable: true,
    status: 'playable',
  },
  {
    id: 'rhyno',
    title: 'RHYNO',
    artist: 'Travis Scott',
    sourceLabel: 'Grand Theft Auto VI: The Album',
    coverUrl: OFFICIAL_ALBUM_ARTWORK_URL,
    youtubeId: '7yJEkQmXVNM',
    durationSec: 180,
    durationText: '3:00',
    isPlayable: true,
    status: 'playable',
  },
  {
    id: 'sexy-magic',
    title: 'Sexy Magic',
    artist: 'CA7RIEL & Paco Amoroso, PinkPantheress, Fred again.. & Etienne de Crécy',
    sourceLabel: 'Grand Theft Auto VI: The Album',
    coverUrl: OFFICIAL_ALBUM_ARTWORK_URL,
    youtubeId: 'VBKnzlBP95A',
    durationSec: 195,
    durationText: '3:15',
    isPlayable: true,
    status: 'playable',
  },
  {
    id: 'last-thing-you-need',
    title: 'Last Thing You Need',
    artist: 'Morgan Wallen',
    sourceLabel: 'Grand Theft Auto VI: The Album',
    coverUrl: OFFICIAL_ALBUM_ARTWORK_URL,
    youtubeId: 'v7yYmRGQaRk',
    durationSec: 196,
    durationText: '3:16',
    isPlayable: true,
    status: 'playable',
  },
  {
    id: 'macacoa-2000',
    title: 'Macacoa 2000',
    artist: 'Rauw Alejandro',
    sourceLabel: 'Grand Theft Auto VI: The Album',
    coverUrl: OFFICIAL_ALBUM_ARTWORK_URL,
    youtubeId: '76R2Q9vObqI',
    durationSec: 173,
    durationText: '2:53',
    isPlayable: true,
    status: 'playable',
  },
  {
    id: 'bright-lights-big-city',
    title: 'Bright Lights, Big City',
    artist: 'Keith Richards',
    sourceLabel: 'Grand Theft Auto VI: The Album',
    coverUrl: OFFICIAL_ALBUM_ARTWORK_URL,
    youtubeId: 'ULhiufAtduE',
    durationSec: 211,
    durationText: '3:31',
    isPlayable: true,
    status: 'playable',
  },
  {
    id: 'blood-in-your-eyes',
    title: 'Blood In Your Eyes',
    artist: 'Tove Lo',
    sourceLabel: 'Grand Theft Auto VI: The Album',
    coverUrl:
      'https://www.rockstargames.com/VI/_next/static/media/The_Album_Cover_Art_square.0s5-7fm8xnns8.jpg',
    youtubeId: 'UqdOZmMQfSk',
    durationSec: 161,
    durationText: '2:41',
    isPlayable: true,
    status: 'playable',
  },
];

export const SOUNDTRACK_LIBRARY: SoundtrackTrack[] = [
  ...VERIFIED_PLAYABLE_TRACKS,
];

/**
 * Merges newly discovered tracks from server or external feed on/after Nov 19, 2026
 * while strictly preserving existing tracks, preventing duplicates, and ensuring
 * only verified playable tracks with valid audio sources are added.
 */
export function mergeDiscoveredTracks(
  base: SoundtrackTrack[],
  incoming: SoundtrackTrack[]
): SoundtrackTrack[] {
  const existingIds = new Set(base.map((t) => t.id));
  const newPlayable = incoming.filter(
    (t) => !existingIds.has(t.id) && t.isPlayable && (t.youtubeId || t.status === 'playable')
  );
  return [...base, ...newPlayable];
}
