import React, { useState, useEffect } from 'react';
import './Slideshow.css';

const Slideshow = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const url = import.meta.env.VITE_BACKEND_URL;

  // Fetch images when the component mounts
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`${url}/api/images`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setImages(data);
      } catch (err) {
        setError('Failed to fetch images.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  const nextSlide = () => {
    if (images.length === 0) return;
    const newIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(newIndex);
  };

  const prevSlide = () => {
    if (images.length === 0) return;
    const newIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(newIndex);
  };

  useEffect(() => {
    const intervalId = setInterval(nextSlide, 3000);
    return () => clearInterval(intervalId);
  }, [currentIndex, images]); // Re-run if images array changes

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
  if (images.length === 0) return <div style={{ padding: '20px' }}>No images to display. Try uploading some!</div>;

  return (
    <div className="slideshow-container">
      <img
        src={images[currentIndex].url}
        alt={`Slide ${currentIndex + 1}`}
        className="slide-image"
      />
      <button onClick={prevSlide} className="prev-button">&#10094;</button>
      <button onClick={nextSlide} className="next-button">&#10095;</button>
    </div>
  );
};

export default Slideshow;