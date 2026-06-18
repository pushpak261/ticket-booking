import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieService, showtimeService } from '../api/services';
import './MovieDetailPage.css';

const MovieDetailPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Generate next 7 days for date picker
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  useEffect(() => {
    fetchMovieData();
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, [id]);

  useEffect(() => {
    if (selectedDate) fetchShowtimes();
  }, [selectedDate]);

  const fetchMovieData = async () => {
    try {
      const res = await movieService.getById(id);
      setMovie(res.data.data);
      document.title = `${res.data.data.title} - CineBook`;
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchShowtimes = async () => {
    try {
      const res = await showtimeService.getAll({ movieId: id, date: selectedDate });
      setShowtimes(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (date) => {
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      value: date.toISOString().split('T')[0],
    };
  };

  const formatDuration = (mins) => `${Math.floor(mins / 60)}h ${mins % 60}m`;

  // Group showtimes by theater
  const groupedShowtimes = showtimes.reduce((acc, show) => {
    const theaterId = show.theater._id;
    if (!acc[theaterId]) {
      acc[theaterId] = { theater: show.theater, shows: [] };
    }
    acc[theaterId].shows.push(show);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="page spinner-container">
        <div className="spinner" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="page spinner-container">
        <div style={{ textAlign: 'center' }}>
          <h2>Movie not found</h2>
          <Link to="/movies" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-detail page">
      {/* ─── Hero Banner ──────────────────────────────────────────────── */}
      <div className="movie-detail__hero">
        <div
          className="movie-detail__hero-bg"
          style={{ backgroundImage: `url(${movie.poster})` }}
        />
        <div className="movie-detail__hero-overlay" />

        <div className="container movie-detail__hero-content">
          <div className="movie-detail__poster-col">
            <img
              src={movie.poster}
              alt={movie.title}
              className="movie-detail__poster"
            />
          </div>
          <div className="movie-detail__meta-col">
            <div className="movie-detail__badges">
              <span className={`badge ${movie.status === 'now_showing' ? 'badge-green' : 'badge-blue'}`}>
                {movie.status === 'now_showing' ? '🟢 Now Showing' : '🔵 Coming Soon'}
              </span>
              <span className="badge badge-gold">{movie.certificate}</span>
            </div>

            <h1 className="movie-detail__title">{movie.title}</h1>

            <div className="movie-detail__info-row">
              {movie.rating > 0 && (
                <span className="movie-detail__rating">⭐ {movie.rating.toFixed(1)}/10</span>
              )}
              <span className="movie-detail__dot">•</span>
              <span>{formatDuration(movie.duration)}</span>
              <span className="movie-detail__dot">•</span>
              <span>{movie.language}</span>
              <span className="movie-detail__dot">•</span>
              <span>{new Date(movie.releaseDate).getFullYear()}</span>
            </div>

            <div className="movie-detail__genres">
              {movie.genre.map((g) => (
                <span key={g} className="movie-detail__genre-tag">{g}</span>
              ))}
            </div>

            <p className="movie-detail__description">{movie.description}</p>

            {movie.director && (
              <p className="movie-detail__director">
                <strong>Director:</strong> {movie.director}
              </p>
            )}

            {movie.cast?.length > 0 && (
              <div className="movie-detail__cast">
                <strong>Cast:</strong>
                <div className="movie-detail__cast-list">
                  {movie.cast.map((c) => (
                    <span key={c.name} className="movie-detail__cast-chip">
                      {c.name}
                      {c.role && <em> as {c.role}</em>}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Booking Section ──────────────────────────────────────────── */}
      {movie.status === 'now_showing' && (
        <div className="container movie-detail__booking">
          <h2 className="section-title">Book Tickets</h2>

          {/* Date Selector */}
          <div className="date-selector">
            {dates.map((d) => {
              const formatted = formatDate(d);
              return (
                <button
                  key={formatted.value}
                  className={`date-btn ${selectedDate === formatted.value ? 'date-btn--active' : ''}`}
                  onClick={() => setSelectedDate(formatted.value)}
                  id={`date-btn-${formatted.value}`}
                >
                  <span className="date-btn__day">{formatted.day}</span>
                  <span className="date-btn__date">{formatted.date}</span>
                  <span className="date-btn__month">{formatted.month}</span>
                </button>
              );
            })}
          </div>

          {/* Showtimes grouped by theater */}
          {Object.values(groupedShowtimes).length === 0 ? (
            <div className="no-showtimes">
              <p>No shows available for this date. Please try another date.</p>
            </div>
          ) : (
            <div className="theater-shows">
              {Object.values(groupedShowtimes).map(({ theater, shows }) => (
                <div key={theater._id} className="theater-shows__card">
                  <div className="theater-shows__header">
                    <div>
                      <h3 className="theater-shows__name">{theater.name}</h3>
                      <p className="theater-shows__city">📍 {theater.city} — {theater.address}</p>
                    </div>
                    <div className="theater-shows__amenities">
                      {theater.amenities?.slice(0, 2).map((a) => (
                        <span key={a} className="theater-shows__amenity">{a}</span>
                      ))}
                    </div>
                  </div>
                  <div className="theater-shows__times">
                    {shows.map((show) => (
                      <Link
                        key={show._id}
                        to={`/showtimes/${show._id}/seats`}
                        className={`showtime-btn ${show.availableSeats === 0 ? 'showtime-btn--sold-out' : ''}`}
                        id={`showtime-btn-${show._id}`}
                      >
                        <span className="showtime-btn__time">{show.startTime}</span>
                        <span className="showtime-btn__seats">
                          {show.availableSeats} seats
                        </span>
                        <span className="showtime-btn__price">₹{show.price.regular}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MovieDetailPage;
