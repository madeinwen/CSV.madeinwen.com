import { describe, it, expect } from 'vitest';
import { formatCellValue, updateColumn, visibleColumns } from './columns';
import type { ColumnDefinition } from './types';

const base: ColumnDefinition[] = [
  { id: 'a__0', originalName: 'usr_nm', displayName: 'usr_nm', dataType: 'string', hidden: false },
  { id: 'b__1', originalName: 'amt', displayName: 'amt', dataType: 'number', hidden: false },
];

describe('columns', () => {
  it('rename changes displayName but keeps id/originalName', () => {
    const next = updateColumn(base, 'a__0', { displayName: 'User Name' });
    expect(next[0].displayName).toBe('User Name');
    expect(next[0].originalName).toBe('usr_nm');
    expect(next[0].id).toBe('a__0');
  });
  it('empty displayName falls back to originalName', () => {
    const next = updateColumn(base, 'a__0', { displayName: '   ' });
    expect(next[0].displayName).toBe('usr_nm');
  });
  it('hide filters visible columns; raw columns kept', () => {
    const next = updateColumn(base, 'b__1', { hidden: true });
    expect(next).toHaveLength(2); // Hide !== delete
    expect(visibleColumns(next).map((c) => c.id)).toEqual(['a__0']);
  });
  it('decimalPlaces formats numbers', () => {
    const next = updateColumn(base, 'b__1', { decimalPlaces: 2 });
    expect(formatCellValue('1250', next[1])).toBe('1250.00');
    expect(formatCellValue(3.14159, next[1])).toBe('3.14');
  });
  it('invalid width/decimalPlaces are ignored', () => {
    const next = updateColumn(base, 'b__1', { width: -5, decimalPlaces: 99 });
    expect(next[1].width).toBeUndefined();
    expect(next[1].decimalPlaces).toBeUndefined();
  });
});
