<script lang="ts">
  import CsvDropzone from './components/csv/CsvDropzone.svelte';
  import DataTable from './components/csv/DataTable.svelte';
  import ColumnSettings from './components/csv/ColumnSettings.svelte';
  import FilterBuilder from './components/csv/FilterBuilder.svelte';
  import ExportButton from './components/csv/ExportButton.svelte';
  import StatisticsPanel from './components/statistics/StatisticsPanel.svelte';
  import ChartPanel from './components/visualization/ChartPanel.svelte';
  import { dataset, rowCount, columnCount } from './stores/dataset';
  import { resetTableState } from './stores/table';
  import { resetFilters } from './stores/filters';
  import { resetViz } from './stores/visualization';
  import { canRedo, canUndo, redo, resetHistory, undo } from './stores/history';
  import { theme, cycleTheme } from './stores/theme';
  import StatusBar from './components/layout/StatusBar.svelte';
  import { ensureSelection, resetColumnSelection, selectedColumnId } from './stores/columns';
  import { onMount } from 'svelte';

  let lastDatasetName = $state<string | null>(null);
  let tab = $state<'table' | 'stats' | 'viz'>('table');
  const tabs = [
    { id: 'table', label: 'Table' },
    { id: 'stats', label: 'Statistics' },
    { id: 'viz', label: 'Visualization' },
  ] as const;
  $effect(() => {
    const name = $dataset?.name ?? null;
    if (name !== lastDatasetName) {
      lastDatasetName = name;
      resetTableState();
      resetColumnSelection();
      resetFilters();
      resetViz();
      resetHistory();
      tab = 'table';
    }
    if ($dataset) ensureSelection();
  });

  onMount(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const k = e.key.toLowerCase();
      if (k === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((k === 'z' && e.shiftKey) || k === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
</script>

<main class="mx-auto min-h-screen max-w-6xl p-4 sm:p-6">
  <header class="mb-6 flex flex-wrap items-center gap-3">
    <div class="mr-auto">
      <h1 class="text-xl font-semibold">CSV Visualizer</h1>
      <p class="text-xs text-slate-500">Explore your data locally</p>
    </div>
    <button
      class="rounded-lg border px-2.5 py-1.5 text-xs"
      onclick={cycleTheme}
      title="Cycle light / dark / system theme"
      aria-label="Current theme: {$theme}. Activate to switch theme."
    >
      {#if $theme === 'light'}☀ Light{:else if $theme === 'dark'}☾ Dark{:else}◐ System{/if}
    </button>
    {#if $dataset}
      <div class="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
        <div class="flex overflow-hidden rounded-lg border" role="group" aria-label="Undo and redo">
          <button
            class="px-2.5 py-1.5 disabled:opacity-40"
            disabled={!$canUndo}
            onclick={undo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            ↩ Undo
          </button>
          <button
            class="border-l px-2.5 py-1.5 disabled:opacity-40"
            disabled={!$canRedo}
            onclick={redo}
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
          >
            Redo ↪
          </button>
        </div>
        <span>
          <span class="font-mono font-semibold">{$dataset.name}</span>
          <span class="ml-2">{$rowCount} rows · {$columnCount} cols</span>
        </span>
        <ExportButton />
      </div>
    {/if}
  </header>

  {#if !$dataset}
    <section class="mx-auto max-w-xl">
      <h2 class="mb-2 text-lg font-medium">Explore your data locally.</h2>
      <p class="mb-4 text-sm text-slate-500">
        Import a CSV to inspect columns, filter data, view statistics, and create visualizations.
      </p>
      <CsvDropzone />
      <div class="mt-4 rounded-lg border p-3 text-xs text-slate-500">
        <p class="font-medium text-slate-700 dark:text-slate-200">Try with your data</p>
        <p class="mt-1 font-mono">taiwan_bankruptcy_572.csv — 6819 rows × 96 cols</p>
      </div>
    </section>
  {:else}
    <section class="grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside class="space-y-3">
        <div class="rounded-xl border p-3 dark:border-zinc-800">
          <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Columns</h3>
          <ul class="max-h-[40vh] space-y-1 overflow-auto text-xs">
            {#each $dataset.columns as c (c.id)}
              <li>
                <button
                  class="flex w-full items-center justify-between gap-2 rounded px-2 py-1 text-left hover:bg-slate-100 dark:hover:bg-zinc-900 {$selectedColumnId === c.id ? 'bg-slate-100 dark:bg-zinc-900' : ''} {c.hidden ? 'opacity-50' : ''}"
                  onclick={() => selectedColumnId.set(c.id)}
                  aria-pressed={$selectedColumnId === c.id}
                >
                  <span class="truncate font-mono" title={c.originalName}>
                    {c.displayName}{#if c.hidden} (hidden){/if}
                  </span>
                  <span class="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] dark:bg-zinc-800">{c.dataType}</span>
                </button>
              </li>
            {/each}
          </ul>
        </div>
        <div class="rounded-xl border p-3 dark:border-zinc-800">
          <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Column Settings</h3>
          <ColumnSettings />
        </div>
        <button
          class="w-full rounded-lg border px-3 py-1.5 text-xs"
          onclick={() => dataset.set(null)}
        >
          Clear dataset
        </button>
        <div><CsvDropzone /></div>
      </aside>

      <div class="min-w-0 space-y-3">
        <FilterBuilder />
        <div class="flex gap-1 border-b text-xs" role="tablist" aria-label="Views">
          {#each tabs as t (t.id)}
            <button
              role="tab"
              aria-selected={tab === t.id}
              tabindex={tab === t.id ? 0 : -1}
              class="border-b-2 px-3 py-1.5 {tab === t.id ? 'border-slate-900 font-semibold dark:border-white' : 'border-transparent text-slate-500'}"
              onclick={() => (tab = t.id)}
              onkeydown={(e) => {
                if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                e.preventDefault();
                const i = tabs.findIndex((x) => x.id === tab);
                const d = e.key === 'ArrowRight' ? 1 : -1;
                tab = tabs[(i + d + tabs.length) % tabs.length].id;
              }}
            >
              {t.label}
            </button>
          {/each}
        </div>
        <div role="tabpanel">
          {#if tab === 'table'}
            <DataTable dataset={$dataset} />
          {:else if tab === 'stats'}
            <StatisticsPanel />
          {:else}
            <ChartPanel />
          {/if}
        </div>
      </div>
    </section>
  {/if}
  <StatusBar />
</main>
