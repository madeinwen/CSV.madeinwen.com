import type { ColumnDefinition } from '../data/types';

export type ChartType = 'bar' | 'line' | 'scatter' | 'pie';

export interface VisualizationConfig {
  chartType: ChartType;
  xColumnId?: string;
  yColumnId?: string;
  groupById?: string;
}

export interface BarDatum {
  x: string;
  value: number;
  count: number;
}
export interface PieDatum {
  name: string;
  value: number;
}
export interface ScatterDatum {
  x: number;
  y: number;
}

function toNum(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/,/g, '').trim());
  return Number.isNaN(n) ? null : n;
}

function cellKey(v: unknown): string {
  if (v === null || v === undefined || v === '') return '(empty)';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

/** Group X categories -> mean of Y (or count when no Y). Top N only. */
export function aggregateBar(
  rows: Record<string, unknown>[],
  xCol: ColumnDefinition,
  yCol: ColumnDefinition | undefined,
  topN = 20,
): BarDatum[] {
  const groups = new Map<string, { sum: number; count: number; nCount: number }>();
  for (const r of rows) {
    const key = cellKey(r[xCol.id]);
    let g = groups.get(key);
    if (!g) {
      g = { sum: 0, count: 0, nCount: 0 };
      groups.set(key, g);
    }
    g.count++;
    if (yCol) {
      const n = toNum(r[yCol.id]);
      if (n !== null) {
        g.sum += n;
        g.nCount++;
      }
    }
  }
  const out: BarDatum[] = [...groups.entries()].map(([x, g]) => ({
    x,
    value: yCol ? (g.nCount === 0 ? 0 : g.sum / g.nCount) : g.count,
    count: g.count,
  }));
  out.sort((a, b) => b.value - a.value);
  return out.slice(0, topN);
}

/** Line: mean of Y per X, sorted by X (dates/numbers naturally). */
export function aggregateLine(
  rows: Record<string, unknown>[],
  xCol: ColumnDefinition,
  yCol: ColumnDefinition | undefined,
  topN = 50,
): BarDatum[] {
  const data = aggregateBar(rows, xCol, yCol, Number.MAX_SAFE_INTEGER);
  // Sort by X label with numeric awareness (dates sort correctly as ISO)
  data.sort((a, b) => a.x.localeCompare(b.x, undefined, { numeric: true }));
  return data.slice(0, topN);
}

/** Pie: count per category, or sum of Y. Top N. */
export function aggregatePie(
  rows: Record<string, unknown>[],
  xCol: ColumnDefinition,
  yCol: ColumnDefinition | undefined,
  topN = 10,
): PieDatum[] {
  const groups = new Map<string, number>();
  const counts = new Map<string, number>();
  for (const r of rows) {
    const key = cellKey(r[xCol.id]);
    counts.set(key, (counts.get(key) ?? 0) + 1);
    if (yCol) {
      const n = toNum(r[yCol.id]);
      if (n !== null) groups.set(key, (groups.get(key) ?? 0) + n);
    }
  }
  const out: PieDatum[] = [...counts.entries()].map(([name, c]) => ({
    name,
    value: yCol ? (groups.get(name) ?? 0) : c,
  }));
  out.sort((a, b) => b.value - a.value);
  return out.slice(0, topN);
}

/** Scatter: numeric pairs, sampled. */
export function aggregateScatter(
  rows: Record<string, unknown>[],
  xCol: ColumnDefinition,
  yCol: ColumnDefinition,
  maxPoints = 2000,
): ScatterDatum[] {
  const out: ScatterDatum[] = [];
  for (const r of rows) {
    const x = toNum(r[xCol.id]);
    const y = toNum(r[yCol.id]);
    if (x !== null && y !== null) out.push({ x, y });
    if (out.length >= maxPoints) break;
  }
  return out;
}

export function suggestChart(
  x: ColumnDefinition | undefined,
  y: ColumnDefinition | undefined,
): ChartType {
  if (!x) return 'bar';
  if (!y) return x.dataType === 'category' || x.dataType === 'string' ? 'pie' : 'bar';
  if ((x.dataType === 'date' || x.dataType === 'datetime') && y.dataType === 'number') return 'line';
  if (x.dataType === 'number' && y.dataType === 'number') return 'scatter';
  if ((x.dataType === 'category' || x.dataType === 'string') && y.dataType === 'number') return 'bar';
  return 'bar';
}

export function defaultConfig(columns: ColumnDefinition[]): VisualizationConfig {
  const numbers = columns.filter((c) => !c.hidden && c.dataType === 'number');
  const cats = columns.filter(
    (c) => !c.hidden && (c.dataType === 'category' || c.dataType === 'string' || c.dataType === 'boolean'),
  );
  const dates = columns.filter((c) => !c.hidden && (c.dataType === 'date' || c.dataType === 'datetime'));
  const x = dates[0] ?? cats[0] ?? columns.find((c) => !c.hidden);
  const y = numbers[0];
  return {
    chartType: suggestChart(x, y),
    xColumnId: x?.id,
    yColumnId: y?.id,
  };
}
