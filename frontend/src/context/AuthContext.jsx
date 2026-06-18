import { createContext, useContext, useReducer, useEffect } from 'react';

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // True while checking localStorage on mount
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_INIT':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!action.payload.token,
        isLoading: false,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
};

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On mount: restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('cinebook_token');
    const user = localStorage.getItem('cinebook_user');

    dispatch({
      type: 'AUTH_INIT',
      payload: {
        token: token || null,
        user: user ? JSON.parse(user) : null,
      },
    });
  }, []);

  const login = (data) => {
    localStorage.setItem('cinebook_token', data.token);
    localStorage.setItem('cinebook_user', JSON.stringify(data.user));
    dispatch({ type: 'LOGIN_SUCCESS', payload: data });
  };

  const logout = () => {
    localStorage.removeItem('cinebook_token');
    localStorage.removeItem('cinebook_user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Custom Hook ──────────────────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
