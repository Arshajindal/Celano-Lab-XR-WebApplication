import pool from './pool';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ToolAsset {
  title: string | null;
  filePath: string;
}

export interface PageContentBlock {
  contentType: string;
  subType: string | null;
  info: string | null;
}

export interface ToolPage {
  title: string;
  content: PageContentBlock[];
}

export interface ToolSummary {
  toolId: string;
  name: string;
  vendor: string | null;
  model: string | null;
  category: string | null;
  shortDescription: string | null;
}

export interface ToolDetail extends ToolSummary {
  labLocation: string | null;
  detailedDescription: string | null;
  cacheVersion: number;
  specs: string[];
  tags: string[];
  researchAreas: string[];
  safetyNotes: string[];
  images: ToolAsset[];
  pdfs: ToolAsset[];
  videos: ToolAsset[];
  pages: ToolPage[];
}

export interface LabInfo {
  id: string;
  name: string;
  location: string | null;
  website: string | null;
  description: string | null;
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

interface ToolFilters {
  category?: string;
  vendor?: string;
  tag?: string;
  search?: string;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getAllTools(filters?: ToolFilters): Promise<ToolSummary[]> {
  let query = 'SELECT tool_id, name, vendor, model, category, short_description FROM tools';
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (filters?.category) {
    conditions.push(`category = $${idx++}`);
    params.push(filters.category);
  }
  if (filters?.vendor) {
    conditions.push(`vendor ILIKE $${idx++}`);
    params.push(`%${filters.vendor}%`);
  }
  if (filters?.tag) {
    conditions.push(`tool_id IN (SELECT tool_id FROM tool_tags WHERE tag ILIKE $${idx++})`);
    params.push(`%${filters.tag}%`);
  }
  if (filters?.search) {
    conditions.push(
      `(name ILIKE $${idx} OR short_description ILIKE $${idx} OR detailed_description ILIKE $${idx})`
    );
    params.push(`%${filters.search}%`);
    idx++;
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY name';

  const { rows } = await pool.query(query, params);
  return rows.map((r) => ({
    toolId: r.tool_id,
    name: r.name,
    vendor: r.vendor,
    model: r.model,
    category: r.category,
    shortDescription: r.short_description,
  }));
}

export async function getToolById(toolId: string): Promise<ToolDetail | null> {
  const toolResult = await pool.query('SELECT * FROM tools WHERE tool_id = $1', [toolId]);
  if (toolResult.rows.length === 0) return null;

  const t = toolResult.rows[0];

  const [specsRes, tagsRes, areasRes, notesRes, assetsRes, pagesRes] = await Promise.all([
    pool.query('SELECT spec FROM tool_specs WHERE tool_id = $1 ORDER BY sort_order', [toolId]),
    pool.query('SELECT tag FROM tool_tags WHERE tool_id = $1', [toolId]),
    pool.query('SELECT area FROM tool_research_areas WHERE tool_id = $1', [toolId]),
    pool.query('SELECT note FROM tool_safety_notes WHERE tool_id = $1 ORDER BY sort_order', [toolId]),
    pool.query(
      'SELECT asset_type, title, file_path FROM assets WHERE tool_id = $1 ORDER BY sort_order',
      [toolId]
    ),
    pool.query(
      `SELECT p.id AS page_id, p.title AS page_title, p.sort_order AS page_order,
              c.content_type, c.sub_type, c.info, c.sort_order AS content_order
       FROM tool_pages p
       LEFT JOIN page_content_blocks c ON c.page_id = p.id
       WHERE p.tool_id = $1
       ORDER BY p.sort_order, c.sort_order`,
      [toolId]
    ),
  ]);

  const images = assetsRes.rows
    .filter((a) => a.asset_type === 'image')
    .map((a) => ({ title: a.title, filePath: a.file_path }));
  const pdfs = assetsRes.rows
    .filter((a) => a.asset_type === 'pdf')
    .map((a) => ({ title: a.title, filePath: a.file_path }));
  const videos = assetsRes.rows
    .filter((a) => a.asset_type === 'video')
    .map((a) => ({ title: a.title, filePath: a.file_path }));

  const pagesMap = new Map<number, ToolPage>();
  for (const row of pagesRes.rows) {
    if (!pagesMap.has(row.page_id)) {
      pagesMap.set(row.page_id, { title: row.page_title, content: [] });
    }
    if (row.content_type) {
      pagesMap.get(row.page_id)!.content.push({
        contentType: row.content_type,
        subType: row.sub_type,
        info: row.info,
      });
    }
  }

  return {
    toolId: t.tool_id,
    name: t.name,
    vendor: t.vendor,
    model: t.model,
    category: t.category,
    labLocation: t.lab_location,
    shortDescription: t.short_description,
    detailedDescription: t.detailed_description,
    cacheVersion: t.cache_version,
    specs: specsRes.rows.map((r) => r.spec),
    tags: tagsRes.rows.map((r) => r.tag),
    researchAreas: areasRes.rows.map((r) => r.area),
    safetyNotes: notesRes.rows.map((r) => r.note),
    images,
    pdfs,
    videos,
    pages: Array.from(pagesMap.values()),
  };
}

export async function getLabInfo(): Promise<LabInfo | null> {
  const { rows } = await pool.query('SELECT * FROM labs LIMIT 1');
  if (rows.length === 0) return null;
  return {
    id: rows[0].id,
    name: rows[0].name,
    location: rows[0].location,
    website: rows[0].website,
    description: rows[0].description,
  };
}
