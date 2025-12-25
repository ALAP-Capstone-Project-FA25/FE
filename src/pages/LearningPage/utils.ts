export const getYouTubeVideoId = (url: string): string => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : '';
};

export const formatTime = (s: number) => {
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, '0');
  const ss = Math.floor(s % 60)
    .toString()
    .padStart(2, '0');
  return `${mm}:${ss}`;
};

export const uuid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function mergeRanges(ranges: [number, number][]) {
  const arr = ranges
    .map(([s, e]) => (s <= e ? [s, e] : [e, s]) as [number, number])
    .sort((a, b) => a[0] - b[0]);

  const out: [number, number][] = [];
  for (const r of arr) {
    if (!out.length || r[0] > out[out.length - 1][1] + 2)
      out.push([r[0], r[1]]);
    else out[out.length - 1][1] = Math.max(out[out.length - 1][1], r[1]);
  }
  return out;
}
