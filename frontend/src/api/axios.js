import axios from 'axios';

export const authTokenStorageKey = 'cliniccare_auth_token';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '');
const defaultApiUrl = import.meta.env.PROD
  ? 'https://clinical-appointment-application-dj.vercel.app/api'
  : 'http://localhost:5000/api';
const apiBaseUrl = configuredApiUrl
  ? configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`
  : defaultApiUrl;

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: { Accept: 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(authTokenStorageKey);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
