// src/api/bloodApi.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
});

API.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    const status  = err.response?.status;
    const message = err.response?.data?.message || err.response?.data?.error || err.message || "Something went wrong";

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

export const bloodApi = {
  summary: () => API.get("/blood-stats/summary").then((r) => r.data),
  groupStats: () => API.get("/blood-stats/groups").then((r) => r.data),
  urgentRequests: () => API.get("/blood-stats/urgent").then((r) => r.data),
  compatibility: (group) =>
    API.get(`/blood-stats/compatibility/${encodeURIComponent(group)}`).then((r) => r.data),

  searchDonors: (params) =>
    API.get("/donors/search", { params }).then((r) => r.data),
  registerDonor: (body) =>
    API.post("/donors/register", body).then((r) => r.data),
  myDonorProfile: () => API.get("/donors/me/profile").then((r) => r.data),
  updateMyDonor: (body) =>
    API.put("/donors/me/profile", body).then((r) => r.data),
  toggleAvailability: (available) =>
    API.put("/donors/me/availability", { available }).then((r) => r.data),
  contactDonor: (id) =>
    API.post(`/donors/${id}/contact`).then((r) => r.data),
  recordDonation: (body) =>
    API.post("/donors/me/donations", body).then((r) => r.data),
  myDonations: () => API.get("/donors/me/donations").then((r) => r.data),

  createRequest: (body) =>
    API.post("/blood-requests", body).then((r) => r.data),
  listRequests: (params) =>
    API.get("/blood-requests", { params }).then((r) => r.data),
  myRequests: () => API.get("/blood-requests/my").then((r) => r.data),
  getRequest: (id) =>
    API.get(`/blood-requests/${id}`).then((r) => r.data),
  respondToRequest: (id, status = "interested") =>
    API.post(`/blood-requests/${id}/respond`, { status }).then((r) => r.data),
  updateRequestStatus: (id, status) =>
    API.put(`/blood-requests/${id}/status`, { status }).then((r) => r.data),
};

export default API;