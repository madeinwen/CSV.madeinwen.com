<script lang="ts">
  import { parseCsvFile } from '../../lib/csv/parser';
  import { setDataset } from '../../stores/dataset';

  let error = $state('');
  let dragging = $state(false);
  let loading = $state(false);
  let fileInput: HTMLInputElement | null = $state(null);

  async function handleFile(file: File | undefined | null) {
    error = '';
    if (!file) return;
    loading = true;
    try {
      const { dataset, issues } = await parseCsvFile(file);
      setDataset(dataset);
      if (issues.length > 0) {
        error = issues.map((i) => (i.row ? `Row ${i.row}: ${i.message}` : i.message)).join('\n');
      }
    } catch (e) {
      setDataset(null);
      error = e instanceof Error ? e.message : 'Unable to read this CSV.';
    } finally {
      loading = false;
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    dragging = false;
    const f = e.dataTransfer?.files?.[0];
    void handleFile(f);
  }
</script>

<div
  role="button"
  tabindex="0"
  aria-label="Drop a CSV file here or press Enter to browse"
  class="rounded-xl border border-dashed p-8 text-center transition-colors {dragging
    ? 'border-slate-900 bg-slate-50 dark:border-white dark:bg-zinc-900'
    : 'border-slate-300 dark:border-zinc-700'}"
  ondragover={(e) => {
    e.preventDefault();
    dragging = true;
  }}
  ondragleave={() => (dragging = false)}
  ondrop={onDrop}
  onkeydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput?.click();
    }
  }}
  onclick={() => fileInput?.click()}
>
  <p class="text-sm font-medium">Drop a CSV file here</p>
  <p class="mt-1 text-xs text-slate-500">or click to browse — parsed locally, never uploaded</p>
  <input
    bind:this={fileInput}
    type="file"
    accept=".csv,text/csv"
    class="hidden"
    onchange={(e) => void handleFile(e.currentTarget.files?.[0])}
  />
  {#if loading}
    <p class="mt-3 text-xs" role="status">Parsing…</p>
  {/if}
</div>

{#if error}
  <div role="alert" class="mt-3 whitespace-pre-line rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950 dark:text-red-200">
    {error}
  </div>
{/if}
