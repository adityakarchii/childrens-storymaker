const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const memoryStorage = require('../services/memoryStorage');

// Check if MongoDB is connected
function isMongoConnected() {
  return require('mongoose').connection.readyState === 1;
}

// Get user's stories
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let stories, total;

    // If user is not authenticated, return empty array
    if (!req.user || !req.user.id) {
      return res.json({
        success: true,
        stories: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0
        }
      });
    }

    if (isMongoConnected()) {
      // Use MongoDB
      stories = await Story.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .select('-pages.imagePrompt'); // Exclude detailed image prompts for list view

      total = await Story.countDocuments({ userId: req.user.id });
    } else {
      // Use memory storage
      const userStories = memoryStorage.getUserStories(req.user.id);
      total = userStories.length;
      
      // Apply pagination
      stories = userStories
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(skip, skip + limit)
        .map(story => ({
          ...story,
          pages: story.pages?.map(page => ({
            ...page,
            imagePrompt: undefined // Exclude detailed image prompts
          }))
        }));
    }

    res.json({
      stories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error getting user stories:', error);
    res.status(500).json({ error: 'Failed to get stories' });
  }
});

// Get public stories
router.get('/public', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    let stories, total;

    if (isMongoConnected()) {
      // Use MongoDB
      stories = await Story.find({ 
        isPublic: true, 
        status: 'completed' 
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .select('title prompt metadata createdAt shareId pages')
        .populate('userId', 'name');

      // Only include first page for preview
      stories = stories.map(story => ({
        ...story.toObject(),
        pages: story.pages.slice(0, 1) // First page only for preview
      }));

      total = await Story.countDocuments({ 
        isPublic: true, 
        status: 'completed' 
      });
    } else {
      // Use memory storage
      const allStories = memoryStorage.getAllStories();
      const publicStories = allStories.filter(story => 
        story.isPublic && story.status === 'completed'
      );
      
      total = publicStories.length;
      
      // Apply pagination and preview formatting
      stories = publicStories
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(skip, skip + limit)
        .map(story => ({
          ...story,
          pages: story.pages ? story.pages.slice(0, 1) : [] // First page only for preview
        }));
    }

    res.json({
      stories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error getting public stories:', error);
    res.status(500).json({ error: 'Failed to get public stories' });
  }
});

// Update story (make public, edit title, etc.)
router.put('/:id', auth, async (req, res) => {
  try {
    const { isPublic, title } = req.body;
    
    const story = await Story.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    if (isPublic !== undefined) {
      story.isPublic = isPublic;
      if (isPublic && !story.shareId) {
        story.shareId = uuidv4();
      }
    }

    if (title) {
      story.title = title;
    }

    await story.save();
    res.json(story);

  } catch (error) {
    console.error('Error updating story:', error);
    res.status(500).json({ error: 'Failed to update story' });
  }
});

// Delete story
router.delete('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // TODO: Clean up associated files from storage
    
    res.json({ message: 'Story deleted successfully' });

  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ error: 'Failed to delete story' });
  }
});

// Create a remix of an existing story
router.post('/:id/remix', auth, async (req, res) => {
  try {
    const { newPrompt, options = {} } = req.body;
    
    const originalStory = await Story.findById(req.params.id);
    
    if (!originalStory) {
      return res.status(404).json({ error: 'Original story not found' });
    }

    // Check access permissions
    if (!originalStory.isPublic && originalStory.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create new story based on original
    const remixPrompt = newPrompt || `Remix this story with a new twist: ${originalStory.prompt}`;
    
    // This would trigger the same generation process as /api/ai/generate-story
    res.json({
      success: true,
      message: 'Remix story generation started',
      originalStory: originalStory._id,
      remixPrompt
    });

  } catch (error) {
    console.error('Error creating remix:', error);
    res.status(500).json({ error: 'Failed to create remix' });
  }
});

// Get story analytics (for user)
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    const story = await Story.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // TODO: Implement view tracking and analytics
    const analytics = {
      views: 0,
      shares: 0,
      created: story.createdAt,
      isPublic: story.isPublic,
      status: story.status,
      pages: story.pages.length
    };

    res.json(analytics);

  } catch (error) {
    console.error('Error getting story analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

module.exports = router;
