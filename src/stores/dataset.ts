import { writable, derived } from 'svelte/store';
import type { Dataset } from '../lib/data/types';

export const dataset = writable<Dataset | null>(null);
export const datasetName = derived(dataset, ($d) => $d?.name ?? '');
export const rowCount = derived(dataset, ($d) => $d?.rowCount ?? 0);
export const columnCount = derived(dataset, ($d) => $d?.columns.length ?? 0);

export function setDataset(d: Dataset | null) {
  dataset.set(d);
}

export function clearDataset() {
  dataset.set(null);
}
