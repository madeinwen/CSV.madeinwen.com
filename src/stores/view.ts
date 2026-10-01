import { derived } from 'svelte/store';
import { dataset } from './dataset';
import { searchQuery } from './table';
import { filterGroup } from './filters';
import { searchRows } from '../lib/data/search';
import { applyFilters } from '../lib/data/filtering';

/** Current dataset view: search + filters applied (no sorting). Table, stats, charts share this. */
export const viewRows = derived(
  [dataset, searchQuery, filterGroup],
  ([$ds, $q, $g]) => {
    if (!$ds) return [];
    const visible = $ds.columns.filter((c) => !c.hidden);
    return applyFilters(searchRows($ds.rows, visible, $q), $ds.columns, $g);
  },
);

export const viewCount = derived(viewRows, ($r) => $r.length);
