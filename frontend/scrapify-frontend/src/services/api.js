import axios from "axios";
import { loadFromStorage, removeFromStorage, saveToStorage, STORAGE_KEYS } from "./storage.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

export function getToken() {
  return loadFromStorage(STORAGE_KEYS.token, null);
}

export function saveToken(token) {
  saveToStorage(STORAGE_KEYS.token, token);
}

export function clearToken() {
  removeFromStorage(STORAGE_KEYS.token);
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const HANDLES_OWN_401 = ["/auth/login", "/auth/register", "/auth/me"];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isOwn401 = HANDLES_OWN_401.some((path) => error.config?.url?.endsWith(path));
    if (error.response?.status === 401 && !isOwn401) {
      clearToken();
      if (window.location.pathname !== "/login") window.location.assign("/login");
    }
    return Promise.reject(error);
  },
);

export function apiErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.request) return "Can't reach the Scrapify server. Check that the backend is running.";
  return error.message;
}

export default api;
