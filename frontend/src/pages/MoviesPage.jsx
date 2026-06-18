import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { movieService } from '../api/services';
import MovieCard from '../components/movie/MovieCard';
import './MoviesPage.css';

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Animation', 'Adventure', 'Fantasy'];
const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu'];

const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter state from URL params
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    genre: searchParams.get('genre') || '',
    language: searchParams.get('language') || '',
    search: searchParams.get('search') || '',
  });

  useEffect(() => {
    document.title = 'Movies - CineBook';
  }, []);

  useEffect(() => {
    fetchMovies(1);
  }, [filters]);

  const fetchMovies = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = { page, limit: 12, ...filters };
      // Remove empty params
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await movieService.getAll(params);
      setMovies(res.data.data);
      setTotalPages(res.data.pages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load movies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    // Sync filters to URL
    const params = {};
    Object.entries(newFilters).forEach(([k, v]) => { if (v) params[k] = v; });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ status: '', genre: '', language: '', search: '' });
    setSearchParams({});
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="movies-page page">
      <div className="container">
        {/* ─── Page Header ────────────────────────────────────────────── */}
        <div className="movies-page__header">
          <h1 className="movies-page__title">
            {filters.status === 'now_showing'
              ? '🎬 Now Showing'
              : filters.status === 'coming_soon'
              ? '📅 Coming Soon'
              : '🍿 All Movies'}
          </h1>
          {movies.length > 0 && (
            <span className="movies-page__count">{movies.length} movies found</span>
          )}
        </div>

        {/* ─── Filters ────────────────────────────────────────────────── */}
        <div className="filters-bar">
          {/* Search */}
          <div className="filters-bar__search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="form-input filters-bar__input"
              placeholder="Search movies..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              id="movies-search-input"
            />
          </div>

          {/* Status Filter */}
          <select
            className="form-input filters-bar__select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            id="status-filter"
          >
            <option value="">All Status</option>
            <option value="now_showing">Now Showing</option>
            <option value="coming_soon">Coming Soon</option>
          </select>

          {/* Genre Filter */}
          <select
            className="form-input filters-bar__select"
            value={filters.genre}
            onChange={(e) => handleFilterChange('genre', e.target.value)}
            id="genre-filter"
          >
            <option value="">All Genres</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          {/* Language Filter */}
          <select
            className="form-input filters-bar__select"
            value={filters.language}
            onChange={(e) => handleFilterChange('language', e.target.value)}
            id="language-filter"
          >
            <option value="">All Languages</option>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters} id="clear-filters-btn">
              ✕ Clear
            </button>
          )}
        </div>

        {/* ─── Movie Grid ─────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="movies-grid">
            {[...Array(12)].map((_, i) => (
              <div key={i}>
                <div className="skeleton" style={{ aspectRatio: '2/3', borderRadius: 'var(--radius-lg)' }} />
                <div className="skeleton" style={{ height: '18px', marginTop: '12px', width: '80%' }} />
                <div className="skeleton" style={{ height: '14px', marginTop: '8px', width: '55%' }} />
              </div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="movies-empty">
            <div className="movies-empty__icon">🎬</div>
            <h3 className="movies-empty__title">No movies found</h3>
            <p className="movies-empty__desc">Try adjusting your search or filters.</p>
            <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
          </div>
        ) : (
          <>
            <div className="movies-grid">
              {movies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={currentPage === 1}
                  onClick={() => fetchMovies(currentPage - 1)}
                  id="prev-page-btn"
                >
                  ← Prev
                </button>
                <span className="pagination__info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={currentPage === totalPages}
                  onClick={() => fetchMovies(currentPage + 1)}
                  id="next-page-btn"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MoviesPage;
