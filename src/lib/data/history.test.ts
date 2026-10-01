import { describe, it, expect } from 'vitest';
import { emptyHistory, redo, settle, undo, type AppSnapshot } from './history';

const snap = (displayName: string, logic: 'AND' | 'OR' = 'AND'): AppSnapshot => ({
  columns: [
    { id: 'a', originalName: 'a', displayName, dataType: 'string', hidden: false },
  ],
  sortColumnId: null,
  sortDirection: null,
  filterGroup: { logic, conditions: [] },
});

describe('history', () => {
  it('settle pushes present and clears redo', () => {
    let h = emptyHistory();
    h = settle(h, snap('a'));
    expect(h.past).toHaveLength(0);
    h = settle(h, snap('b'));
    expect(h.past).toHaveLength(1);
    expect(h.present?.columns[0].displayName).toBe('b');
  });
  it('identical snapshots are ignored', () => {
    let h = settle(emptyHistory(), snap('a'));
    h = settle(h, snap('a'));
    expect(h.past).toHaveLength(0);
  });
  it('undo/redo round-trip', () => {
    let h = emptyHistory();
    h = settle(h, snap('a'));
    h = settle(h, snap('b'));
    const u = undo(h);
    expect(u.snapshot?.columns[0].displayName).toBe('a');
    const r = redo(u.state);
    expect(r.snapshot?.columns[0].displayName).toBe('b');
  });
  it('undo with empty past is a no-op', () => {
    const h = settle(emptyHistory(), snap('a'));
    expect(undo(h).snapshot).toBeNull();
  });
  it('new change clears redo stack', () => {
    let h = settle(emptyHistory(), snap('a'));
    h = settle(h, snap('b'));
    h = undo(h).state;
    h = settle(h, snap('c'));
    expect(redo(h).snapshot).toBeNull();
    expect(h.present?.columns[0].displayName).toBe('c');
  });
  it('filter logic changes are tracked', () => {
    let h = settle(emptyHistory(), snap('a', 'AND'));
    h = settle(h, snap('a', 'OR'));
    expect(undo(h).snapshot?.filterGroup.logic).toBe('AND');
  });
});
