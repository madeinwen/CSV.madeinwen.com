import type { ColumnDefinition } from './types';

export function searchRows(
  rows: Record<string, unknown>[],
  columns: ColumnDefinition[],
  query: string,
): Record<string, unknown>[] {
  const q = query.trim().toLowerCase();
  if (q === '') return rows;
  const visible = columns.filter((c) => !c.hidden);
  return rows.filter((r) =>
    visible.some((c) => {
      const v = r[c.id];
      if (v === null || v === undefined) return false;
      return String(v).toLowerCase().includes(q);
    }),
  );
}
