<script lang="ts">
  import { dataset } from '../../stores/dataset';
  import { addCondition, clearFilters, filterGroup, removeCondition } from '../../stores/filters';
  import { operatorsFor, type FilterOperator } from '../../lib/data/filtering';
  import { page } from '../../stores/table';

  function touch() {
    page.set(1);
  }

  function onColumnChange(condId: string, columnId: string) {
    const col = $dataset?.columns.find((c) => c.id === columnId);
    const ops = col ? operatorsFor(col.dataType) : [];
    const fallback: FilterOperator = ops[0]?.value ?? 'contains';
    filterGroup.update((g) => ({
      ...g,
      conditions: g.conditions.map((c) => (c.id === condId ? { ...c, columnId, operator: fallback, value: '', value2: '' } : c)),
    }));
    touch();
  }
</script>

{#if $dataset}
  <section class="rounded-xl border p-3 dark:border-zinc-800" aria-label="Filter builder">
    <div class="mb-2 flex flex-wrap items-center gap-2">
      <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-500">Filters</h3>
      {#if $filterGroup.conditions.length > 0}
        <div class="flex items-center gap-1 text-[11px]" role="group" aria-label="Filter logic">
          {#each ['AND', 'OR'] as logic (logic)}
            <button
              class="rounded border px-2 py-0.5 {$filterGroup.logic === logic ? 'bg-slate-900 text-white dark:bg-white dark:text-black' : ''}"
              onclick={() => {
                filterGroup.update((g) => ({ ...g, logic: logic as 'AND' | 'OR' }));
                touch();
              }}
              aria-pressed={$filterGroup.logic === logic}
            >
              {logic}
            </button>
          {/each}
        </div>
        <button class="ml-auto text-[11px] text-slate-500 hover:underline" onclick={() => { clearFilters(); touch(); }}>
          Clear all
        </button>
      {/if}
    </div>

    {#if $filterGroup.conditions.length === 0}
      <p class="text-[11px] text-slate-500">No filters. Add one to narrow the table, statistics, and charts.</p>
    {:else}
      <ul class="space-y-2">
        {#each $filterGroup.conditions as cond (cond.id)}
          {@const col = $dataset.columns.find((c) => c.id === cond.columnId)}
          <li class="flex flex-wrap items-center gap-1.5 text-xs">
            <label class="sr-only" for={`col-${cond.id}`}>Column</label>
            <select
              id={`col-${cond.id}`}
              class="max-w-40 rounded-lg border px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
              value={cond.columnId}
              onchange={(e) => onColumnChange(cond.id, e.currentTarget.value)}
            >
              {#each $dataset.columns as c (c.id)}
                <option value={c.id}>{c.displayName}</option>
              {/each}
            </select>

            <label class="sr-only" for={`op-${cond.id}`}>Operator</label>
            <select
              id={`op-${cond.id}`}
              class="rounded-lg border px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
              value={cond.operator}
              onchange={(e) => {
                filterGroup.update((g) => ({
                  ...g,
                  conditions: g.conditions.map((x) =>
                    x.id === cond.id ? { ...x, operator: e.currentTarget.value as FilterOperator } : x,
                  ),
                }));
                touch();
              }}
            >
              {#each col ? operatorsFor(col.dataType) : [] as o (o.value)}
                <option value={o.value}>{o.label}</option>
              {/each}
            </select>

            <label class="sr-only" for={`val-${cond.id}`}>Value</label>
            <input
              id={`val-${cond.id}`}
              type={col?.dataType === 'date' ? 'date' : col?.dataType === 'datetime' ? 'datetime-local' : col?.dataType === 'number' ? 'number' : 'text'}
              placeholder="Value"
              class="w-28 rounded-lg border px-2 py-1 font-mono dark:border-zinc-700 dark:bg-zinc-900"
              value={cond.value}
              oninput={(e) => {
                filterGroup.update((g) => ({
                  ...g,
                  conditions: g.conditions.map((x) => (x.id === cond.id ? { ...x, value: e.currentTarget.value } : x)),
                }));
                touch();
              }}
            />
            {#if cond.operator === 'between'}
              <span class="text-slate-400">and</span>
              <label class="sr-only" for={`val2-${cond.id}`}>Value 2</label>
              <input
                id={`val2-${cond.id}`}
                type={col?.dataType === 'date' ? 'date' : col?.dataType === 'datetime' ? 'datetime-local' : col?.dataType === 'number' ? 'number' : 'text'}
                placeholder="Value 2"
                class="w-28 rounded-lg border px-2 py-1 font-mono dark:border-zinc-700 dark:bg-zinc-900"
                value={cond.value2 ?? ''}
                oninput={(e) => {
                  filterGroup.update((g) => ({
                    ...g,
                    conditions: g.conditions.map((x) => (x.id === cond.id ? { ...x, value2: e.currentTarget.value } : x)),
                  }));
                  touch();
                }}
              />
            {/if}

            <button
              class="rounded-lg border px-2 py-1 text-[11px] text-red-600 dark:text-red-400"
              onclick={() => {
                removeCondition(cond.id);
                touch();
              }}
              aria-label="Remove filter"
            >
              ✕
            </button>
          </li>
        {/each}
      </ul>
    {/if}

    <button
      class="mt-2 rounded-lg border px-2.5 py-1 text-xs"
      onclick={() => {
        if ($dataset) addCondition($dataset.columns[0].id);
        touch();
      }}
    >
      + Add filter
    </button>
  </section>
{/if}
