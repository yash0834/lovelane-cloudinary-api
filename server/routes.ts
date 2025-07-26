import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { insertUserProfileSchema, insertSwipeSchema, insertMatchSchema, insertMessageSchema } from "@shared/schema";

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
  // User Profile endpoints
  app.get('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const userProfile = await storage.getUserProfile(req.params.id);
      if (!userProfile) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(userProfile);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  });

  app.get('/api/users/email/:email', async (req: Request, res: Response) => {
    try {
      const userProfile = await storage.getUserProfileByEmail(req.params.email);
      if (!userProfile) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(userProfile);
    } catch (error) {
      console.error('Get user by email error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  });

  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserProfileSchema.parse(req.body);
      const userProfile = await storage.createUserProfile(validatedData);
      res.status(201).json(userProfile);
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  app.patch('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const userProfile = await storage.updateUserProfile(req.params.id, req.body);
      if (!userProfile) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(userProfile);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  app.put('/api/users/:id/last-active', async (req: Request, res: Response) => {
    try {
      await storage.updateLastActive(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Update last active error:', error);
      res.status(500).json({ error: 'Failed to update last active' });
    }
  });

  app.get('/api/users/:id/potential-matches', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const matches = await storage.getPotentialMatches(req.params.id, limit);
      res.json(matches);
    } catch (error) {
      console.error('Get potential matches error:', error);
      res.status(500).json({ error: 'Failed to get potential matches' });
    }
  });

  // Swipe endpoints
  app.post('/api/swipes', async (req: Request, res: Response) => {
    try {
      const validatedData = insertSwipeSchema.parse(req.body);
      
      // Check if swipe already exists
      const existingSwipe = await storage.getSwipe(validatedData.fromUserId, validatedData.toUserId);
      if (existingSwipe) {
        return res.status(409).json({ error: 'Already swiped on this user' });
      }

      const swipe = await storage.createSwipe(validatedData);

      // Check for mutual like (match)
      if (validatedData.isLike) {
        const reciprocalSwipe = await storage.getSwipe(validatedData.toUserId, validatedData.fromUserId);
        if (reciprocalSwipe && reciprocalSwipe.isLike) {
          // Create match
          const match = await storage.createMatch({
            user1Id: validatedData.fromUserId,
            user2Id: validatedData.toUserId,
            isActive: true
          });
          res.json({ swipe, match });
          return;
        }
      }

      res.status(201).json({ swipe });
    } catch (error) {
      console.error('Create swipe error:', error);
      res.status(500).json({ error: 'Failed to create swipe' });
    }
  });

  app.get('/api/users/:id/swipes', async (req: Request, res: Response) => {
    try {
      const swipes = await storage.getUserSwipes(req.params.id);
      res.json(swipes);
    } catch (error) {
      console.error('Get user swipes error:', error);
      res.status(500).json({ error: 'Failed to get swipes' });
    }
  });

  // Match endpoints
  app.get('/api/users/:id/matches', async (req: Request, res: Response) => {
    try {
      const matches = await storage.getUserMatches(req.params.id);
      res.json(matches);
    } catch (error) {
      console.error('Get user matches error:', error);
      res.status(500).json({ error: 'Failed to get matches' });
    }
  });

  app.get('/api/matches/:id', async (req: Request, res: Response) => {
    try {
      const match = await storage.getMatchById(req.params.id);
      if (!match) {
        return res.status(404).json({ error: 'Match not found' });
      }
      res.json(match);
    } catch (error) {
      console.error('Get match error:', error);
      res.status(500).json({ error: 'Failed to get match' });
    }
  });

  // Message endpoints
  app.post('/api/messages', async (req: Request, res: Response) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      console.error('Create message error:', error);
      res.status(500).json({ error: 'Failed to create message' });
    }
  });

  app.get('/api/matches/:id/messages', async (req: Request, res: Response) => {
    try {
      const messages = await storage.getMatchMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error('Get match messages error:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  });

  app.patch('/api/messages/:id/read', async (req: Request, res: Response) => {
    try {
      await storage.markMessageAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Mark message as read error:', error);
      res.status(500).json({ error: 'Failed to mark message as read' });
    }
  });

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
