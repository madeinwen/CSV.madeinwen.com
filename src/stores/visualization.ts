import { writable } from 'svelte/store';
import type { VisualizationConfig } from '../lib/visualization/chartConfig';

export const vizConfig = writable<VisualizationConfig>({ chartType: 'bar' });

export function resetViz() {
  vizConfig.set({ chartType: 'bar' });
}
