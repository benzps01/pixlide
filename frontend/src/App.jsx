import { Outlet, Link, useNavigate } from 'react-router-dom';
import './App.css';

function App() {
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/');
    window.location.reload(); // Force a refresh to update UI
  };

  return (
    <div className="App">
      <nav style={{ padding: '20px', backgroundColor: '#282c34', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link to="/" style={{ color: 'white', marginRight: '20px' }}>Slideshow</Link>
          {token && (
             <Link to="/upload" style={{ color: 'white' }}>Upload</Link>
          )}
        </div>
        <div>
          {token ? (
            <button onClick={handleLogout} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button>
          ) : (
            <Link to="/login" style={{ color: 'white' }}>Login</Link>
          )}
        </div>
      </nav>
      
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;