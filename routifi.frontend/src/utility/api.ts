import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ✅ Ensures cookies are sent with requests
});

// Interceptor for handling token expiration and refreshing the token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        // ✅ Refresh the token
        const refreshResponse = await api.post("/app/user/token/refresh/", {}, { withCredentials: true });

        if (refreshResponse.status === 200) {
          console.log("Token refreshed successfully");

          // ✅ Retry the original request AFTER ensuring cookies are updated
          return api(error.config);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        window.location.href = "/login"; // Redirect to login if refresh fails
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
