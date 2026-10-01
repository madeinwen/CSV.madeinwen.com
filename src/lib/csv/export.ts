import Papa from 'papaparse';
import type { ColumnDefinition } from '../data/types';

/**
 * Build export CSV text from the current view.
 * - Uses displayName as header (rename respected)
 * - Uses given column order (defaults to dataset order)
 * - Skips hidden columns (hide !== delete, but hidden are not exported)
 * - Caller passes already-filtered rows (filters/search respected)
 * - Raw data untouched; values serialized plainly (Date -> ISO)
 */
export function buildExportCsv(
  rows: Record<string, unknown>[],
  columns: ColumnDefinition[],
  columnOrder?: string[],
): string {
  const visible = columns.filter((c) => !c.hidden);
  const order = columnOrder?.filter((id) => visible.some((c) => c.id === id)) ?? [];
  const ordered =
    order.length > 0
      ? order
          .map((id) => visible.find((c) => c.id === id)!)
          .filter(Boolean)
      : visible;

  const data = rows.map((r) => {
    const o: Record<string, unknown> = {};
    for (const c of ordered) {
      const v = r[c.id];
      o[c.displayName] = v instanceof Date ? v.toISOString() : (v ?? '');
    }
    return o;
  });

  // Papa.unparse handles quoting/commas/newlines
  return Papa.unparse(data, { columns: ordered.map((c) => c.displayName) });
}

export function downloadCsv(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
