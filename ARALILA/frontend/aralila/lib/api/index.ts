// import axios from "axios";
import axios from "axios";
import { ACCESS_TOKEN } from "../constants";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - maybe redirect to login
      localStorage.removeItem('ACCESS_TOKEN');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api