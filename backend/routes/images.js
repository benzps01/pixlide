import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/authMiddleware.js';
import { uploadImages, getImages, deleteImage } from '../controllers/imageController.js';

const router = express.Router();

// --- Multer Configuration for File Storage ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage: storage });

// --- Define Routes ---
// This route is public, anyone can view the images
router.get('/', getImages);

// These routes are protected and require a valid token
router.post('/upload', protect, upload.array('images', 10), uploadImages);
router.delete('/:id', protect, deleteImage);

export default router;