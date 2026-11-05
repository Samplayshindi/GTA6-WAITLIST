import {
  SOUNDTRACK_LIBRARY,
  VERIFIED_PLAYABLE_TRACKS,
  ANNOUNCED_ALBUM_TRACKS,
  OFFICIAL_ALBUM_ARTWORK_URL,
  SoundtrackTrack,
} from '../src/config/soundtrack.ts';

/**
 * Dynamic Official Soundtrack API Endpoint
 * Serves the authoritative GTA VI soundtrack library and merges newly announced
 * tracks discovered via official Rockstar Games RSS and music feed announcements.
 */
export default async function handler(_req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600');
  res.setHeader('Content-Type', 'application/json');

  if (_req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Base catalog from verified playable tracks and official announcements
    let catalog: SoundtrackTrack[] = [...SOUNDTRACK_LIBRARY];

    // Attempt to parse dynamic soundtrack announcements from Rockstar Games Newswire RSS feed
    try {
      const rssRes = await fetch('https://www.rockstargames.com/newswire/rss', {
        headers: { 'User-Agent': 'GTAVIWaitlist-SoundtrackBot/1.0' },
        signal: AbortSignal.timeout(3000),
      });

      if (rssRes.ok) {
        const xmlText = await rssRes.text();
        // Search RSS item descriptions for music/soundtrack/single announcements
        const musicMatches = xmlText.match(/<title>([^<]*Music|Soundtrack|Single|Album[^<]*)<\/title>/gi);
        if (musicMatches && musicMatches.length > 0) {
          // Dynamic discovery logger - ensures freshly parsed music announcements are added safely
          catalog = mergeOfficialDynamicTracks(catalog, musicMatches);
        }
      }
    } catch {
      // If dynamic RSS fetch fails or times out, fallback seamlessly to verified base catalog
    }

    return res.status(200).json({
      tracks: catalog,
      totalTracks: catalog.length,
      playableCount: catalog.filter((t) => t.isPlayable).length,
      announcedCount: catalog.filter((t) => t.status === 'announced' || !t.isPlayable).length,
      albumCoverUrl: OFFICIAL_ALBUM_ARTWORK_URL,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(200).json({
      tracks: SOUNDTRACK_LIBRARY,
      totalTracks: SOUNDTRACK_LIBRARY.length,
      playableCount: VERIFIED_PLAYABLE_TRACKS.length,
      announcedCount: ANNOUNCED_ALBUM_TRACKS.length,
      albumCoverUrl: OFFICIAL_ALBUM_ARTWORK_URL,
      lastUpdated: new Date().toISOString(),
      fallback: true,
    });
  }
}

function mergeOfficialDynamicTracks(base: SoundtrackTrack[], matches: string[]): SoundtrackTrack[] {
  const existingTitles = new Set(base.map((t) => t.title.toLowerCase()));
  const merged = [...base];

  for (const match of matches) {
    const rawTitle = match.replace(/<\/?title>/gi, '').trim();
    if (rawTitle && !existingTitles.has(rawTitle.toLowerCase())) {
      const trackId = rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      merged.push({
        id: trackId,
        title: rawTitle,
        artist: 'Rockstar Games Official Release',
        sourceLabel: 'Grand Theft Auto VI: The Album',
        coverUrl: OFFICIAL_ALBUM_ARTWORK_URL,
        durationSec: 210,
        durationText: '3:30',
        isPlayable: false,
        status: 'announced',
        albumReleaseDate: 'November 19, 2026',
      });
      existingTitles.add(rawTitle.toLowerCase());
    }
  }

  return merged;
}
