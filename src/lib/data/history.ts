import type { ColumnDefinition } from './types';
import type { SortDirection } from './sorting';
import type { FilterGroup } from './filtering';

export interface AppSnapshot {
  columns: ColumnDefinition[];
  sortColumnId: string | null;
  sortDirection: SortDirection;
  filterGroup: FilterGroup;
}

export interface HistoryState {
  past: AppSnapshot[];
  present: AppSnapshot | null;
  future: AppSnapshot[];
}

export const HISTORY_LIMIT = 50;

export function emptyHistory(): HistoryState {
  return { past: [], present: null, future: [] };
}

function same(a: AppSnapshot | null, b: AppSnapshot): boolean {
  if (!a) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Settle a debounced burst: push previous present, adopt snapshot, clear redo. */
export function settle(state: HistoryState, snapshot: AppSnapshot): HistoryState {
  if (same(state.present, snapshot)) return state;
  const past = state.present ? [...state.past, state.present] : state.past;
  return {
    past: past.slice(-HISTORY_LIMIT),
    present: snapshot,
    future: [],
  };
}

export function undo(state: HistoryState): { state: HistoryState; snapshot: AppSnapshot | null } {
  if (!state.present || state.past.length === 0) return { state, snapshot: null };
  const prev = state.past[state.past.length - 1];
  return {
    state: {
      past: state.past.slice(0, -1),
      present: prev,
      future: [state.present, ...state.future].slice(0, HISTORY_LIMIT),
    },
    snapshot: prev,
  };
}

export function redo(state: HistoryState): { state: HistoryState; snapshot: AppSnapshot | null } {
  if (!state.present || state.future.length === 0) return { state, snapshot: null };
  const [next, ...rest] = state.future;
  return {
    state: {
      past: [...state.past, state.present].slice(-HISTORY_LIMIT),
      present: next,
      future: rest,
    },
    snapshot: next,
  };
}
