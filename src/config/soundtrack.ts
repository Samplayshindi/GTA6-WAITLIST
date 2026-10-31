export interface SoundtrackTrack {
  id: string;
  title: string;
  artist: string;
  sourceLabel: string;
  coverUrl: string;
  youtubeId: string;
  durationSec: number;
  durationText: string;
  isPlayable: boolean;
}

export const SOUNDTRACK_LIBRARY: SoundtrackTrack[] = [
  {
    id: 'flower-in-a-hurricane',
    title: 'Flower in a Hurricane',
    artist: 'Justice feat. Tame Impala, SZA, King Gizzard & The Lizard Wizard',
    sourceLabel: 'Grand Theft Auto VI: Official Soundtrack',
    coverUrl: '/images/flower-in-a-hurricane-cover.svg',
    youtubeId: '-fW1M17EVdE',
    durationSec: 230,
    durationText: '3:50',
    isPlayable: true,
  },
  {
    id: 'hot-together',
    title: 'Hot Together',
    artist: 'The Pointer Sisters',
    sourceLabel: 'Grand Theft Auto VI Trailer 2',
    coverUrl: '/images/hot-together-cover.svg',
    youtubeId: 'CuJARUO_4VA',
    durationSec: 252,
    durationText: '4:12',
    isPlayable: true,
  },
  {
    id: 'thats-it',
    title: "That's It",
    artist: 'Yung Lean feat. Future & Metro Boomin',
    sourceLabel: 'Grand Theft Auto VI: The Album',
    coverUrl: '/images/thats-it-cover.svg',
    youtubeId: 'K4JLI9zaRSY',
    durationSec: 198,
    durationText: '3:18',
    isPlayable: true,
  },
  {
    id: 'rhyno',
    title: 'RHYNO',
    artist: 'Travis Scott',
    sourceLabel: 'Grand Theft Auto VI: The Album',
    coverUrl: '/images/rhyno-cover.svg',
    youtubeId: '7yJEkQmXVNM',
    durationSec: 185,
    durationText: '3:05',
    isPlayable: true,
  },
  {
    id: 'sexy-magic',
    title: 'Sexy Magic',
    artist: 'CA7RIEL & Paco Amoroso, PinkPantheress, Fred again.. & Etienne de Crécy',
    sourceLabel: 'Grand Theft Auto VI: The Album',
    coverUrl: '/images/sexy-magic-cover.svg',
    youtubeId: 'VBKnzlBP95A',
    durationSec: 222,
    durationText: '3:42',
    isPlayable: true,
  },
  {
    id: 'last-thing-you-need',
    title: 'Last Thing You Need',
    artist: 'Morgan Wallen',
    sourceLabel: 'Grand Theft Auto VI: The Album',
    coverUrl: '/images/last-thing-you-need-cover.svg',
    youtubeId: 'v7yYmRGQaRk',
    durationSec: 208,
    durationText: '3:28',
    isPlayable: true,
  },
  {
    id: 'macacoa-2000',
    title: 'Macacoa 2000',
    artist: 'Rauw Alejandro',
    sourceLabel: 'Grand Theft Auto VI: The Album',
    coverUrl: '/images/macacoa-2000-cover.svg',
    youtubeId: '76R2Q9vObqI',
    durationSec: 195,
    durationText: '3:15',
    isPlayable: true,
  },
  {
    id: 'bright-lights-big-city',
    title: 'Bright Lights, Big City',
    artist: 'Keith Richards',
    sourceLabel: 'Grand Theft Auto VI: The Album',
    coverUrl: '/images/bright-lights-big-city-cover.svg',
    youtubeId: 'ULhiufAtduE',
    durationSec: 242,
    durationText: '4:02',
    isPlayable: true,
  },
];
