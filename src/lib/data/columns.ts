import type { ColumnDefinition } from './types';

export type ColumnPatch = Partial<
  Pick<
    ColumnDefinition,
    'displayName' | 'dataType' | 'description' | 'unit' | 'hidden' | 'width' | 'decimalPlaces' | 'dateFormat'
  >
>;

/** Pure update: never changes id / originalName (raw data identity). */
export function updateColumn(
  columns: ColumnDefinition[],
  id: string,
  patch: ColumnPatch,
): ColumnDefinition[] {
  return columns.map((c) => {
    if (c.id !== id) return c;
    const next: ColumnDefinition = { ...c };
    if (patch.displayName !== undefined) {
      const t = patch.displayName.trim();
      next.displayName = t === '' ? c.originalName : t;
    }
    if (patch.dataType !== undefined) next.dataType = patch.dataType;
    if (patch.description !== undefined) next.description = patch.description;
    if (patch.unit !== undefined) next.unit = patch.unit;
    if (patch.hidden !== undefined) next.hidden = patch.hidden;
    if (patch.width !== undefined) {
      next.width = patch.width !== null && Number(patch.width) > 0 ? Number(patch.width) : undefined;
    }
    if (patch.decimalPlaces !== undefined) {
      if (patch.decimalPlaces === null || patch.decimalPlaces === undefined) {
        next.decimalPlaces = undefined;
      } else {
        const n = Number(patch.decimalPlaces);
        next.decimalPlaces = Number.isInteger(n) && n >= 0 && n <= 10 ? n : c.decimalPlaces;
      }
    }
    if (patch.dateFormat !== undefined) next.dateFormat = patch.dateFormat;
    return next;
  });
}

export function visibleColumns(columns: ColumnDefinition[]): ColumnDefinition[] {
  return columns.filter((c) => !c.hidden);
}

/** Pure reorder: moves column one step left (-1) or right (+1). No-op at edges. */
export function moveColumn(
  columns: ColumnDefinition[],
  id: string,
  dir: -1 | 1,
): ColumnDefinition[] {
  const i = columns.findIndex((c) => c.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= columns.length) return columns;
  const next = [...columns];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export function formatCellValue(value: unknown, col: ColumnDefinition): string {
  if (value === null || value === undefined || value === '') return '';
  if (col.dataType === 'number' && col.decimalPlaces !== undefined) {
    const n = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''));
    if (!Number.isNaN(n)) return n.toFixed(col.decimalPlaces);
  }
  if ((col.dataType === 'date' || col.dataType === 'datetime') && value instanceof Date) {
    if (col.dataType === 'date') return value.toISOString().slice(0, 10);
    return value.toISOString();
  }
  let s = String(value);
  if (col.unit) s = `${s} ${col.unit}`;
  return s;
}
