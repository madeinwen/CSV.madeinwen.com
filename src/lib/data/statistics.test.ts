import { describe, it, expect } from 'vitest';
import { datasetQuality, summarizeColumn } from './statistics';
import type { ColumnDefinition } from './types';

const numCol = { id: 'n', originalName: 'n', displayName: 'n', dataType: 'number', hidden: false } as ColumnDefinition;
const strCol = { id: 's', originalName: 's', displayName: 's', dataType: 'string', hidden: false } as ColumnDefinition;

describe('statistics', () => {
  it('numeric count/mean/median/min/max/sum/missing/unique', () => {
    const rows = [{ n: '2' }, { n: '10' }, { n: '100' }, { n: null }, { n: '' }];
    const s = summarizeColumn(rows, numCol);
    expect(s.kind).toBe('number');
    if (s.kind !== 'number') return;
    expect(s.count).toBe(5);
    expect(s.missing).toBe(2);
    expect(s.min).toBe(2);
    expect(s.max).toBe(100);
    expect(s.sum).toBe(112);
    expect(s.mean).toBeCloseTo(112 / 3);
    expect(s.median).toBe(10);
    expect(s.unique).toBe(3);
  });
  it('category unique + top values', () => {
    const rows = [{ s: 'TW' }, { s: 'TW' }, { s: 'JP' }, { s: null }];
    const s = summarizeColumn(rows, strCol);
    expect(s.kind).toBe('category');
    if (s.kind !== 'category') return;
    expect(s.count).toBe(4);
    expect(s.missing).toBe(1);
    expect(s.unique).toBe(2);
    expect(s.top[0]).toEqual({ value: 'TW', count: 2 });
  });
  it('dataset quality rows/cols/missing/duplicates', () => {
    const cols = [numCol, strCol];
    const rows = [
      { n: '1', s: 'a' },
      { n: '1', s: 'a' },
      { n: null, s: 'b' },
    ];
    const q = datasetQuality(rows, cols);
    expect(q.rows).toBe(3);
    expect(q.columns).toBe(2);
    expect(q.missingCells).toBe(1);
    expect(q.totalCells).toBe(6);
    expect(q.duplicateRows).toBe(1);
  });
});
