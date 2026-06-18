import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieService } from '../api/services';
import MovieCard from '../components/movie/MovieCard';
import './HomePage.css';

const HomePage = () => {
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'CineBook - Book Movie Tickets Online';
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const [showingRes, soonRes] = await Promise.all([
        movieService.getAll({ status: 'now_showing', limit: 6 }),
        movieService.getAll({ status: 'coming_soon', limit: 4 }),
      ]);
      setNowShowing(showingRes.data.data);
      setComingSoon(soonRes.data.data);
    } catch (error) {
      console.error('Failed to fetch movies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-page page">
      {/* ─── Hero Section ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__gradient" />
          <div className="hero__particles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="hero__particle" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }} />
            ))}
          </div>
        </div>

        <div className="container hero__content">
          <div className="hero__badge">
            <span>🎬</span> Now Streaming Exclusively
          </div>
          <h1 className="hero__title">
            Experience Cinema <br />
            <span className="hero__title-highlight">Like Never Before</span>
          </h1>
          <p className="hero__subtitle">
            Book tickets to the latest blockbusters. Choose your seats. Enjoy the show.
          </p>
          <div className="hero__actions">
            <Link to="/movies?status=now_showing" className="btn btn-primary btn-lg" id="hero-now-showing-btn">
              🎬 Now Showing
            </Link>
            <Link to="/movies?status=coming_soon" className="btn btn-ghost btn-lg" id="hero-coming-soon-btn">
              📅 Coming Soon
            </Link>
          </div>

          {/* Stats */}
          <div className="hero__stats">
            <div className="hero__stat">
              <span className="hero__stat-value">50+</span>
              <span className="hero__stat-label">Movies</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-value">100+</span>
              <span className="hero__stat-label">Theaters</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-value">4</span>
              <span className="hero__stat-label">Cities</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Now Showing ──────────────────────────────────────────────── */}
      <section className="home-section container">
        <div className="home-section__header">
          <h2 className="section-title">
            Now <span>Showing</span>
          </h2>
          <Link to="/movies?status=now_showing" className="btn btn-ghost btn-sm" id="view-all-showing">
            View All →
          </Link>
        </div>

        {isLoading ? (
          <div className="movies-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="movie-card-skeleton">
                <div className="skeleton" style={{ aspectRatio: '2/3', borderRadius: 'var(--radius-lg)' }} />
                <div className="skeleton" style={{ height: '18px', marginTop: '12px', width: '80%' }} />
                <div className="skeleton" style={{ height: '14px', marginTop: '8px', width: '60%' }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="movies-grid">
            {nowShowing.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}
      </section>

      {/* ─── Coming Soon ──────────────────────────────────────────────── */}
      {comingSoon.length > 0 && (
        <section className="home-section container">
          <div className="home-section__header">
            <h2 className="section-title">
              Coming <span>Soon</span>
            </h2>
            <Link to="/movies?status=coming_soon" className="btn btn-ghost btn-sm" id="view-all-soon">
              View All →
            </Link>
          </div>
          <div className="movies-grid movies-grid--4col">
            {comingSoon.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Features Section ─────────────────────────────────────────── */}
      <section className="features-section container">
        <h2 className="section-title text-center">
          Why Choose <span>CineBook?</span>
        </h2>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-card__icon">{f.icon}</div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Banner ────────────────────────────────────────────────── */}
      <section className="cta-section container">
        <div className="cta-card">
          <div className="cta-card__content">
            <h2 className="cta-card__title">Ready to Book Your Seats?</h2>
            <p className="cta-card__desc">
              Join thousands of movie lovers who book tickets with CineBook every day.
            </p>
            <Link to="/register" className="btn btn-primary btn-lg" id="cta-signup-btn">
              Get Started Free
            </Link>
          </div>
          <div className="cta-card__visual">🍿</div>
        </div>
      </section>
    </div>
  );
};

const features = [
  {
    icon: '🎟️',
    title: 'Instant Booking',
    desc: 'Book your seats in seconds. No queues, no hassle. Your ticket is confirmed instantly.',
  },
  {
    icon: '🪑',
    title: 'Choose Your Seat',
    desc: 'Interactive seat map lets you pick exactly where you want to sit — window, aisle, or center.',
  },
  {
    icon: '🔒',
    title: 'Secure Payments',
    desc: 'Your payment information is always protected with bank-grade encryption.',
  },
  {
    icon: '🎬',
    title: 'Latest Movies',
    desc: 'Stay updated with all the latest blockbusters, indie films, and exclusive premieres.',
  },
];

export default HomePage;
