import type { NextApiRequest, NextApiResponse } from 'next';
import { getToolById, getLabInfo, ToolDetail } from '@/db/queries';
import path from 'path';
import fs from 'fs';
import os from 'os';
import archiver from 'archiver';

const CACHE_DIR = path.join(os.tmpdir(), 'celano-packages');
const ASSETS_ROOT = path.join(process.cwd(), 'public', 'assets');

function walkFiles(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(abs));
    else if (entry.isFile()) out.push(abs);
  }
  return out;
}

function buildHeadsetManifest(tool: ToolDetail, lab: Record<string, unknown> | null) {
  return {
    lab: lab ?? {},
    tools: [
      {
        toolId: tool.toolId,
        name: tool.name,
        vendor: tool.vendor,
        model: tool.model,
        category: tool.category,
        labLocation: tool.labLocation,
        shortDescription: tool.shortDescription,
        detailedDescription: tool.detailedDescription,
        specs: tool.specs,
        researchArea: tool.researchAreas,
        safetyNotes: tool.safetyNotes,
        tags: tool.tags,
        pdfs: tool.pdfs.map((p) => ({ title: p.title, file: p.filePath })),
        images: tool.images.map((i) => ({ title: i.title, file: i.filePath })),
        pages: tool.pages.map((p) => ({
          title: p.title,
          content: p.content.map((c) => ({
            contentType: c.contentType,
            subType: c.subType,
            info: c.info,
          })),
        })),
      },
    ],
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { toolId } = req.query;
  if (typeof toolId !== 'string') {
    return res.status(400).json({ error: 'Invalid toolId' });
  }

  const tool = await getToolById(toolId);
  if (!tool) {
    return res.status(404).json({ error: 'Tool not found' });
  }

  const cacheFile = path.join(CACHE_DIR, `${toolId}-v${tool.cacheVersion}.zip`);

  // Serve from cache if available
  if (fs.existsSync(cacheFile)) {
    const stat = fs.statSync(cacheFile);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${toolId}.zip"`);
    res.setHeader('Content-Length', stat.size);
    fs.createReadStream(cacheFile).pipe(res);
    return;
  }

  // Ensure cache dir exists & clean stale versions
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  for (const f of fs.readdirSync(CACHE_DIR)) {
    if (f.startsWith(`${toolId}-`) && f !== path.basename(cacheFile)) {
      fs.unlinkSync(path.join(CACHE_DIR, f));
    }
  }

  const lab = await getLabInfo();
  const manifest = buildHeadsetManifest(tool, lab as Record<string, unknown> | null);

  return new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(cacheFile);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      const stat = fs.statSync(cacheFile);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${toolId}.zip"`);
      res.setHeader('Content-Length', stat.size);
      fs.createReadStream(cacheFile).pipe(res);
      resolve();
    });

    archive.on('error', (err: Error) => {
      res.status(500).json({ error: 'Failed to generate package' });
      reject(err);
    });

    archive.pipe(output);
    archive.append(JSON.stringify(manifest, null, 2), { name: 'labtools-headset.json' });

    const toolAssetsDir = path.join(ASSETS_ROOT, toolId);
    if (fs.existsSync(toolAssetsDir)) {
      for (const filePath of walkFiles(toolAssetsDir)) {
        const rel = path.relative(ASSETS_ROOT, filePath).replace(/\\/g, '/');
        archive.file(filePath, { name: `assets/${rel}` });
      }
    }

    archive.finalize();
  });
}

export const config = {
  api: {
    responseLimit: false,
  },
};
