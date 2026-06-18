import api from './axios';

// ─── Auth Services ─────────────────────────────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ─── Movie Services ────────────────────────────────────────────────────────
export const movieService = {
  getAll: (params) => api.get('/movies', { params }),
  getById: (id) => api.get(`/movies/${id}`),
};

// ─── Theater Services ──────────────────────────────────────────────────────
export const theaterService = {
  getAll: (params) => api.get('/theaters', { params }),
  getCities: () => api.get('/theaters/cities'),
};

// ─── Showtime Services ─────────────────────────────────────────────────────
export const showtimeService = {
  getAll: (params) => api.get('/showtimes', { params }),
  getById: (id) => api.get(`/showtimes/${id}`),
};

// ─── Booking Services ──────────────────────────────────────────────────────
export const bookingService = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.delete(`/bookings/${id}`),
};

// ─── Admin Services ────────────────────────────────────────────────────────
export const adminService = {
  // Movies
  createMovie: (data) => api.post('/admin/movies', data),
  updateMovie: (id, data) => api.put(`/admin/movies/${id}`, data),
  deleteMovie: (id) => api.delete(`/admin/movies/${id}`),
  // Theaters
  createTheater: (data) => api.post('/admin/theaters', data),
  // Showtimes
  createShowtime: (data) => api.post('/admin/showtimes', data),
  // Bookings
  getAllBookings: () => api.get('/admin/bookings'),
};
