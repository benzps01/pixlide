import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Define the base URL from the environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UploadPage = () => {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [message, setMessage] = useState('');
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Use the constant for the fetch call
        const response = await fetch(`${API_BASE_URL}/api/images`);
        const data = await response.json();
        setImages(data);
      } catch (error) {
        console.error("Failed to fetch images:", error);
      }
    };
    fetchImages();
  }, []);

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
    setMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setMessage('Please select one or more files first.');
      return;
    }
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
      // Use the constant for the fetch call
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Upload failed. Your session might have expired.');
      }
      navigate('/');
    } catch (error) {
      setMessage('Error uploading files. Please try again.');
      console.error(error);
    }
  };
  
  const handleDelete = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }
    const token = localStorage.getItem('accessToken');
    try {
      // Use the constant for the fetch call
      const response = await fetch(`${API_BASE_URL}/api/images/${imageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to delete image.');
      }
      setImages(images.filter(image => image.id !== imageId));
      setMessage('Image deleted successfully.');
    } catch (error) {
      setMessage(error.message);
      console.error(error);
    }
  };

    return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
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
        {selectedFiles && selectedFiles.length > 0 && <p>{selectedFiles.length} file(s) selected</p>}
        {message && <p style={{ marginTop: '20px' }}>{message}</p>}
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2>Manage Existing Images</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
          {images.map(image => (
            <div key={image.id} style={{ border: '1px solid #ddd', padding: '5px', borderRadius: '4px', textAlign: 'center' }}>
              <img src={image.url} alt="" style={{ width: '150px', height: '90px', objectFit: 'cover' }} />
              <button 
                onClick={() => handleDelete(image.id)} 
                style={{ marginTop: '5px', width: '100%', background: '#dc3545', color: 'white', border: 'none', padding: '5px', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;