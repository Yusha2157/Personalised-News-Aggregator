import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Sun, 
  Moon, 
  ChevronDown,
  User, 
  Bookmark, 
  LogOut,
  TrendingUp,
  Home
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTopicsOpen, setIsTopicsOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsProfileOpen(false);
  };

  const handleTopicSelect = (category) => {
    navigate(`/?category=${category}`);
    setIsTopicsOpen(false);
  };

  const handleCountrySelect = (country) => {
    navigate(`/?country=${country}`);
    setIsCountryOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown')) {
        setIsTopicsOpen(false);
        setIsCountryOpen(false);
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {/* Brand */}
        <Link to="/" className="brand">
          <span className="brand__name">Brevity - News Aggregator</span>
        </Link>

        {/* Navigation Links */}
        <div className="nav-links">
          <Link to="/" className="nav-link">
            <span>Home</span>
          </Link>
          
          <div className="dropdown">
            <button 
              className="nav-link dropdown-toggle"
              onClick={() => setIsTopicsOpen(!isTopicsOpen)}
            >
              <span>Topics</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {isTopicsOpen && (
              <div className="dropdown-menu">
                <button onClick={() => handleTopicSelect('')} className="dropdown-item">All</button>
                <button onClick={() => handleTopicSelect('technology')} className="dropdown-item">Technology</button>
                <button onClick={() => handleTopicSelect('sports')} className="dropdown-item">Sports</button>
                <button onClick={() => handleTopicSelect('business')} className="dropdown-item">Business</button>
                <button onClick={() => handleTopicSelect('entertainment')} className="dropdown-item">Entertainment</button>
                <button onClick={() => handleTopicSelect('science')} className="dropdown-item">Science</button>
                <button onClick={() => handleTopicSelect('health')} className="dropdown-item">Health</button>
                <button onClick={() => handleTopicSelect('politics')} className="dropdown-item">Politics</button>
              </div>
            )}
          </div>

          <div className="dropdown">
            <button 
              className="nav-link dropdown-toggle"
              onClick={() => setIsCountryOpen(!isCountryOpen)}
            >
              <span>Country</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {isCountryOpen && (
              <div className="dropdown-menu">
                <button onClick={() => handleCountrySelect('us')} className="dropdown-item">United States</button>
                <button onClick={() => handleCountrySelect('uk')} className="dropdown-item">United Kingdom</button>
                <button onClick={() => handleCountrySelect('ca')} className="dropdown-item">Canada</button>
                <button onClick={() => handleCountrySelect('au')} className="dropdown-item">Australia</button>
                <button onClick={() => handleCountrySelect('in')} className="dropdown-item">India</button>
                <button onClick={() => handleCountrySelect('de')} className="dropdown-item">Germany</button>
                <button onClick={() => handleCountrySelect('fr')} className="dropdown-item">France</button>
              </div>
            )}
          </div>
        </div>

        {/* Right side actions */}
        <div className="nav-actions">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="icon-btn"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* User menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="icon-btn"
              >
                <div className="brand__logo" style={{ borderRadius: '999px' }}>
                  <User className="w-4 h-4" />
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {user.name || user.email}
                </span>
              </button>

              {/* Profile dropdown */}
              {isProfileOpen && (
                <div className="card" style={{ position: 'absolute', right: 0, marginTop: 8, width: 192, padding: 8 }}>
                  <Link
                    to="/profile"
                    className="nav-link"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/saved"
                    className="nav-link"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>Saved Articles</span>
                  </Link>
                  <Link
                    to="/trending"
                    className="nav-link"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Trending</span>
                  </Link>
                  <hr className="divider" />
                  <button
                    onClick={handleLogout}
                    className="nav-link"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
