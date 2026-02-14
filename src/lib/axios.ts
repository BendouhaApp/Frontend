import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: false,
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/admin/auth/refresh")
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/admin/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/admin/auth/refresh`,
          { refresh_token: refreshToken }
        );

        localStorage.setItem("access_token", res.data.access_token);

        originalRequest.headers.set(
          "Authorization",
          `Bearer ${res.data.access_token}`
        );

        return api(originalRequest);
      } catch {
        localStorage.clear();
        window.location.href = "/admin/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
