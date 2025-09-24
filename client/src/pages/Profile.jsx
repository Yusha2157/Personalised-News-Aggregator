import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { http } from '../api/http.js';
import { 
  User, 
  Mail, 
  Calendar, 
  Settings, 
  Save, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Camera,
  Tag,
  Bookmark,
  TrendingUp
} from 'lucide-react';

export default function Profile() {
  const { user, updateInterests } = useAuth();
  const [interests, setInterests] = useState(user?.interests?.join(', ') || '');
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    savedArticles: 0,
    categories: [],
    joinDate: null
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await http.get('/auth/stats');
      setStats(data);
    } catch (e) {
      console.error('Error loading stats:', e);
    }
  };

  const save = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const arr = interests.split(',').map((s) => s.trim()).filter(Boolean);
      await updateInterests(arr);
      setSuccess('Interests updated successfully');
    } catch (e) {
      setError('Failed to update interests');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await http.put('/auth/profile', { name, avatarUrl });
      setSuccess('Profile updated successfully');
    } catch (e) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container" style={{ paddingTop: 0 }}>
      <div className="stack-lg">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <User className="w-6 h-6 text-blue-600" />
            Profile Settings
          </h1>
          <p className="muted" style={{ marginTop: 4 }}>
            Manage your account and preferences
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
        <style>{`@media (min-width: 1024px){ .profile-grid { grid-template-columns: 2fr 1fr; } }`}</style>
        <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
        {/* Profile Information */}
        <div className="stack">
          {/* Basic Info */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Settings className="w-5 h-5 text-blue-600" />
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                Basic Information
              </h3>
            </div>

            {/* Avatar Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16 }}>
              <div style={{ position: 'relative' }}>
                <img 
                  src={avatarUrl || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.name || user?.email)}`} 
                  alt="avatar" 
                  style={{ width: 150, height: 150, borderRadius: '999px', border: '2px solid var(--border)', objectFit: 'cover' }}
                />
                <button className="btn btn--primary" style={{ position: 'absolute', bottom: -6, right: -6, padding: 6, borderRadius: '999px' }}>
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <div>
                <h4 style={{ fontSize: 18, fontWeight: 700 }}>
                  {name || user?.name || 'Unnamed User'}
                </h4>
                <p className="muted">{user?.email}</p>
                <p className="muted" style={{ fontSize: 12 }}>
                  Member since {formatDate(stats.joinDate)}
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="stack">
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="input"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail className="input-icon" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="input input--with-icon"
                    disabled
                  />
                </div>
                <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                  Email cannot be changed
                </p>
              </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, borderColor: 'var(--success-100)' }}>
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span style={{ color: '#166534', fontSize: 14 }}>{success}</span>
              </div>
            )}

            {error && (
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, borderColor: 'var(--danger-100)' }}>
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span style={{ color: '#b91c1c', fontSize: 14 }}>{error}</span>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={saveProfile}
              disabled={loading}
              className="btn btn--primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16 }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Profile
                </>
              )}
            </button>
          </div>

          {/* Interests */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Tag className="w-5 h-5 text-blue-600" />
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                News Interests
              </h3>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                Topics you're interested in (comma separated)
              </label>
              <textarea
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="input"
                style={{ minHeight: 100, resize: 'none' }}
                placeholder="Technology, Science, Sports, Politics..."
                rows={3}
              />
              <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                Separate multiple interests with commas
              </p>
            </div>

            <button
              onClick={save}
              disabled={loading}
              className="btn btn--secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16 }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Tag className="w-4 h-4" />
                  Update Interests
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="stack">
          {/* Account Stats */}
          <div className="card">
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              Account Statistics
            </h3>
            
            <div className="stack">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Bookmark className="w-4 h-4 text-blue-600" />
                  <span className="muted" style={{ fontSize: 14 }}>Saved Articles</span>
                </div>
                <span style={{ fontWeight: 700 }}>
                  {stats.savedArticles || 0}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag className="w-4 h-4 text-green-600" />
                  <span className="muted" style={{ fontSize: 14 }}>Categories</span>
                </div>
                <span style={{ fontWeight: 700 }}>
                  {stats.categories?.length || 0}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="muted" style={{ fontSize: 14 }}>Member Since</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: 12 }}>
                  {formatDate(stats.joinDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              Quick Actions
            </h3>
            
            <div className="stack">
              <a
                href="/saved"
                className="card"
              >
                <Bookmark className="w-4 h-4 text-blue-600" />
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  View Saved Articles
                </span>
              </a>

              <a
                href="/trending"
                className="card"
              >
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  View Analytics
                </span>
              </a>
            </div>
          </div>

          {/* Account Info */}
          <div className="card">
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              Account Information
            </h3>
            
            <div className="stack" style={{ fontSize: 14 }}>
              <div>
                <span className="muted">User ID:</span>
                <span style={{ marginLeft: 8, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
                  {user?.id?.slice(0, 8)}...
                </span>
              </div>
              <div>
                <span className="muted">Email:</span>
                <span style={{ marginLeft: 8 }}>
                  {user?.email}
                </span>
              </div>
              <div>
                <span className="muted">Status:</span>
                <span style={{ marginLeft: 8, color: '#16a34a', fontWeight: 600 }}>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
    </div>
  );
}


