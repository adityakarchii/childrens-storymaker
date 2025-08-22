const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
const imageService = require('../services/imageService');
const audioService = require('../services/audioService');
const storageService = require('../services/storageService');
const Story = require('../models/Story');
const { v4: uuidv4 } = require('uuid');
const memoryStorage = require('../services/memoryStorage');

// Check if MongoDB is connected
function isMongoConnected() {
  return require('mongoose').connection.readyState === 1;
}

// Generate a complete story with images and audio
router.post('/generate-story', async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Story prompt is required' });
    }

    let story;
    let storyId;

    if (isMongoConnected()) {
      // Use MongoDB
      story = new Story({
        title: 'Generating...',
        prompt,
        userId: req.user?.id || null,
        status: 'generating',
        shareId: uuidv4()
      });
      
      await story.save();
      storyId = story._id.toString();
    } else {
      // Use memory storage
      const storyData = {
        title: 'Generating...',
        prompt,
        userId: req.user?.id || null,
        status: 'generating',
        shareId: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        pages: [],
        metadata: {},
        generationProgress: {
          storyGenerated: false,
          imagesGenerated: false,
          audioGenerated: false,
          completed: false
        },
        isPublic: false
      };
      
      story = await memoryStorage.createStory(storyData);
      storyId = story.id;
    }

    // Start the generation process asynchronously
    generateCompleteStory(storyId, prompt, options)
      .catch(error => {
        console.error('Story generation failed:', error);
        updateStoryStatus(storyId, 'failed');
      });

    res.json({
      success: true,
      storyId: storyId,
      message: 'Story generation started. Check status for progress.'
    });

  } catch (error) {
    console.error('Error starting story generation:', error);
    res.status(500).json({ error: 'Failed to start story generation' });
  }
});

// Get story generation status
router.get('/story/:id/status', async (req, res) => {
  try {
    let story;
    
    if (isMongoConnected()) {
      story = await Story.findById(req.params.id);
    } else {
      story = await memoryStorage.findStoryById(req.params.id);
    }
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    res.json({
      id: story._id || story.id,
      status: story.status,
      progress: story.generationProgress || {},
      title: story.title,
      pagesGenerated: story.pages ? story.pages.length : 0
    });

  } catch (error) {
    console.error('Error getting story status:', error);
    res.status(500).json({ error: 'Failed to get story status' });
  }
});

// Get complete story
router.get('/story/:id', async (req, res) => {
  try {
    let story;
    
    if (isMongoConnected()) {
      story = await Story.findById(req.params.id);
    } else {
      story = await memoryStorage.findStoryById(req.params.id);
    }
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Check if user has access (own story or public story)
    const userId = story.userId?.toString ? story.userId.toString() : story.userId;
    if (!story.isPublic && userId && (!req.user || userId !== req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(story);

  } catch (error) {
    console.error('Error getting story:', error);
    res.status(500).json({ error: 'Failed to get story' });
  }
});

// Get story by share ID (public access)
router.get('/shared/:shareId', async (req, res) => {
  try {
    const story = await Story.findOne({ shareId: req.params.shareId });
    
    if (!story || !story.isPublic) {
      return res.status(404).json({ error: 'Story not found or not public' });
    }

    res.json(story);

  } catch (error) {
    console.error('Error getting shared story:', error);
    res.status(500).json({ error: 'Failed to get shared story' });
  }
});

// Generate only story text (Phase 1 - Core)
router.post('/generate-text', async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const storyData = await geminiService.generateStory(prompt, options);
    res.json(storyData);

  } catch (error) {
    console.error('Error generating story text:', error);
    res.status(500).json({ error: 'Failed to generate story text' });
  }
});

// Generate single image
router.post('/generate-image', async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Image prompt is required' });
    }

    const imageResult = await imageService.generateImage(prompt, options);
    
    // If it's a URL, upload to our storage
    if (imageResult.url && !imageResult.isPlaceholder) {
      try {
        const uploadResult = await storageService.uploadFromUrl(imageResult.url, {
          folder: 'storybook/temp-images',
          resource_type: 'image'
        });
        imageResult.storedUrl = uploadResult.url;
      } catch (uploadError) {
        console.error('Failed to store generated image:', uploadError);
      }
    }

    res.json(imageResult);

  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

// Generate single audio
router.post('/generate-audio', async (req, res) => {
  try {
    const { text, options = {} } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const audioResult = await audioService.generateAudio(text, options);
    
    // Upload audio file if it was generated
    if (audioResult.filePath) {
      try {
        const uploadResult = await storageService.uploadFile(audioResult.filePath, {
          folder: 'storybook/temp-audio',
          resource_type: 'video'
        });
        audioResult.url = uploadResult.url;
        
        // Clean up temp file
        await audioService.cleanupTempFiles([audioResult.filePath]);
      } catch (uploadError) {
        console.error('Failed to store generated audio:', uploadError);
      }
    }

    res.json(audioResult);

  } catch (error) {
    console.error('Error generating audio:', error);
    res.status(500).json({ error: 'Failed to generate audio' });
  }
});

// Get available voice options
router.get('/voice-options', (req, res) => {
  try {
    const voices = audioService.getVoiceOptions();
    res.json(voices);
  } catch (error) {
    console.error('Error getting voice options:', error);
    res.status(500).json({ error: 'Failed to get voice options' });
  }
});

// Async function to generate complete story
async function generateCompleteStory(storyId, prompt, options) {
  try {
    let story;
    
    if (isMongoConnected()) {
      story = await Story.findById(storyId);
      if (!story) throw new Error('Story not found');
    } else {
      story = await memoryStorage.findStoryById(storyId);
      if (!story) throw new Error('Story not found');
    }

    // Phase 1: Generate story text
    console.log('Generating story text...');
    const storyData = await geminiService.generateStory(prompt, options);
    
    story.title = storyData.title;
    story.pages = storyData.pages.map(page => ({
      ...page,
      imageUrl: null,
      audioUrl: null
    }));
    story.metadata = storyData.metadata;
    story.generationProgress = story.generationProgress || {};
    story.generationProgress.storyGenerated = true;
    story.status = 'generating'; // Keep as generating until fully complete
    
    // Save story
    if (isMongoConnected()) {
      await story.save();
    } else {
      await memoryStorage.updateStory(storyId, story);
    }

    // Phase 2: Generate images
    console.log('Generating images for each page...');
    const imagePromises = story.pages.map((page, index) => {
      const imagePrompt = `Children's story book illustration for a page with text: "${page.text}". Style: ${story.metadata.artStyle || 'colorful and vibrant'}.`;
      return imageService.generateImage(imagePrompt, {
        // Pass any specific options for image generation
      }).then(imageResult => {
        if (imageResult && !imageResult.isPlaceholder) {
          story.pages[index].imageUrl = imageResult.url;
        } else {
          // Fallback to a placeholder if image generation fails
          story.pages[index].imageUrl = `https://picsum.photos/800/600?random=${index + 1}`;
        }
      }).catch(err => {
        console.error(`Failed to generate image for page ${index}:`, err);
        story.pages[index].imageUrl = `https://picsum.photos/800/600?random=${index + 1}`;
      });
    });

    await Promise.all(imagePromises);
    story.generationProgress.imagesGenerated = true;
    
    // Save after generating images
    if (isMongoConnected()) {
      await story.save();
    } else {
      await memoryStorage.updateStory(storyId, story);
    }

    // Phase 3: Generate audio (optional, can be done later)
    console.log('Skipping audio generation for now.');
    story.generationProgress.audioGenerated = true;
    story.generationProgress.completed = true;
    story.status = 'completed';

    // Final save
    if (isMongoConnected()) {
      await story.save();
    } else {
      await memoryStorage.updateStory(storyId, story);
    }

    console.log(`Story generation completed for story ${storyId}`);

  } catch (error) {
    console.error('Error in generateCompleteStory:', error);
    
    try {
      // Update status to failed
      if (isMongoConnected()) {
        await Story.findByIdAndUpdate(storyId, { status: 'failed' });
      } else {
        const story = await memoryStorage.findStoryById(storyId);
        if (story) {
          story.status = 'failed';
          await memoryStorage.updateStory(storyId, story);
        }
      }
    } catch (updateError) {
      console.error('Error updating story status to failed:', updateError);
    }
    
    throw error;
  }
}

async function updateStoryStatus(storyId, status) {
  try {
    if (isMongoConnected()) {
      await Story.findByIdAndUpdate(storyId, { status });
    } else {
      const story = await memoryStorage.findStoryById(storyId);
      if (story) {
        story.status = status;
        await memoryStorage.updateStory(storyId, story);
      }
    }
  } catch (error) {
    console.error('Failed to update story status:', error);
  }
}

module.exports = router;
