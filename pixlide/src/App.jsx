import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

function App() {
  const [appVersion, setAppVersion] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      if (window.electronAPI) {
        const token = await window.electronAPI.getToken();
        setIsLoggedIn(!!token);
        
        const version = await window.electronAPI.getAppVersion();
        setAppVersion(version);
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    await window.electronAPI.clearToken();
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <div>
      <nav style={{ 
        padding: '10px', 
        backgroundColor: '#222', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'relative', // Add this
        zIndex: 100 // Add this to ensure it's on top
      }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/" style={{ color: 'white' }}>Slideshow</Link>
          {isLoggedIn && <Link to="/manage" style={{ color: 'white' }}>Manage Images</Link>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ color: '#888', fontSize: '12px' }}>
            Version: {appVersion}
          </span>
          {isLoggedIn ? (
            <button onClick={handleLogout} style={{ background: 'none', border: '1px solid white', color: 'white', cursor: 'pointer', padding: '5px 10px' }}>Logout</button>
          ) : (
            <Link to="/login" style={{ color: 'white' }}>Login</Link>
          )}
        </div>
      </nav>
      <main>
        {/* The router will render SlideshowPage, LoginPage, etc. here */}
        <Outlet />
      </main>
    </div>
  );
}

export default App;