import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getPublicStories } from '../store/slices/storySlice';
import { FaBook, FaUsers, FaMagic, FaArrowRight } from 'react-icons/fa';
import StoryCard from '../components/stories/StoryCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './HomePage.css';

const HomePage = () => {
  const dispatch = useDispatch();
  const { publicStories, isLoading } = useSelector((state) => state.stories);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getPublicStories({ page: 1, limit: 6 }));
  }, [dispatch]);

  const features = [
    {
      icon: <FaMagic />,
      title: 'AI-Powered Creation',
      description: 'Generate unique stories using APIS DEVELOPED BY GOOGLE AND TAKEN BY ADITYA KARCHI'
    },
    {
      icon: <FaBook />,
      title: 'Illustrated Stories',
      description: 'Each story comes with beautiful AI-generated illustrations for every page'
    },
    {
      icon: <FaUsers />,
      title: 'Share & Discover',
      description: 'Share your creations and explore stories from our community'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to{' '}
            <span className="gradient-text">Aditya Tells Story</span>
          </h1>
          <p className="hero-description">
            Transform your imagination into beautifully illustrated children's stories 
            using ADITYA'S Storybook. Complete with images, narration, and endless possibilities.
          </p>
          <div className="hero-actions">
            <Link to="/create" className="btn btn-primary btn-large">
              <FaMagic />
              Start Creating
            </Link>
            <Link to="/public-stories" className="btn btn-outline btn-large">
              <FaBook />
              Explore Stories
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-book">
            <FaBook />
          </div>
          <div className="magic-sparkles">
            ✨ ⭐ 🌟 ✨ ⭐
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Stories Section */}
      <section className="recent-stories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Stories</h2>
            <Link to="/public-stories" className="view-all-btn">
              View All <FaArrowRight />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="stories-loading">
              <LoadingSpinner size="large" color="white" />
              <p>Loading amazing stories...</p>
            </div>
          ) : (
            <div className="stories-grid">
              {publicStories.slice(0, 6).map((story) => (
                <StoryCard key={story._id} story={story} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Create Your Story?</h2>
            <p>
              Join thousands of storytellers creating magical adventures with AI
            </p>
            <div className="cta-actions">
              {isAuthenticated ? (
                <Link to="/create" className="btn btn-primary btn-large">
                  Create Your Story
                </Link>
              ) : (
                <>
                  <Link to="/auth" className="btn btn-primary btn-large">
                    Get Started Free
                  </Link>
                  <Link to="/create" className="btn btn-outline btn-large">
                    Try Without Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
