const fs = require('fs');
const path = require('path');
const os = require('os');
const { exportReport, serializeReport, toDotenv, toMarkdown } = require('../export');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envdiff-export-'));
}

const sampleReport = {
  summary: { total: 3, missing: 1, mismatched: 1, ok: 1 },
  diff: {
    API_KEY: { status: 'missing', missingIn: ['.env.prod'] },
    DB_URL: { status: 'mismatch', values: { '.env.dev': 'localhost', '.env.prod': 'db.prod.com' } },
    PORT: { status: 'ok', values: { '.env.dev': '3000', '.env.prod': '3000' } }
  }
};

describe('serializeReport', () => {
  test('throws on unknown format', () => {
    expect(() => serializeReport(sampleReport, 'xml')).toThrow('Unsupported export format: xml');
  });

  test('json format produces valid JSON', () => {
    const out = serializeReport(sampleReport, 'json');
    expect(() => JSON.parse(out)).not.toThrow();
    expect(JSON.parse(out).summary.total).toBe(3);
  });

  test('dotenv format includes keys', () => {
    const out = serializeReport(sampleReport, 'dotenv');
    expect(out).toContain('API_KEY=');
    expect(out).toContain('DB_URL=');
    expect(out).toContain('PORT=');
    expect(out).toContain('# MISSING in .env.prod');
  });

  test('markdown format includes table', () => {
    const out = serializeReport(sampleReport, 'markdown');
    expect(out).toContain('# envdiff Report');
    expect(out).toContain('| Key | Status | Detail |');
    expect(out).toContain('API_KEY');
    expect(out).toContain('missing');
  });
});

describe('exportReport', () => {
  let tmpDir;
  beforeEach(() => { tmpDir = makeTmpDir(); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  test('writes json file to disk', () => {
    const outPath = path.join(tmpDir, 'report.json');
    exportReport(sampleReport, outPath, 'json');
    expect(fs.existsSync(outPath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    expect(content.summary.missing).toBe(1);
  });

  test('creates nested directories if needed', () => {
    const outPath = path.join(tmpDir, 'nested', 'deep', 'report.md');
    exportReport(sampleReport, outPath, 'markdown');
    expect(fs.existsSync(outPath)).toBe(true);
  });

  test('returns the output path', () => {
    const outPath = path.join(tmpDir, 'out.dotenv');
    const result = exportReport(sampleReport, outPath, 'dotenv');
    expect(result).toBe(outPath);
  });
});
