#!/usr/bin/env node
/**
 * Syncs local .env to Railway environment variables.
 * Run: npm run railway:sync
 * Requires: railway login && railway link (one-time)
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const envPath = path.join(rootDir, '.env');

if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found at', envPath);
    process.exit(1);
}

// Keys that differ between local and Railway
const OVERRIDES = {
    NODE_ENV: 'production',
    PORT: undefined, // Railway sets this automatically — skip
};

const SKIP_EMPTY = true;

const envContent = fs.readFileSync(envPath, 'utf8');
const vars = [];

for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;

    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();

    if (!key) continue;
    if (key in OVERRIDES) {
        if (OVERRIDES[key] === undefined) continue; // skip
        value = OVERRIDES[key];                     // use override
    }
    if (SKIP_EMPTY && !value) continue;

    vars.push({ key, value });
}

if (vars.length === 0) {
    console.error('❌ No variables found in .env');
    process.exit(1);
}

console.log(`\n🚀 Syncing ${vars.length} variables to Railway...\n`);
vars.forEach(({ key }) => console.log(`  • ${key}`));
console.log();

// Build args: railway variables --set KEY=VAL --set KEY=VAL ...
const setArgs = [];
for (const { key, value } of vars) {
    setArgs.push('--set', `${key}=${value}`);
}

const result = spawnSync('railway', ['variables', ...setArgs], {
    stdio: 'inherit',
    cwd: rootDir,
    shell: true,
});

if (result.status === 0) {
    console.log('\n✅ All variables synced to Railway!');
    console.log('   Railway will automatically redeploy your service.\n');
} else {
    console.error('\n❌ Sync failed.');
    console.error('   Make sure you are logged in and the project is linked:');
    console.error('     railway login');
    console.error('     railway link');
    console.error('   Then run: npm run railway:sync\n');
    process.exit(1);
}
