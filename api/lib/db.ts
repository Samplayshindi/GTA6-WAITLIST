import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

export interface NewsArticleDB {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  retrievedAt: string;
  category: 'official' | 'release' | 'gameplay' | 'trailers' | 'leaks';
  isUnconfirmed: boolean;
  thumbnailUrl?: string;
}

export interface NewsMetadataDB {
  lastSuccessfulRefresh: string;
  latestPublishedAt: string;
  sourceStatus: Record<string, 'ok' | 'error'>;
  lastCronExecution?: string;
  lastCronError?: string;
  stale: boolean;
}

const { Pool } = pg;

let pgPool: pg.Pool | null = null;
let supabaseClient: any = null;

export function getDbConnectionInfo() {
  const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

  if (postgresUrl) {
    return { provider: 'postgres', isConfigured: true, url: postgresUrl };
  }
  if (supabaseUrl && supabaseKey) {
    return { provider: 'supabase', isConfigured: true, url: supabaseUrl, key: supabaseKey };
  }

  return {
    provider: 'none',
    isConfigured: false,
    missingEnvVars: ['POSTGRES_URL', 'DATABASE_URL', 'SUPABASE_URL']
  };
}

function getPgPool(): pg.Pool | null {
  const info = getDbConnectionInfo();
  if (info.provider === 'postgres' && info.url) {
    if (!pgPool) {
      pgPool = new Pool({
        connectionString: info.url,
        ssl: info.url.includes('localhost') || info.url.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
      });
    }
    return pgPool;
  }
  return null;
}

function getSupabaseClient(): any {
  const info = getDbConnectionInfo();
  if (info.provider === 'supabase' && info.url && info.key) {
    if (!supabaseClient) {
      supabaseClient = createClient(info.url, info.key);
    }
    return supabaseClient;
  }
  return null;
}

export async function initDatabaseSchema(): Promise<boolean> {
  const pool = getPgPool();
  if (pool) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS gta_news_articles (
          id VARCHAR(255) PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          url TEXT UNIQUE NOT NULL,
          source VARCHAR(100) NOT NULL,
          published_at TIMESTAMPTZ NOT NULL,
          retrieved_at TIMESTAMPTZ NOT NULL,
          category VARCHAR(50) NOT NULL,
          is_unconfirmed BOOLEAN DEFAULT false,
          thumbnail_url TEXT
        );

        CREATE TABLE IF NOT EXISTS gta_news_metadata (
          key VARCHAR(100) PRIMARY KEY,
          value JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );
      `);
      return true;
    } catch (err) {
      console.error('[DB Init Error - Postgres]:', err);
      return false;
    }
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    // Supabase table assumed created or will use RPC/rest
    return true;
  }

  return false;
}

// Memory fallback cache ONLY used when no database credentials are set in environment
const fallbackMemoryStore: {
  articles: NewsArticleDB[];
  metadata: NewsMetadataDB;
} = {
  articles: [],
  metadata: {
    lastSuccessfulRefresh: new Date().toISOString(),
    latestPublishedAt: new Date().toISOString(),
    sourceStatus: {},
    stale: false
  }
};

export async function saveArticlesToDb(articles: NewsArticleDB[]): Promise<boolean> {
  const pool = getPgPool();
  if (pool) {
    try {
      await initDatabaseSchema();
      for (const a of articles) {
        await pool.query(
          `INSERT INTO gta_news_articles 
            (id, title, description, url, source, published_at, retrieved_at, category, is_unconfirmed, thumbnail_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            published_at = EXCLUDED.published_at,
            retrieved_at = EXCLUDED.retrieved_at,
            category = EXCLUDED.category,
            is_unconfirmed = EXCLUDED.is_unconfirmed,
            thumbnail_url = EXCLUDED.thumbnail_url`,
          [
            a.id,
            a.title,
            a.description,
            a.url,
            a.source,
            a.publishedAt,
            a.retrievedAt,
            a.category,
            a.isUnconfirmed,
            a.thumbnailUrl || null
          ]
        );
      }
      return true;
    } catch (err) {
      console.error('[DB Save Articles Error - Postgres]:', err);
      return false;
    }
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const rows = articles.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        url: a.url,
        source: a.source,
        published_at: a.publishedAt,
        retrieved_at: a.retrievedAt,
        category: a.category,
        is_unconfirmed: a.isUnconfirmed,
        thumbnail_url: a.thumbnailUrl
      }));
      await supabase.from('gta_news_articles').upsert(rows, { onConflict: 'id' });
      return true;
    } catch (err) {
      console.error('[DB Save Articles Error - Supabase]:', err);
      return false;
    }
  }

  // Fallback memory update when no DB is configured
  const existingMap = new Map(fallbackMemoryStore.articles.map((a) => [a.id, a]));
  for (const a of articles) {
    existingMap.set(a.id, a);
  }
  fallbackMemoryStore.articles = Array.from(existingMap.values()).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  return false;
}

export async function saveMetadataToDb(metadata: Partial<NewsMetadataDB>): Promise<boolean> {
  const pool = getPgPool();
  if (pool) {
    try {
      await initDatabaseSchema();
      const currentMeta = await getMetadataFromDb();
      const merged: NewsMetadataDB = {
        ...currentMeta,
        ...metadata,
      };

      await pool.query(
        `INSERT INTO gta_news_metadata (key, value, updated_at)
         VALUES ('global_metadata', $1, NOW())
         ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          updated_at = NOW()`,
        [JSON.stringify(merged)]
      );
      return true;
    } catch (err) {
      console.error('[DB Save Metadata Error]:', err);
      return false;
    }
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const currentMeta = await getMetadataFromDb();
      const merged = { ...currentMeta, ...metadata };
      await supabase.from('gta_news_metadata').upsert({ key: 'global_metadata', value: merged, updated_at: new Date().toISOString() });
      return true;
    } catch (err) {
      console.error('[DB Save Metadata Error - Supabase]:', err);
      return false;
    }
  }

  // Memory fallback
  fallbackMemoryStore.metadata = {
    ...fallbackMemoryStore.metadata,
    ...metadata
  };
  return false;
}

export async function getArticlesFromDb(): Promise<NewsArticleDB[]> {
  const pool = getPgPool();
  if (pool) {
    try {
      await initDatabaseSchema();
      const result = await pool.query(
        `SELECT id, title, description, url, source, 
                published_at AS "publishedAt", 
                retrieved_at AS "retrievedAt", 
                category, is_unconfirmed AS "isUnconfirmed", 
                thumbnail_url AS "thumbnailUrl"
         FROM gta_news_articles
         ORDER BY published_at DESC
         LIMIT 50`
      );
      return result.rows.map((row) => ({
        ...row,
        publishedAt: new Date(row.publishedAt).toISOString(),
        retrievedAt: new Date(row.retrievedAt).toISOString()
      }));
    } catch (err) {
      console.error('[DB Get Articles Error - Postgres]:', err);
    }
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('gta_news_articles')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(50);
      if (!error && data) {
        return data.map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          url: row.url,
          source: row.source,
          publishedAt: row.published_at,
          retrievedAt: row.retrieved_at,
          category: row.category,
          isUnconfirmed: row.is_unconfirmed,
          thumbnailUrl: row.thumbnail_url
        }));
      }
    } catch (err) {
      console.error('[DB Get Articles Error - Supabase]:', err);
    }
  }

  return fallbackMemoryStore.articles;
}

export async function getMetadataFromDb(): Promise<NewsMetadataDB> {
  const pool = getPgPool();
  if (pool) {
    try {
      await initDatabaseSchema();
      const result = await pool.query(
        `SELECT value FROM gta_news_metadata WHERE key = 'global_metadata'`
      );
      if (result.rows.length > 0) {
        return result.rows[0].value as NewsMetadataDB;
      }
    } catch (err) {
      console.error('[DB Get Metadata Error - Postgres]:', err);
    }
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('gta_news_metadata').select('value').eq('key', 'global_metadata').single();
      if (!error && data?.value) {
        return data.value as NewsMetadataDB;
      }
    } catch (err) {
      console.error('[DB Get Metadata Error - Supabase]:', err);
    }
  }

  return fallbackMemoryStore.metadata;
}
