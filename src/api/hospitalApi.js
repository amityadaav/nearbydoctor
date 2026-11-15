// src/api/hospitalApi.js
import axios from "axios";

/* ------------------------------------------------------------------ */
/*  Base client                                                        */
/* ------------------------------------------------------------------ */
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/hospitals`,
  timeout: 60000, // Render free tier cold starts take 30–60s
  headers: { "Content-Type": "application/json" },
});

/* Attach JWT if present (harmless for public endpoints) */
API.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

/* Normalise errors + handle expired auth */
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Something went wrong";

    if (status === 401 || /invalid or expired token|jwt expired/i.test(message)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      const here = window.location.pathname + window.location.search;
      if (!window.location.pathname.startsWith("/login")) {
        window.location.replace(`/login?next=${encodeURIComponent(here)}`);
      }
    }
    return Promise.reject(new Error(message));
  }
);

/* ------------------------------------------------------------------ */
/*  API functions                                                      */
/* ------------------------------------------------------------------ */
export const registerHospital = async (hospitalData) => {
  const { data } = await API.post("/register", hospitalData);
  return data;
};

export const getAllHospitals = async (params = {}) => {
  const { data } = await API.get("/", { params });
  return data;
};

export const getHospitalById = async (id) => {
  if (!id) throw new Error("Hospital id is required");
  const { data } = await API.get(`/${encodeURIComponent(id)}`);
  return data;
};

export const updateHospital = async (id, hospitalData) => {
  if (!id) throw new Error("Hospital id is required");
  const { data } = await API.put(`/${encodeURIComponent(id)}`, hospitalData);
  return data;
};

export const deleteHospital = async (id) => {
  if (!id) throw new Error("Hospital id is required");
  const { data } = await API.delete(`/${encodeURIComponent(id)}`);
  return data;
};

export default API;