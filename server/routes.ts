import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dnmvyvvqh',
  api_key: '592154457426537',
  api_secret: 'nVWi5sRlaXKcP6oDRzo1ju6J59w'
});

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Image upload endpoint
  app.post('/api/upload-image', upload.single('image'), async (req: Request, res: Response) => {
    try {
      const file = req.file as Express.Multer.File;
      if (!file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Convert buffer to base64
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(base64Image, {
        folder: 'lovelane',
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto'
      });

      res.json({ url: result.secure_url });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
