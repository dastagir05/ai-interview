import axios from "axios";
import {env} from "@/data/env/server";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, 
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// Request interceptor - cookies are sent automatically with withCredentials
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${env.BACKEND_URL}/auth/refresh`,
          {},
          { withCredentials: true } 
        );

        if (response.data.accessToken) {
          localStorage.setItem("accessToken", response.data.accessToken);
          
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        window.location.href = "/signin";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;