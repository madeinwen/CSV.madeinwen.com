import Papa from 'papaparse';
import type { ColumnDefinition, Dataset, ParseIssue } from '../data/types';
import { detectDataType } from './typeDetection';

export interface ParsedCsv {
  dataset: Dataset;
  issues: ParseIssue[];
}

function slugId(name: string, index: number): string {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  return (base || `col_${index}`) + `__${index}`;
}

export function parseCsvText(fileName: string, text: string): ParsedCsv {
  const issues: ParseIssue[] = [];

  if (!text || text.trim() === '') {
    throw new Error('This file is empty. Please choose a CSV file with a header row and data.');
  }

  const result = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim(),
  });

  if (result.errors && result.errors.length > 0) {
    for (const e of result.errors.slice(0, 5)) {
      issues.push({
        row: typeof e.row === 'number' ? e.row + 1 : undefined,
        message: e.message || `Parse error (code ${e.code})`,
      });
    }
    // TooManyFields / TooFewFields indicate inconsistent columns
    const fatal = result.errors.find((e) => e.code === 'TooManyFields' || e.code === 'TooFewFields');
    if (fatal) {
      const rowInfo = typeof fatal.row === 'number' ? ` around row ${fatal.row + 1}` : '';
      throw new Error(
        `Unable to read this CSV. The file appears to contain inconsistent columns${rowInfo}.`,
      );
    }
  }

  const rawRows = (result.data ?? []).filter((r) => r && typeof r === 'object');
  if (rawRows.length === 0) {
    throw new Error('No data rows found. Please check that the file has a header row and data.');
  }

  const fields = (result.meta.fields ?? Object.keys(rawRows[0] as object)).map((f) => String(f));
  if (fields.length === 0 || (fields.length === 1 && fields[0].trim() === '')) {
    throw new Error('Unable to read this CSV. No header row was detected.');
  }

  // Detect inconsistent row lengths via Papa errors already; also guard huge files
  if (rawRows.length > 500_000) {
    issues.push({ message: 'Very large file: only the first 500,000 rows will be previewed efficiently.' });
  }

  const columns: ColumnDefinition[] = fields.map((originalName, i) => {
    const sampleValues = rawRows.slice(0, 1000).map((r) => (r as Record<string, unknown>)[originalName]);
    return {
      id: slugId(originalName, i),
      originalName,
      displayName: originalName,
      dataType: detectDataType(sampleValues),
      hidden: false,
    };
  });

  const rows: Record<string, unknown>[] = rawRows.map((r) => {
    const rec = r as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const c of columns) {
      const v = rec[c.originalName];
      out[c.id] = typeof v === 'string' ? (v.trim() === '' ? null : v) : (v ?? null);
    }
    return out;
  });

  return {
    dataset: { name: fileName, columns, rows, rowCount: rows.length },
    issues,
  };
}

export async function parseCsvFile(file: File): Promise<ParsedCsv> {
  if (!/\.csv$/i.test(file.name) && file.type !== 'text/csv' && file.type !== '') {
    throw new Error('Unsupported file. Please choose a .csv file.');
  }
  const text = await file.text();
  // Quick UTF-8 sanity: File.text() decodes as UTF-8; replacement chars indicate issues
  if (text.includes('�')) {
    throw new Error('Unable to decode this file as UTF-8. Please save it as UTF-8 CSV and retry.');
  }
  return parseCsvText(file.name, text);
}
