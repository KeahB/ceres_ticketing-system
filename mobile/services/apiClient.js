import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';
import { getConductorSession } from './authService';

export const conductorApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/api/conductors`,
  timeout: 10000,
});

conductorApi.interceptors.request.use(async (config) => {
  const session = await getConductorSession();

  return {
    ...config,
    headers: {
      ...config.headers,
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
    },
  };
});
