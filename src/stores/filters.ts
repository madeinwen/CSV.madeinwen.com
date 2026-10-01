import { writable } from 'svelte/store';
import type { FilterGroup } from '../lib/data/filtering';

export const filterGroup = writable<FilterGroup>({ logic: 'AND', conditions: [] });

let seq = 0;

export function addCondition(columnId: string) {
  filterGroup.update((g) => ({
    ...g,
    conditions: [
      ...g.conditions,
      { id: `f_${Date.now()}_${seq++}`, columnId, operator: 'contains', value: '', value2: '' },
    ],
  }));
}

export function removeCondition(id: string) {
  filterGroup.update((g) => ({ ...g, conditions: g.conditions.filter((c) => c.id !== id) }));
}

export function clearFilters() {
  filterGroup.set({ logic: 'AND', conditions: [] });
}

export function resetFilters() {
  clearFilters();
}
