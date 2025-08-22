// Simple in-memory storage for development when MongoDB is not available
class MemoryStorage {
  constructor() {
    this.users = new Map();
    this.stories = new Map();
    this.userIdCounter = 1;
    this.storyIdCounter = 1;
  }

  // User methods
  async createUser(userData) {
    const id = (this.userIdCounter++).toString();
    const user = {
      _id: id,
      id: id,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async findUserByEmail(email) {
    for (let user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findUserById(id) {
    return this.users.get(id) || null;
  }

  async updateUser(id, updates) {
    const user = this.users.get(id);
    if (user) {
      Object.assign(user, updates, { updatedAt: new Date() });
      return user;
    }
    return null;
  }

  // Story methods
  async createStory(storyData) {
    const id = (this.storyIdCounter++).toString();
    const story = {
      _id: id,
      id: id,
      ...storyData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.stories.set(id, story);
    return story;
  }

  async findStoryById(id) {
    return this.stories.get(id) || null;
  }

  async findStories(query = {}) {
    let results = Array.from(this.stories.values());
    
    // Apply filters
    if (query.userId) {
      results = results.filter(story => story.userId === query.userId);
    }
    if (query.isPublic !== undefined) {
      results = results.filter(story => story.isPublic === query.isPublic);
    }
    if (query.status) {
      results = results.filter(story => story.status === query.status);
    }

    // Sort by creation date (newest first)
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return results;
  }

  async updateStory(id, updates) {
    const story = this.stories.get(id);
    if (story) {
      Object.assign(story, updates, { updatedAt: new Date() });
      return story;
    }
    return null;
  }

  async deleteStory(id) {
    return this.stories.delete(id);
  }

  // Utility methods
  isConnected() {
    return true; // Always connected for in-memory storage
  }

  async count(collection, query = {}) {
    if (collection === 'users') {
      return this.users.size;
    } else if (collection === 'stories') {
      const stories = await this.findStories(query);
      return stories.length;
    }
    return 0;
  }
}

// Create a singleton instance
const memoryStorage = new MemoryStorage();

module.exports = memoryStorage;
