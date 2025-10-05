import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose, { mongo } from 'mongoose';

const app = express();
dotenv.config();
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;

const MONGO_URL = 'mongodb://localhost:27017/pixlide';
mongoose.connect(MONGO_URL)
  .then(() => console.log("Successfully connected to DB"))
  .catch(err => console.error('Connection error', err));

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', UserSchema);

// Image Schema
const ImageSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Image = mongoose.model('Image', ImageSchema);

// --- Middleware ---
app.use(cors());
app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage: storage });

// --- JWT Authentication Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401); // if there isn't any token

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // if the token is no longer valid
    req.user = user;
    next(); // move on to the next middleware or the route handler
  });
};


// --- API Routes ---

// USER AUTHENTICATION ROUTES
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('Username already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).send('User created successfully');
  } catch (err) {
    res.status(500).send('Error creating user');
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(400).send('Cannot find user');
    }
    if (await bcrypt.compare(req.body.password, user.password)) {
      const accessToken = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ accessToken: accessToken });
    } else {
      res.status(401).send('Not Allowed');
    }
  } catch (err) {
    res.status(500).send();
  }
});


// IMAGE ROUTES (Now with DB)
app.get('/api/images', async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 }); // Get newest images first
    const imageUrls = images.map(img => ({
      id: img._id,
      url: `http://localhost:${PORT}${img.path}`
    }));
    res.json(imageUrls);
  } catch (err) {
    res.status(500).send('Error fetching images');
  }
});

// PROTECTED upload route (Now with DB)
app.post('/api/upload', authenticateToken, upload.array('images', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded.' });
  }

  try {
    const imageDocs = req.files.map(file => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`, // Store the URL path
    }));

    await Image.insertMany(imageDocs);

    res.status(201).json({
      message: `${req.files.length} file(s) uploaded and saved to DB successfully!`,
    });
  } catch (err) {
    res.status(500).send('Error saving images to database');
  }
});

// --- Start the server ---
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});