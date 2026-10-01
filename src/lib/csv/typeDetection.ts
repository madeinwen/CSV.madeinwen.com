import type { DataType } from '../data/types';

const TRUE_SET = new Set(['true', '1', 'yes', 'y', 't']);
const FALSE_SET = new Set(['false', '0', 'no', 'n', 'f']);

function isMissing(v: unknown): boolean {
  return v === null || v === undefined || (typeof v === 'string' && v.trim() === '');
}

function looksNumber(s: string): boolean {
  if (s.trim() === '') return false;
  // Allow thousands separators and plain floats
  const cleaned = s.replace(/,/g, '').trim();
  if (cleaned === '') return false;
  return /^-?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(cleaned);
}

function looksDate(s: string): boolean {
  const t = s.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return false;
  const d = new Date(t + 'T00:00:00Z');
  return !Number.isNaN(d.getTime());
}

function looksDatetime(s: string): boolean {
  const t = s.trim();
  if (looksDate(t)) return false;
  // ISO-ish datetime
  if (!/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?/.test(t)) return false;
  const d = new Date(t);
  return !Number.isNaN(d.getTime());
}

function looksBoolean(s: string): boolean {
  const t = s.trim().toLowerCase();
  return TRUE_SET.has(t) || FALSE_SET.has(t);
}

export function detectDataType(values: unknown[]): DataType {
  const present = values.filter((v) => !isMissing(v)).map((v) => String(v));
  if (present.length === 0) return 'string';

  // Require high confidence: sample up to 1000 values
  const sample = present.length > 1000 ? present.slice(0, 1000) : present;
  const total = sample.length;

  const count = (fn: (s: string) => boolean) =>
    sample.reduce((acc, s) => (fn(s) ? acc + 1 : acc), 0);

  const nNumber = count(looksNumber);
  const nBool = count(looksBoolean);
  const nDate = count(looksDate);
  const nDatetime = count(looksDatetime);

  // Conservative thresholds: >=95% agreement
  if (nNumber / total >= 0.95) return 'number';
  if (nBool / total >= 0.95) return 'boolean';
  if (nDatetime / total >= 0.95) return 'datetime';
  if (nDate / total >= 0.95) return 'date';

  // Category heuristic: low cardinality string
  const unique = new Set(sample.map((s) => s.trim()));
  if (unique.size <= Math.min(20, Math.max(2, total * 0.05)) && total >= 10) {
    // Only suggest category for short strings
    const avgLen = sample.reduce((a, s) => a + s.length, 0) / total;
    if (avgLen < 32) return 'category';
  }

  return 'string';
}

export function coerceValue(value: unknown, dataType: DataType): unknown {
  if (isMissing(value)) return null;
  const s = String(value).trim();
  try {
    switch (dataType) {
      case 'number': {
        if (!looksNumber(s)) return value;
        return Number(s.replace(/,/g, ''));
      }
      case 'boolean': {
        const t = s.toLowerCase();
        if (TRUE_SET.has(t)) return true;
        if (FALSE_SET.has(t)) return false;
        return value;
      }
      case 'date':
      case 'datetime': {
        const d = new Date(s);
        return Number.isNaN(d.getTime()) ? value : d;
      }
      default:
        return value;
    }
  } catch {
    return value;
  }
}
