import type { ColumnDefinition, DataType } from './types';

export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'between'
  | 'contains'
  | 'starts_with'
  | 'ends_with'
  | 'before'
  | 'after';

export type FilterLogic = 'AND' | 'OR';

export interface FilterCondition {
  id: string;
  columnId: string;
  operator: FilterOperator;
  value: string;
  value2?: string;
}

export interface FilterGroup {
  logic: FilterLogic;
  conditions: FilterCondition[];
}

export const EMPTY_FILTER: FilterGroup = { logic: 'AND', conditions: [] };

const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: 'equals',
  not_equals: 'not equals',
  gt: 'greater than',
  lt: 'less than',
  gte: 'greater than or equal',
  lte: 'less than or equal',
  between: 'between',
  contains: 'contains',
  starts_with: 'starts with',
  ends_with: 'ends with',
  before: 'before',
  after: 'after',
};

export function operatorsFor(dataType: DataType): { value: FilterOperator; label: string }[] {
  switch (dataType) {
    case 'number':
      return (['equals', 'not_equals', 'gt', 'lt', 'gte', 'lte', 'between'] as FilterOperator[]).map(
        (o) => ({ value: o, label: OPERATOR_LABELS[o] }),
      );
    case 'date':
    case 'datetime':
      return (['before', 'after', 'between', 'equals', 'not_equals'] as FilterOperator[]).map(
        (o) => ({ value: o, label: OPERATOR_LABELS[o] }),
      );
    case 'boolean':
    case 'category':
      return (['equals', 'not_equals'] as FilterOperator[]).map((o) => ({
        value: o,
        label: o === 'equals' ? 'is' : 'is not',
      }));
    default:
      return (['equals', 'not_equals', 'contains', 'starts_with', 'ends_with'] as FilterOperator[]).map(
        (o) => ({ value: o, label: OPERATOR_LABELS[o] }),
      );
  }
}

function toNum(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/,/g, '').trim());
  return Number.isNaN(n) ? null : n;
}

function toTime(v: unknown): number | null {
  if (v instanceof Date) {
    const t = v.getTime();
    return Number.isNaN(t) ? null : t;
  }
  if (typeof v === 'string') {
    const t = new Date(v.trim()).getTime();
    return Number.isNaN(t) ? null : t;
  }
  return null;
}

function parseInputNum(s: string): number | null {
  if (s.trim() === '') return null;
  const n = Number(s.replace(/,/g, '').trim());
  return Number.isNaN(n) ? null : n;
}

function parseInputTime(s: string): number | null {
  if (s.trim() === '') return null;
  const t = new Date(s.trim()).getTime();
  return Number.isNaN(t) ? null : t;
}

export function testCondition(
  row: Record<string, unknown>,
  col: ColumnDefinition,
  cond: FilterCondition,
): boolean {
  // Empty filter value => don't filter (pass)
  if (cond.value.trim() === '' && cond.operator !== 'between') return true;
  if (cond.operator === 'between' && (cond.value.trim() === '' || (cond.value2 ?? '').trim() === '')) {
    return true;
  }

  const cell = row[col.id];

  switch (col.dataType) {
    case 'number': {
      const c = toNum(cell);
      const v = parseInputNum(cond.value);
      if (c === null || v === null) return true; // invalid => pass, don't break table
      switch (cond.operator) {
        case 'equals':
          return c === v;
        case 'not_equals':
          return c !== v;
        case 'gt':
          return c > v;
        case 'lt':
          return c < v;
        case 'gte':
          return c >= v;
        case 'lte':
          return c <= v;
        case 'between': {
          const v2 = parseInputNum(cond.value2 ?? '');
          if (v2 === null) return true;
          const [lo, hi] = v <= v2 ? [v, v2] : [v2, v];
          return c >= lo && c <= hi;
        }
        default:
          return true;
      }
    }
    case 'date':
    case 'datetime': {
      const c = toTime(cell);
      if (cond.operator === 'between') {
        const v1 = parseInputTime(cond.value);
        const v2 = parseInputTime(cond.value2 ?? '');
        if (c === null || v1 === null || v2 === null) return true;
        const [lo, hi] = v1 <= v2 ? [v1, v2] : [v2, v1];
        return c >= lo && c <= hi;
      }
      if (cond.operator === 'before' || cond.operator === 'after') {
        const v = parseInputTime(cond.value);
        if (c === null || v === null) return true;
        return cond.operator === 'before' ? c < v : c > v;
      }
      // equals / not_equals on dates: compare day (date) or instant (datetime)
      const v = parseInputTime(cond.value);
      if (c === null || v === null) return true;
      if (col.dataType === 'date') {
        const cd = new Date(c).toISOString().slice(0, 10);
        const vd = new Date(v).toISOString().slice(0, 10);
        return cond.operator === 'not_equals' ? cd !== vd : cd === vd;
      }
      return cond.operator === 'not_equals' ? c !== v : c === v;
    }
    default: {
      // string / boolean / category: case-insensitive
      const s = cell === null || cell === undefined ? '' : String(cell).toLowerCase();
      const v = cond.value.toLowerCase();
      switch (cond.operator) {
        case 'equals':
          return s === v;
        case 'not_equals':
          return s !== v;
        case 'contains':
          return s.includes(v);
        case 'starts_with':
          return s.startsWith(v);
        case 'ends_with':
          return s.endsWith(v);
        default:
          return true;
      }
    }
  }
}

export function applyFilters(
  rows: Record<string, unknown>[],
  columns: ColumnDefinition[],
  group: FilterGroup,
): Record<string, unknown>[] {
  if (group.conditions.length === 0) return rows;
  const byId = new Map(columns.map((c) => [c.id, c]));
  // Drop conditions pointing at removed columns
  const active = group.conditions.filter((c) => byId.has(c.columnId));
  if (active.length === 0) return rows;
  return rows.filter((row) => {
    const results = active.map((cond) => testCondition(row, byId.get(cond.columnId)!, cond));
    return group.logic === 'AND' ? results.every(Boolean) : results.some(Boolean);
  });
}
