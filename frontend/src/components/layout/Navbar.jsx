import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Add background blur on scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo" aria-label="CineBook Home">
          <span className="navbar__logo-icon">🎬</span>
          <span className="navbar__logo-text">
            Cine<span>Book</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="navbar__nav" aria-label="Main navigation">
          <NavLink
            to="/"
            className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
            end
          >
            Home
          </NavLink>
          <NavLink
            to="/movies"
            className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
          >
            Movies
          </NavLink>
          {isAuthenticated && (
            <NavLink
              to="/my-bookings"
              className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
            >
              My Bookings
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `navbar__link navbar__link--admin ${isActive ? 'navbar__link--active' : ''}`}
            >
              Admin
            </NavLink>
          )}
        </nav>

        {/* Auth Section */}
        <div className="navbar__auth">
          {isAuthenticated ? (
            <div className="navbar__user" ref={userMenuRef}>
              <button
                className="navbar__user-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-haspopup="true"
                aria-expanded={isUserMenuOpen}
                id="user-menu-trigger"
              >
                <div className="navbar__avatar">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="navbar__user-name">{user?.name?.split(' ')[0]}</span>
                <svg className={`navbar__chevron ${isUserMenuOpen ? 'navbar__chevron--open' : ''}`} viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </button>

              {isUserMenuOpen && (
                <div className="navbar__dropdown" role="menu">
                  <div className="navbar__dropdown-header">
                    <p className="navbar__dropdown-name">{user?.name}</p>
                    <p className="navbar__dropdown-email">{user?.email}</p>
                  </div>
                  <div className="navbar__dropdown-divider" />
                  <Link
                    to="/my-bookings"
                    className="navbar__dropdown-item"
                    role="menuitem"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    🎟️ My Bookings
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="navbar__dropdown-item"
                      role="menuitem"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      ⚙️ Admin Panel
                    </Link>
                  )}
                  <div className="navbar__dropdown-divider" />
                  <button
                    className="navbar__dropdown-item navbar__dropdown-item--danger"
                    role="menuitem"
                    onClick={handleLogout}
                    id="logout-btn"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar__auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm" id="navbar-login-btn">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="navbar-register-btn">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="navbar__mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
            id="mobile-menu-toggle"
          >
            <span className={`navbar__hamburger ${isMobileMenuOpen ? 'navbar__hamburger--open' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="navbar__mobile-menu">
          <NavLink to="/" className="navbar__mobile-link" onClick={() => setIsMobileMenuOpen(false)} end>Home</NavLink>
          <NavLink to="/movies" className="navbar__mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Movies</NavLink>
          {isAuthenticated && (
            <NavLink to="/my-bookings" className="navbar__mobile-link" onClick={() => setIsMobileMenuOpen(false)}>My Bookings</NavLink>
          )}
          {!isAuthenticated && (
            <>
              <Link to="/login" className="navbar__mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="navbar__mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
            </>
          )}
          {isAuthenticated && (
            <button className="navbar__mobile-link navbar__mobile-link--danger" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
