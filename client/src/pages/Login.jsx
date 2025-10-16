import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      navigate('/');
    } catch (e) {
      const errorMessage = e?.response?.data?.error?.message || e?.response?.data?.message || e?.response?.data?.error || 'Login failed';
      setError(typeof errorMessage === 'string' ? errorMessage : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="brand__logo" style={{ width: '64px', height: '64px', fontSize: '24px', margin: '0 auto 1rem' }}>
          N
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--fg)', marginBottom: '0.5rem' }}>
          Welcome back
        </h1>
        <p style={{ color: 'var(--muted)' }}>
          Sign in to your account to continue
        </p>
      </div>

      {/* Login Form */}
      <div className="card">
        <form onSubmit={onSubmit} className="stack">
          {/* Email Field */}
          <div className="fieldset">
            <label htmlFor="email" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--fg)' }}>
              Email address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail className="input-icon" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input input--with-icon"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="fieldset">
            <label htmlFor="password" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--fg)' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input input--with-icon"
                style={{ paddingRight: '2.5rem' }}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="icon-btn"
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.75rem', 
              background: 'var(--danger-100)', 
              border: '1px solid var(--danger-800)', 
              borderRadius: '10px' 
            }}>
              <AlertCircle size={20} style={{ color: 'var(--danger-800)' }} />
              <span style={{ color: 'var(--danger-800)', fontSize: '14px' }}>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn--primary"
            style={{ width: '100%', gap: '0.5rem' }}
          >
            {loading ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Register Link */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{ 
                color: 'var(--primary-500)', 
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              Create one here
            </Link>
          </p>
        </div>
      </div>

      {/* Demo Credentials */}
      <div className="card" style={{ marginTop: '1.5rem', background: 'var(--info-100)', borderColor: 'var(--info-800)' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--info-800)', marginBottom: '0.5rem' }}>
          Demo Credentials
        </h3>
        <div style={{ fontSize: '12px', color: 'var(--info-800)' }}>
          <p><strong>Email:</strong> demo@example.com</p>
          <p><strong>Password:</strong> password123</p>
        </div>
      </div>
    </div>
  );
}


