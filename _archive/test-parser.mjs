// Quick script to generate a sample DOCX and test the parser.
import { Document, Packer, Table, TableRow, TableCell, Paragraph } from 'docx';
import fs from 'fs';

// -- Build a modules table --
const moduleHeaders = ['Module ID', 'Module title', 'Short description', 'Status', 'Approx. duration', 'Topic'];
const moduleData = [
  ['MOD-01', 'Getting Started with Jira', 'Intro to Jira basics', 'final', '30 min', 'Jira'],
  ['MOD-02', 'Boards and Backlogs', 'Using boards and managing backlogs', 'in review', '45 min', 'Jira'],
  ['MOD-03', 'Confluence Spaces', 'Creating and organising spaces', 'draft', '20 min', 'Confluence'],
];

function makeRow(cells) {
  return new TableRow({
    children: cells.map(
      (text) => new TableCell({ children: [new Paragraph(text)] })
    ),
  });
}

const modulesTable = new Table({
  rows: [makeRow(moduleHeaders), ...moduleData.map(makeRow)],
});

// -- Build an objectives table --
const objHeaders = ['Objective text', 'Module ID', 'Source link', 'Bloom / type', 'Content type'];
const objData = [
  ['Create a new Jira project', 'MOD-01', 'https://example.com/1', 'Apply', 'Hands-on'],
  ['Navigate the board view', 'MOD-02', 'https://example.com/2', 'Understand', 'Video'],
  ['Set up a Confluence space', 'MOD-03', 'https://example.com/3', 'Apply', 'Walkthrough'],
  ['Orphan objective with bad ID', 'MOD-99', 'https://example.com/4', 'Remember', 'Text'],
];

const objectivesTable = new Table({
  rows: [makeRow(objHeaders), ...objData.map(makeRow)],
});

const doc = new Document({
  sections: [
    {
      children: [
        new Paragraph('Course Design Document'),
        modulesTable,
        new Paragraph(''),
        objectivesTable,
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync('test-input.docx', buffer);
console.log('Created test-input.docx');

// Now test the parser
// We need to use dynamic import with tsx or compile, but since parseDocx uses @/ alias,
// let's just call the API endpoint approach. Instead, let's do a direct mammoth + parser test.

import mammoth from 'mammoth';
import { parse as parseHtml } from 'node-html-parser';
import { v4 as uuidv4 } from 'uuid';

const result = await mammoth.convertToHtml({ buffer: buffer.buffer });
console.log('\n--- Mammoth HTML (tables only) ---');
const root = parseHtml(result.value);
const tables = root.querySelectorAll('table');
console.log(`Found ${tables.length} table(s)\n`);

// Replicate the parser logic inline for testing
function normaliseStatus(value) {
  const v = value.trim().toLowerCase();
  if (v === 'in review' || v === 'inreview') return 'inReview';
  if (v === 'final') return 'final';
  return 'draft';
}

function tableToRows(table) {
  const trs = table.querySelectorAll('tr');
  if (trs.length === 0) return { headers: [], rows: [] };
  const headerCells = trs[0].querySelectorAll('td, th');
  const headers = headerCells.map((cell) => cell.textContent.trim());
  const rows = [];
  for (let i = 1; i < trs.length; i++) {
    const cells = trs[i].querySelectorAll('td, th');
    const row = {};
    cells.forEach((cell, idx) => {
      const key = headers[idx];
      if (key) row[key.toLowerCase()] = cell.textContent.trim();
    });
    if (Object.values(row).some((v) => v.length > 0)) rows.push(row);
  }
  return { headers, rows };
}

const tableData = tables.map(tableToRows);

let moduleRows = [];
let objectiveRows = [];
for (const { headers, rows } of tableData) {
  const normHeaders = headers.map((h) => h.toLowerCase().trim());
  if (normHeaders.includes('module id') && !normHeaders.includes('objective text')) {
    moduleRows = rows;
  } else if (normHeaders.includes('objective text')) {
    objectiveRows = rows;
  }
}

const modules = moduleRows
  .filter((row) => row['module id'])
  .map((row) => ({
    id: row['module id'],
    title: row['module title'],
    shortDescription: row['short description'],
    status: normaliseStatus(row['status'] || 'draft'),
  }));

const moduleIdSet = new Set(modules.map((m) => m.id));

const objectives = [];
const warnings = [];
for (const row of objectiveRows) {
  const moduleId = row['module id'];
  const text = row['objective text'];
  if (!text) continue;
  if (!moduleIdSet.has(moduleId)) {
    warnings.push(`Dropped orphan: "${text}" (Module ID: ${moduleId})`);
    continue;
  }
  objectives.push({ id: uuidv4().slice(0, 8), moduleId, text });
}

console.log('--- MODULES ---');
console.log(JSON.stringify(modules, null, 2));
console.log('\n--- OBJECTIVES ---');
console.log(JSON.stringify(objectives, null, 2));
console.log('\n--- WARNINGS ---');
console.log(warnings);
