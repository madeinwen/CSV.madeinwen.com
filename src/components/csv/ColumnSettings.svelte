<script lang="ts">
  import { moveColumn, patchColumn, selectedColumn } from '../../stores/columns';
  import { dataset } from '../../stores/dataset';
  import type { DataType } from '../../lib/data/types';

  const TYPES: DataType[] = ['string', 'number', 'boolean', 'date', 'datetime', 'category'];

  const position = $derived.by(() => {
    if (!$dataset || !$selectedColumn) return null;
    const i = $dataset.columns.findIndex((c) => c.id === $selectedColumn!.id);
    return i < 0 ? null : { i: i + 1, n: $dataset.columns.length };
  });
</script>

{#if !$selectedColumn}
  <p class="text-xs text-slate-500">Select a column to edit its metadata.</p>
{:else}
  {@const c = $selectedColumn}
  <div class="space-y-3 text-xs">
    <div>
      <p class="text-[11px] text-slate-500">Original Name</p>
      <p class="mt-0.5 rounded bg-slate-100 px-2 py-1 font-mono dark:bg-zinc-800">{c.originalName}</p>
    </div>

    <label class="block">
      <span class="text-[11px] text-slate-500">Display Name</span>
      <input
        type="text"
        class="mt-0.5 w-full rounded-lg border px-2 py-1.5 font-mono dark:border-zinc-700 dark:bg-zinc-900"
        value={c.displayName}
        oninput={(e) => patchColumn(c.id, { displayName: e.currentTarget.value })}
      />
    </label>

    <label class="block">
      <span class="text-[11px] text-slate-500">Data Type</span>
      <select
        class="mt-0.5 w-full rounded-lg border px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
        value={c.dataType}
        onchange={(e) => patchColumn(c.id, { dataType: e.currentTarget.value as DataType })}
      >
        {#each TYPES as t (t)}
          <option value={t}>{t}</option>
        {/each}
      </select>
    </label>

    <label class="block">
      <span class="text-[11px] text-slate-500">Description</span>
      <input
        type="text"
        placeholder="e.g. The amount paid by the customer."
        class="mt-0.5 w-full rounded-lg border px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
        value={c.description ?? ''}
        oninput={(e) => patchColumn(c.id, { description: e.currentTarget.value })}
      />
    </label>

    <div class="grid grid-cols-2 gap-2">
      <label class="block">
        <span class="text-[11px] text-slate-500">Unit (e.g. TWD, %, kg)</span>
        <input
          type="text"
          class="mt-0.5 w-full rounded-lg border px-2 py-1.5 font-mono dark:border-zinc-700 dark:bg-zinc-900"
          value={c.unit ?? ''}
          oninput={(e) => patchColumn(c.id, { unit: e.currentTarget.value })}
        />
      </label>
      <label class="block">
        <span class="text-[11px] text-slate-500">Width (px)</span>
        <input
          type="number"
          min="40"
          max="800"
          placeholder="auto"
          class="mt-0.5 w-full rounded-lg border px-2 py-1.5 font-mono dark:border-zinc-700 dark:bg-zinc-900"
          value={c.width ?? ''}
          oninput={(e) =>
            patchColumn(c.id, {
              width: e.currentTarget.value === '' ? undefined : Number(e.currentTarget.value),
            })}
        />
      </label>
    </div>

    {#if c.dataType === 'number'}
      <label class="block">
        <span class="text-[11px] text-slate-500">Decimal Places (0–10)</span>
        <input
          type="number"
          min="0"
          max="10"
          placeholder="auto"
          class="mt-0.5 w-full rounded-lg border px-2 py-1.5 font-mono dark:border-zinc-700 dark:bg-zinc-900"
          value={c.decimalPlaces ?? ''}
          oninput={(e) =>
            patchColumn(c.id, {
              decimalPlaces: e.currentTarget.value === '' ? undefined : Number(e.currentTarget.value),
            })}
        />
      </label>
    {/if}

    <label class="flex items-center gap-2 rounded-lg border px-2 py-1.5 dark:border-zinc-700">
      <input
        type="checkbox"
        checked={c.hidden}
        onchange={(e) => patchColumn(c.id, { hidden: e.currentTarget.checked })}
      />
      <span>Hide column <span class="text-slate-400">(hide ≠ delete)</span></span>
    </label>

    <div class="flex items-center gap-2">
      <span class="text-[11px] text-slate-500">Order{#if position} ({position.i}/{position.n}){/if}</span>
      <button
        class="rounded-lg border px-2 py-1"
        disabled={!position || position.i <= 1}
        onclick={() => moveColumn(c.id, -1)}
        aria-label="Move column left"
      >
        ◀
      </button>
      <button
        class="rounded-lg border px-2 py-1"
        disabled={!position || position.i >= position.n}
        onclick={() => moveColumn(c.id, 1)}
        aria-label="Move column right"
      >
        ▶
      </button>
    </div>
  </div>
{/if}
