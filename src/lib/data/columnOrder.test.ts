import { describe, it, expect } from 'vitest';
import { moveColumn } from './columns';
import type { ColumnDefinition } from './types';

const cols = (names: string[]): ColumnDefinition[] =>
  names.map((n, i) => ({
    id: `${n}__${i}`,
    originalName: n,
    displayName: n,
    dataType: 'string',
    hidden: false,
  }));

describe('moveColumn', () => {
  it('moves left and right', () => {
    const c = cols(['a', 'b', 'x']);
    expect(moveColumn(c, 'x__2', -1).map((x) => x.id)).toEqual(['a__0', 'x__2', 'b__1']);
    expect(moveColumn(c, 'a__0', 1).map((x) => x.id)).toEqual(['b__1', 'a__0', 'x__2']);
  });
  it('no-op at edges or unknown id', () => {
    const c = cols(['a', 'b']);
    expect(moveColumn(c, 'a__0', -1)).toBe(c);
    expect(moveColumn(c, 'b__1', 1)).toBe(c);
    expect(moveColumn(c, 'zzz', 1)).toBe(c);
  });
});
