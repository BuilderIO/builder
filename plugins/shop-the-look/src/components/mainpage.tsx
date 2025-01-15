import React, { useState } from 'react';
import LookbookPage from './lookbook-list';
import { UploadImagePage } from './upload-image';

export const MyPlugin = () => {
  const [currentView, setCurrentView] = useState<'list' | 'upload'>('list');
  const [selectedLookbook, setSelectedLookbook] = useState(null);

  const handleEditClick = (lookbook: any) => {
    setSelectedLookbook(lookbook);
    setCurrentView('upload');
  };

  const handleSave = () => {
    setCurrentView('list');
  };

  const handleUploadButton = () =>{
    setSelectedLookbook(null)
    setCurrentView('upload');

  }

  return (
    <div>
      <div style={{ margin:"20px" }}>
        <button
          onClick={() => setCurrentView('list')}
          style={{
            marginRight: '10px',
            padding: '10px 20px',
            backgroundColor: currentView === 'list' ? '#2196F3' : '#B5DAF6',
            color: currentView === 'list' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight:"bold"
          }}
        >
          Lookbook List
        </button>
        <button
          onClick={handleUploadButton}
          style={{
            padding: '10px 20px',
            backgroundColor: currentView === 'upload' ? '#2196F3' : '#B5DAF6',
            color: currentView === 'upload' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight:"bold"
          }}
        >
          Upload/Edit Lookbook
        </button>
      </div>

      {currentView === 'list' && (
        <LookbookPage onEditClick={handleEditClick} />
      )}
      {currentView === 'upload' && (
        <UploadImagePage
          lookbook={selectedLookbook}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

