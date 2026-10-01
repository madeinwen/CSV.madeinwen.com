<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { EChartsCoreOption } from 'echarts';
  import type { ECharts } from 'echarts';

  const { option }: { option: EChartsCoreOption } = $props();

  let el: HTMLDivElement | null = $state(null);
  let chart: ECharts | null = $state(null);
  let loadError = $state('');

  onMount(() => {
    let cancelled = false;
    // Lazy-load ECharts so the main bundle stays small (§25).
    import('echarts')
      .then((echarts) => {
        if (cancelled || !el) return;
        chart = echarts.init(el);
        chart.setOption(option, true);
      })
      .catch(() => {
        if (!cancelled) loadError = 'Could not load the chart library. Check your connection and retry.';
      });
    const onResize = () => chart?.resize();
    window.addEventListener('resize', onResize);
    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
    };
  });

  $effect(() => {
    // Re-apply when option identity changes
    if (chart && option) chart.setOption(option, true);
  });

  onDestroy(() => {
    chart?.dispose();
    chart = null;
  });
</script>

<div bind:this={el} class="h-80 w-full" role="img" aria-label="Chart">
  {#if loadError}
    <p role="alert" class="p-4 text-xs text-red-600 dark:text-red-400">{loadError}</p>
  {:else if !chart}
    <p role="status" class="p-4 text-xs text-slate-500">Loading chart…</p>
  {/if}
</div>
