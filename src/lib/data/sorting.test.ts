import { describe, it, expect } from 'vitest';
import { compareValues, sortRows, nextDirection } from './sorting';
import type { ColumnDefinition } from './types';

const numCol = { id: 'n', originalName: 'n', displayName: 'n', dataType: 'number', hidden: false } as ColumnDefinition;
const strCol = { id: 's', originalName: 's', displayName: 's', dataType: 'string', hidden: false } as ColumnDefinition;
const dateCol = { id: 'd', originalName: 'd', displayName: 'd', dataType: 'date', hidden: false } as ColumnDefinition;

describe('sorting', () => {
  it('sorts numbers numerically, not lexicographically (2/10/100)', () => {
    const rows = [{ n: '100' }, { n: '2' }, { n: '10' }];
    const sorted = sortRows(rows, numCol, 'asc');
    expect(sorted.map((r) => r.n)).toEqual(['2', '10', '100']);
  });
  it('sorts strings with numeric awareness', () => {
    expect(compareValues('2', '10', 'string')).toBeLessThan(0);
  });
  it('sorts dates chronologically', () => {
    const rows = [{ d: '2026-01-03' }, { d: '2026-01-01' }, { d: '2026-01-02' }];
    expect(sortRows(rows, dateCol, 'asc').map((r) => r.d)).toEqual([
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
    ]);
  });
  it('desc reverses asc; null direction keeps order', () => {
    const rows = [{ s: 'b' }, { s: 'a' }];
    expect(sortRows(rows, strCol, 'desc').map((r) => r.s)).toEqual(['b', 'a']);
    expect(sortRows(rows, strCol, null)).toBe(rows);
  });
  it('nulls last', () => {
    const rows = [{ n: null }, { n: '5' }, { n: '3' }];
    expect(sortRows(rows, numCol, 'asc').map((r) => r.n)).toEqual(['3', '5', null]);
  });
  it('cycles None -> asc -> desc -> None', () => {
    expect(nextDirection(null)).toBe('asc');
    expect(nextDirection('asc')).toBe('desc');
    expect(nextDirection('desc')).toBe(null);
  });
});
