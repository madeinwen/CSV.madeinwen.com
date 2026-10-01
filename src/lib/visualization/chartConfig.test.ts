import { describe, it, expect } from 'vitest';
import {
  aggregateBar,
  aggregateLine,
  aggregatePie,
  aggregateScatter,
  defaultConfig,
  suggestChart,
} from './chartConfig';
import type { ColumnDefinition } from '../data/types';

const cat = { id: 'c', originalName: 'c', displayName: 'c', dataType: 'category', hidden: false } as ColumnDefinition;
const num = { id: 'n', originalName: 'n', displayName: 'n', dataType: 'number', hidden: false } as ColumnDefinition;
const num2 = { id: 'm', originalName: 'm', displayName: 'm', dataType: 'number', hidden: false } as ColumnDefinition;
const date = { id: 'd', originalName: 'd', displayName: 'd', dataType: 'date', hidden: false } as ColumnDefinition;

const rows = [
  { c: 'TW', n: '10', m: '1', d: '2026-01-01' },
  { c: 'TW', n: '20', m: '2', d: '2026-01-02' },
  { c: 'JP', n: '30', m: '3', d: '2026-01-03' },
];

describe('chartConfig', () => {
  it('bar aggregates mean of Y per X', () => {
    const b = aggregateBar(rows, cat, num);
    expect(b.find((x) => x.x === 'TW')?.value).toBeCloseTo(15);
    expect(b.find((x) => x.x === 'JP')?.value).toBe(30);
  });
  it('bar without Y counts rows', () => {
    const b = aggregateBar(rows, cat, undefined);
    expect(b.find((x) => x.x === 'TW')?.value).toBe(2);
  });
  it('line sorts by X', () => {
    const l = aggregateLine([...rows].reverse(), date, num);
    expect(l.map((x) => x.x)).toEqual(['2026-01-01', '2026-01-02', '2026-01-03']);
  });
  it('pie counts or sums', () => {
    expect(aggregatePie(rows, cat, undefined).find((x) => x.name === 'TW')?.value).toBe(2);
    expect(aggregatePie(rows, cat, num).find((x) => x.name === 'TW')?.value).toBe(30);
  });
  it('scatter pairs numerics', () => {
    expect(aggregateScatter(rows, num, num2)).toHaveLength(3);
  });
  it('suggests sensibly + defaults', () => {
    expect(suggestChart(date, num)).toBe('line');
    expect(suggestChart(num, num2)).toBe('scatter');
    expect(suggestChart(cat, num)).toBe('bar');
    const d = defaultConfig([cat, num]);
    expect(d.xColumnId).toBeDefined();
    expect(d.yColumnId).toBe('n');
  });
});
