import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:3000/api");

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window === "undefined") {
      return config;
    }

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

      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("refresh_token")
          : null;

      if (!refreshToken) {
        if (typeof window !== "undefined") {
          localStorage.clear();
          window.location.href = "/admin/login";
        }
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          `${API_BASE_URL}/admin/auth/refresh`,
          { refresh_token: refreshToken }
        );

        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", res.data.access_token);
        }

        originalRequest.headers.set(
          "Authorization",
          `Bearer ${res.data.access_token}`
        );

        return api(originalRequest);
      } catch {
        if (typeof window !== "undefined") {
          localStorage.clear();
          window.location.href = "/admin/login";
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

