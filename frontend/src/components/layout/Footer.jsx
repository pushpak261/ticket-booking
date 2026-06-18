import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              🎬 Cine<span>Book</span>
            </Link>
            <p className="footer__tagline">
              Your ultimate destination for booking movie tickets online. Experience cinema like never before.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer__section">
            <h3 className="footer__heading">Quick Links</h3>
            <ul className="footer__links">
              <li><Link to="/" className="footer__link">Home</Link></li>
              <li><Link to="/movies" className="footer__link">Movies</Link></li>
              <li><Link to="/movies?status=now_showing" className="footer__link">Now Showing</Link></li>
              <li><Link to="/movies?status=coming_soon" className="footer__link">Coming Soon</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div className="footer__section">
            <h3 className="footer__heading">Account</h3>
            <ul className="footer__links">
              <li><Link to="/login" className="footer__link">Login</Link></li>
              <li><Link to="/register" className="footer__link">Register</Link></li>
              <li><Link to="/my-bookings" className="footer__link">My Bookings</Link></li>
            </ul>
          </div>

          {/* Cities */}
          <div className="footer__section">
            <h3 className="footer__heading">Cities</h3>
            <ul className="footer__links">
              <li><span className="footer__link">Delhi</span></li>
              <li><span className="footer__link">Mumbai</span></li>
              <li><span className="footer__link">Bangalore</span></li>
              <li><span className="footer__link">Hyderabad</span></li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {currentYear} CineBook. All rights reserved.
          </p>
          <div className="footer__tech">
            <span className="footer__tech-badge">Built with MERN Stack</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
