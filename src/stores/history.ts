import { get, writable } from 'svelte/store';
import { dataset } from './dataset';
import { filterGroup } from './filters';
import { page } from './table';
import { sortColumnId, sortDirection } from './table';
import {
  emptyHistory,
  redo as redoPure,
  settle as settlePure,
  undo as undoPure,
  type AppSnapshot,
} from '../lib/data/history';

let history = emptyHistory();
let silenced = false;
let timer: ReturnType<typeof setTimeout> | null = null;

export const canUndo = writable(false);
export const canRedo = writable(false);

function syncFlags() {
  canUndo.set(history.past.length > 0);
  canRedo.set(history.future.length > 0);
}

function snapshot(): AppSnapshot | null {
  const ds = get(dataset);
  if (!ds) return null;
  return {
    columns: ds.columns,
    sortColumnId: get(sortColumnId),
    sortDirection: get(sortDirection),
    filterGroup: get(filterGroup),
  };
}

function schedule() {
  if (silenced) return;
  if (timer) clearTimeout(timer);
  // Debounce bursts (e.g. typing a display name) into one entry
  timer = setTimeout(() => {
    timer = null;
    const s = snapshot();
    if (!s || silenced) return;
    history = settlePure(history, s);
    syncFlags();
  }, 500);
}

function restore(s: AppSnapshot) {
  silenced = true;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  dataset.update((ds) => (ds ? { ...ds, columns: s.columns } : ds));
  sortColumnId.set(s.sortColumnId);
  sortDirection.set(s.sortDirection);
  filterGroup.set(s.filterGroup);
  page.set(1);
  // Let Svelte flush before re-enabling tracking
  queueMicrotask(() => {
    silenced = false;
  });
}

export function undo() {
  const { state, snapshot: s } = undoPure(history);
  if (!s) return;
  history = state;
  restore(s);
  syncFlags();
}

export function redo() {
  const { state, snapshot: s } = redoPure(history);
  if (!s) return;
  history = state;
  restore(s);
  syncFlags();
}

/** Call after dataset load/reset: fresh baseline, no undo past. */
export function resetHistory() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  history = emptyHistory();
  const s = snapshot();
  if (s) history = settlePure(history, s);
  syncFlags();
}

// Track undoable state (rename / type / hide / reorder / sort / filter).
dataset.subscribe(() => schedule());
sortColumnId.subscribe(() => schedule());
sortDirection.subscribe(() => schedule());
filterGroup.subscribe(() => schedule());
