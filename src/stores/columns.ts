import { writable, derived, get } from 'svelte/store';
import { dataset } from './dataset';
import {
  moveColumn as pureMove,
  updateColumn as pureUpdate,
  type ColumnPatch,
} from '../lib/data/columns';
import type { ColumnDefinition } from '../lib/data/types';

export const selectedColumnId = writable<string | null>(null);

export const selectedColumn = derived(
  [dataset, selectedColumnId],
  ([$ds, $id]): ColumnDefinition | null =>
    $ds?.columns.find((c) => c.id === $id) ?? null,
);

export function patchColumn(id: string, patch: ColumnPatch) {
  dataset.update((ds) => {
    if (!ds) return ds;
    return { ...ds, columns: pureUpdate(ds.columns, id, patch) };
  });
}

export function moveColumn(id: string, dir: -1 | 1) {
  dataset.update((ds) => {
    if (!ds) return ds;
    return { ...ds, columns: pureMove(ds.columns, id, dir) };
  });
}

export function resetColumnSelection() {
  selectedColumnId.set(null);
}

export function ensureSelection() {
  const ds = get(dataset);
  const id = get(selectedColumnId);
  if (ds && (!id || !ds.columns.some((c) => c.id === id))) {
    selectedColumnId.set(ds.columns[0]?.id ?? null);
  }
}
