import React, { useState, useEffect } from 'react';

const ManagementPage = () => {
  const [syncMessage, setSyncMessage] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [progressLog, setProgressLog] = useState([]);

  // Listen for progress updates from the main process
  useEffect(() => {
    window.electronAPI.onSyncProgress((message) => {
      setProgressLog(prevLog => [...prevLog, message]);
    });
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage('');
    setProgressLog([]); // Clear previous logs
    const result = await window.electronAPI.syncImages();
    setSyncMessage(result.message);
    setIsSyncing(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Image Management Dashboard</h1>
      <p>Synchronize images from the central server to this device.</p>
      
      <button onClick={handleSync} disabled={isSyncing}>
        {isSyncing ? 'Syncing...' : 'Sync Now'}
      </button>

      {syncMessage && (
        <p style={{ fontWeight: 'bold', color: syncMessage.includes('Error') ? 'red' : 'green' }}>
          {syncMessage}
        </p>
      )}

      {/* Display a live log of sync progress */}
      {progressLog.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#f0f0f0',
          border: '1px solid #ccc',
          maxHeight: '300px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          {progressLog.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagementPage;