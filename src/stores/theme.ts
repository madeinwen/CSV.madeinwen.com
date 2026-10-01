import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark' | 'system';

const KEY = 'csv-visualizer-theme';

function initial(): Theme {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  } catch {
    // private mode etc. — fall through to system
  }
  return 'system';
}

export const theme = writable<Theme>(initial());

function apply(t: Theme) {
  const dark =
    t === 'dark' ||
    (t === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}

theme.subscribe((t) => {
  try {
    localStorage.setItem(KEY, t);
  } catch {
    // ignore
  }
  if (typeof document !== 'undefined') apply(t);
});

export function cycleTheme() {
  theme.update((t) => (t === 'light' ? 'dark' : t === 'dark' ? 'system' : 'light'));
}
