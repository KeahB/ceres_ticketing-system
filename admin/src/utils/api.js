import axios from 'axios';

const DEFAULT_BACKEND_PORT = '3000';

const getStoredApiUrl = () => {
  try {
    const rawSettings = localStorage.getItem('adminSettings');
    if (!rawSettings) {
      return null;
    }

    const settings = JSON.parse(rawSettings);
    const apiUrl = settings?.apiUrl?.trim();

    return apiUrl || null;
  } catch (error) {
    return null;
  }
};

export const getBackendUrl = () => {
  const storedApiUrl = getStoredApiUrl();

  if (storedApiUrl) {
    return storedApiUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:${DEFAULT_BACKEND_PORT}`;
  }

  return `http://localhost:${DEFAULT_BACKEND_PORT}`;
};

export const getApiBase = () => `${getBackendUrl()}/api`;

export const getAdminApiBase = () => `${getApiBase()}/admin`;

export const clearAdminSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminProfile');
};

export const hasValidAdminToken = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const token = localStorage.getItem('adminToken');
  return Boolean(token && token.includes('.'));
};

export const adminApi = axios.create();

adminApi.interceptors.request.use((config) => ({
  ...config,
  baseURL: getAdminApiBase(),
  headers: {
    ...config.headers,
    ...(typeof window !== 'undefined' && hasValidAdminToken()
      ? { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      : {}),
  },
}));

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAdminSession();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  }
);

export const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isNaN(amount) ? 0 : amount);
};

export const formatDate = (value, options) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString('en-PH', options);
};
