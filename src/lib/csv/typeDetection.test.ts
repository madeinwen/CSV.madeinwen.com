import { describe, it, expect } from 'vitest';
import { detectDataType } from './typeDetection';

describe('typeDetection', () => {
  it('detects number', () => {
    expect(detectDataType(['123', '456', '789', '1,250', '-3.5'])).toBe('number');
  });
  it('detects date', () => {
    expect(detectDataType(['2026-01-01', '2026-01-02', '2026-03-01'])).toBe('date');
  });
  it('detects boolean', () => {
    expect(detectDataType(['true', 'false', 'TRUE', 'False'])).toBe('boolean');
  });
  it('keeps mixed column as string', () => {
    expect(detectDataType(['123', 'abc', '456', 'def'])).toBe('string');
  });
  it('empty column is string', () => {
    expect(detectDataType(['', null, undefined, '  '])).toBe('string');
  });
  it('does not misjudge 2/10/100 as string sort issue (still number)', () => {
    expect(detectDataType(['2', '10', '100'])).toBe('number');
  });
});
