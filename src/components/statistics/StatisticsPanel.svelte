<script lang="ts">
  import { dataset } from '../../stores/dataset';
  import { selectedColumn } from '../../stores/columns';
  import { viewRows } from '../../stores/view';
  import { datasetQuality, summarizeColumn } from '../../lib/data/statistics';

  const quality = $derived($dataset ? datasetQuality($viewRows, $dataset.columns) : null);
  const summary = $derived(
    $dataset && $selectedColumn ? summarizeColumn($viewRows, $selectedColumn) : null,
  );

  function fmt(n: number | null): string {
    if (n === null || n === undefined) return '—';
    return Number.isInteger(n) ? n.toLocaleString() : n.toLocaleString(undefined, { maximumFractionDigits: 4 });
  }
</script>

{#if !$dataset}
  <p class="text-xs text-slate-500">Import a dataset to view statistics.</p>
{:else}
  <div class="space-y-4 text-xs">
    <section class="rounded-xl border p-3 dark:border-zinc-800" aria-label="Dataset quality">
      <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Data Quality (current view)
      </h3>
      {#if quality}
        <dl class="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div class="rounded-lg bg-slate-50 p-2 dark:bg-zinc-900">
            <dt class="text-[11px] text-slate-500">Rows</dt>
            <dd class="font-mono text-sm font-semibold">{quality.rows.toLocaleString()}</dd>
          </div>
          <div class="rounded-lg bg-slate-50 p-2 dark:bg-zinc-900">
            <dt class="text-[11px] text-slate-500">Columns</dt>
            <dd class="font-mono text-sm font-semibold">{quality.visibleColumns} / {quality.columns}</dd>
          </div>
          <div class="rounded-lg bg-slate-50 p-2 dark:bg-zinc-900">
            <dt class="text-[11px] text-slate-500">Missing cells</dt>
            <dd class="font-mono text-sm font-semibold">{quality.missingCells.toLocaleString()}</dd>
          </div>
          <div class="rounded-lg bg-slate-50 p-2 dark:bg-zinc-900">
            <dt class="text-[11px] text-slate-500">Duplicate rows</dt>
            <dd class="font-mono text-sm font-semibold">{quality.duplicateRows.toLocaleString()}</dd>
          </div>
          <div class="rounded-lg bg-slate-50 p-2 dark:bg-zinc-900">
            <dt class="text-[11px] text-slate-500">Total cells</dt>
            <dd class="font-mono text-sm font-semibold">{quality.totalCells.toLocaleString()}</dd>
          </div>
          <div class="rounded-lg bg-slate-50 p-2 dark:bg-zinc-900">
            <dt class="text-[11px] text-slate-500">Missing %</dt>
            <dd class="font-mono text-sm font-semibold">
              {quality.totalCells === 0 ? '—' : `${((quality.missingCells / quality.totalCells) * 100).toFixed(2)}%`}
            </dd>
          </div>
        </dl>
      {/if}
    </section>

    <section class="rounded-xl border p-3 dark:border-zinc-800" aria-label="Column statistics">
      <h3 class="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Column Statistics</h3>
      {#if !$selectedColumn || !summary}
        <p class="text-[11px] text-slate-500">Select a column to inspect.</p>
      {:else}
        <p class="mb-2">
          <span class="font-mono font-semibold">{$selectedColumn.displayName}</span>
          <span class="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] dark:bg-zinc-800">{$selectedColumn.dataType}</span>
          {#if $selectedColumn.description}
            <span class="ml-2 text-[11px] text-slate-500">{$selectedColumn.description}</span>
          {/if}
        </p>
        {#if summary.kind === 'number'}
          <dl class="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div class="rounded-lg bg-slate-50 p-2 dark:bg-zinc-900"><dt class="text-[11px] text-slate-500">Count</dt><dd class="font-mono font-semibold">{summary.count.toLocaleString()}</dd></div>
            <div class="rounded-lg bg-slate-50 p-2 dark:bg-zinc-900"><dt class="text-[11px] text-slate-500">Missing</dt><dd class="font-mono font-semibold">{summary.missing.toLocaleString()}</dd></div>
            <div class="rounded-lg bg-slate-50 p-2 dark:bg-zinc-900"><dt class="text-[11px] text-slate-500">Unique</dt><dd class="font-mono font-semibold">{summary.unique.toLocaleString()}</dd></div>
            <div class="rounded-lg bg-slate-50 p-2 dark:bg-zinc-900"><dt class="text-[11px] text-slate-500">Mean</dt><dd class="font-mono font-semibold">{fmt(summary.mean)}</dd></div>
            <div class="rounded-lg bg-slate-50 p-2 dark:bg-zinc-900"><dt class="text-[11px] text-slate-500">Median</dt><dd class="font-mono font-semibold">{fmt(summary.median)}</dd></div>
            <div class="rounded-lg bg-slate-50 p-2 dark:bg-zinc-900"><dt class="text-[11px] text-slate-500">Min</dt><dd class="font-mono font-semibold">{fmt(summary.min)}</dd></div>
            <div class="rounded-lg bg-slate-50 p-2 dark:bg-zinc-900"><dt class="text-[11px] text-slate-500">Max</dt><dd class="font-mono font-semibold">{fmt(summary.max)}</dd></div>
            <div class="rounded-lg bg-slate-50 p-2 dark:bg-zinc-900"><dt class="text-[11px] text-slate-500">Sum</dt><dd class="font-mono font-semibold">{fmt(summary.sum)}</dd></div>
          </dl>
        {:else}
          <dl class="grid grid-cols-3 gap-2">
            <div class="rounded-lg bg-slate-50 p-2 dark:bg-zinc-900"><dt class="text-[11px] text-slate-500">Count</dt><dd class="font-mono font-semibold">{summary.count.toLocaleString()}</dd></div>
            <div class="rounded-lg bg-slate-50 p-2 dark:bg-zinc-900"><dt class="text-[11px] text-slate-500">Missing</dt><dd class="font-mono font-semibold">{summary.missing.toLocaleString()}</dd></div>
            <div class="rounded-lg bg-slate-50 p-2 dark:bg-zinc-900"><dt class="text-[11px] text-slate-500">Unique</dt><dd class="font-mono font-semibold">{summary.unique.toLocaleString()}</dd></div>
          </dl>
          <h4 class="mb-1 mt-3 text-[11px] font-semibold text-slate-500">Most common</h4>
          {#if summary.top.length === 0}
            <p class="text-[11px] text-slate-500">No values.</p>
          {:else}
            <ul class="space-y-1">
              {#each summary.top as t (t.value)}
                <li class="flex justify-between gap-2 rounded bg-slate-50 px-2 py-1 font-mono dark:bg-zinc-900">
                  <span class="truncate">{t.value === '' ? '(empty)' : t.value}</span>
                  <span class="shrink-0">{t.count.toLocaleString()}</span>
                </li>
              {/each}
            </ul>
          {/if}
        {/if}
        <p class="mt-2 text-[11px] text-slate-400">Based on current search + filters ({$viewRows.length.toLocaleString()} rows).</p>
      {/if}
    </section>
  </div>
{/if}
