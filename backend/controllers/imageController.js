import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Image from '../models/Image.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(path.dirname(__filename)); // Navigate up to the 'backend' folder

// @desc    Upload new images
// @route   POST /api/images/upload
export const uploadImages = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded.' });
  }

  try {
    const imageDocs = req.files.map(file => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`,
    }));

    await Image.insertMany(imageDocs);

    res.status(201).json({
      message: `${req.files.length} file(s) uploaded successfully!`,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error saving images to database' });
  }
};

// @desc    Get all images with pagination
// @route   GET /api/images
export const getImages = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const images = await Image.find().sort({ createdAt: -1 }).limit(limit).skip(skip);
    
    const imageUrls = images.map(img => ({
      id: img._id,
      url: `http://localhost:${process.env.PORT || 3000}${img.path}`
    }));
    
    res.json(imageUrls);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching images' });
  }
};

// @desc    Delete an image
// @route   DELETE /api/images/:id
export const deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const filePath = path.join(__dirname, image.path);
    fs.unlink(filePath, async (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      }
      await Image.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Image deleted successfully' });
    });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting image' });
  }
};