// This file is kept for compatibility but we're using Firebase Firestore
// for all data storage in this dating app. No local storage needed.

export interface IStorage {
  // Placeholder interface - all data operations handled by Firebase
}

export class MemStorage implements IStorage {
  constructor() {
    // Empty constructor - Firebase handles all storage
  }
}

export const storage = new MemStorage();
