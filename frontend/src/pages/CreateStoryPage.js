import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { generateStory, checkStoryStatus } from '../store/slices/storySlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaMagic, FaBook, FaPalette, FaChild } from 'react-icons/fa';
import './CreateStoryPage.css';

const CreateStoryPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isGenerating, error } = useSelector((state) => state.stories);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    prompt: '',
    pages: 8,
    ageGroup: 'children',
    genre: 'adventure',
    artStyle: 'colorful illustration'
  });

  const [generationStatus, setGenerationStatus] = useState(null);

  const ageGroups = [
    { value: 'toddler', label: 'Toddlers (2-4 years)', icon: '👶' },
    { value: 'preschool', label: 'Preschool (4-6 years)', icon: '🧒' },
    { value: 'children', label: 'Children (6-10 years)', icon: '👦' },
    { value: 'preteen', label: 'Preteens (10-13 years)', icon: '👧' }
  ];

  const genres = [
    { value: 'adventure', label: 'Adventure', icon: '🗺️' },
    { value: 'friendship', label: 'Friendship', icon: '🤝' },
    { value: 'fantasy', label: 'Fantasy', icon: '🧙' },
    { value: 'animals', label: 'Animals', icon: '🐾' },
    { value: 'educational', label: 'Educational', icon: '📚' },
    { value: 'bedtime', label: 'Bedtime', icon: '🌙' }
  ];

  const artStyles = [
    { value: 'colorful illustration', label: 'Colorful Illustration' },
    { value: 'watercolor', label: 'Watercolor' },
    { value: 'cartoon', label: 'Cartoon' },
    { value: 'sketch', label: 'Pencil Sketch' },
    { value: 'digital art', label: 'Digital Art' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.prompt.trim()) {
      return;
    }

    try {
      const result = await dispatch(generateStory({
        prompt: formData.prompt,
        options: {
          pages: parseInt(formData.pages),
          ageGroup: formData.ageGroup,
          genre: formData.genre,
          artStyle: formData.artStyle
        }
      }));

      if (result.type === 'stories/generateStory/fulfilled') {
        const storyId = result.payload.storyId;
        // Poll for completion before navigating
        await pollForCompletion(storyId);
        navigate(`/story/${storyId}`);
      }
    } catch (error) {
      console.error('Story generation failed:', error);
    }
  };

  const pollForCompletion = async (storyId) => {
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const statusResult = await dispatch(checkStoryStatus(storyId));
          if (statusResult.type === 'stories/checkStatus/fulfilled') {
            const status = statusResult.payload;
            console.log('Story status:', status);
            setGenerationStatus(status);
            
            if (status.status === 'completed' && status.pagesGenerated > 0) {
              resolve();
            } else if (status.status === 'failed') {
              reject(new Error('Story generation failed'));
            } else {
              // Continue polling
              setTimeout(checkStatus, 2000); // Check every 2 seconds
            }
          } else {
            reject(new Error('Failed to check status'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      checkStatus();
    });
  };

  return (
    <div className="create-story-page">
      <div className="container">
        <div className="create-story-header">
          <h1>
            <FaMagic className="header-icon" />
            Aditya Tells Story
          </h1>
          <p>Transform your imagination into a beautifully illustrated children's story</p>
        </div>

        <div className="create-story-form-container">
          {isGenerating && (
            <div className="generation-progress">
              <LoadingSpinner />
              <h3>Creating Your Story...</h3>
              {generationStatus && (
                <div className="progress-details">
                  <p>Status: {generationStatus.status}</p>
                  <p>Pages Generated: {generationStatus.pagesGenerated || 0}</p>
                  {generationStatus.progress && (
                    <div className="progress-steps">
                      <div className={generationStatus.progress.storyGenerated ? 'step completed' : 'step'}>
                        📝 Story Text
                      </div>
                      <div className={generationStatus.progress.imagesGenerated ? 'step completed' : 'step'}>
                        🎨 Images
                      </div>
                      <div className={generationStatus.progress.audioGenerated ? 'step completed' : 'step'}>
                        🔊 Audio
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {!isGenerating && (
            <form onSubmit={handleSubmit} className="create-story-form">
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            {/* Story Prompt */}
            <div className="form-section">
              <label className="form-label">
                <FaBook />
                What's your story about?
              </label>
              <textarea
                name="prompt"
                value={formData.prompt}
                onChange={handleInputChange}
                className="form-textarea story-prompt"
                placeholder="e.g., A shy little dragon who discovers they can make beautiful music with their fire..."
                rows="4"
                required
              />
              <div className="form-hint">
                Be descriptive! The more details you provide, the better your story will be.
              </div>
            </div>

            {/* Story Options */}
            <div className="form-options-grid">
              {/* Age Group */}
              <div className="form-section">
                <label className="form-label">
                  <FaChild />
                  Age Group
                </label>
                <div className="option-grid">
                  {ageGroups.map((age) => (
                    <label key={age.value} className="option-card">
                      <input
                        type="radio"
                        name="ageGroup"
                        value={age.value}
                        checked={formData.ageGroup === age.value}
                        onChange={handleInputChange}
                      />
                      <div className="option-content">
                        <span className="option-icon">{age.icon}</span>
                        <span className="option-text">{age.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Genre */}
              <div className="form-section">
                <label className="form-label">
                  <FaBook />
                  Story Genre
                </label>
                <div className="option-grid">
                  {genres.map((genre) => (
                    <label key={genre.value} className="option-card">
                      <input
                        type="radio"
                        name="genre"
                        value={genre.value}
                        checked={formData.genre === genre.value}
                        onChange={handleInputChange}
                      />
                      <div className="option-content">
                        <span className="option-icon">{genre.icon}</span>
                        <span className="option-text">{genre.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="advanced-options">
              <div className="form-section">
                <label className="form-label">
                  <FaPalette />
                  Art Style
                </label>
                <select
                  name="artStyle"
                  value={formData.artStyle}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {artStyles.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-section">
                <label className="form-label">
                  Number of Pages: {formData.pages}
                </label>
                <input
                  type="range"
                  name="pages"
                  min="4"
                  max="16"
                  step="2"
                  value={formData.pages}
                  onChange={handleInputChange}
                  className="form-range"
                />
                <div className="range-labels">
                  <span>4 pages</span>
                  <span>16 pages</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary btn-large create-btn"
                disabled={isGenerating || !formData.prompt.trim()}
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner size="small" color="white" />
                    Generating Your Story...
                  </>
                ) : (
                  <>
                    <FaMagic />
                    Create My Story
                  </>
                )}
              </button>
              
              {!isAuthenticated && (
                <p className="auth-notice">
                  💡 <strong>Sign up</strong> to save your stories and access more features!
                </p>
              )}
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateStoryPage;
