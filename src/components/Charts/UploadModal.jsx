import React from 'react';
import ChartDataUploader from './ChartDataUploader';
import './UploadModal.css';

const UploadModal = ({ isOpen, onClose, onDataUploaded }) => {
  if (!isOpen) return null;

  const handleDataUploaded = (chartData) => {
    onDataUploaded(chartData);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="upload-modal-overlay" onClick={handleOverlayClick}>
      <div className="upload-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="upload-modal-header">
          <h2>Import Chart Data</h2>
          <button className="upload-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="upload-modal-body">
          <ChartDataUploader 
            onDataUploaded={handleDataUploaded}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default UploadModal;

