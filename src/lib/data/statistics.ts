import type { ColumnDefinition } from './types';

export interface NumericSummary {
  kind: 'number';
  count: number;
  missing: number;
  mean: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
  sum: number | null;
  unique: number;
}

export interface CategorySummary {
  kind: 'category';
  count: number;
  missing: number;
  unique: number;
  top: { value: string; count: number }[];
}

export type ColumnSummary = NumericSummary | CategorySummary;

function toNum(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/,/g, '').trim());
  return Number.isNaN(n) ? null : n;
}

export function summarizeColumn(
  rows: Record<string, unknown>[],
  col: ColumnDefinition,
  topN = 5,
): ColumnSummary {
  const count = rows.length;
  let missing = 0;
  const freq = new Map<string, number>();
  const nums: number[] = [];

  for (const r of rows) {
    const v = r[col.id];
    if (v === null || v === undefined || (typeof v === 'string' && v.trim() === '')) {
      missing++;
      continue;
    }
    if (col.dataType === 'number') {
      const n = toNum(v);
      if (n === null) {
        missing++;
        continue;
      }
      nums.push(n);
      freq.set(String(v), (freq.get(String(v)) ?? 0) + 1);
    } else {
      const key = v instanceof Date ? v.toISOString() : String(v);
      freq.set(key, (freq.get(key) ?? 0) + 1);
    }
  }

  const unique = freq.size;

  if (col.dataType === 'number') {
    if (nums.length === 0) {
      return { kind: 'number', count, missing, mean: null, median: null, min: null, max: null, sum: null, unique };
    }
    const sorted = [...nums].sort((a, b) => a - b);
    const sum = nums.reduce((a, b) => a + b, 0);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    return {
      kind: 'number',
      count,
      missing,
      mean: sum / nums.length,
      median,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      sum,
      unique,
    };
  }

  const top = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([value, c]) => ({ value, count: c }));
  return { kind: 'category', count, missing, unique, top };
}

export interface DatasetQuality {
  rows: number;
  columns: number;
  visibleColumns: number;
  missingCells: number;
  totalCells: number;
  duplicateRows: number;
}

export function datasetQuality(
  rows: Record<string, unknown>[],
  columns: ColumnDefinition[],
): DatasetQuality {
  const visible = columns.filter((c) => !c.hidden);
  const totalCells = rows.length * visible.length;
  let missingCells = 0;
  for (const r of rows) {
    for (const c of visible) {
      const v = r[c.id];
      if (v === null || v === undefined || (typeof v === 'string' && v.trim() === '')) missingCells++;
    }
  }
  // Duplicate detection on visible values; cap work for very large views
  const sample = rows.length > 20000 ? rows.slice(0, 20000) : rows;
  const seen = new Set<string>();
  let dups = 0;
  for (const r of sample) {
    const key = visible.map((c) => String(r[c.id] ?? '∅')).join('');
    if (seen.has(key)) dups++;
    else seen.add(key);
  }
  return {
    rows: rows.length,
    columns: columns.length,
    visibleColumns: visible.length,
    missingCells,
    totalCells,
    duplicateRows: dups,
  };
}
