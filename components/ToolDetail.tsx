'use client';

import React from 'react';
import styles from './ToolDetail.module.css';
import { Tool, resolveAssetUrl } from './LabToolsGallery';

interface ToolDetailProps {
  tool: Tool;
}

const ToolDetail: React.FC<ToolDetailProps> = ({ tool }) => {
  return (
    <article className={styles.container}>
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

      {tool.images && tool.images.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Images</h2>
          <div className={styles.imagesGallery}>
            {tool.images.map((img, i) => (
              <figure key={i} className={styles.imageFigure}>
                <img
                  className={styles.toolImage}
                  src={resolveAssetUrl(img.filePath)}
                  alt={img.title ?? tool.name}
                  loading="lazy"
                />
                {img.title && (
                  <figcaption className={styles.imageCaption}>{img.title}</figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      {tool.specs && tool.specs.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Specifications</h2>
          <div className={styles.specsGrid}>
            {tool.specs.map((spec, i) => (
              <div key={i} className={styles.specItem}>
                {spec}
              </div>
            ))}
          </div>
        </section>
      )}

      {tool.pdfs && tool.pdfs.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Documents</h2>
          <div className={styles.pdfsList}>
            {tool.pdfs.map((pdf, i) => (
              <div className={styles.pdfItem} key={i}>
                <div className={styles.pdfInfo}>
                  <h3 className={styles.pdfTitle}>{pdf.title}</h3>
                </div>
                {resolveAssetUrl(pdf.filePath) && (
                  <a
                    className={styles.pdfLink}
                    href={resolveAssetUrl(pdf.filePath)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View PDF
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {tool.videos && tool.videos.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Videos</h2>
          <div className={styles.videosList}>
            {tool.videos.map((video, i) => (
              <a
                key={i}
                className={styles.videoLink}
                href={video.filePath}
                target="_blank"
                rel="noopener noreferrer"
              >
                {video.title || video.filePath}
              </a>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};

export default ToolDetail;
