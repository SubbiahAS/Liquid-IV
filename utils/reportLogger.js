// utils/reportLogger.js

const fs   = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, '../reports/raw-results.json');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveStatus(entry) {
  if (!entry) return 'N/A';
  const step   = String(entry.step   || '').trim().toUpperCase();
  const status = String(entry.status || '').trim().toUpperCase();
  if (['PASS', 'FAIL', 'SKIP'].includes(step))   return step;
  if (['PASS', 'FAIL', 'SKIP'].includes(status)) return status;
  return 'N/A';
}

function parseExpected(expected) {
  if (!expected || typeof expected !== 'string') return [];
  const cleaned = expected
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/gi, ' ')
    .trim();
  if (!cleaned) return [];
  const parts = cleaned.split(/(?=\d+\.\s)/).map(p => p.trim()).filter(Boolean);
  return parts.length <= 1
    ? [{ point: cleaned, status: '' }]
    : parts.map(p => ({ point: p, status: '' }));
}

function matchExpectedToSteps(expectedItems, stepResults) {
  return expectedItems.map((item, index) => ({
    ...item,
    status: stepResults[index] ? resolveStatus(stepResults[index]) : 'N/A',
  }));
}

function buildFromSteps(stepResults) {
  return stepResults.map((r, i) => {
    const status  = resolveStatus(r);
    const details = String(r.details || r.status || r.step || '').trim();
    const isToken = ['PASS', 'FAIL', 'SKIP', 'N/A'].includes(details.toUpperCase());
    const point   = isToken ? `Step ${i + 1}` : details;
    return { point: `${i + 1}. ${point}`, status };
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function logResult(data) {
  const testId   = data.testId    || data.testCaseId || '';
  const scenario = data.scenario  || data.title      || '';
  const expected = data.expected  || '';

  const stepResults = Array.isArray(data.results) ? data.results
                    : Array.isArray(data.steps)   ? data.steps
                    : [];

  const expectedResults = expected
    ? matchExpectedToSteps(parseExpected(expected), stepResults)
    : buildFromSteps(stepResults);

  let overallStatus = data.status || '';
  if (!overallStatus && stepResults.length > 0) {
    const statuses = stepResults.map(resolveStatus);
    overallStatus = statuses.some(s => s === 'FAIL') ? 'FAIL'
                  : statuses.every(s => s === 'SKIP') ? 'SKIP' : 'PASS';
  }

  // Persist to raw-results.json
  const entry = {
    testId, scenario,
    module:   data.module   || '',
    priority: data.priority || '',
    status:   overallStatus,
    results:  stepResults,
    expectedResults,
  };

  if (!fs.existsSync(reportPath)) {
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify([], null, 2));
  }

  let existing = [];
  try { existing = JSON.parse(fs.readFileSync(reportPath, 'utf8')); } catch { existing = []; }
  existing.push(entry);
  fs.writeFileSync(reportPath, JSON.stringify(existing, null, 2));

  // ── KEY FIX: Write expectedResults as a tagged console.log ───────────────
  // Monocart 2.11.2 captures console.log output into the test's `logs` array.
  // The visitor in playwright.config.js will parse this line and build the column.
  // The tag ##EXPECTED_RESULTS## is used to identify this specific log line.
  console.log(`##EXPECTED_RESULTS##${JSON.stringify(expectedResults)}`);
}

logResult._testInfo = null;

module.exports = { logResult };
