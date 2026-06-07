/**
 * Patches tailwindcss CSS escape decoder (ke function) in both CJS and ESM
 * dist files to gracefully skip invalid Unicode code points (> U+10FFFF) instead
 * of throwing RangeError. Run automatically via `postinstall`.
 *
 * Root cause: Tailwind v4's oxide Rust parser generates a CSS escape sequence
 * with a code point value > 0x10FFFF, which causes String.fromCodePoint() to
 * throw. By returning the raw escape unchanged we preserve correctness and
 * allow the build to complete.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const OLD = 'r=>r.length>2?String.fromCodePoint(Number.parseInt(r.slice(1).trim(),16)):r[1]';
const NEW = 'r=>{if(r.length>2){const cp=Number.parseInt(r.slice(1).trim(),16);return cp>0x10FFFF?r:String.fromCodePoint(cp);}return r[1];}';

const targets = [
  'node_modules/tailwindcss/dist/lib.js',
  'node_modules/tailwindcss/dist/chunk-F4544Y4M.mjs',
];

let anyChanged = false;

for (const rel of targets) {
  const abs = resolve(rel);
  if (!existsSync(abs)) {
    console.log(`[patch-tailwindcss] skipped (not found): ${rel}`);
    continue;
  }
  const src = readFileSync(abs, 'utf8');
  if (!src.includes(OLD)) {
    if (src.includes('cp>0x10FFFF')) {
      console.log(`[patch-tailwindcss] already patched: ${rel}`);
    } else {
      console.warn(`[patch-tailwindcss] WARNING: patch target not found in ${rel} — tailwindcss version may have changed`);
    }
    continue;
  }
  writeFileSync(abs, src.replace(OLD, NEW), 'utf8');
  console.log(`[patch-tailwindcss] patched: ${rel}`);
  anyChanged = true;
}

if (!anyChanged) process.exit(0);
console.log('[patch-tailwindcss] done');
