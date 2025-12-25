// src/lib/youtube.ts

export type YoutubeThumbQuality =
  | 'default' // 120x90
  | 'mqdefault' // 320x180
  | 'hqdefault' // 480x360
  | 'sddefault' // 640x480
  | 'maxresdefault'; // 1280x720

export interface EmbedOptions {
  autoplay?: 0 | 1;
  controls?: 0 | 1;
  modestbranding?: 0 | 1;
  rel?: 0 | 1;
  start?: number; // seconds
}

export interface YoutubePreview {
  valid: boolean;
  id: string | null;
  start: number; // seconds
  watchUrl: string | null;
  embedUrl: string | null;
  thumbnailUrl: string | null;
}

export function isYouTubeUrl(url: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    return (
      host.includes('youtube.com') ||
      host === 'youtu.be' ||
      host.endsWith('.youtube.com')
    );
  } catch {
    return false;
  }
}

export function extractYouTubeId(url: string): string {
  if (!url) return '';
  // khớp nhanh các biến thể phổ biến
  const quick =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
  const m = url.match(quick);
  if (m?.[1]) return m[1];

  // fallback: đọc query v=
  try {
    const u = new URL(url);
    const v = u.searchParams.get('v');
    if (v && v.length === 11) return v;
  } catch {
    /* ignore */
  }
  return '';
}

export function parseStartTimeFromUrl(url: string): number {
  if (!url) return 0;
  const parseTimeToken = (token: string) => {
    // 1h2m3s | 2m3s | 90s | 90
    const h = /(\d+)h/.exec(token)?.[1];
    const m = /(\d+)m/.exec(token)?.[1];
    const s = /(\d+)s?/.exec(token)?.[1];
    let total = 0;
    if (h) total += parseInt(h, 10) * 3600;
    if (m) total += parseInt(m, 10) * 60;
    if (s) {
      total += parseInt(s, 10);
    }
    return total;
  };

  try {
    const u = new URL(url);
    const tQuery = u.searchParams.get('t');
    if (tQuery) return parseTimeToken(tQuery);

    if (u.hash) {
      const tHash = u.hash.replace(/^#/, '');
      const kv = new URLSearchParams(tHash);
      const t = kv.get('t');
      if (t) return parseTimeToken(t);
      if (tHash.startsWith('t=')) return parseTimeToken(tHash.slice(2));
    }
  } catch {
    /* ignore */
  }
  return 0;
}

export function buildWatchUrl(id: string, start = 0): string {
  const url = new URL('https://www.youtube.com/watch');
  url.searchParams.set('v', id);
  if (start > 0) url.searchParams.set('t', `${start}s`);
  return url.toString();
}

/** Trả về link embed https://www.youtube.com/embed/<id>?... */
export function buildEmbedUrl(id: string, opts: EmbedOptions = {}): string {
  const url = new URL(`https://www.youtube.com/embed/${id}`);
  const {
    autoplay = 0,
    controls = 1,
    modestbranding = 1,
    rel = 0,
    start = 0
  } = opts;

  url.searchParams.set('autoplay', String(autoplay));
  url.searchParams.set('controls', String(controls));
  url.searchParams.set('modestbranding', String(modestbranding));
  url.searchParams.set('rel', String(rel));
  if (start > 0) url.searchParams.set('start', String(start));

  return url.toString();
}

export function getThumbnailUrl(
  id: string,
  quality: YoutubeThumbQuality = 'hqdefault'
): string {
  return `https://img.youtube.com/vi/${id}/${quality}.jpg`;
}

export function normalizeYouTubeUrl(url: string): string {
  const id = extractYouTubeId(url);
  const start = parseStartTimeFromUrl(url);
  return id ? buildWatchUrl(id, start) : url;
}

export function getYouTubePreview(
  url: string,
  embedOpts?: EmbedOptions,
  thumbQuality?: YoutubeThumbQuality
): YoutubePreview {
  const id = extractYouTubeId(url);
  const start = parseStartTimeFromUrl(url);

  if (!id) {
    return {
      valid: false,
      id: null,
      start: 0,
      watchUrl: null,
      embedUrl: null,
      thumbnailUrl: null
    };
  }

  return {
    valid: true,
    id,
    start,
    watchUrl: buildWatchUrl(id, start),
    embedUrl: buildEmbedUrl(id, { ...embedOpts, start }),
    thumbnailUrl: getThumbnailUrl(id, thumbQuality ?? 'hqdefault')
  };
}
