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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account and preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Basic Information
              </h3>
            </div>

            {/* Avatar Section */}
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <img 
                  src={avatarUrl || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.name || user?.email)}`} 
                  alt="avatar" 
                  className="w-20 h-20 rounded-full border-2 border-gray-200 dark:border-gray-700 object-cover"
                />
                <button className="absolute -bottom-1 -right-1 p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {name || user?.name || 'Unnamed User'}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Member since {formatDate(stats.joinDate)}
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="input pl-10 bg-gray-50 dark:bg-gray-800"
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Email cannot be changed
                </p>
              </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300 text-sm">{success}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={saveProfile}
              disabled={loading}
              className="btn-primary flex items-center gap-2 mt-6"
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
            <div className="flex items-center gap-2 mb-6">
              <Tag className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                News Interests
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Topics you're interested in (comma separated)
              </label>
              <textarea
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="input min-h-[100px] resize-none"
                placeholder="Technology, Science, Sports, Politics..."
                rows={3}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Separate multiple interests with commas
              </p>
            </div>

            <button
              onClick={save}
              disabled={loading}
              className="btn-secondary flex items-center gap-2 mt-4"
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
        <div className="space-y-6">
          {/* Account Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Account Statistics
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Saved Articles</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {stats.savedArticles || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Categories</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {stats.categories?.length || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Member Since</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs">
                  {formatDate(stats.joinDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Quick Actions
            </h3>
            
            <div className="space-y-3">
              <a
                href="/saved"
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Bookmark className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  View Saved Articles
                </span>
              </a>

              <a
                href="/trending"
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  View Analytics
                </span>
              </a>
            </div>
          </div>

          {/* Account Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Account Information
            </h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">User ID:</span>
                <span className="ml-2 font-mono text-gray-900 dark:text-gray-100">
                  {user?.id?.slice(0, 8)}...
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">
                  {user?.email}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className="ml-2 text-green-600 dark:text-green-400 font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


