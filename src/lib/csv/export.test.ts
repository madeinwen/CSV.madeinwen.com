import { describe, it, expect } from 'vitest';
import { buildExportCsv } from './export';
import type { ColumnDefinition } from '../data/types';

const cols = [
  { id: 'a__0', originalName: 'usr_id', displayName: 'User ID', dataType: 'string', hidden: false },
  { id: 'b__1', originalName: 'usr_nm', displayName: 'User Name', dataType: 'string', hidden: false },
  { id: 'c__2', originalName: 'amt', displayName: 'Amount', dataType: 'number', hidden: true },
] as ColumnDefinition[];

describe('export', () => {
  it('uses display names and skips hidden columns', () => {
    const rows = [{ a__0: '001', b__1: 'Alice', c__2: '1250' }];
    const csv = buildExportCsv(rows, cols);
    expect(csv).toContain('User ID,User Name');
    expect(csv).not.toContain('Amount');
    expect(csv).not.toContain('usr_id');
    expect(csv).toContain('001,Alice');
  });
  it('respects column order', () => {
    const rows = [{ a__0: '001', b__1: 'Alice', c__2: '1' }];
    const csv = buildExportCsv(rows, cols, ['b__1', 'a__0']);
    const header = csv.split('\n')[0].replace(/\r/g, '');
    expect(header).toBe('User Name,User ID');
  });
  it('quotes commas/newlines correctly', () => {
    const rows = [{ a__0: '1', b__1: 'Hello, world', c__2: '1' }];
    const csv = buildExportCsv(rows, cols);
    expect(csv).toContain('"Hello, world"');
  });
  it('exports only filtered rows (caller passes view)', () => {
    const rows = [
      { a__0: '001', b__1: 'Alice', c__2: '1' },
      { a__0: '002', b__1: 'Bob', c__2: '2' },
    ];
    const csv = buildExportCsv(rows.slice(0, 1), cols);
    expect(csv).toContain('Alice');
    expect(csv).not.toContain('Bob');
  });
});
