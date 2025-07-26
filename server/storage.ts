import { userProfiles, matches, swipes, messages, type UserProfile, type InsertUserProfile, type Match, type InsertMatch, type Swipe, type InsertSwipe, type Message, type InsertMessage } from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, ne, notInArray } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  // User Profile operations
  getUserProfile(id: string): Promise<UserProfile | undefined>;
  getUserProfileByEmail(email: string): Promise<UserProfile | undefined>;
  createUserProfile(insertUserProfile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(id: string, updates: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  updateLastActive(id: string): Promise<void>;
  getPotentialMatches(userId: string, limit?: number): Promise<UserProfile[]>;

  // Swipe operations
  createSwipe(insertSwipe: InsertSwipe): Promise<Swipe>;
  getSwipe(fromUserId: string, toUserId: string): Promise<Swipe | undefined>;
  getUserSwipes(userId: string): Promise<Swipe[]>;

  // Match operations
  createMatch(insertMatch: InsertMatch): Promise<Match>;
  getMatch(user1Id: string, user2Id: string): Promise<Match | undefined>;
  getUserMatches(userId: string): Promise<Match[]>;
  getMatchById(matchId: string): Promise<Match | undefined>;

  // Message operations
  createMessage(insertMessage: InsertMessage): Promise<Message>;
  getMatchMessages(matchId: string): Promise<Message[]>;
  markMessageAsRead(messageId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User Profile operations
  async getUserProfile(id: string): Promise<UserProfile | undefined> {
    const [userProfile] = await db.select().from(userProfiles).where(eq(userProfiles.id, id));
    return userProfile || undefined;
  }

  async getUserProfileByEmail(email: string): Promise<UserProfile | undefined> {
    const [userProfile] = await db.select().from(userProfiles).where(eq(userProfiles.email, email));
    return userProfile || undefined;
  }

  async createUserProfile(insertUserProfile: InsertUserProfile): Promise<UserProfile> {
    const [userProfile] = await db
      .insert(userProfiles)
      .values([insertUserProfile])
      .returning();
    return userProfile;
  }

  async updateUserProfile(id: string, updates: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const updateData: any = {};
    
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.age !== undefined) updateData.age = updates.age;
    if (updates.gender !== undefined) updateData.gender = updates.gender;
    if (updates.interestedIn !== undefined) updateData.interestedIn = updates.interestedIn;
    if (updates.bio !== undefined) updateData.bio = updates.bio;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.interests !== undefined) updateData.interests = updates.interests;
    if (updates.profileImages !== undefined) updateData.profileImages = updates.profileImages;
    
    const [userProfile] = await db
      .update(userProfiles)
      .set(updateData)
      .where(eq(userProfiles.id, id))
      .returning();
    return userProfile || undefined;
  }

  async updateLastActive(id: string): Promise<void> {
    await db
      .update(userProfiles)
      .set({ lastActive: new Date() })
      .where(eq(userProfiles.id, id));
  }

  async getPotentialMatches(userId: string, limit = 10): Promise<UserProfile[]> {
    // Get users that haven't been swiped on by the current user
    const swipedUserIds = await db
      .select({ toUserId: swipes.toUserId })
      .from(swipes)
      .where(eq(swipes.fromUserId, userId));
    
    const swipedIds = swipedUserIds.map(s => s.toUserId);
    
    let whereCondition = ne(userProfiles.id, userId);
    
    if (swipedIds.length > 0) {
      whereCondition = and(
        ne(userProfiles.id, userId),
        notInArray(userProfiles.id, swipedIds)
      ) as any;
    }
    
    return await db
      .select()
      .from(userProfiles)
      .where(whereCondition)
      .limit(limit);
  }

  // Swipe operations
  async createSwipe(insertSwipe: InsertSwipe): Promise<Swipe> {
    const [swipe] = await db
      .insert(swipes)
      .values(insertSwipe)
      .returning();
    return swipe;
  }

  async getSwipe(fromUserId: string, toUserId: string): Promise<Swipe | undefined> {
    const [swipe] = await db
      .select()
      .from(swipes)
      .where(and(eq(swipes.fromUserId, fromUserId), eq(swipes.toUserId, toUserId)));
    return swipe || undefined;
  }

  async getUserSwipes(userId: string): Promise<Swipe[]> {
    return await db
      .select()
      .from(swipes)
      .where(eq(swipes.fromUserId, userId));
  }

  // Match operations
  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const [match] = await db
      .insert(matches)
      .values(insertMatch)
      .returning();
    return match;
  }

  async getMatch(user1Id: string, user2Id: string): Promise<Match | undefined> {
    const [match] = await db
      .select()
      .from(matches)
      .where(
        or(
          and(eq(matches.user1Id, user1Id), eq(matches.user2Id, user2Id)),
          and(eq(matches.user1Id, user2Id), eq(matches.user2Id, user1Id))
        )
      );
    return match || undefined;
  }

  async getUserMatches(userId: string): Promise<Match[]> {
    return await db
      .select()
      .from(matches)
      .where(
        and(
          or(eq(matches.user1Id, userId), eq(matches.user2Id, userId)),
          eq(matches.isActive, true)
        )
      )
      .orderBy(desc(matches.createdAt));
  }

  async getMatchById(matchId: string): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, matchId));
    return match || undefined;
  }

  // Message operations
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getMatchMessages(matchId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.matchId, matchId))
      .orderBy(messages.createdAt);
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await db
      .update(messages)
      .set({ readAt: new Date() })
      .where(eq(messages.id, messageId));
  }
}

export const storage = new DatabaseStorage();
