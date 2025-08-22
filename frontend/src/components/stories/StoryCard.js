import React from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaHeart, FaUser, FaClock } from 'react-icons/fa';
import './StoryCard.css';

const StoryCard = ({ story, showActions = false, onDelete, onShare }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStoryLink = () => {
    if (story.shareId) {
      return `/shared/${story.shareId}`;
    }
    return `/story/${story._id}`;
  };

  const firstPageImage = story.pages && story.pages.length > 0 ? story.pages[0].imageUrl : null;
  const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' fill='%23667eea'%3E%3Crect width='300' height='200' fill='%23f0f2f5'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23667eea' font-family='Arial, sans-serif' font-size='16'%3EStory Image%3C/text%3E%3C/svg%3E";

  return (
    <div className="story-card">
      <Link to={getStoryLink()} className="story-image-link">
        <div className="story-image">
          <img 
            src={firstPageImage || placeholderImage} 
            alt={story.title}
            onError={(e) => {
              e.target.src = placeholderImage;
            }}
          />
          <div className="story-overlay">
            <span className="view-story-btn">View Story</span>
          </div>
        </div>
      </Link>

      <div className="story-content">
        <div className="story-header">
          <Link to={getStoryLink()} className="story-title-link">
            <h3 className="story-title">{story.title}</h3>
          </Link>
          {story.metadata?.genre && (
            <span className="story-genre">{story.metadata.genre}</span>
          )}
        </div>

        <p className="story-prompt">
          {story.prompt.length > 100 
            ? `${story.prompt.substring(0, 100)}...` 
            : story.prompt
          }
        </p>

        <div className="story-meta">
          <div className="story-stats">
            {story.pages && (
              <span className="stat">
                <FaEye />
                {story.pages.length} pages
              </span>
            )}
            <span className="stat">
              <FaClock />
              {formatDate(story.createdAt)}
            </span>
            {story.userId?.name && (
              <span className="stat">
                <FaUser />
                {story.userId.name}
              </span>
            )}
          </div>

          {story.status && (
            <div className={`story-status status-${story.status}`}>
              {story.status === 'generating' && 'Generating...'}
              {story.status === 'completed' && 'Ready'}
              {story.status === 'failed' && 'Failed'}
            </div>
          )}
        </div>

        {showActions && (
          <div className="story-actions">
            <Link to={getStoryLink()} className="action-btn view-btn">
              View
            </Link>
            {onShare && (
              <button onClick={() => onShare(story)} className="action-btn share-btn">
                Share
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(story._id)} 
                className="action-btn delete-btn"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryCard;
