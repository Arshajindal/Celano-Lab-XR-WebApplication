'use client';

import React from 'react';
import QRCodeRenderer from './QRCodeRenderer';
import styles from './ToolQRCode.module.css';

interface ToolQRCodeProps {
  toolId: string;
  toolName: string;
  size?: number;
  showDownload?: boolean;
}

const ToolQRCode: React.FC<ToolQRCodeProps> = ({ 
  toolId, 
  toolName, 
  size = 150,
  showDownload = false
}) => {
  const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://xr-labtools-745967509851.us-central1.run.app';
  const baseUrl = rawBaseUrl.replace(/\/+$/, '');
  const url = `${baseUrl}/api/tools/${toolId}/package`;

  return (
    <div className={styles.qrContainer}>
      <QRCodeRenderer 
        url={url}
        toolName={toolName}
        size={size}
        showDownload={showDownload}
      />
      
      <p className={styles.qrLabel}>Scan for {toolName}</p>
      <p className={styles.urlText}>{url}</p>
    </div>
  );
};

export default ToolQRCode;
