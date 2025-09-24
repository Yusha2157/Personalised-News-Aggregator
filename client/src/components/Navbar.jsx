import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Sun, 
  Moon, 
  Menu, 
  X, 
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsProfileOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <div className="brand">
          <Link to="/" className="brand">
            <div className="brand__logo"><span>N</span></div>
            <span className="brand__name">NewsNow</span>
          </Link>

          <div className="nav-links">
            <Link 
              to="/" 
              className="nav-link"
            >
              <Home className="w-4 h-4" />
              <span>Feed</span>
            </Link>
            <Link 
              to="/saved" 
              className="nav-link"
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved</span>
            </Link>
            <Link 
              to="/trending" 
              className="nav-link"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Trending</span>
            </Link>
          </div>

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
            {user ? (
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
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link
                  to="/login"
                  className="btn btn--secondary"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn--primary"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="menu-btn icon-btn">
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="stack" style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
            <div className="stack-sm">
              <Link
                to="/"
                className="nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-4 h-4" />
                <span>Feed</span>
              </Link>
              <Link
                to="/saved"
                className="nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <Bookmark className="w-4 h-4" />
                <span>Saved</span>
              </Link>
              <Link
                to="/trending"
                className="nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Trending</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
