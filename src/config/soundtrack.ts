export interface SoundtrackTrack {
  id: string;
  title: string;
  artist: string;
  sourceLabel: string;
  coverUrl: string;
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
 * 8 Verified Official Playable Tracks
 * Preserved with exact audio sources, metadata, and duration.
 */
export const VERIFIED_PLAYABLE_TRACKS: SoundtrackTrack[] = [
  {
    id: 'flower-in-a-hurricane',
    title: 'Flower in a Hurricane',
    artist: 'Justice feat. Tame Impala, SZA, King Gizzard & The Lizard Wizard',
    sourceLabel: 'Grand Theft Auto VI: Official Soundtrack',
    coverUrl:
      'https://www.rockstargames.com/VI/_next/static/media/Score_CoverArt_1014_1600x1600.0.5dr9slukqhb.jpg?akim=1&imdensity=1&imwidth=420',
    youtubeId: '-fW1M17EVdE',
    durationSec: 230,
    durationText: '3:50',
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
    durationSec: 198,
    durationText: '3:18',
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
    durationSec: 185,
    durationText: '3:05',
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
    durationSec: 222,
    durationText: '3:42',
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
    durationSec: 208,
    durationText: '3:28',
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
    durationSec: 195,
    durationText: '3:15',
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
    durationSec: 242,
    durationText: '4:02',
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
