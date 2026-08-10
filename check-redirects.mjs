#!/usr/bin/env node
/**
 * Prove amplify-redirects.json actually covers this build.
 *
 * Every published URL (canonical tags, og:url, sitemap.xml) must either be a
 * real file or be served by a 200 rewrite. Anything else 404s on Amplify.
 * Vercel hid this class of bug behind cleanUrls, so it has never been tested.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2] ?? '.';
const SITE = 'https://www.safercharging.co.uk';

const rules = JSON.parse(fs.readFileSync(path.join(ROOT, 'amplify-redirects.json'), 'utf8'));
const rewrites = new Map(rules.filter(r => r.status === '200').map(r => [r.source, r.target]));
const redirects = new Map(rules.filter(r => r.status === '301').map(r => [r.source, r.target]));

// every URL this build tells the outside world about
const published = new Set();
for (const f of fs.readdirSync(ROOT).filter(n => n.endsWith('.html'))) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  for (const re of [/<link rel="canonical" href="([^"]+)"/g, /<meta property="og:url" content="([^"]+)"/g]) {
    for (const m of s.matchAll(re)) published.add(m[1]);
  }
}
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
for (const m of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) published.add(m[1]);

const problems = [];
let served = 0;

for (const url of [...published].sort()) {
  if (!url.startsWith(SITE)) { problems.push(`${url} — not on the canonical host`); continue; }
  let p = url.slice(SITE.length) || '/';
  if (p === '/' || p === '') { served++; continue; }            // index.html at root

  if (fs.existsSync(path.join(ROOT, p.replace(/^\//, '')))) { served++; continue; }  // real file
  if (rewrites.has(p)) {
    const target = rewrites.get(p).replace(/^\//, '');
    if (!fs.existsSync(path.join(ROOT, target))) { problems.push(`${p} — rewrite target ${target} does not exist`); continue; }
    served++; continue;
  }
  problems.push(`${p} — no file and no 200 rewrite, would 404 on Amplify`);
}

// legacy redirects must land somewhere that resolves
for (const [src, target] of redirects) {
  const t = target.replace(/^\//, '');
  if (!fs.existsSync(path.join(ROOT, t)) && !rewrites.has(target)) {
    problems.push(`legacy ${src} -> ${target} — target does not resolve`);
  }
}

// rules pointing at files that are not there
for (const [src, target] of rewrites) {
  if (!fs.existsSync(path.join(ROOT, target.replace(/^\//, '')))) problems.push(`rule ${src} -> ${target} — target missing`);
}

console.log(`Published URLs .......... ${published.size}`);
console.log(`Resolvable on Amplify ... ${served}`);
console.log(`Legacy 301s ............. ${redirects.size}`);
console.log(`Clean-URL 200 rewrites .. ${rewrites.size}`);

if (!problems.length) { console.log('\nPASS — every published URL resolves under these rules.'); process.exit(0); }
console.log(`\nFAIL — ${problems.length} problem(s):`);
problems.forEach(p => console.log('  ' + p));
process.exit(1);
