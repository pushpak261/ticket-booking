import { Link } from 'react-router-dom';
import './MovieCard.css';

/**
 * MovieCard Component
 * Displays a movie poster with hover effects, rating, and genre badges.
 */
const MovieCard = ({ movie }) => {
  const {
    _id,
    title,
    poster,
    rating,
    genre,
    duration,
    language,
    status,
    certificate,
  } = movie;

  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const statusLabel = {
    now_showing: { text: 'Now Showing', class: 'movie-card__status--showing' },
    coming_soon: { text: 'Coming Soon', class: 'movie-card__status--soon' },
    ended: { text: 'Ended', class: 'movie-card__status--ended' },
  };

  return (
    <Link to={`/movies/${_id}`} className="movie-card" id={`movie-card-${_id}`}>
      {/* Poster */}
      <div className="movie-card__poster-wrap">
        <img
          src={poster}
          alt={`${title} poster`}
          className="movie-card__poster"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x450/16161f/e50914?text=No+Image';
          }}
        />

        {/* Hover Overlay */}
        <div className="movie-card__overlay">
          <button className="movie-card__play-btn" aria-label={`View ${title}`}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
          <span className="movie-card__overlay-text">Book Tickets</span>
        </div>

        {/* Status Badge */}
        <span className={`movie-card__status ${statusLabel[status]?.class || ''}`}>
          {statusLabel[status]?.text || status}
        </span>

        {/* Certificate */}
        {certificate && (
          <span className="movie-card__cert">{certificate}</span>
        )}
      </div>

      {/* Info */}
      <div className="movie-card__info">
        <h3 className="movie-card__title" title={title}>{title}</h3>

        <div className="movie-card__meta">
          {rating > 0 && (
            <span className="movie-card__rating">
              ⭐ {rating.toFixed(1)}
            </span>
          )}
          <span className="movie-card__duration">{formatDuration(duration)}</span>
          <span className="movie-card__language">{language}</span>
        </div>

        <div className="movie-card__genres">
          {genre.slice(0, 2).map((g) => (
            <span key={g} className="movie-card__genre-tag">{g}</span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
