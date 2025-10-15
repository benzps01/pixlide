import express from 'express';
import authRoutes from './auth.js';
import imageRoutes from './images.js'; // <-- Import the new image routes

const router = express.Router();

// Test route
router.get('/', (req, res) => {
  res.json({ message: 'API is running...' });
});

// All routes starting with /auth will be handled by authRoutes
router.use('/auth', authRoutes);

// All routes starting with /images will be handled by imageRoutes
router.use('/images', imageRoutes); // <-- Use the image routes

export default router;