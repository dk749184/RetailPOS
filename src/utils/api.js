/**
 * api.js — Frontend ke sabhi API calls yahan se jaate hain
 * Auto-fallback: Agar backend (MongoDB) available nahi hai to mock localStorage use hoga
 */

import {
  mockAuthAPI, mockProductsAPI, mockEmployeesAPI,
  mockCustomersAPI, mockDiscountsAPI, mockBillsAPI,
} from "./mockApi.js";

const BASE = "https://retail-pos-backend.vercel.app/api";

// ─── Token helpers ─────────────────────────────────────────────────────────────
export const getToken   = ()  => localStorage.getItem("token");
export const setToken   = (t) => localStorage.setItem("token", t);
export const clearToken = ()  => localStorage.removeItem("token");

// ─── Backend availability check ────────────────────────────────────────────────
let _backendAvailable = null;
let _checkPromise     = null;

async function checkBackend() {
  if (_backendAvailable !== null) return _backendAvailable;
  if (_checkPromise) return _checkPromise;

  _checkPromise = (async () => {
    try {
      const res = await fetch(`${BASE}/health`, { signal: AbortSignal.timeout(2500) });
      _backendAvailable = res.ok;
    } catch {
      _backendAvailable = false;
    }
    return _backendAvailable;
  })();

  return _checkPromise;
}

export function resetBackendCheck() {
  _backendAvailable = null;
  _checkPromise     = null;
}

// ─── Core fetch wrapper ────────────────────────────────────────────────────────
async function api(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
  return data;
}

// ─── Smart: backend try then mock fallback ──────────────────────────────────────
async function smartCall(realFn, mockFn) {
  const available = await checkBackend();
  if (!available) return mockFn();
  try {
    return await realFn();
  } catch (err) {
    if (err instanceof TypeError || err.message.includes("fetch")) {
      _backendAvailable = false;
      return mockFn();
    }
    throw err;
  }
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    smartCall(
      () => api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
      () => mockAuthAPI.login(email, password)
    ),
};

// ─── Products ──────────────────────────────────────────────────────────────────
export const productsAPI = {
  getAll: ()         => smartCall(() => api("/products"),                                                                              () => mockProductsAPI.getAll()),
  create: (data)     => smartCall(() => api("/products",       { method: "POST",   body: JSON.stringify(data) }),                     () => mockProductsAPI.create(data)),
  update: (id, data) => smartCall(() => api(`/products/${id}`, { method: "PUT",    body: JSON.stringify(data) }),                     () => mockProductsAPI.update(id, data)),
  delete: (id)       => smartCall(() => api(`/products/${id}`, { method: "DELETE" }),                                                 () => mockProductsAPI.delete(id)),
};

// ─── Employees ─────────────────────────────────────────────────────────────────
export const employeesAPI = {
  getAll: ()         => smartCall(() => api("/employees"),                                                                             () => mockEmployeesAPI.getAll()),
  create: (data)     => smartCall(() => api("/employees",       { method: "POST",   body: JSON.stringify(data) }),                    () => mockEmployeesAPI.create(data)),
  update: (id, data) => smartCall(() => api(`/employees/${id}`, { method: "PUT",    body: JSON.stringify(data) }),                    () => mockEmployeesAPI.update(id, data)),
  delete: (id)       => smartCall(() => api(`/employees/${id}`, { method: "DELETE" }),                                                () => mockEmployeesAPI.delete(id)),
};

// ─── Customers ─────────────────────────────────────────────────────────────────
export const customersAPI = {
  getAll: ()         => smartCall(() => api("/customers"),                                                                             () => mockCustomersAPI.getAll()),
  create: (data)     => smartCall(() => api("/customers",       { method: "POST",   body: JSON.stringify(data) }),                    () => mockCustomersAPI.create(data)),
  update: (id, data) => smartCall(() => api(`/customers/${id}`, { method: "PUT",    body: JSON.stringify(data) }),                    () => mockCustomersAPI.update(id, data)),
  delete: (id)       => smartCall(() => api(`/customers/${id}`, { method: "DELETE" }),                                                () => mockCustomersAPI.delete(id)),
};

// ─── Discounts ─────────────────────────────────────────────────────────────────
export const discountsAPI = {
  getAll:   ()                  => smartCall(() => api("/discounts"),                                                                  () => mockDiscountsAPI.getAll()),
  validate: (code, orderAmount) => smartCall(() => api("/discounts/validate", { method: "POST", body: JSON.stringify({ code, orderAmount }) }), () => mockDiscountsAPI.validate(code, orderAmount)),
  create:   (data)              => smartCall(() => api("/discounts",       { method: "POST",   body: JSON.stringify(data) }),          () => mockDiscountsAPI.create(data)),
  update:   (id, data)          => smartCall(() => api(`/discounts/${id}`, { method: "PUT",    body: JSON.stringify(data) }),          () => mockDiscountsAPI.update(id, data)),
  delete:   (id)                => smartCall(() => api(`/discounts/${id}`, { method: "DELETE" }),                                     () => mockDiscountsAPI.delete(id)),
};

// ─── Bills ─────────────────────────────────────────────────────────────────────
export const billsAPI = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return smartCall(
      () => api(`/bills${q ? "?" + q : ""}`),
      () => mockBillsAPI.getAll()
    );
  },
  getMy:  ()     => smartCall(() => api("/bills/my"),                                                 () => mockBillsAPI.getMy()),
  create: (data) => smartCall(() => api("/bills", { method: "POST", body: JSON.stringify(data) }),    () => mockBillsAPI.create(data)),
};
