<script lang="ts">
  import { dataset } from '../../stores/dataset';
  import { viewCount } from '../../stores/view';
  import { filterGroup } from '../../stores/filters';
  import { sortColumnId, sortDirection } from '../../stores/table';
</script>

{#if $dataset}
  <footer
    class="mt-6 flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-[11px] text-slate-500 dark:border-zinc-800"
    aria-label="Dataset status"
  >
    <span role="status">
      View: {$viewCount.toLocaleString()} / {$dataset.rowCount.toLocaleString()} rows
    </span>
    <span>{$filterGroup.conditions.length} filter(s) · {$filterGroup.logic}</span>
    <span>
      Sort: {$sortColumnId
        ? `${$dataset.columns.find((c) => c.id === $sortColumnId)?.displayName ?? ''} ${$sortDirection === 'asc' ? '▲' : '▼'}`
        : 'none'}
    </span>
    <span class="ml-auto">Parsed locally — nothing uploaded</span>
  </footer>
{/if}
