#!/usr/bin/env node
/*
 * Builds one ZIP per tool from data/labtools.json into public/packages/<toolId>.zip.
 *
 * Each ZIP contains:
 *   - labtools-headset.json   (a scoped catalog: { lab, tools: [<single tool>] })
 *   - every asset referenced by that tool, preserved at its original relative path
 *
 * The Unity headset app downloads one of these ZIPs per QR scan and binds the
 * single tool in `tools[0]` directly, so each machine QR just needs to point at
 *   https://<host>/packages/<toolId>.zip
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const ROOT = path.resolve(__dirname, '..');
const DATA_JSON = path.join(ROOT, 'data', 'labtools.json');
const ASSETS_ROOT = path.join(ROOT, 'public', 'assets');
const OUT_DIR = path.join(ROOT, 'public', 'packages');
const MANIFEST_NAME = 'labtools-headset.json';

function walkFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(abs));
    else if (entry.isFile()) out.push(abs);
  }
  return out;
}

// Headset manifest paths must match the zip layout exactly. The source catalog
// references assets with a vendor-slug prefix (assets/qnami-proteusq/...), and
// the 3D-model page uses placeholder "downloaded/..." paths. The zip, however,
// lays files out under `assets/<toolId>/...` (mirroring public/assets/<toolId>/).
// Rewrite every asset reference in the cloned tool to point into the zip.
const MODEL_EXTS = new Set(['.obj', '.gltf', '.glb', '.fbx']);
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function firstFileRelWithExt(toolAssetsDir, toolId, extSet, subdirHint) {
  const candidates = walkFiles(toolAssetsDir).filter((abs) =>
    extSet.has(path.extname(abs).toLowerCase())
  );
  if (candidates.length === 0) return null;
  const preferred = subdirHint
    ? candidates.find((abs) => abs.replace(/\\/g, '/').includes(`/${subdirHint}/`))
    : null;
  const pick = preferred || candidates[0];
  return `assets/${toolId}/${path.relative(toolAssetsDir, pick).replace(/\\/g, '/')}`;
}

function rewriteAssetRef(p, toolId, toolAssetsDir) {
  if (typeof p !== 'string' || p.length === 0) return p;
  const n = p.replace(/\\/g, '/').replace(/^\/+/, '');

  const slugMatch = n.match(/^assets\/[^/]+\/(.+)$/);
  if (slugMatch) return `assets/${toolId}/${slugMatch[1]}`;

  const ext = path.extname(n).toLowerCase();
  if (/^downloaded\/models\//i.test(n) || MODEL_EXTS.has(ext)) {
    const found = firstFileRelWithExt(toolAssetsDir, toolId, MODEL_EXTS, '3d-model');
    if (found) return found;
  }
  if (/^downloaded\/images\//i.test(n) || IMAGE_EXTS.has(ext)) {
    const found = firstFileRelWithExt(toolAssetsDir, toolId, IMAGE_EXTS, 'images');
    if (found) return found;
  }
  return p;
}

function toHeadsetTool(tool, toolAssetsDir) {
  const clone = JSON.parse(JSON.stringify(tool));
  const toolId = clone.toolId;

  const rewriteArr = (arr, field) => {
    if (!Array.isArray(arr)) return;
    for (const item of arr) {
      if (!item) continue;
      if (item.localPath && !item.file) item.file = item.localPath;
      if (item[field]) item[field] = rewriteAssetRef(item[field], toolId, toolAssetsDir);
    }
  };

  rewriteArr(clone.images, 'file');
  rewriteArr(clone.pdfs, 'file');

  if (Array.isArray(clone.pages)) {
    for (const page of clone.pages) {
      if (!page || !Array.isArray(page.content)) continue;
      for (const c of page.content) {
        if (!c) continue;
        const t = String(c.contentType || '').toLowerCase();
        if (t === 'image' || t === 'model' || t === 'pdf') {
          c.info = rewriteAssetRef(c.info, toolId, toolAssetsDir);
        }
      }
    }
  }

  return clone;
}

function buildPackageForTool(tool, lab) {
  return new Promise((resolve, reject) => {
    const toolAssetsDir = path.join(ASSETS_ROOT, tool.toolId);
    const scoped = { lab, tools: [toHeadsetTool(tool, toolAssetsDir)] };
    const outPath = path.join(OUT_DIR, `${tool.toolId}.zip`);

    const output = fs.createWriteStream(outPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    let filesIncluded = 0;
    let missing = 0;

    output.on('close', () => {
      const kb = (archive.pointer() / 1024).toFixed(1);
      console.log(`  [${tool.toolId}] ${kb} KB, ${filesIncluded} files${missing ? `, ${missing} missing` : ''}`);
      resolve();
    });
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        missing++;
        console.warn(`  [${tool.toolId}] warning: ${err.message}`);
      } else reject(err);
    });
    archive.on('error', reject);
    archive.pipe(output);

    archive.append(JSON.stringify(scoped, null, 2), { name: MANIFEST_NAME });

    if (!fs.existsSync(toolAssetsDir)) {
      console.warn(`  [${tool.toolId}] no assets directory at public/assets/${tool.toolId}`);
    } else {
      for (const abs of walkFiles(toolAssetsDir)) {
        const rel = path.relative(ASSETS_ROOT, abs).replace(/\\/g, '/');
        archive.file(abs, { name: `assets/${rel}` });
        filesIncluded++;
      }
    }

    archive.finalize();
  });
}

async function main() {
  if (!fs.existsSync(DATA_JSON)) {
    console.error(`Source catalog not found: ${DATA_JSON}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(DATA_JSON, 'utf8'));
  const tools = Array.isArray(data.tools) ? data.tools : [];
  const lab = data.lab || {};

  if (tools.length === 0) {
    console.error('No tools found in catalog; nothing to build.');
    process.exit(1);
  }

  if (fs.existsSync(OUT_DIR)) fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`Building ${tools.length} per-machine package(s) -> ${path.relative(ROOT, OUT_DIR)}`);

  for (const tool of tools) {
    if (!tool || !tool.toolId) {
      console.warn(`Skipping tool with no toolId: ${(tool && tool.name) || '(unnamed)'}`);
      continue;
    }
    await buildPackageForTool(tool, lab);
  }

  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
