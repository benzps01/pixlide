import React, { useState } from 'react';

const UploadPage = () => {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [message, setMessage] = useState('');
  const url = import.meta.env.VITE_BACKEND_URL;


  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
    setMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setMessage('Please select one or more files first.');
      return;
    }

    // --- Get the token from localStorage ---
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setMessage('You must be logged in to upload files.');
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('images', selectedFiles[i]);
    }

    try {
      setMessage('Uploading...');
      const response = await fetch(`${url}/api/upload`, {
        method: 'POST',
        // --- Add the Authorization header ---
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed. Your session might have expired.');
      }

      const result = await response.json();
      setMessage(result.message);
      setSelectedFiles(null);
      document.getElementById('fileInput').value = '';

    } catch (error) {
      setMessage('Error uploading files. Please try again.');
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Upload New Image(s)</h2>
      <input 
        id="fileInput"
        type="file" 
        accept="image/png, image/jpeg" 
        onChange={handleFileChange}
        multiple
      />
      <button onClick={handleUpload} style={{ marginLeft: '10px' }}>
        Upload
      </button>
      {selectedFiles && selectedFiles.length > 0 && (
        <p>{selectedFiles.length} file(s) selected</p>
      )}
      {message && <p style={{ marginTop: '20px' }}>{message}</p>}
    </div>
  );
};

export default UploadPage;