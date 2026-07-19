import axios from "axios";

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? "http://localhost:5000",
  withCredentials: true, // ← cookies ke liye zaroori
  headers: { "Content-Type": "application/json" },
});

// Auto attach access token every request
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto refresh token if 401
// authApi.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     const original = error.config;
//     if (error.response?.status === 401 && !original._retry) {
//       original._retry = true;
//       try {
//         const res = await authApi.post("/api/auth/refresh");
//         const newToken = res.data.accessToken;
//         localStorage.setItem("accessToken", newToken);
//         original.headers.Authorization = `Bearer ${newToken}`;
//         return authApi(original);
//       } catch {
//         localStorage.removeItem("accessToken");
//         window.location.href = "/";
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export const authService = {
  register: (data) => authApi.post("/api/auth/register", data),
  login:    (data) => authApi.post("/api/auth/login", data),
  logout:   ()     => authApi.post("/api/auth/logout"),
  getMe:    ()     => authApi.get("/api/auth/me"),
};

export default authApi;