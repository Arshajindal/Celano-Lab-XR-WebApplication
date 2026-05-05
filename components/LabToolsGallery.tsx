import React from 'react';
import Link from 'next/link';
import styles from './LabToolsGallery.module.css';

// ---------------------------------------------------------------------------
// Shared types — imported by Welcome, ToolDetail, pages, etc.
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

export interface Tool {
  toolId: string;
  name: string;
  vendor: string | null;
  model: string | null;
  category: string | null;
  labLocation?: string | null;
  shortDescription: string | null;
  detailedDescription?: string | null;
  cacheVersion?: number;
  specs?: string[];
  tags?: string[];
  researchAreas?: string[];
  safetyNotes?: string[];
  images?: ToolAsset[];
  pdfs?: ToolAsset[];
  videos?: ToolAsset[];
  pages?: ToolPage[];
}

export function resolveAssetUrl(filePath: string | undefined | null): string | undefined {
  if (!filePath) return undefined;
  if (/^https?:\/\//i.test(filePath)) return filePath;
  return filePath.startsWith('/') ? filePath : '/' + filePath;
}

// ---------------------------------------------------------------------------
// Gallery component
// ---------------------------------------------------------------------------

interface LabToolsGalleryProps {
  tools: Tool[];
}

const LabToolsGallery: React.FC<LabToolsGalleryProps> = ({ tools }) => {
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {tools.map((tool, idx) => (
          <article className={styles.card} key={tool.toolId ?? idx}>
            <header className={styles.cardHeader}>
              <div className={styles.titleRow}>
                <h3 className={styles.title}>
                  <Link href={`/tools/${tool.toolId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
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

            <section className={styles.subCard} aria-label="Specs">
              <div className={styles.subTitle}>Specs</div>
              {tool.specs && tool.specs.length > 0 ? (
                <ul>
                  {tool.specs.map((spec, i) => (
                    <li key={i}>{spec}</li>
                  ))}
                </ul>
              ) : (
                <div className={styles.muted}>No specs available</div>
              )}
            </section>

            <section className={styles.subCard} aria-label="PDFs">
              <div className={styles.subTitle}>PDFs</div>
              {tool.pdfs && tool.pdfs.length > 0 ? (
                tool.pdfs.map((pdf, i) => {
                  const pdfHref = resolveAssetUrl(pdf.filePath);
                  return (
                    <div className={styles.pdfRow} key={i}>
                      <div className={styles.pdfMeta}>
                        <div style={{ fontWeight: 600 }}>{pdf.title}</div>
                      </div>
                      {pdfHref && (
                        <a className={styles.linkButton} href={pdfHref} target="_blank" rel="noopener noreferrer">
                          Open
                        </a>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className={styles.muted}>No PDFs available</div>
              )}
            </section>

            <section className={styles.subCard} aria-label="Images">
              <div className={styles.subTitle}>Images</div>
              {tool.images && tool.images.length > 0 ? (
                <div className={styles.imagesGrid}>
                  {tool.images.map((img, i) => {
                    const imgSrc = resolveAssetUrl(img.filePath);
                    return (
                      <figure key={i} style={{ margin: 0 }}>
                        <img
                          className={styles.thumb}
                          src={imgSrc}
                          alt={img.title ?? tool.name}
                          loading="lazy"
                        />
                        {img.title && <figcaption className={styles.caption}>{img.title}</figcaption>}
                      </figure>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.muted}>No images available</div>
              )}
            </section>

            {tool.videos && tool.videos.length > 0 && (
              <section className={styles.subCard} aria-label="Videos">
                <div className={styles.subTitle}>Videos</div>
                <div className={styles.videosList}>
                  {tool.videos.map((v, i) => (
                    <a key={i} href={v.filePath} target="_blank" rel="noopener noreferrer">
                      {v.title ?? v.filePath}
                    </a>
                  ))}
                </div>
              </section>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};

export default LabToolsGallery;
