import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const generateStory = createAsyncThunk(
  'stories/generateStory',
  async ({ prompt, options }, { rejectWithValue }) => {
    try {
      const response = await api.post('/ai/generate-story', { prompt, options });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Story generation failed');
    }
  }
);

export const checkStoryStatus = createAsyncThunk(
  'stories/checkStatus',
  async (storyId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/ai/story/${storyId}/status`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Status check failed');
    }
  }
);

export const getStory = createAsyncThunk(
  'stories/getStory',
  async (storyId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/ai/story/${storyId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to get story');
    }
  }
);

export const getSharedStory = createAsyncThunk(
  'stories/getSharedStory',
  async (shareId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/ai/shared/${shareId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to get shared story');
    }
  }
);

export const getUserStories = createAsyncThunk(
  'stories/getUserStories',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/stories?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to get stories');
    }
  }
);

export const getPublicStories = createAsyncThunk(
  'stories/getPublicStories',
  async ({ page = 1, limit = 12 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/stories/public?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to get public stories');
    }
  }
);

export const updateStory = createAsyncThunk(
  'stories/updateStory',
  async ({ storyId, updates }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/stories/${storyId}`, updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update story');
    }
  }
);

export const deleteStory = createAsyncThunk(
  'stories/deleteStory',
  async (storyId, { rejectWithValue }) => {
    try {
      await api.delete(`/stories/${storyId}`);
      return storyId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete story');
    }
  }
);

const initialState = {
  currentStory: null,
  userStories: [],
  publicStories: [],
  generationStatus: null,
  isGenerating: false,
  isLoading: false,
  error: null,
  pagination: {
    user: { page: 1, pages: 1, total: 0 },
    public: { page: 1, pages: 1, total: 0 }
  }
};

const storySlice = createSlice({
  name: 'stories',
  initialState,
  reducers: {
    clearCurrentStory: (state) => {
      state.currentStory = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateStoryPage: (state, action) => {
      const { pageIndex, updates } = action.payload;
      if (state.currentStory && state.currentStory.pages[pageIndex]) {
        state.currentStory.pages[pageIndex] = {
          ...state.currentStory.pages[pageIndex],
          ...updates
        };
      }
    },
    setGenerationStatus: (state, action) => {
      state.generationStatus = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Generate Story
      .addCase(generateStory.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generateStory.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.generationStatus = action.payload;
      })
      .addCase(generateStory.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload;
      })
      // Check Status
      .addCase(checkStoryStatus.fulfilled, (state, action) => {
        state.generationStatus = action.payload;
      })
      // Get Story
      .addCase(getStory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getStory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentStory = action.payload;
      })
      .addCase(getStory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Shared Story
      .addCase(getSharedStory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSharedStory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentStory = action.payload;
      })
      .addCase(getSharedStory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get User Stories
      .addCase(getUserStories.fulfilled, (state, action) => {
        state.userStories = action.payload.stories;
        state.pagination.user = action.payload.pagination;
      })
      // Get Public Stories
      .addCase(getPublicStories.fulfilled, (state, action) => {
        state.publicStories = action.payload.stories;
        state.pagination.public = action.payload.pagination;
      })
      // Update Story
      .addCase(updateStory.fulfilled, (state, action) => {
        const updatedStory = action.payload;
        // Update in userStories if present
        const userIndex = state.userStories.findIndex(story => story._id === updatedStory._id);
        if (userIndex !== -1) {
          state.userStories[userIndex] = updatedStory;
        }
        // Update currentStory if it's the same
        if (state.currentStory && state.currentStory._id === updatedStory._id) {
          state.currentStory = updatedStory;
        }
      })
      // Delete Story
      .addCase(deleteStory.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.userStories = state.userStories.filter(story => story._id !== deletedId);
        if (state.currentStory && state.currentStory._id === deletedId) {
          state.currentStory = null;
        }
      });
  },
});

export const { 
  clearCurrentStory, 
  clearError, 
  updateStoryPage, 
  setGenerationStatus 
} = storySlice.actions;

export default storySlice.reducer;
