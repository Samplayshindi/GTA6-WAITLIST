export interface SoundtrackTrack {
  id: string;
  title: string;
  artist: string;
  sourceLabel: string;
  coverUrl: string;
  youtubeId: string;
  durationSec: number;
  durationText: string;
  spotifyUrl: string;
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
    spotifyUrl: 'https://open.spotify.com/search/Flower%20in%20a%20Hurricane',
    isPlayable: true,
  },
  {
    id: 'hot-together',
    title: 'Hot Together',
    artist: 'The Pointer Sisters',
    sourceLabel: 'Grand Theft Auto VI Trailer 2',
    coverUrl: '/images/hot-together-cover.svg',
    youtubeId: 'a1eL1eR2X_w',
    durationSec: 252,
    durationText: '4:12',
    spotifyUrl: 'https://open.spotify.com/search/The%20Pointer%20Sisters%20Hot%20Together',
    isPlayable: true,
  },
  {
    id: 'thats-it',
    title: "That's It",
    artist: 'Yung Lean feat. Future & Metro Boomin',
    sourceLabel: 'Grand Theft Auto VI: The Album',
    coverUrl: '/images/thats-it-cover.svg',
    youtubeId: '0S0Y2R2bJzM',
    durationSec: 198,
    durationText: '3:18',
    spotifyUrl: 'https://www.rockstargames.com/newswire/article/7599a881942544/announcing-grand-theft-auto-vi-the-album-coming-november-19',
    isPlayable: true,
  },
  {
    id: 'rhyno',
    title: 'RHYNO',
    artist: 'Travis Scott',
    sourceLabel: 'Grand Theft Auto VI: The Album',
    coverUrl: '/images/rhyno-cover.svg',
    youtubeId: 'Xz_aB00k2y4',
    durationSec: 185,
    durationText: '3:05',
    spotifyUrl: 'https://www.rockstargames.com/VI/music/afrobank',
    isPlayable: true,
  },
  {
    id: 'sexy-magic',
    title: 'Sexy Magic',
    artist: 'CA7RIEL & Paco Amoroso, PinkPantheress, Fred again.. & Etienne de Crécy',
    sourceLabel: 'Grand Theft Auto VI: The Album',
    coverUrl: '/images/sexy-magic-cover.svg',
    youtubeId: '9_9vQeX0Zf8',
    durationSec: 222,
    durationText: '3:42',
    spotifyUrl: 'https://www.rockstargames.com/VI/music/afrobank',
    isPlayable: true,
  },
  {
    id: 'last-thing-you-need',
    title: 'Last Thing You Need',
    artist: 'Morgan Wallen',
    sourceLabel: 'Grand Theft Auto VI: The Album',
    coverUrl: '/images/last-thing-you-need-cover.svg',
    youtubeId: '3vY2K_9qZ04',
    durationSec: 208,
    durationText: '3:28',
    spotifyUrl: 'https://www.rockstargames.com/VI/music/afrobank',
    isPlayable: true,
  },
  {
    id: 'macacoa-2000',
    title: 'Macacoa 2000',
    artist: 'Rauw Alejandro',
    sourceLabel: 'Grand Theft Auto VI: The Album',
    coverUrl: '/images/macacoa-2000-cover.svg',
    youtubeId: '7x8M8G81Z58',
    durationSec: 195,
    durationText: '3:15',
    spotifyUrl: 'https://www.rockstargames.com/VI/music/afrobank',
    isPlayable: true,
  },
  {
    id: 'bright-lights-big-city',
    title: 'Bright Lights, Big City',
    artist: 'Keith Richards',
    sourceLabel: 'Grand Theft Auto VI: The Album',
    coverUrl: '/images/bright-lights-big-city-cover.svg',
    youtubeId: '2xZ9P_6kQ28',
    durationSec: 242,
    durationText: '4:02',
    spotifyUrl: 'https://www.rockstargames.com/VI/music/afrobank',
    isPlayable: true,
  },
];
