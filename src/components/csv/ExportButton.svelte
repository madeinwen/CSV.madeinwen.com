<script lang="ts">
  import { dataset } from '../../stores/dataset';
  import { viewRows } from '../../stores/view';
  import { buildExportCsv, downloadCsv } from '../../lib/csv/export';

  function onExport() {
    if (!$dataset) return;
    const csv = buildExportCsv($viewRows, $dataset.columns);
    const base = $dataset.name.replace(/\.csv$/i, '');
    downloadCsv(`${base}_export.csv`, csv);
  }
</script>

<button
  class="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40 dark:bg-white dark:text-black"
  disabled={!$dataset || $viewRows.length === 0}
  onclick={onExport}
  title={$dataset ? `Export ${$viewRows.length.toLocaleString()} filtered rows with display names (hidden columns excluded)` : 'Import a CSV first'}
>
  Export CSV ({$viewRows.length.toLocaleString()})
</button>
