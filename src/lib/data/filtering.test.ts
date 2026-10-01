import { describe, it, expect } from 'vitest';
import { applyFilters, type FilterGroup } from './filtering';
import type { ColumnDefinition } from './types';

const numCol = { id: 'n', originalName: 'n', displayName: 'n', dataType: 'number', hidden: false } as ColumnDefinition;
const strCol = { id: 's', originalName: 's', displayName: 's', dataType: 'string', hidden: false } as ColumnDefinition;
const dateCol = { id: 'd', originalName: 'd', displayName: 'd', dataType: 'date', hidden: false } as ColumnDefinition;
const cols = [numCol, strCol, dateCol];

const rows = [
  { n: '5', s: 'Alice', d: '2026-01-01' },
  { n: '15', s: 'Bob', d: '2026-01-10' },
  { n: '25', s: 'Charlie', d: '2026-02-01' },
];

describe('filtering', () => {
  it('number greater than', () => {
    const g: FilterGroup = {
      logic: 'AND',
      conditions: [{ id: '1', columnId: 'n', operator: 'gt', value: '10' }],
    };
    expect(applyFilters(rows, cols, g)).toHaveLength(2);
  });
  it('number between', () => {
    const g: FilterGroup = {
      logic: 'AND',
      conditions: [{ id: '1', columnId: 'n', operator: 'between', value: '10', value2: '20' }],
    };
    expect(applyFilters(rows, cols, g).map((r) => r.s)).toEqual(['Bob']);
  });
  it('string contains (case-insensitive)', () => {
    const g: FilterGroup = {
      logic: 'AND',
      conditions: [{ id: '1', columnId: 's', operator: 'contains', value: 'ALI' }],
    };
    expect(applyFilters(rows, cols, g).map((r) => r.s)).toEqual(['Alice']);
  });
  it('date before/after/between', () => {
    const before: FilterGroup = {
      logic: 'AND',
      conditions: [{ id: '1', columnId: 'd', operator: 'before', value: '2026-01-05' }],
    };
    expect(applyFilters(rows, cols, before).map((r) => r.s)).toEqual(['Alice']);
    const between: FilterGroup = {
      logic: 'AND',
      conditions: [{ id: '1', columnId: 'd', operator: 'between', value: '2026-01-05', value2: '2026-01-20' }],
    };
    expect(applyFilters(rows, cols, between).map((r) => r.s)).toEqual(['Bob']);
  });
  it('AND vs OR', () => {
    const and: FilterGroup = {
      logic: 'AND',
      conditions: [
        { id: '1', columnId: 'n', operator: 'gt', value: '10' },
        { id: '2', columnId: 's', operator: 'contains', value: 'Bob' },
      ],
    };
    const or: FilterGroup = { ...and, logic: 'OR' };
    expect(applyFilters(rows, cols, and)).toHaveLength(1);
    expect(applyFilters(rows, cols, or)).toHaveLength(2);
  });
  it('empty value passes (does not break table)', () => {
    const g: FilterGroup = {
      logic: 'AND',
      conditions: [{ id: '1', columnId: 'n', operator: 'gt', value: '' }],
    };
    expect(applyFilters(rows, cols, g)).toHaveLength(3);
  });
});
