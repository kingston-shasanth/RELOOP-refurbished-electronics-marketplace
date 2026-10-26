import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Resolves the appropriate Bearer token based on explicit scope,
 * active route, or target administrative endpoint.
 */
export const getActiveToken = (config = {}) => {
  if (typeof window === 'undefined') return null;

  // 1. Explicit header scope override
  const explicitScope = config.headers?.['X-Session-Scope'];
  if (explicitScope === 'admin') {
    return localStorage.getItem('reloop_admin_token') || null;
  }
  if (explicitScope === 'customer') {
    return localStorage.getItem('reloop_customer_token') || localStorage.getItem('reloop_token') || null;
  }

  // 2. Window location context
  const isWindowAdmin = window.location.pathname.startsWith('/admin');

  // 3. Administrative API endpoint context
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  const isEndpointAdmin =
    url.startsWith('/admin') ||
    url.includes('/status') ||
    url.includes('/payment-status') ||
    url === '/upload' ||
    (url === '/products' && ['post', 'put', 'delete'].includes(method)) ||
    (url.startsWith('/products/') && ['put', 'delete'].includes(method)) ||
    (url.startsWith('/trade-in/') && method === 'patch') ||
    (url === '/trade-in' && method === 'get' && isWindowAdmin) ||
    (url === '/orders' && method === 'get' && isWindowAdmin);

  if (isWindowAdmin || isEndpointAdmin) {
    return localStorage.getItem('reloop_admin_token') || localStorage.getItem('reloop_token') || null;
  }

  return localStorage.getItem('reloop_customer_token') || localStorage.getItem('reloop_token') || null;
};

// Interceptor to inject the correctly scoped JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = getActiveToken(config);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthorized 401s gracefully without clobbering independent sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isWindowAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
      if (isWindowAdmin) {
        console.warn('[RELOOP Auth] Admin session expired or unauthorized.');
        localStorage.removeItem('reloop_admin_token');
        localStorage.removeItem('reloop_admin_user');
      } else {
        console.warn('[RELOOP Auth] Customer session expired or unauthorized.');
        localStorage.removeItem('reloop_customer_token');
        localStorage.removeItem('reloop_customer_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

