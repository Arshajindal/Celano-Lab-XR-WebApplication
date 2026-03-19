'use client';

import React from 'react';
import styles from './ToolDetail.module.css';
import { Tool } from './LabToolsGallery';

interface ToolDetailProps {
  tool: Tool;
}

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

function formatSpecKey(key: string) {
  const normalized = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

const ToolDetail: React.FC<ToolDetailProps> = ({ tool }) => {
  return (
    <article className={styles.container}>
      {/* Header Section */}
      <header className={styles.header}>
        <h1 className={styles.title}>{tool.name}</h1>
        <div className={styles.headerMeta}>
          {tool.vendor && <span className={styles.vendor}>{tool.vendor}</span>}
          {tool.model && <span className={styles.model}>{tool.model}</span>}
          {tool.category && <span className={styles.category}>{tool.category}</span>}
        </div>
        {tool.shortDescription && (
          <p className={styles.shortDescription}>{tool.shortDescription}</p>
        )}
      </header>

      {/* Images Section */}
      {tool.images && tool.images.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Images</h2>
          <div className={styles.imagesGallery}>
            {tool.images.map((img, i) => (
              <figure key={i} className={styles.imageFigure}>
                <img
                  className={styles.toolImage}
                  src={img.url}
                  alt={img.alt ?? img.label ?? tool.name}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23999"%3EImage not found%3C/text%3E%3C/svg%3E';
                  }}
                />
                {(img.caption ?? img.label) && (
                  <figcaption className={styles.imageCaption}>{img.caption ?? img.label}</figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Specs Section */}
      {tool.specs && Object.keys(tool.specs).length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Specifications</h2>
          <div className={styles.specsGrid}>
            {Object.entries(tool.specs).map(([key, val]) => (
              <div className={styles.specItem} key={key}>
                <h3 className={styles.specKey}>{formatSpecKey(key)}</h3>
                <div className={styles.specValue}>{renderSpecValue(val)}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PDFs Section */}
      {tool.pdfs && tool.pdfs.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Documents</h2>
          <div className={styles.pdfsList}>
            {tool.pdfs.map((pdf, i) => (
              <div className={styles.pdfItem} key={i}>
                <div className={styles.pdfInfo}>
                  <h3 className={styles.pdfTitle}>{pdf.title}</h3>
                  {pdf.type && <span className={styles.pdfType}>{pdf.type}</span>}
                </div>
                <a className={styles.pdfLink} href={pdf.url} target="_blank" rel="noopener noreferrer">
                  View PDF
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Videos Section */}
      {tool.videos && tool.videos.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Videos</h2>
          <div className={styles.videosList}>
            {tool.videos.map((video, i) => (
              <a
                key={i}
                className={styles.videoLink}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {video.title || video.url}
              </a>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};

export default ToolDetail;
