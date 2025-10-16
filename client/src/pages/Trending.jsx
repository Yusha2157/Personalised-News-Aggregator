import { useEffect, useState } from 'react';
import { http } from '../api/http.js';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Newspaper,
  Calendar,
  Users,
  Loader2,
  AlertCircle,
  Tag
} from 'lucide-react';
import { 
  PieChart as RechartsPieChart, 
  Pie,
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

export default function Trending() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    categories: [],
    sources: [],
    tags: [],
    totalArticles: 0,
    totalUsers: 0,
    trendingToday: []
  });

  const loadStats = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { data } = await http.get('/stats/trending');
      setStats(data);
    } catch (e) {
      setError('Failed to load trending data');
      console.error('Error loading stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
          <p className="text-blue-600 dark:text-blue-400">
            Articles: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--primary)' }} />
          <span className="muted">Loading trending data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 0' }}>
        <div style={{ textAlign: 'center' }}>
          <AlertCircle className="w-12 h-12" style={{ color: 'var(--danger)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--fg)' }}>
            Error loading data
          </h3>
          <p className="muted" style={{ marginBottom: 16 }}>{error}</p>
          <button onClick={loadStats} className="btn btn--primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp className="w-6 h-6" style={{ color: 'var(--primary)' }} />
            Trending Analytics
          </h1>
          <p className="muted" style={{ marginTop: 4 }}>
            Insights into popular content and user engagement
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 14, color: 'var(--muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>Total Articles</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--fg)' }}>
                {stats.totalArticles?.toLocaleString() || 0}
              </p>
            </div>
            <div style={{ width: 48, height: 48, background: 'var(--primary-100)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Newspaper className="w-6 h-6" style={{ color: 'var(--primary)' }} />
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>Active Users</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--fg)' }}>
                {stats.totalUsers?.toLocaleString() || 0}
              </p>
            </div>
            <div style={{ width: 48, height: 48, background: 'var(--success-100)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users className="w-6 h-6" style={{ color: 'var(--success)' }} />
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>Trending Today</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--fg)' }}>
                {stats.trendingToday?.length || 0}
              </p>
            </div>
            <div style={{ width: 48, height: 48, background: 'var(--warning-100)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp className="w-6 h-6" style={{ color: 'var(--warning)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        {/* Categories Pie Chart */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <PieChart className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg)' }}>
              Articles by Category
            </h3>
          </div>
          
          {stats.categories && stats.categories.length > 0 ? (
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={stats.categories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
              No category data available
            </div>
          )}
        </div>

        {/* Sources Bar Chart */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <BarChart3 className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg)' }}>
              Articles by Source
            </h3>
          </div>
          
          {stats.sources && stats.sources.length > 0 ? (
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.sources}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
              No source data available
            </div>
          )}
        </div>
      </div>

      {/* Trending Articles */}
      {stats.trendingToday && stats.trendingToday.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg)' }}>
              Trending Today
            </h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {stats.trendingToday.map((article, index) => (
              <div key={article.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'var(--border)', borderRadius: 12 }}>
                <div style={{ flexShrink: 0, width: 32, height: 32, background: 'var(--primary-100)', borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>
                    {index + 1}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontWeight: 600, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {article.title}
                  </h4>
                  <p style={{ fontSize: 14, color: 'var(--muted)' }}>
                    {article.source} • {article.views || 0} views
                  </p>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--success)' }}>
                    +{article.trendScore || 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags Cloud */}
      {stats.tags && stats.tags.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <Tag className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg)' }}>
              Popular Tags
            </h3>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {stats.tags.map((tag, index) => (
              <span
                key={tag.name}
                className="pill"
                style={{
                  fontSize: `${Math.max(12, Math.min(20, tag.count * 2))}px`,
                  opacity: Math.max(0.6, Math.min(1, tag.count / 10))
                }}
              >
                {tag.name} ({tag.count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
