export type DataType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'category';

export interface ColumnDefinition {
  id: string;
  originalName: string;
  displayName: string;
  dataType: DataType;
  description?: string;
  unit?: string;
  hidden: boolean;
  width?: number;
  decimalPlaces?: number;
  dateFormat?: string;
}

export interface Dataset {
  name: string;
  columns: ColumnDefinition[];
  rows: Record<string, unknown>[];
  rowCount: number;
}

export interface ParseIssue {
  row?: number;
  message: string;
}
