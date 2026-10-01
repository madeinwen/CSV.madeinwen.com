import { writable } from 'svelte/store';
import type { SortDirection } from '../lib/data/sorting';

export const sortColumnId = writable<string | null>(null);
export const sortDirection = writable<SortDirection>(null);
export const searchQuery = writable('');
export const page = writable(1);
export const pageSize = writable(100);

export function resetTableState() {
  sortColumnId.set(null);
  sortDirection.set(null);
  searchQuery.set('');
  page.set(1);
}
