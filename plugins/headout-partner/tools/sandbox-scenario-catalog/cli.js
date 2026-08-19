#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const config = require("./config.json");
const { apiGet, configureRateLimit } = require("./lib/api");
const checkers = require("./lib/checkers");
const { readCsv, writeCsv } = require("./lib/csv");

const OUTPUT_PATH = path.join(__dirname, config.output);
const FIXTURES_DIR = path.join(__dirname, "output", "fixtures");
const CHECKLIST_PATH = path.join(__dirname, "output", "CHECKLIST.md");

function writeFixture(scenarioId, tourId, fixture) {
  if (fixture === undefined) return "";
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  const relPath = path.join("fixtures", `${scenarioId}__${tourId}.json`);
  fs.writeFileSync(path.join(__dirname, "output", relPath), JSON.stringify(fixture, null, 2) + "\n");
  return relPath;
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    } else {
      args._.push(a);
    }
  }
  return args;
}

function nowIso() {
  // Wall-clock timestamp intentionally not injected via any deterministic
  // source — this is a real CLI run, not a Workflow script.
  return new Date().toISOString();
}

function loadScenarios(filterArg) {
  const all = config.scenarios;
  if (!filterArg || filterArg === "all") return all;
  const ids = new Set(String(filterArg).split(",").map((s) => s.trim()));
  return all.filter((s) => ids.has(s.id));
}

function satisfiedCounts(rows) {
  const counts = {};
  for (const r of rows) {
    if (r.status === "OK") counts[r.scenarioId] = (counts[r.scenarioId] || 0) + 1;
  }
  return counts;
}

function notFoundScenarioIds(rows) {
  return new Set(rows.filter((r) => r.status === "NOT_FOUND").map((r) => r.scenarioId));
}

async function fetchProductList({ cityCode, offset, limit }) {
  const qs = new URLSearchParams({ offset: String(offset), limit: String(limit) });
  if (cityCode) qs.set("cityCode", cityCode);
  return apiGet(`/products/?${qs.toString()}`);
}

async function fetchAllCityCodes() {
  const codes = [];
  let offset = 0;
  const limit = 20; // API max
  while (true) {
    const page = await apiGet(`/cities/?${new URLSearchParams({ offset: String(offset), limit: String(limit) })}`);
    const cities = page.cities || [];
    codes.push(...cities.map((c) => c.code));
    if (!page.nextUrl && !page.nextOffset) break;
    if (cities.length === 0) break;
    offset += limit;
  }
  return codes;
}

async function fetchProduct(id) {
  return apiGet(`/products/${id}`);
}

async function fetchInventoriesByTour(tourId, { limit = 1 } = {}) {
  const startDateTime = new Date().toISOString().slice(0, 16);
  const qs = new URLSearchParams({ tourId: String(tourId), currencyCode: "USD", startDateTime, limit: String(limit) });
  return apiGet(`/inventory/list-by/tour/?${qs.toString()}`);
}

async function fetchInventoryDetails(inventoryId) {
  return apiGet(`/inventories/${inventoryId}/`);
}

function needsInventoryDetails(scenario) {
  return scenario.checker === "inventoryFieldsDifferFromVariant" || (scenario.params && scenario.params.source === "inventory");
}

// Distinct from needsInventoryDetails: checkers reading per-pax-type pricing
// (e.g. paxRange.max) only need the /inventory/list-by/tour list response,
// not the extra /inventories/{id} details call.
function needsInventoryList(scenario) {
  return needsInventoryDetails(scenario) || scenario.checker === "hasNonNullPersonPaxRangeMax";
}

async function evaluateProductForScenarios(product, scenarios) {
  const matches = []; // { scenarioId, variantId, tourId, inventoryId, evidence }
  const anyNeedsList = scenarios.some(needsInventoryList);
  const anyNeedsDetails = scenarios.some(needsInventoryDetails);

  for (const variant of product.variants || []) {
    let inventoryDetails = null;
    let inventoryListItem = null;
    let sampleInventoryId = null;

    if (anyNeedsList) {
      try {
        const invResp = await fetchInventoriesByTour(variant.id, { limit: 1 });
        const first = (invResp.items || [])[0];
        if (first) {
          sampleInventoryId = first.id;
          inventoryListItem = first;
          if (anyNeedsDetails) {
            inventoryDetails = await fetchInventoryDetails(first.id);
          }
        }
      } catch (e) {
        // sandbox slots can be closed/empty for a given variant; skip inventory-level checks for it
      }
    }

    for (const scenario of scenarios) {
      const fn = checkers[scenario.checker];
      if (!fn) throw new Error(`Unknown checker: ${scenario.checker} (scenario ${scenario.id})`);
      if (needsInventoryDetails(scenario) && !inventoryDetails) continue;
      if (scenario.checker === "hasNonNullPersonPaxRangeMax" && !inventoryListItem) continue;
      const result = fn({ product, variant, inventoryDetails, inventoryListItem }, scenario.params || {});
      if (result) {
        matches.push({
          scenarioId: scenario.id,
          category: scenario.category,
          scenarioName: scenario.name,
          productId: product.id,
          variantId: variant.id,
          tourId: variant.id,
          inventoryId: sampleInventoryId || "",
          evidence: result.evidence,
          fixture: result.fixture,
        });
      }
    }
  }
  return matches;
}

async function scanCity(cityCode, { scenarios, remainingUnsatisfied, recordMatch, maxProducts }) {
  const limit = 50;
  let offset = 0;
  let scanned = 0;
  while (remainingUnsatisfied() && scanned < maxProducts) {
    let page;
    try {
      page = await fetchProductList({ cityCode, offset, limit });
    } catch (e) {
      console.error(`  [error] products list (${cityCode || "no city"}) offset=${offset}: ${e.message}`);
      break;
    }
    const items = page.products || page.items || [];
    if (items.length === 0) break;

    for (const item of items) {
      if (!remainingUnsatisfied()) break;
      scanned++;
      try {
        const product = await fetchProduct(item.id);
        const matches = await evaluateProductForScenarios(product, scenarios);
        matches.forEach(recordMatch);
      } catch (e) {
        console.error(`  [error] product ${item.id}: ${e.message}`);
      }
    }
    offset += limit;
    if (!page.nextUrl && !page.nextOffset) break;
  }
  return scanned;
}

async function cmdDiscover(args) {
  // Hard cap of 90 req/min by default — under the "don't hit 100/min" ceiling
  // with margin. This is enforced regardless of --concurrency/--delay-ms.
  configureRateLimit({
    concurrency: args.concurrency ? Number(args.concurrency) : 3,
    delayMs: args["delay-ms"] ? Number(args["delay-ms"]) : 250,
    maxPerMinute: args["max-per-minute"] ? Number(args["max-per-minute"]) : 90,
  });

  const existingRows = readCsv(OUTPUT_PATH);
  const counts = satisfiedCounts(existingRows);
  const notFound = notFoundScenarioIds(existingRows);
  let scenarios = loadScenarios(args.scenario);
  scenarios = scenarios.filter((s) => (counts[s.id] || 0) < (s.earlyExitMatches || config.defaultEarlyExitMatches));

  if (!args.force) {
    const skipped = scenarios.filter((s) => notFound.has(s.id));
    if (skipped.length) {
      console.log(`Skipping ${skipped.length} scenario(s) already confirmed NOT_FOUND in a prior scan (use --force to re-attempt): ${skipped.map((s) => s.id).join(", ")}`);
    }
    scenarios = scenarios.filter((s) => !notFound.has(s.id));
  }

  if (scenarios.length === 0) {
    console.log("All requested scenarios already satisfied (or confirmed NOT_FOUND) in output CSV. Nothing to discover. Use --force to re-run anyway.");
    if (!args.force) return;
    scenarios = loadScenarios(args.scenario);
  }

  console.log(`Discovering for ${scenarios.length} unsatisfied scenario(s): ${scenarios.map((s) => s.id).join(", ")}`);

  const newRows = [];
  const localCounts = { ...counts };

  // Long --all-cities runs can take a very long time; a crash or manual kill
  // mid-run must not lose already-found matches. Persist the CSV after every
  // single match rather than only once at the very end.
  const recordMatch = (m) => {
    const target = scenarios.find((s) => s.id === m.scenarioId);
    const limit = target.earlyExitMatches || config.defaultEarlyExitMatches;
    if ((localCounts[m.scenarioId] || 0) >= limit) return;
    localCounts[m.scenarioId] = (localCounts[m.scenarioId] || 0) + 1;
    const ts = nowIso();
    const fixtureFile = writeFixture(m.scenarioId, m.tourId, m.fixture);
    const { fixture, ...row } = m;
    newRows.push({ ...row, fixtureFile, firstVerifiedAt: ts, lastVerifiedAt: ts, status: "OK" });
    writeCsv(OUTPUT_PATH, [...existingRows, ...newRows]);
    console.log(`  MATCH [${m.scenarioId}] tourId=${m.tourId} productId=${m.productId} :: ${m.evidence}`);
  };

  const remainingUnsatisfied = () => scenarios.some((s) => (localCounts[s.id] || 0) < (s.earlyExitMatches || config.defaultEarlyExitMatches));

  if (args.candidates) {
    const candRows = readCsv(path.resolve(process.cwd(), args.candidates));
    console.log(`Using ${candRows.length} candidate tourIds from ${args.candidates}`);
    for (const row of candRows) {
      if (!remainingUnsatisfied()) break;
      const tourId = row.tourId || row.productId;
      if (!tourId) continue;
      try {
        const product = await fetchProduct(row.productId || tourId);
        const matches = await evaluateProductForScenarios(product, scenarios);
        matches.forEach(recordMatch);
      } catch (e) {
        console.error(`  [error] candidate ${tourId}: ${e.message}`);
      }
    }
  } else if (args["all-cities"] || args.cities) {
    const maxProductsPerCity = args["max-products-per-city"] ? Number(args["max-products-per-city"]) : 150;
    let cities;
    if (args.cities) {
      cities = String(args.cities).split(",").map((c) => c.trim().toUpperCase());
      console.log(`Scanning ${cities.length} specified cities: ${cities.join(", ")}. Up to ${maxProductsPerCity} products/city, stopping early once every requested scenario is satisfied.`);
    } else {
      try {
        cities = await fetchAllCityCodes();
      } catch (e) {
        console.error(`  [error] fetching city list: ${e.message}`);
        return;
      }
      console.log(`Fetched ${cities.length} sandbox cities. Scanning up to ${maxProductsPerCity} products/city, stopping early once every requested scenario is satisfied.`);
    }

    let totalScanned = 0;
    for (const cityCode of cities) {
      if (!remainingUnsatisfied()) {
        console.log(`All scenarios satisfied after ${totalScanned} products across cities scanned so far — stopping before city ${cityCode}.`);
        break;
      }
      console.log(`-- city ${cityCode} --`);
      const scanned = await scanCity(cityCode, { scenarios, remainingUnsatisfied, recordMatch, maxProducts: maxProductsPerCity });
      totalScanned += scanned;
    }
    console.log(`Scanned ${totalScanned} products across ${cities.length} cities (or fewer if stopped early).`);
    if (remainingUnsatisfied()) {
      const still = scenarios.filter((s) => (localCounts[s.id] || 0) < (s.earlyExitMatches || config.defaultEarlyExitMatches)).map((s) => s.id);
      console.log(`Scanned every city and still missing examples for: ${still.join(", ")} — these appear rare/absent in sandbox.`);
    }
  } else {
    const maxProducts = args["max-products"] ? Number(args["max-products"]) : 2000;
    const scanned = await scanCity(args.city, { scenarios, remainingUnsatisfied, recordMatch, maxProducts });
    console.log(`Scanned ${scanned} products.`);
  }

  writeCsv(OUTPUT_PATH, [...existingRows, ...newRows]);
  console.log(`Wrote ${newRows.length} new row(s) to ${OUTPUT_PATH}`);
}

async function cmdVerify(args) {
  configureRateLimit({
    concurrency: args.concurrency ? Number(args.concurrency) : 3,
    delayMs: args["delay-ms"] ? Number(args["delay-ms"]) : 250,
    maxPerMinute: args["max-per-minute"] ? Number(args["max-per-minute"]) : 90,
  });

  const rows = readCsv(OUTPUT_PATH);
  const scenarioFilter = args.scenario ? new Set(String(args.scenario).split(",")) : null;
  const scenarioById = Object.fromEntries(config.scenarios.map((s) => [s.id, s]));

  let checked = 0;
  let staled = 0;
  for (const row of rows) {
    if (scenarioFilter && !scenarioFilter.has(row.scenarioId)) continue;
    const scenario = scenarioById[row.scenarioId];
    if (!scenario) {
      console.error(`  [warn] unknown scenarioId ${row.scenarioId} in CSV, skipping`);
      continue;
    }
    checked++;
    try {
      const product = await fetchProduct(row.productId);
      const variant = (product.variants || []).find((v) => String(v.id) === String(row.variantId));
      if (!variant) throw new Error("variant no longer present on product");

      let inventoryDetails = null;
      let inventoryListItem = null;
      if (needsInventoryList(scenario) && row.inventoryId) {
        // inventoryId in the CSV is a specific past inventory slot, not
        // necessarily still returned by a fresh list-by-tour call, so fetch
        // its details directly rather than re-querying the list endpoint.
        if (needsInventoryDetails(scenario)) {
          inventoryDetails = await fetchInventoryDetails(row.inventoryId);
        }
        if (scenario.checker === "hasNonNullPersonPaxRangeMax") {
          const invResp = await fetchInventoriesByTour(row.tourId, { limit: 1 });
          inventoryListItem = (invResp.items || [])[0] || null;
        }
      }

      const fn = checkers[scenario.checker];
      const result = fn({ product, variant, inventoryDetails, inventoryListItem }, scenario.params || {});
      row.lastVerifiedAt = nowIso();
      if (result) {
        row.status = "OK";
        row.evidence = result.evidence;
        row.fixtureFile = writeFixture(row.scenarioId, row.tourId, result.fixture) || row.fixtureFile;
        console.log(`  OK    [${row.scenarioId}] tourId=${row.tourId}`);
      } else {
        row.status = "STALE";
        console.log(`  STALE [${row.scenarioId}] tourId=${row.tourId} — scenario no longer reproduces`);
        staled++;
      }
    } catch (e) {
      row.lastVerifiedAt = nowIso();
      row.status = "STALE";
      staled++;
      console.log(`  STALE [${row.scenarioId}] tourId=${row.tourId} — ${e.message}`);
    }
  }

  writeCsv(OUTPUT_PATH, rows);
  console.log(`Verified ${checked} row(s), ${staled} now STALE. Updated ${OUTPUT_PATH}`);

  if (args.refill && staled > 0) {
    const staleScenarioIds = [...new Set(rows.filter((r) => r.status === "STALE").map((r) => r.scenarioId))];
    console.log(`\n--refill: re-running discover for stale scenarios: ${staleScenarioIds.join(", ")}`);
    await cmdDiscover({ ...args, scenario: staleScenarioIds.join(",") });
  }
}

function cmdGenerateChecklist() {
  const rows = readCsv(OUTPUT_PATH);
  const byScenario = {};
  for (const r of rows) {
    (byScenario[r.scenarioId] = byScenario[r.scenarioId] || []).push(r);
  }

  const byCategory = {};
  for (const s of config.scenarios) {
    (byCategory[s.category] = byCategory[s.category] || []).push(s);
  }

  const lines = [
    "# Partner Integration Verification Checklist",
    "",
    "Generated from `output/scenarios.csv`. Each row is a scenario your integration",
    "must handle; check the box once your client code has been tested against the",
    "linked sandbox `tourId` and fixture. Regenerate with `node cli.js generate-checklist`",
    "after a `discover`/`verify` run.",
    "",
    "## Inventory-field retrieval fallback (read before the checklist below)",
    "",
    "`GET /v2/inventories/{id}` (per-slot field overrides) can fail or be slow for a",
    "given inventory even when the product/variant fetch succeeded. Expected client",
    "behavior:",
    "- **Non-2xx / timeout on inventory details** — fall back to the variant-level",
    "  `inputFields` from the Product API response; do not block checkout on this call.",
    "- **Fields differ between the two** — the Inventory Details response is",
    "  authoritative for that specific date/slot; always prefer it when both succeeded.",
    "- **Never cache** either response across bookings — availability/fields can change",
    "  per request (see `scratch/edge-case-taxonomy.md` §6).",
    "",
  ];

  for (const [category, scenarios] of Object.entries(byCategory)) {
    lines.push(`## ${category}`, "");
    for (const s of scenarios) {
      const rowsForScenario = byScenario[s.id] || [];
      const ok = rowsForScenario.filter((r) => r.status === "OK");
      const notFoundRow = rowsForScenario.find((r) => r.status === "NOT_FOUND");
      const box = ok.length > 0 ? "x" : " ";
      lines.push(`- [${box}] **${s.name}** (\`${s.id}\`)`);
      if (ok.length > 0) {
        for (const r of ok) {
          lines.push(`  - tourId=\`${r.tourId}\` productId=\`${r.productId}\` — ${r.evidence}${r.fixtureFile ? ` — fixture: \`${r.fixtureFile}\`` : ""} (last verified ${r.lastVerifiedAt})`);
        }
      } else if (notFoundRow) {
        lines.push(`  - ⚠️ **Confirmed absent from sandbox** as of ${notFoundRow.lastVerifiedAt} — ${notFoundRow.evidence}`);
        lines.push(`    _Re-attempt with \`node cli.js discover --scenario ${s.id} --force\` if sandbox catalog has since grown._`);
      } else {
        lines.push(`  - _No verified sandbox example yet — run \`node cli.js discover --scenario ${s.id}\`._`);
      }
    }
    lines.push("");
  }

  fs.mkdirSync(path.dirname(CHECKLIST_PATH), { recursive: true });
  fs.writeFileSync(CHECKLIST_PATH, lines.join("\n") + "\n");
  console.log(`Wrote ${CHECKLIST_PATH}`);
}

function cmdListScenarios() {
  for (const s of config.scenarios) {
    console.log(`${s.id.padEnd(30)} [${s.category}] ${s.name} (checker=${s.checker}, earlyExit=${s.earlyExitMatches || config.defaultEarlyExitMatches})`);
  }
}

function cmdMarkNotFound(args) {
  if (!args.scenario || args.scenario === "all") {
    console.error("--scenario <id> is required (a single scenario id, not a list) for mark-not-found.");
    process.exit(1);
  }
  const scenario = config.scenarios.find((s) => s.id === args.scenario);
  if (!scenario) {
    console.error(`Unknown scenario id: ${args.scenario}`);
    process.exit(1);
  }
  if (!args.note) {
    console.error("--note \"<what was scanned and found nothing>\" is required — this becomes the durable evidence in the CSV/checklist.");
    process.exit(1);
  }

  const rows = readCsv(OUTPUT_PATH);
  const alreadyOk = rows.some((r) => r.scenarioId === scenario.id && r.status === "OK");
  if (alreadyOk) {
    console.error(`${scenario.id} already has a verified OK example in the CSV — refusing to mark it NOT_FOUND. Remove the OK row(s) first if that's really intended.`);
    process.exit(1);
  }

  const others = rows.filter((r) => r.scenarioId !== scenario.id);
  const ts = nowIso();
  others.push({
    scenarioId: scenario.id,
    category: scenario.category,
    scenarioName: scenario.name,
    productId: "",
    variantId: "",
    tourId: "",
    inventoryId: "",
    evidence: args.note,
    fixtureFile: "",
    firstVerifiedAt: ts,
    lastVerifiedAt: ts,
    status: "NOT_FOUND",
  });
  writeCsv(OUTPUT_PATH, others);
  console.log(`Marked ${scenario.id} as NOT_FOUND: ${args.note}`);
}

async function main() {
  const [, , cmd, ...rest] = process.argv;
  const args = parseArgs(rest);

  if (cmd === "discover") return cmdDiscover(args);
  if (cmd === "verify") return cmdVerify(args);
  if (cmd === "list-scenarios") return cmdListScenarios(args);
  if (cmd === "generate-checklist") return cmdGenerateChecklist(args);
  if (cmd === "mark-not-found") return cmdMarkNotFound(args);

  console.log(`Usage:
  node cli.js discover [--scenario id1,id2|all] [--candidates file.csv]
                        [--city CODE] [--max-products N]
                        [--all-cities] [--max-products-per-city N]
                        [--concurrency N] [--delay-ms N] [--max-per-minute N] [--force]
  node cli.js verify   [--scenario id1,id2] [--refill] [--concurrency N] [--delay-ms N] [--max-per-minute N]
  node cli.js list-scenarios
  node cli.js generate-checklist
  node cli.js mark-not-found --scenario <id> --note "<scan scope + what was found>"

  Rate limiting: all API calls are hard-capped at --max-per-minute (default 90,
  independent of --concurrency/--delay-ms) so a run never exceeds ~100 req/min.

  discover skips any scenario already marked NOT_FOUND unless --force is passed
  (sandbox catalog may grow over the tool's 6-12mo intended lifetime).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
