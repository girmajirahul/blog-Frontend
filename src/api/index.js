/**
 * api/index.js
 *
 * techApi  → POST/GET/PUT/DELETE  /api/tech   (TechBlog schema)
 * genApi   → POST/GET/PUT/DELETE  /api/blogs  (Blog schema)
 */
import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5000";

const http = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.message ??
      err.response?.data?.error ??
      err.message ??
      "Something went wrong";
    return Promise.reject(Object.assign(err, { userMessage: msg }));
  }
);

/* ── /api/tech  (TechBlog) ─────────────────────────────────────── */
export const techApi = {
  getAll:    (page = 1, limit = 5)         => http.get(`/api/tech?page=${page}&limit=${limit}`),
  getBySlug: (slug)     => http.get(`/api/tech/${slug}`),
  create:    (data)     => http.post("/api/tech", data),
  update:    (id, data) => http.put(`/api/tech/${id}`, data),
  delete:    (id)       => http.delete(`/api/tech/${id}`),
};

/* ── /api/blogs  (General Blog) ────────────────────────────────── */
export const genApi = {
  getAll:    (page=1,limit=5)         => http.get(`/api/blogs?page=${page}&limit=${limit}`),
  getAllByUser:  (id)         => http.get(`/api/blogs/users/${id}`),
  getBySlug: (slug)     => http.get(`/api/blogs/${slug}`),
  create:    (data)     => http.post("/api/blogs", data),
  update:    (id, data) => http.put(`/api/blogs/${id}`, data),
  delete:    (id)       => http.delete(`/api/blogs/${id}`),
};


export const blogApi = {
  getCommonBlogs: (page = 1, limit = 10, type = "all") =>
    http.get(
      `/api/blogs/commonblogs?page=${page}&limit=${limit}&type=${type}`
    ),

   importBlog: (formData) =>
    http.post("/api/blogs/import", formData,{
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),  
};

export default http;
