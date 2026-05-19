import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || (error.response.status === 400 && error.response.data.error === 'Token no válido'))) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const login = (email, password) => api.post('auth/login', { email, password });
export const register = (email, password, nombre) => api.post('auth/register', { email, password, nombre });

export const getStats = () => api.get('/stats');
export const getActivity = () => api.get('/activity');
export const searchGlobal = (query) => api.get(`/search?q=${query}`);

export const getLocations = () => api.get('locations');
export const createLocation = (data) => api.post('locations', data);
export const getBoxes = () => api.get('boxes');
export const getBox = (id) => api.get(`boxes/${id}`);
export const createBox = (data) => api.post('boxes', data);
export const updateBox = (id, data) => api.put(`boxes/${id}`, data);
export const deleteBox = (id) => api.delete(`boxes/${id}`);
export const getItems = () => api.get('items');
export const createItem = (data) => api.post('items', data);
export const updateItem = (id, data) => api.put(`items/${id}`, data);
export const deleteItem = (id) => api.delete(`items/${id}`);

export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:3080/api').replace(/\/api\/?$/, '');
  return `${backendBase}${url}`;
};

export default api;
