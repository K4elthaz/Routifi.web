import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        // ✅ Refresh the token
        const refreshResponse = await api.post("/app/user/token-refresh/", {}, { withCredentials: true });

        if (refreshResponse.status === 200) {
          console.log("Token refreshed successfully");

          // ✅ Extract new access token from response body
          const newAccessToken = refreshResponse.data.access_token;

          if (newAccessToken) {
            // ✅ Store new token in localStorage (or update axios headers)
            localStorage.setItem("access_token", newAccessToken);
            api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
          }

          // ✅ Retry the original request
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
