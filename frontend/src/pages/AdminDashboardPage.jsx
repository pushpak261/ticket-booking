import { useState, useEffect } from 'react';
import { movieService, adminService } from '../api/services';
import toast from 'react-hot-toast';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', genre: '', language: 'English',
    duration: '', rating: '', poster: '', director: '',
    releaseDate: '', status: 'now_showing', certificate: 'UA',
  });

  useEffect(() => {
    document.title = 'Admin Dashboard - CineBook';
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await movieService.getAll({ limit: 50 });
      setMovies(res.data.data);
    } catch (err) {
      toast.error('Failed to load movies.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        genre: form.genre.split(',').map((g) => g.trim()),
        duration: Number(form.duration),
        rating: Number(form.rating),
      };
      await adminService.createMovie(payload);
      toast.success('Movie added successfully!');
      setShowAddForm(false);
      setForm({ title: '', description: '', genre: '', language: 'English', duration: '', rating: '', poster: '', director: '', releaseDate: '', status: 'now_showing', certificate: 'UA' });
      fetchMovies();
    } catch (err) {
      toast.error(err.message || 'Failed to add movie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await adminService.deleteMovie(id);
      toast.success('Movie deleted.');
      setMovies(movies.filter((m) => m._id !== id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await adminService.updateMovie(id, { status });
      setMovies(movies.map((m) => m._id === id ? { ...m, status } : m));
      toast.success('Status updated.');
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  return (
    <div className="admin-page page">
      <div className="container">
        {/* Header */}
        <div className="admin-page__header">
          <div>
            <h1 className="admin-page__title">⚙️ Admin Dashboard</h1>
            <p className="admin-page__subtitle">{movies.length} movies in database</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
            id="add-movie-btn"
          >
            {showAddForm ? '✕ Cancel' : '+ Add Movie'}
          </button>
        </div>

        {/* Add Movie Form */}
        {showAddForm && (
          <form className="admin-form" onSubmit={handleSubmit} id="add-movie-form">
            <h2 className="admin-form__title">Add New Movie</h2>
            <div className="admin-form__grid">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" name="title" value={form.title} onChange={handleChange} required placeholder="Movie title" />
              </div>
              <div className="form-group">
                <label className="form-label">Director</label>
                <input className="form-input" name="director" value={form.director} onChange={handleChange} placeholder="Director name" />
              </div>
              <div className="form-group">
                <label className="form-label">Genre * (comma separated)</label>
                <input className="form-input" name="genre" value={form.genre} onChange={handleChange} required placeholder="Action, Drama, Thriller" />
              </div>
              <div className="form-group">
                <label className="form-label">Language *</label>
                <select className="form-input" name="language" value={form.language} onChange={handleChange}>
                  <option>English</option><option>Hindi</option><option>Tamil</option><option>Telugu</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Duration (mins) *</label>
                <input className="form-input" type="number" name="duration" value={form.duration} onChange={handleChange} required min="1" />
              </div>
              <div className="form-group">
                <label className="form-label">Rating (0–10)</label>
                <input className="form-input" type="number" name="rating" value={form.rating} onChange={handleChange} min="0" max="10" step="0.1" />
              </div>
              <div className="form-group">
                <label className="form-label">Release Date *</label>
                <input className="form-input" type="date" name="releaseDate" value={form.releaseDate} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" name="status" value={form.status} onChange={handleChange}>
                  <option value="now_showing">Now Showing</option>
                  <option value="coming_soon">Coming Soon</option>
                  <option value="ended">Ended</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Certificate</label>
                <select className="form-input" name="certificate" value={form.certificate} onChange={handleChange}>
                  <option>U</option><option>UA</option><option>A</option><option>S</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Poster URL *</label>
                <input className="form-input" name="poster" value={form.poster} onChange={handleChange} required placeholder="https://..." />
              </div>
              <div className="form-group admin-form__full">
                <label className="form-label">Description *</label>
                <textarea className="form-input" name="description" value={form.description} onChange={handleChange} required rows={3} placeholder="Movie synopsis..." style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div className="admin-form__actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting} id="submit-movie-btn">
                {isSubmitting ? 'Adding...' : 'Add Movie'}
              </button>
            </div>
          </form>
        )}

        {/* Movies Table */}
        {isLoading ? (
          <div className="spinner-container"><div className="spinner" /></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Movie</th>
                  <th>Genre</th>
                  <th>Duration</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((movie) => (
                  <tr key={movie._id} id={`admin-row-${movie._id}`}>
                    <td>
                      <div className="admin-table__movie">
                        <img src={movie.poster} alt={movie.title} className="admin-table__poster" />
                        <div>
                          <p className="admin-table__title">{movie.title}</p>
                          <p className="admin-table__director">{movie.director}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="admin-table__genre">{movie.genre.join(', ')}</span></td>
                    <td>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</td>
                    <td>{movie.rating > 0 ? `⭐ ${movie.rating}` : '—'}</td>
                    <td>
                      <select
                        className="admin-table__status-select"
                        value={movie.status}
                        onChange={(e) => handleStatusChange(movie._id, e.target.value)}
                        id={`status-select-${movie._id}`}
                      >
                        <option value="now_showing">Now Showing</option>
                        <option value="coming_soon">Coming Soon</option>
                        <option value="ended">Ended</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm"
                        style={{ background: 'rgba(229,9,20,0.12)', color: 'var(--color-primary)', border: '1px solid rgba(229,9,20,0.3)' }}
                        onClick={() => handleDelete(movie._id, movie.title)}
                        disabled={deletingId === movie._id}
                        id={`delete-movie-${movie._id}`}
                      >
                        {deletingId === movie._id ? '...' : '🗑️ Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
