#!/usr/bin/env node
/**
 * Link / anchor / src checker for the static Safer Charging site.
 *
 * Strips HTML comments BEFORE parsing so commented-out example markup
 * cannot produce false positives.
 *
 * Checks, across every *.html in the repo root:
 *   1. every internal href resolves to a real file on disk
 *   2. every #anchor (same-page or cross-page) has a matching id/name
 *   3. every src / srcset / poster / <source src> resolves to a real file
 *
 * Usage: node check-links.mjs [repoDir]
 * Exit code 1 if any problem is found.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] ?? '.');

const pages = fs.readdirSync(ROOT).filter(f => f.endsWith('.html')).sort();
if (!pages.length) { console.error(`No .html files in ${ROOT}`); process.exit(1); }

/** Remove HTML comments, plus <script>/<style> bodies (they contain URL-ish strings). */
const strip = html => html
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '<script></script>')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '<style></style>');

const EXTERNAL = /^(https?:|mailto:|tel:|data:|javascript:|#$|\/\/)/i;

// ---- pass 1: collect the id/name namespace of every page -------------------
const clean = new Map();   // page -> comment-stripped source
const ids   = new Map();   // page -> Set of ids and anchor names

for (const p of pages) {
  const src = strip(fs.readFileSync(path.join(ROOT, p), 'utf8'));
  clean.set(p, src);
  const set = new Set();
  for (const m of src.matchAll(/\sid\s*=\s*["']([^"']+)["']/gi)) set.add(m[1]);
  for (const m of src.matchAll(/<a\b[^>]*\sname\s*=\s*["']([^"']+)["']/gi)) set.add(m[1]);
  ids.set(p, set);
}

// ---- pass 2: walk every reference ------------------------------------------
const problems = [];
let nHref = 0, nAnchor = 0, nSrc = 0;
const missingAssets = new Set();

const exists = rel => {
  const abs = path.resolve(ROOT, decodeURIComponent(rel.split(/[?#]/)[0]));
  if (!abs.startsWith(ROOT)) return false;              // escapes the repo
  return fs.existsSync(abs);
};

for (const page of pages) {
  const src = clean.get(page);
  const report = (kind, detail) => problems.push({ page, kind, detail });

  // --- href ---
  for (const m of src.matchAll(/\shref\s*=\s*["']([^"']*)["']/gi)) {
    const raw = m[1].trim();
    if (!raw || EXTERNAL.test(raw)) continue;

    if (raw.startsWith('#')) {                           // same-page anchor
      nAnchor++;
      const id = decodeURIComponent(raw.slice(1));
      if (!ids.get(page).has(id)) report('anchor', `${raw} — no element with id="${id}" on this page`);
      continue;
    }

    nHref++;
    const [file, hash] = raw.split('#');
    const target = file === '' ? page : file;
    if (!exists(target)) { report('href', `${raw} — ${target} does not exist`); continue; }

    if (hash) {                                          // cross-page anchor
      nAnchor++;
      const tgtPage = path.relative(ROOT, path.resolve(ROOT, decodeURIComponent(target)));
      if (ids.has(tgtPage) && !ids.get(tgtPage).has(decodeURIComponent(hash))) {
        report('anchor', `${raw} — ${tgtPage} has no id="${hash}"`);
      }
    }
  }

  // --- src / poster ---
  for (const m of src.matchAll(/\s(?:src|poster)\s*=\s*["']([^"']*)["']/gi)) {
    const raw = m[1].trim();
    if (!raw || EXTERNAL.test(raw)) continue;
    nSrc++;
    if (!exists(raw)) { report('src', `${raw} — file does not exist`); missingAssets.add(raw); }
  }

  // --- srcset ---
  for (const m of src.matchAll(/\ssrcset\s*=\s*["']([^"']*)["']/gi)) {
    for (const cand of m[1].split(',')) {
      const raw = cand.trim().split(/\s+/)[0];
      if (!raw || EXTERNAL.test(raw)) continue;
      nSrc++;
      if (!exists(raw)) { report('src', `srcset ${raw} — file does not exist`); missingAssets.add(raw); }
    }
  }
}

// ---- report ----------------------------------------------------------------
console.log(`Pages scanned .......... ${pages.length}`);
console.log(`Internal links ......... ${nHref}`);
console.log(`Anchors ................ ${nAnchor}`);
console.log(`Local src refs ......... ${nSrc}`);

// Expected-missing allowlist: the two police crests fall back to a wordmark.
const ALLOW = new Set(['assets/kent-police-logo.png', 'assets/essex-police-logo.png']);
const real = problems.filter(p => !(p.kind === 'src' && ALLOW.has(p.detail.split(' ')[0])));
const waived = problems.length - real.length;

if (waived) console.log(`Expected-missing ....... ${waived} (police crests, fall back to wordmark)`);

if (!real.length) { console.log('\nPASS — no broken links, anchors or local sources.'); process.exit(0); }

console.log(`\nFAIL — ${real.length} problem(s):`);
for (const p of real) console.log(`  [${p.kind}] ${p.page}: ${p.detail}`);
process.exit(1);
