'use client';

import React, { useRef } from 'react';
import styles from './ToolQRCode.module.css';

interface QRCodeRendererProps {
  url: string;
  toolName: string;
  size: number;
  showDownload: boolean;
}

const QRCodeRenderer: React.FC<QRCodeRendererProps> = ({
  url,
  toolName,
  size,
  showDownload
}) => {
  const qrRef = useRef<HTMLDivElement>(null);

  // Generate QR code using a simple API service (no dependencies needed)
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `${toolName.replace(/\s+/g, '-')}-qr.png`;
    link.click();
  };

  const printQR = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${toolName}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 2rem; }
              img { max-width: 500px; margin: 2rem 0; }
              h2 { margin: 0 0 1rem 0; color: #333; }
              p { color: #666; font-size: 14px; word-break: break-all; }
            </style>
          </head>
          <body>
            <h2>${toolName}</h2>
            <p>Scan this QR code to view the tool details</p>
            <img src="${qrImageUrl}" alt="QR Code" />
            <p><strong>URL:</strong> ${url}</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <>
      <div ref={qrRef} className={styles.qrWrapper}>
        <img
          src={qrImageUrl}
          alt={`QR Code for ${toolName}`}
          width={size}
          height={size}
          style={{ display: 'block', margin: '0 auto' }}
        />
      </div>
      
      {showDownload && (
        <div className={styles.buttonGroup}>
          <button onClick={downloadQR} className={styles.btn}>
            📥 Download QR
          </button>
          <button onClick={printQR} className={styles.btn}>
            🖨️ Print QR
          </button>
        </div>
      )}
    </>
  );
};

export default QRCodeRenderer;
