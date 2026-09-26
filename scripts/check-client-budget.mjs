#!/usr/bin/env node

import { gzipSync } from "node:zlib";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const config = JSON.parse(await readFile(path.join(root, "frontend-loop.config.json"), "utf8"));
const budgets = config.performanceBudgets;
const chunksRoot = path.join(root, ".next", "static", "chunks");

async function collect(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await collect(target));
    if (entry.isFile() && entry.name.endsWith(".js")) files.push(target);
  }
  return files;
}

let files;
try {
  files = await collect(chunksRoot);
} catch {
  throw new Error("No production build found. Run npm run build before the performance budget check.");
}

const measured = [];
let total = 0;
for (const file of files) {
  const bytes = gzipSync(await readFile(file)).byteLength;
  total += bytes;
  measured.push({ file: path.relative(root, file), gzipBytes: bytes });
}

const oversized = measured.filter((item) => item.gzipBytes > budgets.maxIndividualClientChunkGzipBytes);
if (oversized.length || total > budgets.maxTotalClientChunksGzipBytes) {
  process.stderr.write(`${JSON.stringify({ oversized, totalGzipBytes: total, budgets }, null, 2)}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Client budget PASS: ${files.length} chunks, ${total} gzip bytes total.\n`);
}
