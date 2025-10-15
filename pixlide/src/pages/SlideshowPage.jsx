import React, { useState, useEffect, useMemo } from 'react';
import '../Slideshow.css'; // Import the new styles

const animationClasses = ['transition-fade', 'transition-slide-left', 'transition-slide-right', 'transition-zoom'];

const SlideshowPage = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocalImages = async () => {
      const localImages = await window.electronAPI.getLocalImages();
      setImages(localImages);
      setLoading(false);
    };
    fetchLocalImages();
  }, []);

  const nextSlide = () => {
    if (images.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    if (images.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const intervalId = setInterval(nextSlide, 3000);
    return () => clearInterval(intervalId);
  }, [images]); // Rerun if the images array changes

  const randomAnimationClass = useMemo(() => {
    return animationClasses[Math.floor(Math.random() * animationClasses.length)];
  }, [currentIndex]);

  if (loading) {
    return <div className="slideshow-container"><h1>Loading...</h1></div>;
  }

  if (images.length === 0) {
    return <div className="slideshow-container"><h1>No images found. Please sync from the Manage page.</h1></div>;
  }

  return (
    <div className="slideshow-container">
      <img
        key={currentIndex}
        // Use the custom 'media://' protocol to load the local file
        src={`media://${images[currentIndex].filename}`}
        alt={images[currentIndex].filename}
        className={`slide-image ${randomAnimationClass}`}
      />
      <button onClick={prevSlide} className="prev-button">&#10094;</button>
      <button onClick={nextSlide} className="next-button">&#10095;</button>
    </div>
  );
};

export default SlideshowPage;