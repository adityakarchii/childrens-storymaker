import React from 'react';

const SharedStoryPage = () => {
  return (
    <div style={{ padding: '100px 20px', textAlign: 'center', color: 'white' }}>
      <h1>Shared Story</h1>
      <p>Public story viewing coming soon...</p>
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: '40px', 
        borderRadius: '20px',
        maxWidth: '600px',
        margin: '40px auto'
      }}>
        <h3>Features to implement:</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>🌐 Public story access</li>
          <li>📖 Full story reading</li>
          <li>🎵 Audio playback</li>
          <li>💾 Download options</li>
          <li>👍 Like and share</li>
        </ul>
      </div>
    </div>
  );
};

export default SharedStoryPage;
