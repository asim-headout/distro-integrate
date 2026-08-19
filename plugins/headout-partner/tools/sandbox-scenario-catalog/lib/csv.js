const fs = require("fs");
const path = require("path");

const COLUMNS = [
  "scenarioId", "category", "scenarioName", "productId", "variantId",
  "tourId", "inventoryId", "evidence", "fixtureFile", "firstVerifiedAt", "lastVerifiedAt", "status",
];

function esc(v) {
  const s = v === undefined || v === null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function parseLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { cur += c; }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { out.push(cur); cur = ""; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}

function readCsv(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, "utf8").split("\n").filter((l) => l.length > 0);
  if (lines.length === 0) return [];
  const header = parseLine(lines[0]);
  return lines.slice(1).map((line) => {
    const vals = parseLine(line);
    const row = {};
    header.forEach((h, i) => (row[h] = vals[i] ?? ""));
    return row;
  });
}

function writeCsv(filePath, rows) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  // Stable-sort by scenarioId (then tourId) so the N examples for each
  // scenario land on adjacent rows — reads as visually grouped in any
  // spreadsheet viewer without needing real merged cells.
  const sorted = [...rows].sort((a, b) => {
    if (a.scenarioId !== b.scenarioId) return a.scenarioId < b.scenarioId ? -1 : 1;
    return String(a.tourId).localeCompare(String(b.tourId));
  });
  const lines = [COLUMNS.join(",")];
  for (const row of sorted) {
    lines.push(COLUMNS.map((c) => esc(row[c])).join(","));
  }
  // Write to a temp file then rename, so a process kill mid-write (this tool
  // calls writeCsv after every single match during long discover runs) can
  // never leave scenarios.csv truncated/corrupted — rename is atomic, a raw
  // writeFileSync is not. Confirmed root cause of a real incident: several
  // rows lost their `status` value after a background run was killed.
  const tmpPath = `${filePath}.tmp-${process.pid}`;
  fs.writeFileSync(tmpPath, lines.join("\n") + "\n");
  fs.renameSync(tmpPath, filePath);
}

module.exports = { readCsv, writeCsv, COLUMNS };
