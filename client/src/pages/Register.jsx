import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { 
  Mail, 
  Lock, 
  User,
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (password) => {
    setForm({ ...form, password });
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await register(form);
      navigate('/');
    } catch (e) {
      const errorMessage = e?.response?.data?.error?.message || e?.response?.data?.message || e?.response?.data?.error || 'Registration failed';
      setError(typeof errorMessage === 'string' ? errorMessage : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 2) return 'var(--danger-800)';
    if (strength < 4) return 'var(--warn-800)';
    return 'var(--success-800)';
  };

  const getPasswordStrengthText = (strength) => {
    if (strength < 2) return 'Weak';
    if (strength < 4) return 'Medium';
    return 'Strong';
  };

  return (
    <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="brand__logo" style={{ width: '64px', height: '64px', fontSize: '24px', margin: '0 auto 1rem' }}>
          N
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--fg)', marginBottom: '0.5rem' }}>
          Create your account
        </h1>
        <p style={{ color: 'var(--muted)' }}>
          Join thousands of users getting personalized news
        </p>
      </div>

      {/* Register Form */}
      <div className="card">
        <form onSubmit={onSubmit} className="stack">
          {/* Name Field */}
          <div className="fieldset">
            <label htmlFor="name" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--fg)' }}>
              Full name
            </label>
            <div style={{ position: 'relative' }}>
              <User className="input-icon" />
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your full name"
                className="input input--with-icon"
                required
                disabled={loading}
              />
            </div>
          </div>

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
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                value={form.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Create a strong password"
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
            
            {/* Password Strength Indicator */}
            {form.password && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <div style={{ flex: 1, background: 'var(--border)', borderRadius: '999px', height: '8px' }}>
                    <div 
                      style={{ 
                        height: '8px', 
                        borderRadius: '999px', 
                        background: getPasswordStrengthColor(passwordStrength),
                        width: `${(passwordStrength / 5) * 100}%`,
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--muted)' }}>
                    {getPasswordStrengthText(passwordStrength)}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  Password should be at least 8 characters with uppercase, lowercase, and numbers
                </div>
              </div>
            )}
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

          {/* Terms and Conditions */}
          <div className="check">
            <input
              type="checkbox"
              id="terms"
              required
              disabled={loading}
            />
            <label htmlFor="terms" style={{ fontSize: '14px', color: 'var(--muted)' }}>
              I agree to the{' '}
              <a href="#" style={{ color: 'var(--primary-500)', textDecoration: 'none' }}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" style={{ color: 'var(--primary-500)', textDecoration: 'none' }}>
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || passwordStrength < 2}
            className="btn btn--primary"
            style={{ 
              width: '100%', 
              gap: '0.5rem',
              opacity: loading || passwordStrength < 2 ? 0.5 : 1,
              cursor: loading || passwordStrength < 2 ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ 
                color: 'var(--primary-500)', 
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      {/* Features */}
      <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
        <div className="row" style={{ fontSize: '14px', color: 'var(--muted)' }}>
          <CheckCircle size={20} style={{ color: 'var(--success-800)' }} />
          <span>Personalized news feed</span>
        </div>
        <div className="row" style={{ fontSize: '14px', color: 'var(--muted)' }}>
          <CheckCircle size={20} style={{ color: 'var(--success-800)' }} />
          <span>Save articles for later</span>
        </div>
        <div className="row" style={{ fontSize: '14px', color: 'var(--muted)' }}>
          <CheckCircle size={20} style={{ color: 'var(--success-800)' }} />
          <span>Trending analytics</span>
        </div>
      </div>
    </div>
  );
}


