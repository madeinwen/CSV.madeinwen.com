<script lang="ts">
  import { dataset } from '../../stores/dataset';
  import { vizConfig } from '../../stores/visualization';
  import { suggestChart, type ChartType } from '../../lib/visualization/chartConfig';

  const TYPES: { value: ChartType; label: string }[] = [
    { value: 'bar', label: 'Bar' },
    { value: 'line', label: 'Line' },
    { value: 'scatter', label: 'Scatter' },
    { value: 'pie', label: 'Pie' },
  ];

  function autoSuggest() {
    const cols = $dataset?.columns ?? [];
    const x = cols.find((c) => c.id === $vizConfig.xColumnId);
    const y = cols.find((c) => c.id === $vizConfig.yColumnId);
    vizConfig.update((v) => ({ ...v, chartType: suggestChart(x, y) }));
  }
</script>

{#if $dataset}
  <div class="flex flex-wrap items-end gap-2 text-xs">
    <label class="flex flex-col gap-1">
      <span class="text-[11px] text-slate-500">Chart Type</span>
      <select
        class="rounded-lg border px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
        value={$vizConfig.chartType}
        onchange={(e) => vizConfig.update((v) => ({ ...v, chartType: e.currentTarget.value as ChartType }))}
      >
        {#each TYPES as t (t.value)}
          <option value={t.value}>{t.label}</option>
        {/each}
      </select>
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-[11px] text-slate-500">X Axis</span>
      <select
        class="max-w-48 rounded-lg border px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
        value={$vizConfig.xColumnId ?? ''}
        onchange={(e) => vizConfig.update((v) => ({ ...v, xColumnId: e.currentTarget.value || undefined }))}
      >
        <option value="">(none)</option>
        {#each $dataset.columns.filter((c) => !c.hidden) as c (c.id)}
          <option value={c.id}>{c.displayName} ({c.dataType})</option>
        {/each}
      </select>
    </label>
    {#if $vizConfig.chartType !== 'pie'}
      <label class="flex flex-col gap-1">
        <span class="text-[11px] text-slate-500">Y Axis</span>
        <select
          class="max-w-48 rounded-lg border px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
          value={$vizConfig.yColumnId ?? ''}
          onchange={(e) => vizConfig.update((v) => ({ ...v, yColumnId: e.currentTarget.value || undefined }))}
        >
          <option value="">(count)</option>
          {#each $dataset.columns.filter((c) => !c.hidden && c.dataType === 'number') as c (c.id)}
            <option value={c.id}>{c.displayName}</option>
          {/each}
        </select>
      </label>
    {:else}
      <label class="flex flex-col gap-1">
        <span class="text-[11px] text-slate-500">Value (optional)</span>
        <select
          class="max-w-48 rounded-lg border px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
          value={$vizConfig.yColumnId ?? ''}
          onchange={(e) => vizConfig.update((v) => ({ ...v, yColumnId: e.currentTarget.value || undefined }))}
        >
          <option value="">(count)</option>
          {#each $dataset.columns.filter((c) => !c.hidden && c.dataType === 'number') as c (c.id)}
            <option value={c.id}>{c.displayName}</option>
          {/each}
        </select>
      </label>
    {/if}
    <button class="rounded-lg border px-2.5 py-1.5" onclick={autoSuggest} title="Suggest chart from data types">
      Suggest
    </button>
  </div>
{/if}
