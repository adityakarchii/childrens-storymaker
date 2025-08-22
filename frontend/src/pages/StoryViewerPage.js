import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getStory, getSharedStory } from '../store/slices/storySlice';
import {
  FaChevronLeft,
  FaChevronRight,
  FaPlay,
  FaPause,
  FaShareAlt,
  FaExpand,
  FaBookOpen,
} from 'react-icons/fa';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './StoryViewerPage.css';

const StoryViewerPage = () => {
  const { id, shareId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const audioRef = useRef(null);

  const { currentStory: story, isLoading, error } = useSelector((state) => state.stories);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (shareId) {
      dispatch(getSharedStory(shareId));
    } else {
      dispatch(getStory(id));
    }
  }, [id, shareId, dispatch]);

  const nextPage = () => {
    if (currentPage < story.pages.length - 1) {
      setCurrentPage(currentPage + 1);
      stopAudio();
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      stopAudio();
    }
  };

  const goToPage = (pageIndex) => {
    setCurrentPage(pageIndex);
    stopAudio();
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  };

  const playAudio = () => {
    // Use text-to-speech for narration
    const text = story.pages[currentPage]?.text || '';
    if ('speechSynthesis' in window && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      utterance.voice = speechSynthesis.getVoices().find(voice => 
        voice.name.includes('Female') || voice.name.includes('Child')
      ) || speechSynthesis.getVoices()[0];
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const toggleFullscreenImage = () => {
    setIsFullscreenImage(!isFullscreenImage);
  };

  const shareStory = () => {
    setShowShareModal(true);
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/story/${story._id || story.id}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Story link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="story-viewer-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your story...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="story-viewer-container">
        <div className="error-message">
          <h2>📚 Story Not Found</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="back-button">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!story || !story.pages || story.pages.length === 0) {
    console.log('Story data:', story);
    console.log('Story pages:', story?.pages);
    console.log('Pages length:', story?.pages?.length);
    
    return (
      <div className="story-viewer-container">
        <div className="error-message">
          <h2>📖 No Pages Found</h2>
          <p>This story doesn't have any pages yet.</p>
          <p>Debug: Story loaded: {story ? 'Yes' : 'No'}, Pages: {story?.pages?.length || 0}</p>
          <button onClick={() => navigate(-1)} className="back-button">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentStoryPage = story.pages[currentPage];

  return (
    <div className="story-viewer-container">
      {/* Header */}
      <header className="story-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <h1 className="story-title">{story.title}</h1>
        <div className="story-actions">
          <button onClick={shareStory} className="share-button">
            🔗 Share
          </button>
        </div>
      </header>

      {/* Main Story Content */}
      <main className="story-content">
        {/* Page Image */}
        <div className="page-image-container">
          <img
            src={currentStoryPage.imageUrl || `https://picsum.photos/800/600?random=${currentPage + 1}`}
            alt={`Page ${currentPage + 1}`}
            className="page-image"
            onClick={toggleFullscreenImage}
          />
          <button className="fullscreen-button" onClick={toggleFullscreenImage}>
            🔍 View Full Size
          </button>
        </div>

        {/* Page Content */}
        <div className="page-content">
          <div className="page-header">
            <h2 className="page-title">{currentStoryPage.title || `Page ${currentPage + 1}`}</h2>
            <button 
              onClick={toggleAudio} 
              className={`audio-button ${isPlaying ? 'playing' : ''}`}
            >
              {isPlaying ? '⏸️ Stop' : '🎵 Listen'}
            </button>
          </div>
          
          <div className="page-text">
            {currentStoryPage.text}
          </div>
        </div>
      </main>

      {/* Navigation Controls */}
      <div className="navigation-controls">
        <button 
          onClick={prevPage} 
          disabled={currentPage === 0}
          className="nav-button prev-button"
        >
          ← Previous
        </button>

        <div className="page-indicators">
          {story.pages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToPage(index)}
              className={`page-dot ${index === currentPage ? 'active' : ''}`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button 
          onClick={nextPage} 
          disabled={currentPage === story.pages.length - 1}
          className="nav-button next-button"
        >
          Next →
        </button>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${((currentPage + 1) / story.pages.length) * 100}%` }}
        />
      </div>

      {/* Page Counter */}
      <div className="page-counter">
        Page {currentPage + 1} of {story.pages.length}
      </div>

      {/* Fullscreen Image Modal */}
      {isFullscreenImage && (
        <div className="fullscreen-overlay" onClick={toggleFullscreenImage}>
          <div className="fullscreen-content">
            <img
              src={currentStoryPage.imageUrl || `https://picsum.photos/800/600?random=${currentPage + 1}`}
              alt={`Page ${currentPage + 1} - Full Size`}
              className="fullscreen-image"
            />
            <button className="close-fullscreen" onClick={toggleFullscreenImage}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Share Your Story</h3>
            <p>Share this magical story with friends and family!</p>
            <div className="share-options">
              <input
                type="text"
                value={`${window.location.origin}/story/${story._id || story.id}`}
                readOnly
                className="share-link"
              />
              <button onClick={copyShareLink} className="copy-button">
                📋 Copy Link
              </button>
            </div>
            <button onClick={() => setShowShareModal(false)} className="close-modal">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Audio Element for Audio Files */}
      <audio ref={audioRef} />
    </div>
  );
};

export default StoryViewerPage;
