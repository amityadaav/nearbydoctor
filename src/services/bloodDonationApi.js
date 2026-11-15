// src/services/bloodDonationApi.js
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const API_ROOT = API_BASE.endsWith("/api") ? API_BASE : `${API_BASE}/api`;
const TIMEOUT = 90000; // 90s — Render cold start

async function apiRequest(endpoint, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(`${API_ROOT}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message ||
        data.error ||
        `Request failed (${response.status})`
      );
    }

    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Server is waking up. Please try again in a moment.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export const bloodDonationApi = {
  /* POST /api/donors/register — matches server.js mount */
  registerDonor: (payload) =>
    apiRequest("/donors/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /* GET /api/donors/search?... — matches server.js mount */
  getDonors: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiRequest(`/donors/search${params ? `?${params}` : ""}`);
  },

  /* POST /api/blood-requests — matches server.js mount */
  createBloodRequest: (payload) =>
    apiRequest("/blood-requests", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /* GET /api/blood-requests?... */
  getBloodRequests: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiRequest(`/blood-requests${params ? `?${params}` : ""}`);
  },
};