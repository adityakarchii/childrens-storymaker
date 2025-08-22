import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './store/slices/authSlice';
import Navbar from './components/common/Navbar';
import HomePage from './pages/HomePage';
import CreateStoryPage from './pages/CreateStoryPage';
import StoryViewerPage from './pages/StoryViewerPage';
import MyStoriesPage from './pages/MyStoriesPage';
import PublicStoriesPage from './pages/PublicStoriesPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import SharedStoryPage from './pages/SharedStoryPage';
import LoadingSpinner from './components/common/LoadingSpinner';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="app-loading">
        <LoadingSpinner size="large" />
        <p>Loading Gemini Storybook...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateStoryPage />} />
          <Route path="/story/:id" element={<StoryViewerPage />} />
          <Route path="/my-stories" element={<MyStoriesPage />} />
          <Route path="/public-stories" element={<PublicStoriesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/shared/:shareId" element={<SharedStoryPage />} />
          <Route path="*" element={<div className="not-found">Page not found</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
