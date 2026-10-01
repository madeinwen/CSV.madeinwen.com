<script lang="ts">
  import { page, pageSize, searchQuery, sortColumnId, sortDirection } from '../../stores/table';
  import { filterGroup } from '../../stores/filters';
  import { viewRows } from '../../stores/view';
  import { nextDirection, sortRows } from '../../lib/data/sorting';
  import { formatCellValue } from '../../lib/data/columns';
  import type { Dataset } from '../../lib/data/types';

  const { dataset }: { dataset: Dataset } = $props();

  const visibleColumns = $derived(dataset.columns.filter((c) => !c.hidden));

  const sortCol = $derived(dataset.columns.find((c) => c.id === $sortColumnId));
  const sorted = $derived(sortRows($viewRows, sortCol, $sortDirection));

  const totalPages = $derived(Math.max(1, Math.ceil(sorted.length / $pageSize)));
  const safePage = $derived(Math.min($page, totalPages));
  const pageRows = $derived(sorted.slice((safePage - 1) * $pageSize, safePage * $pageSize));

  function toggleSort(colId: string) {
    if ($sortColumnId !== colId) {
      sortColumnId.set(colId);
      sortDirection.set('asc');
    } else {
      const next = nextDirection($sortDirection);
      sortDirection.set(next);
      if (next === null) sortColumnId.set(null);
    }
    page.set(1);
  }

  function sortLabel(colId: string): string {
    if ($sortColumnId !== colId || !$sortDirection) return 'Not sorted. Activate to sort ascending.';
    return $sortDirection === 'asc'
      ? 'Sorted ascending. Activate to sort descending.'
      : 'Sorted descending. Activate to clear sorting.';
  }
</script>

<div class="mb-2 flex flex-wrap items-center gap-2">
  <label class="flex flex-1 items-center gap-2 text-xs">
    <span class="sr-only">Search data</span>
    <input
      type="search"
      placeholder="Search data..."
      class="w-full max-w-xs rounded-lg border px-3 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
      value={$searchQuery}
      oninput={(e) => {
        searchQuery.set(e.currentTarget.value);
        page.set(1);
      }}
    />
  </label>
  <p class="text-[11px] text-slate-500" role="status">
    {sorted.length.toLocaleString()} / {dataset.rowCount.toLocaleString()} rows · {visibleColumns.length} cols
  </p>
</div>

{#if sorted.length === 0}
  <div class="rounded-xl border p-8 text-center text-xs text-slate-500 dark:border-zinc-800">
    {#if $searchQuery.trim() === '' && $filterGroup.conditions.length === 0}
      No rows in this dataset.
    {:else}
      No matches for current search / filters. Try clearing them.
    {/if}
  </div>
{:else}
  <div class="overflow-auto rounded-xl border dark:border-zinc-800" style="max-height: 60vh;">
    <table class="w-full border-collapse text-xs" style="min-width: max-content;">
      <thead class="sticky top-0 z-10 bg-slate-50 dark:bg-zinc-900">
        <tr>
          {#each visibleColumns as c (c.id)}
            {@const active = $sortColumnId === c.id && $sortDirection !== null}
            <th
              class="border-b px-3 py-2 text-left font-medium"
              scope="col"
              aria-sort={active ? ($sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              style={c.width ? `width:${c.width}px;min-width:${c.width}px;` : undefined}
            >
              <button
                class="flex items-center gap-1 rounded px-1 py-0.5 hover:bg-slate-200 dark:hover:bg-zinc-800"
                onclick={() => toggleSort(c.id)}
                aria-label={`Sort by ${c.displayName}: ${sortLabel(c.id)}`}
                title={c.originalName !== c.displayName ? `Original: ${c.originalName}` : c.displayName}
              >
                <span class="max-w-48 truncate">{c.displayName}</span>
                <span class="w-4 text-[10px] text-slate-400" aria-hidden="true">
                  {#if active}{$sortDirection === 'asc' ? '▲' : '▼'}{/if}
                </span>
              </button>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each pageRows as r, i ((safePage - 1) * $pageSize + i)}
          <tr class="odd:bg-white even:bg-slate-50 dark:odd:bg-black dark:even:bg-zinc-950">
            {#each visibleColumns as c (c.id)}
              <td
                class="max-w-48 truncate border-b px-3 py-1.5 font-mono"
                title={c.description ?? String(r[c.id] ?? '')}
              >
                {formatCellValue(r[c.id], c)}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div class="mt-2 flex flex-wrap items-center gap-2 text-xs">
    <button
      class="rounded-lg border px-2.5 py-1 disabled:opacity-40"
      disabled={safePage <= 1}
      onclick={() => page.set(Math.max(1, safePage - 1))}
    >
      Prev
    </button>
    <span role="status">Page {safePage} / {totalPages}</span>
    <button
      class="rounded-lg border px-2.5 py-1 disabled:opacity-40"
      disabled={safePage >= totalPages}
      onclick={() => page.set(Math.min(totalPages, safePage + 1))}
    >
      Next
    </button>
    <label class="ml-auto flex items-center gap-1 text-[11px] text-slate-500">
      Rows per page
      <select
        class="rounded border px-1.5 py-1 dark:border-zinc-700 dark:bg-zinc-900"
        value={$pageSize}
        onchange={(e) => {
          pageSize.set(Number(e.currentTarget.value));
          page.set(1);
        }}
      >
        <option value={50}>50</option>
        <option value={100}>100</option>
        <option value={200}>200</option>
      </select>
    </label>
  </div>
{/if}
