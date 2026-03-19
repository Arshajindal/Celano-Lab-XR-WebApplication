'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Welcome.module.css';
import ToolQRCode from './ToolQRCode';
import { Tool } from './LabToolsGallery';

interface WelcomeProps {
  tools: Tool[];
}

const Welcome: React.FC<WelcomeProps> = ({ tools }) => {
  return (
    <div className={styles.container}>
      {/* Welcome Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Celano Lab</h1>
          <h2 className={styles.heroSubtitle}>Nanoelectronics Metrology & Failure Analysis Lab</h2>
          
          <p className={styles.tagline}>
            An interdisciplinary research team at Arizona State University's School of Electrical, Computer & 
            Energy Engineering, led by Prof. Umberto Celano
          </p>

          <p className={styles.description}>
            The Celano Lab focuses on cutting-edge research in nanoelectronics, nanoscale analytical imaging, 
            and correlative metrology for emerging devices and 2D materials. Our research combines advanced 
            instrumentation with innovative analytical techniques to unlock new insights in next-generation 
            electronic devices.
          </p>

          <a 
            href="https://labs.engineering.asu.edu/celano/" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.labLink}
          >
            Visit Lab Website →
          </a>
        </div>
      </section>

      {/* Tools List Section */}
      <section className={styles.toolsSection}>
        <h2 className={styles.toolsSectionTitle}>Our Research Tools & Equipment</h2>
        
        <div className={styles.toolsList}>
          {tools.map((tool, idx) => {
            const toolId = (tool as any).toolId || String(tool.name).toLowerCase().replace(/\s+/g, '-');
            return (
              <Link href={`/tools/${toolId}`} key={idx} className={styles.toolItem}>
                <div className={styles.toolHeader}>
                  <h3 className={styles.toolName}>{tool.name}</h3>
                  {tool.vendor && <span className={styles.vendor}>{tool.vendor}</span>}
                </div>

                {tool.category && (
                  <span className={styles.category}>{tool.category}</span>
                )}

                {tool.shortDescription && (
                  <p className={styles.toolDescription}>{tool.shortDescription}</p>
                )}

                <div className={styles.qrPreview}>
                  <ToolQRCode 
                    toolId={toolId} 
                    toolName={tool.name}
                    size={80}
                    showDownload={false}
                  />
                </div>

                <div className={styles.arrow}>→</div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Welcome;
