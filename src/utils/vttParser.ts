/**
 * W3C WebVTT (.vtt) Parser for YouTube-style Synchronized Captions
 */

export interface VttCue {
  start: number;
  end: number;
  text: string;
}

export function parseVtt(vttContent: string): VttCue[] {
  if (!vttContent) return [];
  const lines = vttContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const cues: VttCue[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.includes('-->')) {
      const parts = line.split('-->');
      const start = parseTimestamp(parts[0].trim());
      const end = parseTimestamp(parts[1].trim().split(' ')[0]);
      i++;
      const textLines: string[] = [];
      while (i < lines.length && lines[i].trim() !== '') {
        // Strip out any VTT formatting tags like <v ...> or <b>
        const clean = lines[i].trim().replace(/<[^>]+>/g, '');
        if (clean) textLines.push(clean);
        i++;
      }
      if (textLines.length > 0 && !isNaN(start) && !isNaN(end)) {
        cues.push({
          start,
          end,
          text: textLines.join(' '),
        });
      }
    }
    i++;
  }
  return cues;
}

function parseTimestamp(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length === 3) {
    const hours = parseFloat(parts[0]);
    const minutes = parseFloat(parts[1]);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
  }
  if (parts.length === 2) {
    const minutes = parseFloat(parts[0]);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  }
  return parseFloat(timeStr) || 0;
}
