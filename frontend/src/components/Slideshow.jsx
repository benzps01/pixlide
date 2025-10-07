import React, { useState, useEffect, useMemo } from 'react';
import './Slideshow.css';

// Define the base URL from the environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// An array of all our available animation class names
const animationClasses = [
  'transition-fade',
  'transition-slide-left',
  'transition-slide-right',
  'transition-zoom',
];

const Slideshow = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch images when the component mounts
  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Use the constant for the fetch call
        const response = await fetch(`${API_BASE_URL}/api/images`);
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

  // Autoplay functionality
  useEffect(() => {
    const intervalId = setInterval(nextSlide, 3000);
    return () => clearInterval(intervalId);
  }, [currentIndex, images]);

  // useMemo will re-calculate a random class only when currentIndex changes
  const randomAnimationClass = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * animationClasses.length);
    return animationClasses[randomIndex];
  }, [currentIndex]);

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
  if (images.length === 0) return <div style={{ padding: '20px' }}>No images to display. Try uploading some!</div>;

  return (
    <div className="slideshow-container">
      <img
        key={currentIndex}
        src={images[currentIndex].url}
        alt={`Slide ${currentIndex + 1}`}
        className={`slide-image ${randomAnimationClass}`}
      />
      <button onClick={prevSlide} className="prev-button">&#10094;</button>
      <button onClick={nextSlide} className="next-button">&#10095;</button>
    </div>
  );
};

export default Slideshow;