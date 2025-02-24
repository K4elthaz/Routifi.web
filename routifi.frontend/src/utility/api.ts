import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ✅ Ensure cookies are sent with requests
});

// ✅ Function to refresh the access token
const refreshToken = async () => {
  try {
    const response = await axios.post(`${API_URL}/app/token-refresh/`, {}, { withCredentials: true });
    return response.data.access_token;
  } catch (error) {
    console.error("Token refresh failed", error);
    throw error; // Ensure logout or redirect happens if refresh fails
  }
};

// ✅ Axios Interceptor to handle expired tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const newAccessToken = await refreshToken();
        error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api.request(error.config); // Retry failed request
      } catch (refreshError) {
        console.error("Session expired, redirecting to login...");
        window.location.href = "/sign-in";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);


export default api;
