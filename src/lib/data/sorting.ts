import type { ColumnDefinition, DataType } from './types';

export type SortDirection = 'asc' | 'desc' | null;

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return Number.isNaN(v) ? null : v;
  if (typeof v === 'string') {
    const n = Number(v.replace(/,/g, '').trim());
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

function toTime(v: unknown): number | null {
  if (v instanceof Date) {
    const t = v.getTime();
    return Number.isNaN(t) ? null : t;
  }
  if (typeof v === 'string') {
    const t = new Date(v.trim()).getTime();
    return Number.isNaN(t) ? null : t;
  }
  return null;
}

export function compareValues(a: unknown, b: unknown, dataType: DataType): number {
  // null/empty always last regardless of direction (handled by caller sign)
  const aEmpty = a === null || a === undefined || a === '';
  const bEmpty = b === null || b === undefined || b === '';
  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1;
  if (bEmpty) return -1;

  switch (dataType) {
    case 'number': {
      const na = toNumber(a);
      const nb = toNumber(b);
      if (na === null && nb === null) break;
      if (na === null) return 1;
      if (nb === null) return -1;
      return na - nb;
    }
    case 'date':
    case 'datetime': {
      const ta = toTime(a);
      const tb = toTime(b);
      if (ta !== null && tb !== null) return ta - tb;
      break;
    }
    case 'boolean': {
      const ba = a === true || String(a).toLowerCase() === 'true' ? 1 : 0;
      const bb = b === true || String(b).toLowerCase() === 'true' ? 1 : 0;
      if (ba !== bb) return ba - bb;
      break;
    }
    default:
      break;
  }
  // Fallback: numeric-aware string comparison so 2 < 10 < 100
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

export function sortRows(
  rows: Record<string, unknown>[],
  column: ColumnDefinition | undefined,
  direction: SortDirection,
): Record<string, unknown>[] {
  if (!column || !direction) return rows;
  const sign = direction === 'asc' ? 1 : -1;
  return [...rows].map((r, i) => ({ r, i })).sort((x, y) => {
    const c = compareValues(x.r[column.id], y.r[column.id], column.dataType);
    if (c !== 0) return c * sign;
    return x.i - y.i; // stable
  }).map((x) => x.r);
}

export function nextDirection(current: SortDirection): SortDirection {
  if (current === null) return 'asc';
  if (current === 'asc') return 'desc';
  return null;
}
