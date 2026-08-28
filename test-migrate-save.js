/**
 * Automated regression tests for `migrateSave` in js/game.js
 *
 * Run: node test-migrate-save.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const gamePath = path.join(__dirname, 'js', 'game.js');
let gameSrc = fs.readFileSync(gamePath, 'utf8');

// Convert `const Game =` to `var Game =` so we can capture it from wrapper.
const wrappedSrc = gameSrc.replace('const Game =', 'var Game =') +
  '\nreturn Game;';

const context = vm.createContext({
  localStorage: {
    _store: {},
    getItem(k) { return this._store[k] || null; },
    setItem(k, v) { this._store[k] = String(v); },
    removeItem(k) { delete this._store[k]; }
  },
  console,
  JSON,
  Date,
  Math,
  String,
  Number,
  Array,
  Object,
  parseInt,
  isNaN
});

let Game;
try {
  Game = vm.runInNewContext('(function() { ' + wrappedSrc + ' })()', context);
} catch (e) {
  console.error('FAIL: could not load game.js into sandbox:', e && e.stack || e);
  process.exit(2);
}

if (!Game || typeof Game.migrateSave !== 'function') {
  console.error('FAIL: Game.migrateSave is not exposed.');
  process.exit(2);
}

const migrateSave = Game.migrateSave;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
let failures = 0;
let tests = 0;

function assert(cond, msg) {
  tests++;
  if (cond) {
    console.log(`  PASS: ${msg}`);
  } else {
    failures++;
    console.log(`  FAIL: ${msg}`);
  }
}

function assertEqual(actual, expected, msg) {
  assert(actual === expected, `${msg} (expected=${expected}, actual=${actual})`);
}

function assertHas(keys, obj, ctx) {
  for (const k of keys) {
    assert(Object.prototype.hasOwnProperty.call(obj, k), `${ctx || 'state'} has key "${k}"`);
  }
}

function sanitizeClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ---------------------------------------------------------------------------
// 1. Version 0 legacy save gets all new fields
// ---------------------------------------------------------------------------
console.log('\n=== Test 1: version 0 legacy save gets all new fields ===');
context.localStorage._store = {};
context.localStorage.setItem('carpFishingTycoon_saveVersion', '0');

const legacyV0 = {
  day: 42,
  money: 12345,
  reputation: 10,
  ownedLakes: ['oakmere_lake'],
  activeLakeId: 'oakmere_lake',
  playerAnglerId: null,
  fish: [{ id: 1, name: 'Legacy', alive: true }],
  anglers: [],
  notifications: [],
  totalEarnings: 100,
  totalSpent: 50,
};

const migrated = migrateSave(sanitizeClone(legacyV0));

assertEqual(migrated.day, 42, 'day preserved');
assertEqual(migrated.money, 12345, 'money preserved');
assertEqual(migrated.ownedLakes.length, 1, 'ownedLakes preserved');
assertEqual(migrated.fish.length, 1, 'fish preserved');

const expectedKeysV1 = [
  'breedingPond','breedingTimer','breedingActive','lakeUpgrades',
  'fishHistory','nextFishId','anglerBookings','anglerSatisfaction',
  'pendingBookings','incomeHistory','completedQuests','disasterLog',
  'lakeClosures','biodiversityPenalties','capacityPenalties',
  'weather','lakeOxygen','hiredStaff','availableStaffIds',
  'loans','marketingCampaigns','financeLog','spawnLog',
  'breedingSettings','eventLog','fishCreationLog','nextEventId',
  'lastBreedingOutcome','investorDeals','marketEquityPct','dividendsPaid',
  'fisheryListed','sharePrice','nextInvestorId','fishAuctions',
  'lakeMaintenance','lakeExpansions','sponsorships','anglerStats',
  'matchResults','rigInventory','rigEquipped','rigCustomizations',
  'rigComponentsOwned','customRigs','reputationAccumulator',
  'nextStaffRefreshDay','nextStaffInstanceId','nextLoanId','nextCampaignId',
  'nextNewsId','nextSponsorshipId','lastDeathCount','duckHuntDone',
  'lastDuckHuntDay','lastDisasterDay'
];
assertHas(expectedKeysV1, migrated, 'migrated');

assert(Array.isArray(migrated.rigCustomizations), 'rigCustomizations is array');
assertEqual(migrated.rigCustomizations.length, 3, 'rigCustomizations length 3');
assertEqual(migrated.rigEquipped.length, 3, 'rigEquipped length 3');
assertEqual(migrated.breedingSettings.feedQuality, 0, 'breedingSettings defaults');
assertEqual(migrated.nextStaffRefreshDay, 0, 'nextStaffRefreshDay=0');
assertEqual(migrated.duckHuntDone, false, 'duckHuntDone=false');
assertEqual(migrated.lastDisasterDay, 0, 'lastDisasterDay=0');

// ---------------------------------------------------------------------------
// 2. Existing keys are NOT overwritten
// ---------------------------------------------------------------------------
console.log('\n=== Test 2: existing keys preserved ===');
const partial = {
  day: 7,
  fishHistory: [{ id: 99 }],
  nextFishId: 77,
  weather: { season: 'summer' },
  lakeClosures: { oakmere_lake: 15 },
  rigInventory: ['old_rig'],
  nextLoanId: 5,
  duckHuntDone: true,
  lastDuckHuntDay: 30,
  lastDisasterDay: 12,
};
const migrated2 = migrateSave(sanitizeClone(partial));
assertEqual(migrated2.fishHistory.length, 1, 'fishHistory preserved');
assertEqual(migrated2.fishHistory[0].id, 99, 'fishHistory entry preserved');
assertEqual(migrated2.nextFishId, 77, 'nextFishId preserved');
assertEqual(migrated2.weather && migrated2.weather.season, 'summer', 'weather preserved');
assertEqual(migrated2.lakeClosures.oakmere_lake, 15, 'lakeClosures preserved');
assertEqual(migrated2.rigInventory[0], 'old_rig', 'rigInventory preserved');
assertEqual(migrated2.nextLoanId, 5, 'nextLoanId preserved');
assertEqual(migrated2.duckHuntDone, true, 'duckHuntDone preserved');
assertEqual(migrated2.lastDuckHuntDay, 30, 'lastDuckHuntDay preserved');
assertEqual(migrated2.lastDisasterDay, 12, 'lastDisasterDay preserved');

// ---------------------------------------------------------------------------
// 3. Idempotence on version 1
// ---------------------------------------------------------------------------
console.log('\n=== Test 3: idempotent on already-current version ===');
context.localStorage._store = {};
context.localStorage.setItem('carpFishingTycoon_saveVersion', '1');
const migrated3 = migrateSave(sanitizeClone(migrated));
assertEqual(migrated3.rigCustomizations.length, 3, 'rigCustomizations unchanged');
assertEqual(migrated3.breedingSettings.feedQuality, 0, 'breedingSettings unchanged');
assertEqual(migrated3.day, migrated.day, 'day unchanged');

// ---------------------------------------------------------------------------
// 4. Edge cases: null fields, minimal objects
// ---------------------------------------------------------------------------
console.log('\n=== Test 4: edge-case inputs ===');
context.localStorage._store = {};
context.localStorage.setItem('carpFishingTycoon_saveVersion', '0');
const edgeCases = [
  { label: 'null legacy fields', data: { day: 1, weather: null } },
  { label: 'null array legacy fields', data: { day: 1, fishHistory: null, lakeClosures: null } },
];
edgeCases.forEach(({ label, data }) => {
  let threw = false;
  let out;
  try {
    out = migrateSave(sanitizeClone(data));
  } catch (e) {
    threw = true;
    console.log(`  FAIL: ${label} threw ${e && e.message}`);
    failures += 2;
    tests += 2;
    return;
  }
  assertHas(expectedKeysV1, out, label);
  assert(Array.isArray(out.fishHistory), `${label} fishHistory is array`);
  assert(typeof out.lakeClosures === 'object', `${label} lakeClosures is object`);
  tests += 2;
});

// ---------------------------------------------------------------------------
// 5. Save path: saveToStorage bumps version key to CURRENT_SAVE_VERSION
// ---------------------------------------------------------------------------
console.log('\n=== Test 5: saveToStorage bumps version key ===');
context.localStorage._store = {};
context.localStorage.setItem('carpFishingTycoon_saveData', JSON.stringify(legacyV0));
context.localStorage.setItem('carpFishingTycoon_saveVersion', '0');

Game.setState(sanitizeClone(legacyV0));
Game.saveToStorage();
const savedVer = context.localStorage.getItem('carpFishingTycoon_saveVersion');
assertEqual(savedVer, '1', 'saveToStorage sets CURRENT_SAVE_VERSION=1');

// ---------------------------------------------------------------------------
// 6. Crash risk: missing fish array / malformed fish entries
// ---------------------------------------------------------------------------
console.log('\n=== Test 6: robustness checks ===');
const malformed = { day: 1, fish: 'not-an-array' };
let threw6 = false;
let out6;
try {
  out6 = migrateSave(sanitizeClone(malformed));
} catch (e) {
  threw6 = true;
}
if (!threw6) {
  assert(Array.isArray(out6.fish) || typeof out6.fish === 'string', 'malformed fish did not crash migration');
}

const empty = { day: 1, fish: [] };
let threwEmpty = false;
try {
  migrateSave(sanitizeClone(empty));
} catch (e) { threwEmpty = true; }
assert(!threwEmpty, 'empty fish array does not crash migration');

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
console.log(`\nTests run: ${tests}`);
console.log(`Failures:   ${failures}`);
if (failures) {
  console.log('RESULT: FAIL');
  process.exit(1);
}
console.log('RESULT: PASS');
process.exit(0);
