import { XMLParser } from 'fast-xml-parser';
import { NewsArticleDB } from './db.ts';

export function isValidGtaViArticle(title: string, description: string): boolean {
  const combined = `${title} ${description}`.toLowerCase();

  // Must explicitly mention GTA 6 / GTA VI / Grand Theft Auto VI or Leonida / Vice City in context
  const hasGtaViKeyword = 
    combined.includes('gta 6') ||
    combined.includes('gta vi') ||
    combined.includes('gta-vi') ||
    combined.includes('grand theft auto 6') ||
    combined.includes('grand theft auto vi') ||
    combined.includes('grand theft auto: vi');

  if (!hasGtaViKeyword) {
    return false;
  }

  // Reject clickbait / unrelated titles / parodies
  const clickbaitNoise = [
    'south park',
    'dog poop',
    'union vote',
    'fan trailer',
    'concept trailer',
    'fan made',
    'modder',
    'fortnite',
    'gta online',
    'gta 5 ',
    'gta v ',
    'red dead',
    'rdr2',
    'rdr 2',
    'roblox',
    'minecraft',
    'call of duty',
    'warzone'
  ];

  if (clickbaitNoise.some((noise) => combined.includes(noise))) {
    return false;
  }

  return true;
}

export function cleanHtmlText(raw: string): string {
  if (!raw) return '';
  return String(raw)
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function generateArticleId(source: string, title: string, url: string): string {
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30);
  const cleanSource = source.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `art-${cleanSource}-${cleanTitle}`;
}

export async function fetchLiveGtaArticles(): Promise<{
  articles: NewsArticleDB[];
  sourceStatus: Record<string, 'ok' | 'error'>;
}> {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const nowIso = new Date().toISOString();

  const feeds = [
    {
      name: 'Google News (GTA VI)',
      url: 'https://news.google.com/rss/search?q=%22GTA+6%22+OR+%22Grand+Theft+Auto+VI%22+OR+%22GTA+VI%22+OR+%22Grand+Theft+Auto+6%22&hl=en-US&gl=US&ceid=US:en'
    },
    {
      name: 'GameSpot',
      url: 'https://www.gamespot.com/feeds/news/'
    },
    {
      name: 'Eurogamer',
      url: 'https://www.eurogamer.net/?format=rss'
    },
    {
      name: 'GamesRadar',
      url: 'https://www.gamesradar.com/rss/'
    },
    {
      name: 'VGC',
      url: 'https://www.videogameschronicle.com/feed/'
    }
  ];

  const results: NewsArticleDB[] = [];
  const sourceStatus: Record<string, 'ok' | 'error'> = {};

  for (const feed of feeds) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(feed.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) GTA6-Newswire-Bot/3.0'
        }
      });
      clearTimeout(timeout);

      if (!res.ok) {
        sourceStatus[feed.name] = 'error';
        continue;
      }

      const xml = await res.text();
      const parsed = parser.parse(xml);
      const channel = parsed?.rss?.channel || parsed?.feed;
      const items = channel?.item || channel?.entry || [];
      const list = Array.isArray(items) ? items : [items];

      for (const item of list) {
        const rawTitle = item.title ? (typeof item.title === 'string' ? item.title : item.title['#text']) : '';
        const title = cleanHtmlText(rawTitle);
        const rawDesc = item.description || item.summary || item['content:encoded'] || '';
        const description = cleanHtmlText(rawDesc);
        
        let articleUrl = feed.url;
        if (typeof item.link === 'string') {
          articleUrl = item.link;
        } else if (item.link?.['@_href']) {
          articleUrl = item.link['@_href'];
        } else if (item.link?.['#text']) {
          articleUrl = item.link['#text'];
        } else if (item.guid) {
          articleUrl = typeof item.guid === 'string' ? item.guid : item.guid['#text'] || feed.url;
        }

        // Determine publisher source
        let articleSource = feed.name;
        if (item.source) {
          if (typeof item.source === 'string') articleSource = item.source;
          else if (item.source['#text']) articleSource = item.source['#text'];
        }

        const pubDateRaw = item.pubDate || item.published || item.updated || nowIso;
        let publishedAt = nowIso;
        try {
          const parsedDate = new Date(pubDateRaw);
          if (!isNaN(parsedDate.getTime())) {
            publishedAt = parsedDate.toISOString();
          }
        } catch {
          // keep nowIso
        }

        if (title.length > 5 && isValidGtaViArticle(title, description)) {
          const combined = `${title.toLowerCase()} ${description.toLowerCase()}`;
          const isUnconfirmed = combined.includes('leak') || combined.includes('rumor') || combined.includes('speculat') || combined.includes('alleged');
          let category: NewsArticleDB['category'] = 'official';
          if (isUnconfirmed) category = 'leaks';
          else if (combined.includes('trailer') || combined.includes('video')) category = 'trailers';
          else if (combined.includes('release') || combined.includes('date') || combined.includes('launch') || combined.includes('window') || combined.includes('preload')) category = 'release';
          else if (combined.includes('gameplay') || combined.includes('map') || combined.includes('mechanic') || combined.includes('physics')) category = 'gameplay';

          let thumbnailUrl = '/official-gta-vi-hero.jpg';
          if (item['media:content']?.['@_url']) thumbnailUrl = item['media:content']['@_url'];
          else if (item['media:thumbnail']?.['@_url']) thumbnailUrl = item['media:thumbnail']['@_url'];
          else if (combined.includes('look') || combined.includes('gameplay')) thumbnailUrl = '/official-gta-vi-cover.png';

          const articleId = generateArticleId(articleSource, title, articleUrl);

          results.push({
            id: articleId,
            title,
            description: description.length > 220 ? description.slice(0, 217) + '...' : description,
            url: articleUrl,
            source: articleSource,
            publishedAt,
            retrievedAt: nowIso,
            category,
            isUnconfirmed,
            thumbnailUrl
          });
        }
      }

      sourceStatus[feed.name] = 'ok';
    } catch {
      sourceStatus[feed.name] = 'error';
    }
  }

  // Deduplicate articles by unique ID or clean title
  const seen = new Set<string>();
  const deduplicated: NewsArticleDB[] = [];

  for (const item of results) {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 35);
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(item);
    }
  }

  // Sort strictly by publishedAt DESC (newest first)
  deduplicated.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return {
    articles: deduplicated,
    sourceStatus
  };
}
