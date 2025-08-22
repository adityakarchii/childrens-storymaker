// In-memory storage for development without MongoDB
const users = new Map();
const stories = new Map();

class MemoryStorage {
  // User methods
  async createUser(userData) {
    const id = Date.now().toString();
    const user = {
      id,
      _id: id,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.set(id, user);
    return user;
  }

  async findUserByEmail(email) {
    for (const user of users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findUserById(id) {
    return users.get(id) || null;
  }

  // Story methods
  async createStory(storyData) {
    const id = Date.now().toString();
    const story = {
      id,
      _id: id,
      ...storyData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    stories.set(id, story);
    return story;
  }

  async findStoryById(id) {
    return stories.get(id) || null;
  }

  getUserStories(userId) {
    const userStories = [];
    for (const story of stories.values()) {
      if (story.userId === userId) {
        userStories.push(story);
      }
    }
    return userStories;
  }

  getAllStories() {
    return Array.from(stories.values());
  }

  async updateStory(id, updateData) {
    const story = stories.get(id);
    if (story) {
      const updated = {
        ...story,
        ...updateData,
        updatedAt: new Date()
      };
      stories.set(id, updated);
      return updated;
    }
    return null;
  }

  async deleteStory(id) {
    return stories.delete(id);
  }

  // Clear all data (for testing)
  clear() {
    users.clear();
    stories.clear();
  }

  // Get stats
  getStats() {
    return {
      users: users.size,
      stories: stories.size
    };
  }
}

module.exports = new MemoryStorage();
