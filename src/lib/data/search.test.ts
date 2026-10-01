import { describe, it, expect } from 'vitest';
import { searchRows } from './search';
import type { ColumnDefinition } from './types';

const cols = [
  { id: 'a', originalName: 'a', displayName: 'a', dataType: 'string', hidden: false },
  { id: 'b', originalName: 'b', displayName: 'b', dataType: 'string', hidden: true },
] as ColumnDefinition[];

describe('search', () => {
  const rows = [{ a: 'Alice', b: 'TW' }, { a: 'Bob', b: 'JP' }, { a: 'Charlie', b: 'TW' }];
  it('empty query returns all', () => {
    expect(searchRows(rows, cols, '')).toHaveLength(3);
  });
  it('case-insensitive substring', () => {
    expect(searchRows(rows, cols, 'ali')).toHaveLength(1);
  });
  it('only searches visible columns', () => {
    expect(searchRows(rows, cols, 'TW')).toHaveLength(0);
    expect(searchRows(rows, cols.map((c) => ({ ...c, hidden: false })), 'TW')).toHaveLength(2);
  });
});
