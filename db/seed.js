#!/usr/bin/env node
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATA_JSON = path.join(__dirname, '..', 'data', 'labtools.json');
const ASSETS_ROOT = path.join(__dirname, '..', 'public', 'assets');

// ---------------------------------------------------------------------------
// Asset-path helpers (ported from scripts/build-packages.js)
// ---------------------------------------------------------------------------

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

function findFileWithExt(dir, exts, subdirHint) {
  const files = walkFiles(dir);
  const matching = files.filter((f) =>
    exts.includes(path.extname(f).toLowerCase())
  );
  if (matching.length === 0) return null;
  const preferred = subdirHint
    ? matching.find((f) =>
        f.replace(/\\/g, '/').includes(`/${subdirHint}/`)
      )
    : null;
  const pick = preferred || matching[0];
  return path.relative(dir, pick).replace(/\\/g, '/');
}

const MODEL_EXTS = ['.obj', '.gltf', '.glb', '.fbx'];
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

function rewriteAssetPath(originalPath, toolId) {
  if (!originalPath || typeof originalPath !== 'string') return originalPath;
  const n = originalPath.replace(/\\/g, '/').replace(/^\/+/, '');

  if (n.startsWith(`assets/${toolId}/`)) return n;

  const slugMatch = n.match(/^assets\/[^/]+\/(.+)$/);
  if (slugMatch) return `assets/${toolId}/${slugMatch[1]}`;

  const toolAssetsDir = path.join(ASSETS_ROOT, toolId);
  if (fs.existsSync(toolAssetsDir)) {
    const ext = path.extname(n).toLowerCase();
    if (/^downloaded\/models\//i.test(n) || MODEL_EXTS.includes(ext)) {
      const found = findFileWithExt(toolAssetsDir, MODEL_EXTS, '3d-model');
      if (found) return `assets/${toolId}/${found}`;
    }
    if (/^downloaded\/images\//i.test(n) || IMAGE_EXTS.includes(ext)) {
      const found = findFileWithExt(toolAssetsDir, IMAGE_EXTS, 'images');
      if (found) return `assets/${toolId}/${found}`;
    }
  }

  return n;
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function main() {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/celano_lab',
  });

  const data = JSON.parse(fs.readFileSync(DATA_JSON, 'utf8'));
  const lab = data.lab;
  const tools = data.tools || [];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clear in dependency order
    await client.query('DELETE FROM page_content_blocks');
    await client.query('DELETE FROM tool_pages');
    await client.query('DELETE FROM assets');
    await client.query('DELETE FROM tool_safety_notes');
    await client.query('DELETE FROM tool_research_areas');
    await client.query('DELETE FROM tool_tags');
    await client.query('DELETE FROM tool_specs');
    await client.query('DELETE FROM tools');
    await client.query('DELETE FROM labs');

    // Insert lab
    const labRes = await client.query(
      `INSERT INTO labs (name, location, website, description)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [lab.name, lab.location, lab.website, lab.description]
    );
    const labId = labRes.rows[0].id;
    console.log(`Lab "${lab.name}" -> ${labId}`);

    for (const tool of tools) {
      if (!tool.toolId) {
        console.warn(`Skipping tool with no toolId: ${tool.name || '(unnamed)'}`);
        continue;
      }

      await client.query(
        `INSERT INTO tools (tool_id, lab_id, name, vendor, model, category, lab_location, short_description, detailed_description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          tool.toolId, labId, tool.name, tool.vendor, tool.model,
          tool.category, tool.labLocation, tool.shortDescription,
          tool.detailedDescription,
        ]
      );

      // Specs
      if (Array.isArray(tool.specs)) {
        for (let i = 0; i < tool.specs.length; i++) {
          await client.query(
            'INSERT INTO tool_specs (tool_id, spec, sort_order) VALUES ($1, $2, $3)',
            [tool.toolId, tool.specs[i], i]
          );
        }
      }

      // Tags
      if (Array.isArray(tool.tags)) {
        for (const tag of tool.tags) {
          await client.query(
            'INSERT INTO tool_tags (tool_id, tag) VALUES ($1, $2)',
            [tool.toolId, tag]
          );
        }
      }

      // Research areas
      if (Array.isArray(tool.researchArea)) {
        for (const area of tool.researchArea) {
          await client.query(
            'INSERT INTO tool_research_areas (tool_id, area) VALUES ($1, $2)',
            [tool.toolId, area]
          );
        }
      }

      // Safety notes
      if (Array.isArray(tool.safetyNotes)) {
        for (let i = 0; i < tool.safetyNotes.length; i++) {
          await client.query(
            'INSERT INTO tool_safety_notes (tool_id, note, sort_order) VALUES ($1, $2, $3)',
            [tool.toolId, tool.safetyNotes[i], i]
          );
        }
      }

      // Assets — images
      if (Array.isArray(tool.images)) {
        for (let i = 0; i < tool.images.length; i++) {
          const img = tool.images[i];
          const fp = rewriteAssetPath(img.file || img.localPath, tool.toolId);
          await client.query(
            `INSERT INTO assets (tool_id, asset_type, title, file_path, sort_order)
             VALUES ($1, 'image', $2, $3, $4)`,
            [tool.toolId, img.title, fp, i]
          );
        }
      }

      // Assets — PDFs
      if (Array.isArray(tool.pdfs)) {
        for (let i = 0; i < tool.pdfs.length; i++) {
          const pdf = tool.pdfs[i];
          const fp = rewriteAssetPath(pdf.file || pdf.localPath, tool.toolId);
          await client.query(
            `INSERT INTO assets (tool_id, asset_type, title, file_path, sort_order)
             VALUES ($1, 'pdf', $2, $3, $4)`,
            [tool.toolId, pdf.title, fp, i]
          );
        }
      }

      // Pages + content blocks
      if (Array.isArray(tool.pages)) {
        for (let pi = 0; pi < tool.pages.length; pi++) {
          const page = tool.pages[pi];
          const pageRes = await client.query(
            'INSERT INTO tool_pages (tool_id, title, sort_order) VALUES ($1, $2, $3) RETURNING id',
            [tool.toolId, page.title, pi]
          );
          const pageId = pageRes.rows[0].id;

          if (Array.isArray(page.content)) {
            for (let ci = 0; ci < page.content.length; ci++) {
              const block = page.content[ci];
              let info = block.info;
              const ct = String(block.contentType || '').toLowerCase();
              if (ct === 'image' || ct === 'model' || ct === 'pdf') {
                info = rewriteAssetPath(info, tool.toolId);
              }
              await client.query(
                `INSERT INTO page_content_blocks (page_id, content_type, sub_type, info, sort_order)
                 VALUES ($1, $2, $3, $4, $5)`,
                [pageId, block.contentType, block.subType, info, ci]
              );
            }
          }
        }
      }

      console.log(`  Tool "${tool.name}" (${tool.toolId}) seeded.`);
    }

    await client.query('COMMIT');
    console.log(`\nSeeded ${tools.length} tools.`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
