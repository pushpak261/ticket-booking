import axios from 'axios';

/**
 * Axios instance pre-configured with base URL.
 * Automatically attaches Bearer token from localStorage to all requests.
 */
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor: attach auth token ────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cinebook_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: normalize error format ─────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong';

    return Promise.reject(new Error(message));
  }
);

export default api;
