import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const res = await authService.register(formData);
      login(res.data);
      toast.success(`Account created! Welcome, ${res.data.user.name}! 🎉`);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page page">
      <div className="auth-container">
        <div className="auth-bg" />
        <div className="auth-card">
          <div className="auth-card__header">
            <Link to="/" className="auth-card__logo">🎬 CineBook</Link>
            <h1 className="auth-card__title">Create Account</h1>
            <p className="auth-card__subtitle">Join CineBook to start booking tickets</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                name="name"
                className="form-input"
                placeholder="Pushpak"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                type="email"
                name="email"
                className="form-input"
                placeholder="pushpak@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">Phone Number (optional)</label>
              <input
                id="reg-phone"
                type="tel"
                name="phone"
                className="form-input"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-role">Account Type</label>
              <select
                id="reg-role"
                name="role"
                className="form-input"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                name="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-form__submit"
              disabled={isLoading}
              id="register-submit-btn"
            >
              {isLoading ? (
                <><div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> Creating account...</>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="auth-card__footer">
            Already have an account?{' '}
            <Link to="/login" className="auth-card__link" id="go-to-login">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
