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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const url = `${baseUrl}/tools/${toolId}`;

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
