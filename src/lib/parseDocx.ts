import { ParseResult, Module, Objective, ModuleStatus } from '@/types/journey';
import mammoth from 'mammoth';
import { parse as parseHtml, HTMLElement } from 'node-html-parser';
import { v4 as uuidv4 } from 'uuid';

// ----------------------------------------------------------------
// Public API
// ----------------------------------------------------------------

export async function parseDocxBuffer(buffer: ArrayBuffer): Promise<ParseResult> {
  const warnings: string[] = [];

  // 1. Convert DOCX → HTML via mammoth
  const nodeBuffer = Buffer.from(buffer);
  const result = await mammoth.convertToHtml({ buffer: nodeBuffer });
  if (result.messages.length > 0) {
    result.messages.forEach((m) => warnings.push(`mammoth: ${m.message}`));
  }

  // 2. Parse the HTML and pull out every <table>
  const root = parseHtml(result.value);
  const tables = root.querySelectorAll('table');

  if (tables.length < 2) {
    warnings.push(
      `Expected 2 tables (modules + objectives) but found ${tables.length}.`
    );
  }

  // 3. Turn each table into an array of row-objects keyed by header text
  const tableData = tables.map(tableToRows);

  // 4. Identify which table is modules and which is objectives
  //    by checking for a "Module ID" column in the headers.
  let moduleRows: Record<string, string>[] = [];
  let objectiveRows: Record<string, string>[] = [];

  for (const { headers, rows } of tableData) {
    const normHeaders = headers.map((h) => h.toLowerCase().trim());
    if (normHeaders.includes('module id') && !normHeaders.includes('objective text')) {
      moduleRows = rows;
    } else if (normHeaders.includes('objective text') || normHeaders.includes('module id')) {
      objectiveRows = rows;
    }
  }

  // 5. Map raw rows → typed Module[]
  const modules: Module[] = moduleRows
    .filter((row) => getField(row, 'module id'))
    .map((row) => ({
      id: getField(row, 'module id'),
      title: getField(row, 'module title'),
      shortDescription: getField(row, 'short description'),
      duration: getField(row, 'approx. duration') || getField(row, 'duration') || undefined,
      status: normaliseStatus(getField(row, 'status')),
      topic: getField(row, 'topic') || undefined,
    }));

  const moduleIdSet = new Set(modules.map((m) => m.id));

  // 6. Map raw rows → typed Objective[]
  const objectives: Objective[] = [];
  for (const row of objectiveRows) {
    const moduleId = getField(row, 'module id');
    const text = getField(row, 'objective text');
    if (!text) continue; // skip empty rows

    if (!moduleIdSet.has(moduleId)) {
      warnings.push(
        `Dropped orphan objective "${text.slice(0, 40)}…" — Module ID "${moduleId}" not found.`
      );
      continue;
    }

    objectives.push({
      id: uuidv4(),
      moduleId,
      text,
      bloomType: getField(row, 'bloom / type') || getField(row, 'bloom') || undefined,
      contentType: getField(row, 'content type') || undefined,
      sourceLink: getField(row, 'source link'),
    });
  }

  if (modules.length === 0) {
    warnings.push('No modules were parsed. Check that your DOCX contains a modules table with a "Module ID" column header.');
  }

  // Derive course name from the most common Topic value, or fall back to first module title
  let courseName: string | undefined;
  const topics = modules.map((m) => m.topic).filter(Boolean) as string[];
  if (topics.length > 0) {
    // Pick the most frequent topic as the course name
    const freq: Record<string, number> = {};
    topics.forEach((t) => { freq[t] = (freq[t] || 0) + 1; });
    courseName = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
  } else if (modules.length > 0) {
    courseName = modules[0].title;
  }

  return { modules, objectives, warnings, courseName };
}

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

export function normaliseStatus(value: string): ModuleStatus {
  const v = value.trim().toLowerCase();
  if (v === 'in review' || v === 'inreview') return 'inReview';
  if (v === 'final') return 'final';
  return 'draft';
}

/**
 * Converts an HTML <table> element into an array of row-objects,
 * using the first row as header keys (lowercased, trimmed).
 */
function tableToRows(table: HTMLElement): {
  headers: string[];
  rows: Record<string, string>[];
} {
  const trs = table.querySelectorAll('tr');
  if (trs.length === 0) return { headers: [], rows: [] };

  // First row = headers
  const headerCells = trs[0].querySelectorAll('td, th');
  const headers = headerCells.map((cell) => cell.textContent.trim());

  // Remaining rows = data
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < trs.length; i++) {
    const cells = trs[i].querySelectorAll('td, th');
    const row: Record<string, string> = {};
    cells.forEach((cell, idx) => {
      const key = headers[idx];
      if (key) {
        row[key.toLowerCase()] = cell.textContent.trim();
      }
    });

    // Skip completely empty rows
    if (Object.values(row).some((v) => v.length > 0)) {
      rows.push(row);
    }
  }

  return { headers, rows };
}

/**
 * Case-insensitive field lookup from a row object.
 */
function getField(row: Record<string, string>, fieldName: string): string {
  return row[fieldName.toLowerCase()] ?? '';
}
