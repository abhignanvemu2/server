import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import Video from "../models/Video.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});


const upload = multer({
  storage,
  limits: { fileSize: 100000000000000 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed!"), false);
    }
  }
});

// Get all videos (public)
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().sort({ order: 1, createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured videos (public)
router.get('/featured', async (req, res) => {
  try {
    const videos = await Video.find({ featured: true }).sort({ order: 1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload video (admin only)
router.post('/upload', auth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    const { title, description, category, client, year, featured } = req.body;

    const video = new Video({
      title,
      description,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      category,
      client,
      year: parseInt(year),
      featured: featured === 'true'
    });

    await video.save();
    res.status(201).json(video);
  } catch (error) {
    console.log("🚀 ~ error:", error)
    res.status(500).json({ message: 'Server error' });
  }
});

// Update video (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete video (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Delete physical file
    const fs = require('fs');
    const filePath = path.join(__dirname, '../uploads', video.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});



// // Fix __dirname for ESM
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Ensure uploads folder exists
// const uploadDir = path.join(__dirname, "../uploads");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// Configure multer for video uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 100000000000000 * 1024 * 1024 }, // 100MB
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith("video/")) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only video files are allowed!"), false);
//     }
//   }
// });

// Upload video route
// router.post("/upload", auth, upload.single("video"), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ message: "No video uploaded" });

//     const { title, description, category, client, year, featured } = req.body;

//     const video = new Video({
//       title,
//       description,
//       filename: req.file.filename,
//       originalName: req.file.originalname,
//       size: req.file.size,
//       category,
//       client,
//       year: parseInt(year),
//       featured: featured === "true"
//     });

//     await video.save();
//     res.status(201).json(video);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// Delete video route
// router.delete("/:id", auth, async (req, res) => {
//   try {
//     const video = await Video.findByIdAndDelete(req.params.id);
//     if (!video) return res.status(404).json({ message: "Video not found" });

//     // Delete physical file
//     const filePath = path.join(uploadDir, video.filename);
//     if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

//     res.json({ message: "Video deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

export default router;

