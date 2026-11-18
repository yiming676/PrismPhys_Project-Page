import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const base = (process.argv[2] ?? "/").replace(/\/?$/, "/");
const html = await readFile(join(dist, "index.html"), "utf8");
const demos = JSON.parse(await readFile(join(root, "src/data/demos.json"), "utf8"));

const caseKeys = new Set(demos.map((demo) => `${demo.dataset}:${demo.caseId}`));
assert.equal(demos.length, 40, "Expected 40 video variants");
assert.equal(caseKeys.size, 28, "Expected 28 cases across two datasets");
assert.equal(demos.filter((demo) => demo.dataset === "AmbiPhys-Bench").length, 24);
assert.equal(demos.filter((demo) => demo.dataset === "PhysTwin").length, 16);
assert.equal(new Set(demos.map((demo) => demo.video)).size, demos.length, "Duplicate video paths");
for (const section of ["abstract", "method", "demo", "results", "bibtex"]) {
  assert.match(html, new RegExp(`id="${section}"`), `Missing #${section}`);
}
assert.doesNotMatch(html, /\/data[23]\//, "Absolute source paths must not ship");

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, "Duplicate HTML IDs");

const urls = [...html.matchAll(/(?:src|href|poster)="([^"]+)"/g)].map((match) => match[1]);
for (const demo of demos) {
  urls.push(demo.video, demo.poster);
}
for (const name of ["teaser", "method_overview", "ambiphys_qualitative", "phystwin_qualitative"]) {
  for (const width of [960, 1600, 2400]) urls.push(`images/${name}-${width}.webp`);
}
urls.push("paper/PrismPhys.pdf", "videos/comparison-captions.vtt", "favicon.svg");

for (let url of urls) {
  if (/^(?:[a-z]+:|#|\/\/)/i.test(url)) continue;
  url = url.split(/[?#]/)[0];
  let relative = url;
  if (url.startsWith("/")) {
    assert.ok(url.startsWith(base), `${url} does not use deployment base ${base}`);
    relative = url.slice(base.length);
  }
  const target = join(dist, decodeURIComponent(relative));
  assert.ok(existsSync(target), `Missing built asset: ${relative}`);
  if (/\.(?:mp4|webp|pdf|vtt)$/.test(relative)) {
    assert.ok(statSync(target).size > 100, `Empty asset: ${relative}`);
  }
}

console.log(
  `Checked ${demos.length} video variants across ${caseKeys.size} cases, 12 paper images, local assets, anchors, and HTML IDs.`,
);
