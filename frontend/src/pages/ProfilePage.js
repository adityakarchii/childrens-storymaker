import React from 'react';

const ProfilePage = () => {
  return (
    <div style={{ padding: '100px 20px', textAlign: 'center', color: 'white' }}>
      <h1>User Profile</h1>
      <p>Profile management coming soon...</p>
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: '40px', 
        borderRadius: '20px',
        maxWidth: '600px',
        margin: '40px auto'
      }}>
        <h3>Features to implement:</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>👤 Edit profile information</li>
          <li>🎨 Story preferences</li>
          <li>📊 Account statistics</li>
          <li>🔒 Change password</li>
          <li>💳 Subscription management</li>
        </ul>
      </div>
    </div>
  );
};

export default ProfilePage;
