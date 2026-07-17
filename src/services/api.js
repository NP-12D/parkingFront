import axios from "axios";

// 1. Create Axios Instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
});

// 2. Request Interceptor: Attach Token (except for login/register)
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Check if the current request is for public auth endpoints
    const isAuthRoute =
      config.url.includes("/users/login") ||
      config.url.includes("/users") ||
      config.url.includes("/users/forgot-password") ||
      config.url.includes("/users/reset-password");

    // Only attach the Bearer token if it exists AND we aren't logging in/registering
    if (token && !isAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor: Auto-logout on expired token (401)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid/expired token
      localStorage.removeItem("token");
      
      // Optional: Redirect user to login page if unauthorized
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;