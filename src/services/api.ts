import axios from 'axios';
import { Mutex } from 'async-mutex';

export const mutex = new Mutex();

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
});

// Intercepteur des requêtes (headers dynamiques, etc.)
api.interceptors.request.use(
  async (config) => {
    // config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur des réponses pour gérer les 401 et le refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (!mutex.isLocked()) {
        const release = await mutex.acquire();
        try {
          const refreshResponse = await axios.post(
            `${BASE_API_URL}/jwt/refresh/`,
            {},
            { withCredentials: true }
          );

          if (refreshResponse.status === 200) {
            // Retry original request
            return api(originalRequest);
          } else {
            console.error('Refresh token failed');
          }
        } catch (err) {
          // console.error('Refresh token error:', err);
        } finally {
          release();
        }
      } else {
        await mutex.waitForUnlock();
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
