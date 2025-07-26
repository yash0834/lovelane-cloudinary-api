import { z } from "zod";

// User Profile Schema
export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  age: z.number().min(18).max(100),
  gender: z.enum(["male", "female", "non-binary"]),
  interestedIn: z.enum(["men", "women", "everyone"]),
  bio: z.string().max(500),
  location: z.string(),
  interests: z.array(z.string()),
  profileImages: z.array(z.string()).min(1),
  createdAt: z.date(),
  lastActive: z.date(),
});

export const insertUserProfileSchema = userProfileSchema.omit({
  id: true,
  createdAt: true,
  lastActive: true,
});

export type UserProfile = z.infer<typeof userProfileSchema>;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

// Match Schema
export const matchSchema = z.object({
  id: z.string(),
  user1Id: z.string(),
  user2Id: z.string(),
  createdAt: z.date(),
  isActive: z.boolean(),
});

export const insertMatchSchema = matchSchema.omit({
  id: true,
  createdAt: true,
});

export type Match = z.infer<typeof matchSchema>;
export type InsertMatch = z.infer<typeof insertMatchSchema>;

// Like/Dislike Schema
export const swipeSchema = z.object({
  id: z.string(),
  fromUserId: z.string(),
  toUserId: z.string(),
  isLike: z.boolean(),
  createdAt: z.date(),
});

export const insertSwipeSchema = swipeSchema.omit({
  id: true,
  createdAt: true,
});

export type Swipe = z.infer<typeof swipeSchema>;
export type InsertSwipe = z.infer<typeof insertSwipeSchema>;

// Message Schema
export const messageSchema = z.object({
  id: z.string(),
  matchId: z.string(),
  senderId: z.string(),
  receiverId: z.string(),
  text: z.string(),
  imageUrl: z.string().optional(),
  createdAt: z.date(),
  readAt: z.date().optional(),
});

export const insertMessageSchema = messageSchema.omit({
  id: true,
  createdAt: true,
  readAt: true,
});

export type Message = z.infer<typeof messageSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
