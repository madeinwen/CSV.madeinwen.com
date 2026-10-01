<script lang="ts">
  import ChartConfigurator from './ChartConfigurator.svelte';
  import ChartRenderer from './ChartRenderer.svelte';
  import { dataset } from '../../stores/dataset';
  import { viewRows } from '../../stores/view';
  import { vizConfig } from '../../stores/visualization';
  import {
    aggregateBar,
    aggregateLine,
    aggregatePie,
    aggregateScatter,
    defaultConfig,
  } from '../../lib/visualization/chartConfig';
  import type { EChartsCoreOption } from 'echarts';

  // Init defaults once per dataset
  let lastName: string | null = null;
  $effect(() => {
    const ds = $dataset;
    if (ds && ds.name !== lastName) {
      lastName = ds.name;
      vizConfig.set(defaultConfig(ds.columns));
    } else if (!ds) {
      lastName = null;
    }
  });

  const xCol = $derived($dataset?.columns.find((c) => c.id === $vizConfig.xColumnId));
  const yCol = $derived($dataset?.columns.find((c) => c.id === $vizConfig.yColumnId));

  const option = $derived.by((): EChartsCoreOption | null => {
    if (!$dataset || !xCol) return null;
    const rows = $viewRows;
    if (rows.length === 0) return null;
    switch ($vizConfig.chartType) {
      case 'bar': {
        const data = aggregateBar(rows, xCol, yCol);
        return {
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: data.map((d) => d.x), axisLabel: { interval: 0, rotate: 30 } },
          yAxis: { type: 'value' },
          series: [{ type: 'bar', data: data.map((d) => d.value) }],
        };
      }
      case 'line': {
        const data = aggregateLine(rows, xCol, yCol);
        return {
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: data.map((d) => d.x) },
          yAxis: { type: 'value' },
          series: [{ type: 'line', data: data.map((d) => d.value) }],
        };
      }
      case 'scatter': {
        if (!yCol) return null;
        const pts = aggregateScatter(rows, xCol, yCol);
        return {
          tooltip: { trigger: 'item' },
          xAxis: { type: 'value', name: xCol.displayName },
          yAxis: { type: 'value', name: yCol.displayName },
          series: [{ type: 'scatter', data: pts.map((p) => [p.x, p.y]) }],
        };
      }
      case 'pie': {
        const data = aggregatePie(rows, xCol, yCol);
        return {
          tooltip: { trigger: 'item' },
          series: [{ type: 'pie', radius: '60%', data: data.map((d) => ({ name: d.name, value: d.value })) }],
        };
      }
    }
  });
</script>

<div class="space-y-3">
  <ChartConfigurator />
  {#if !option}
    <p class="rounded-xl border p-6 text-center text-xs text-slate-500 dark:border-zinc-800">
      {#if $viewRows.length === 0}
        No rows in current view — clear search / filters to chart.
      {:else}
        Pick X (and Y for scatter) columns to render.
      {/if}
    </p>
  {:else}
    <div class="rounded-xl border p-2 dark:border-zinc-800">
      {#key JSON.stringify([$vizConfig, $viewRows.length])}
        <ChartRenderer option={option} />
      {/key}
      <p class="px-2 pb-1 text-[11px] text-slate-400">
        Based on current view ({$viewRows.length.toLocaleString()} rows). Config is independent of raw data.
      </p>
    </div>
  {/if}
</div>
