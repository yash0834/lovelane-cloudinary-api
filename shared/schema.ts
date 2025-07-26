import { z } from "zod";
import { pgTable, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { nanoid } from "nanoid";

// Drizzle Database Tables
export const userProfiles = pgTable("user_profiles", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(), // 'male', 'female', 'non-binary'
  interestedIn: text("interested_in").notNull(), // 'men', 'women', 'everyone'
  bio: text("bio").notNull(),
  location: text("location").notNull(),
  interests: text("interests").array().notNull(),
  profileImages: text("profile_images").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActive: timestamp("last_active").defaultNow().notNull(),
});

export const matches = pgTable("matches", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  user1Id: text("user1_id").notNull().references(() => userProfiles.id),
  user2Id: text("user2_id").notNull().references(() => userProfiles.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const swipes = pgTable("swipes", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  fromUserId: text("from_user_id").notNull().references(() => userProfiles.id),
  toUserId: text("to_user_id").notNull().references(() => userProfiles.id),
  isLike: boolean("is_like").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  matchId: text("match_id").notNull().references(() => matches.id),
  senderId: text("sender_id").notNull().references(() => userProfiles.id),
  receiverId: text("receiver_id").notNull().references(() => userProfiles.id),
  text: text("text").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

// Insert Schemas
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  lastActive: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
});

export const insertSwipeSchema = createInsertSchema(swipes).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  readAt: true,
});

// Types
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;

export type Swipe = typeof swipes.$inferSelect;
export type InsertSwipe = z.infer<typeof insertSwipeSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Legacy Zod schemas for validation (keeping for compatibility)
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

export const matchSchema = z.object({
  id: z.string(),
  user1Id: z.string(),
  user2Id: z.string(),
  createdAt: z.date(),
  isActive: z.boolean(),
});

export const swipeSchema = z.object({
  id: z.string(),
  fromUserId: z.string(),
  toUserId: z.string(),
  isLike: z.boolean(),
  createdAt: z.date(),
});

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
