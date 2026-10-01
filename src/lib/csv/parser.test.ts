import { describe, it, expect } from 'vitest';
import { parseCsvText } from './parser';

describe('parser', () => {
  it('parses normal CSV', () => {
    const { dataset } = parseCsvText('users.csv', 'usr_id,usr_nm,amt\n001,Alice,1250\n002,Bob,830');
    expect(dataset.columns.map((c) => c.originalName)).toEqual(['usr_id', 'usr_nm', 'amt']);
    expect(dataset.rowCount).toBe(2);
  });
  it('handles quoted comma', () => {
    const { dataset } = parseCsvText('q.csv', 'name,description\nAlice,"Hello, world"');
    expect(dataset.rows[0][dataset.columns[1].id]).toBe('Hello, world');
  });
  it('handles empty values as null', () => {
    const { dataset } = parseCsvText('e.csv', 'a,b\n1,\n,2');
    expect(Object.values(dataset.rows[0])).toContain(null);
  });
  it('handles UTF-8', () => {
    const { dataset } = parseCsvText('u.csv', 'name,city\n小明,台北');
    expect(dataset.rowCount).toBe(1);
  });
  it('throws friendly error on empty', () => {
    expect(() => parseCsvText('e.csv', '')).toThrowError(/empty/i);
  });
  it('throws friendly error on inconsistent columns', () => {
    expect(() => parseCsvText('bad.csv', 'a,b\n1,2,3\n4')).toThrowError(/inconsistent columns/);
  });
});
