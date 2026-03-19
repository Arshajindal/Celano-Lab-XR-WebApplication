import React from 'react';
import Link from 'next/link';
import styles from './LabToolsGallery.module.css';
import rawData from '../data/labtools.json';

// Type definitions
export interface Pdf {
  title: string;
  type?: string;
  url: string;
}

export interface ImageItem {
  url: string;
  label?: string;
  alt?: string;
  caption?: string;
}

export interface VideoItem {
  title?: string;
  url: string;
}

export type Specs = { [key: string]: string | number | boolean | Array<string> | null };

export interface Tool {
  id?: string | number;
  name: string;
  vendor?: string;
  model?: string;
  category?: string;
  shortDescription?: string;
  specs?: Specs;
  pdfs?: Pdf[];
  images?: ImageItem[];
  videos?: VideoItem[];
}

export interface Lab {
  name?: string;
  tools?: Tool[];
}

// Normalize incoming JSON into a Tool[] array
function extractTools(data: any): Tool[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    // Might already be a list of tools or labs
    const maybeTools = data as any[];
    if (maybeTools.length === 0) return [];
    // If entries look like tools (have `name`), return directly
    if (maybeTools[0] && typeof maybeTools[0].name === 'string') return maybeTools as Tool[];
    // Otherwise try to collect `tools` from each entry
    return maybeTools.reduce((acc: Tool[], item: any) => {
      if (item && Array.isArray(item.tools)) acc.push(...item.tools);
      return acc;
    }, []);
  }

  // If object with `tools` key
  if (data.tools && Array.isArray(data.tools)) return data.tools as Tool[];
  // If object with `labs` key
  if (data.labs && Array.isArray(data.labs)) {
    return data.labs.reduce((acc: Tool[], lab: Lab) => {
      if (lab && Array.isArray(lab.tools)) acc.push(...lab.tools);
      return acc;
    }, [] as Tool[]);
  }

  // Fallback: try to find any nested tools arrays
  const found: Tool[] = [];
  for (const key of Object.keys(data)) {
    const val = (data as any)[key];
    if (Array.isArray(val) && val.length > 0 && val[0] && typeof val[0].name === 'string') {
      found.push(...(val as Tool[]));
    }
  }
  return found;
}

const tools: Tool[] = extractTools(rawData as any);

function renderSpecValue(val: any) {
  if (Array.isArray(val)) {
    return (
      <ul>
        {val.map((v, i) => (
          <li key={i}>{String(v)}</li>
        ))}
      </ul>
    );
  }
  return <span>{String(val)}</span>;
}

const LabToolsGallery: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {tools.map((tool, idx) => (
          <article className={styles.card} key={(tool as any).toolId ?? tool.id ?? idx}>
            <header className={styles.cardHeader}>
              <div className={styles.titleRow}>
                <h3 className={styles.title}>
                  <Link href={`/tools/${(tool as any).toolId || tool.id || String(tool.name).toLowerCase().replace(/\s+/g, '-')}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {tool.name}
                  </Link>
                </h3>
                <div className={styles.meta}>{tool.category ?? ''}</div>
              </div>
              <div className={styles.meta}>
                {tool.vendor ? `${tool.vendor}${tool.model ? ' — ' + tool.model : ''}` : tool.model}
              </div>
              {tool.shortDescription && <div className={styles.shortDesc}>{tool.shortDescription}</div>}
            </header>

            {/* Specs sub-card */}
            <section className={styles.subCard} aria-label="Specs">
              <div className={styles.subTitle}>Specs</div>
              {tool.specs && Object.keys(tool.specs).length > 0 ? (
                <div>
                  {Object.entries(tool.specs).map(([k, v]) => (
                    <div className={styles.specRow} key={k}>
                      <div className={styles.specKey}>{k}</div>
                      <div className={styles.specValue}>{renderSpecValue(v)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.muted}>No specs available</div>
              )}
            </section>

            {/* PDFs sub-card */}
            <section className={styles.subCard} aria-label="PDFs">
              <div className={styles.subTitle}>PDFs</div>
              {tool.pdfs && tool.pdfs.length > 0 ? (
                tool.pdfs.map((p, i) => (
                  <div className={styles.pdfRow} key={i}>
                    <div className={styles.pdfMeta}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.title}</div>
                        <div className={styles.muted}>{p.type}</div>
                      </div>
                    </div>
                    <a className={styles.linkButton} href={p.url} target="_blank" rel="noopener noreferrer">
                      Open
                    </a>
                  </div>
                ))
              ) : (
                <div className={styles.muted}>No PDFs available</div>
              )}
            </section>

            {/* Images sub-card */}
            <section className={styles.subCard} aria-label="Images">
              <div className={styles.subTitle}>Images</div>
              {tool.images && tool.images.length > 0 ? (
                <div>
                  <div className={styles.imagesGrid}>
                    {tool.images.map((img, i) => (
                      <figure key={i} style={{ margin: 0 }}>
                        <img 
                          className={styles.thumb} 
                          src={img.url} 
                          alt={img.alt ?? img.label ?? tool.name}
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23f0f0f0" width="80" height="80"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%23999"%3EImage not found%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        {(img.caption ?? img.label) && <figcaption className={styles.caption}>{img.caption ?? img.label}</figcaption>}
                      </figure>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.muted}>No images available</div>
              )}
            </section>

            {/* Videos sub-card (optional) */}
            {tool.videos && tool.videos.length > 0 ? (
              <section className={styles.subCard} aria-label="Videos">
                <div className={styles.subTitle}>Videos</div>
                <div className={styles.videosList}>
                  {tool.videos.map((v, i) => (
                    <a key={i} href={v.url} target="_blank" rel="noopener noreferrer">
                      {v.title ?? v.url}
                    </a>
                  ))}
                </div>
              </section>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
};

export default LabToolsGallery;
