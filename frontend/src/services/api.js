import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const login = (username, password) =>
  api.post("/auth/login", { username, password });
export const getGuards = () => api.get("/auth/users");

// Guest APIs
export const guestCheckIn = (data) =>
  api.post("/transactions/guest/checkin", data);
export const guestCheckOut = (data) =>
  api.post("/transactions/guest/checkout", data);
export const searchGuestEquipment = (query) =>
  api.get(`/transactions/guest/search?query=${query}`);
export const getActiveGuests = () => api.get("/transactions/guest/active");

// Company APIs
export const companyEquipmentOut = (data) =>
  api.post("/transactions/company/out", data);
export const companyEquipmentIn = (data) =>
  api.post("/transactions/company/in", data);
export const getActiveCompanyEquipment = () =>
  api.get("/transactions/company/active");
export const getOverdueCompanyEquipment = () =>
  api.get("/transactions/company/overdue");
export const reportToManager = (data) =>
  api.post("/transactions/company/report", data);

// Dashboard APIs
export const getStatistics = () => api.get("/transactions/statistics");
export const getRecentActivity = () => api.get("/transactions/recent");
export const getTodayCheckins = () => api.get("/transactions/today/checkins");
export const getTodayCheckouts = () => api.get("/transactions/today/checkouts");

// Legacy/Compatibility
export const getActiveCheckouts = () => api.get("/transactions/active");
export const getOverdueItems = () => api.get("/transactions/overdue");
export const getTodayActivity = () => api.get("/transactions/today");
export const getHistory = (page = 1, limit = 50, type = "all") =>
  api.get(`/transactions/history?page=${page}&limit=${limit}&type=${type}`);
export const searchTransactions = (query) =>
  api.get(`/transactions/search?query=${query}`);

// Aliases for backward compatibility
export const checkOutGuest = guestCheckIn;
export const checkOutStaff = companyEquipmentOut;
export const checkIn = companyEquipmentIn;
export const getActiveStaff = getActiveCompanyEquipment;

export default api;
