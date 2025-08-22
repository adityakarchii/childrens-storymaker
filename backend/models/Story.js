const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  prompt: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Allow anonymous stories
  },
  pages: [{
    pageNumber: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    imagePrompt: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      default: null
    },
    audioUrl: {
      type: String,
      default: null
    }
  }],
  metadata: {
    genre: String,
    ageGroup: String,
    mood: String,
    artStyle: String
  },
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed'],
    default: 'generating'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  shareId: {
    type: String,
    unique: true,
    sparse: true
  },
  generationProgress: {
    storyGenerated: { type: Boolean, default: false },
    imagesGenerated: { type: Boolean, default: false },
    audioGenerated: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Index for better query performance
storySchema.index({ userId: 1, createdAt: -1 });
storySchema.index({ shareId: 1 });
storySchema.index({ isPublic: 1, createdAt: -1 });

module.exports = mongoose.model('Story', storySchema);
