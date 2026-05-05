/**
 * mockApi.js — Backend unavailable hone par ye mock data use hota hai
 * Poora data localStorage mein store hota hai (offline mode)
 */

// ─── Initial seed data ─────────────────────────────────────────────────────────
const SEED_PRODUCTS = [
  { _id: "p1", id: "p1", name: "Wireless Headphones", category: "Electronics", price: 2999, stock: 45, image: "🎧", barcode: "BAR001", discount: 10, createdAt: new Date().toISOString() },
  { _id: "p2", id: "p2", name: "Mechanical Keyboard",  category: "Electronics", price: 4500, stock: 20, image: "⌨️", barcode: "BAR002", discount: 0,  createdAt: new Date().toISOString() },
  { _id: "p3", id: "p3", name: "USB-C Hub",            category: "Accessories", price: 1299, stock: 60, image: "🔌", barcode: "BAR003", discount: 15, createdAt: new Date().toISOString() },
  { _id: "p4", id: "p4", name: "Laptop Stand",         category: "Accessories", price: 899,  stock: 35, image: "💻", barcode: "BAR004", discount: 0,  createdAt: new Date().toISOString() },
  { _id: "p5", id: "p5", name: "Webcam HD",            category: "Electronics", price: 3200, stock: 15, image: "📷", barcode: "BAR005", discount: 5,  createdAt: new Date().toISOString() },
  { _id: "p6", id: "p6", name: "Mouse Pad XL",         category: "Accessories", price: 499,  stock: 80, image: "🖱️", barcode: "BAR006", discount: 20, createdAt: new Date().toISOString() },
  { _id: "p7", id: "p7", name: "Smart Speaker",        category: "Electronics", price: 5999, stock: 10, image: "🔊", barcode: "BAR007", discount: 0,  createdAt: new Date().toISOString() },
  { _id: "p8", id: "p8", name: "Phone Stand",          category: "Accessories", price: 349,  stock: 55, image: "📱", barcode: "BAR008", discount: 0,  createdAt: new Date().toISOString() },
];

const SEED_EMPLOYEES = [
  { _id: "e1", id: "e1", name: "Rahul Sharma", email: "rahul@store.com", password: "emp123", phone: "9876543210", role: "employee", joinDate: "2024-01-15", active: true },
  { _id: "e2", id: "e2", name: "Priya Verma",  email: "priya@store.com", password: "emp456", phone: "9876543211", role: "employee", joinDate: "2024-03-20", active: true },
  { _id: "e3", id: "e3", name: "Amit Kumar",   email: "amit@store.com",  password: "emp789", phone: "9876543212", role: "employee", joinDate: "2024-06-10", active: true },
];

const SEED_CUSTOMERS = [
  { _id: "c1", id: "c1", name: "Sanjay Gupta", email: "sanjay@gmail.com", phone: "9900001111", address: "Delhi",     totalPurchases: 12500, joinDate: "2024-02-10" },
  { _id: "c2", id: "c2", name: "Meera Patel",  email: "meera@gmail.com",  phone: "9900002222", address: "Mumbai",    totalPurchases: 8700,  joinDate: "2024-04-05" },
  { _id: "c3", id: "c3", name: "Karan Singh",  email: "karan@gmail.com",  phone: "9900003333", address: "Bangalore", totalPurchases: 23400, joinDate: "2023-11-20" },
];

const SEED_DISCOUNTS = [
  { _id: "d1", id: "d1", code: "SAVE10",    type: "percent", value: 10, minOrder: 500,  active: true,  usedCount: 23 },
  { _id: "d2", id: "d2", code: "FLAT200",   type: "flat",    value: 200, minOrder: 1000, active: true,  usedCount: 15 },
  { _id: "d3", id: "d3", code: "MEGA20",    type: "percent", value: 20, minOrder: 2000, active: false, usedCount: 42 },
  { _id: "d4", id: "d4", code: "WELCOME50", type: "flat",    value: 50,  minOrder: 200,  active: true,  usedCount: 8  },
];

// Generate bills for last 30 days
function generateSeedBills() {
  const bills = [];
  const prods = SEED_PRODUCTS;
  const emps  = SEED_EMPLOYEES;
  const custs = SEED_CUSTOMERS;
  const methods = ["Cash", "Card", "UPI"];
  let billNum = 1;

  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const billsPerDay = Math.floor(Math.random() * 5) + 1;

    for (let b = 0; b < billsPerDay; b++) {
      const emp  = emps[Math.floor(Math.random() * emps.length)];
      const cust = custs[Math.floor(Math.random() * custs.length)];
      const numItems = Math.floor(Math.random() * 3) + 1;
      const items = [];
      let subtotal = 0;

      for (let i = 0; i < numItems; i++) {
        const prod = prods[Math.floor(Math.random() * prods.length)];
        const qty  = Math.floor(Math.random() * 3) + 1;
        items.push({ productId: prod._id, name: prod.name, price: prod.price, qty, total: prod.price * qty });
        subtotal += prod.price * qty;
      }

      const discount = Math.random() > 0.6 ? Math.floor(subtotal * 0.1) : 0;
      const total    = subtotal - discount;

      bills.push({
        _id: `b${billNum}`, id: `b${billNum}`,
        employeeId: emp._id, customerId: cust._id,
        items, subtotal, discount, total,
        couponCode: discount > 0 ? "SAVE10" : null,
        date: date.toISOString(),
        paymentMethod: methods[Math.floor(Math.random() * methods.length)],
      });
      billNum++;
    }
  }
  return bills;
}

// ─── LocalStorage helpers ──────────────────────────────────────────────────────
function load(key, seed) {
  const stored = localStorage.getItem(`retailpos_${key}`);
  if (stored) return JSON.parse(stored);
  const data = typeof seed === "function" ? seed() : seed;
  localStorage.setItem(`retailpos_${key}`, JSON.stringify(data));
  return data;
}
function save(key, data) {
  localStorage.setItem(`retailpos_${key}`, JSON.stringify(data));
}
function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ─── MOCK API exports ──────────────────────────────────────────────────────────
export const mockAuthAPI = {
  login: async (email, password) => {
    await delay(300);
    if (email === "admin@store.com" && password === "admin123") {
      const user = { id: "admin", name: "Admin", email, role: "admin" };
      return { token: "mock-jwt-admin", user };
    }
    const employees = load("employees", SEED_EMPLOYEES);
    const emp = employees.find(e => e.email === email.toLowerCase() && e.active);
    if (!emp || emp.password !== password) {
      throw new Error("Invalid email or password");
    }
    const user = { id: emp._id, name: emp.name, email: emp.email, role: emp.role };
    return { token: `mock-jwt-${emp._id}`, user };
  },
};

export const mockProductsAPI = {
  getAll: async () => { await delay(200); return load("products", SEED_PRODUCTS); },
  create: async (data) => {
    await delay(200);
    const products = load("products", SEED_PRODUCTS);
    const p = { ...data, _id: uid(), id: uid(), createdAt: new Date().toISOString() };
    products.unshift(p);
    save("products", products);
    return p;
  },
  update: async (id, data) => {
    await delay(200);
    const products = load("products", SEED_PRODUCTS);
    const idx = products.findIndex(x => x._id === id || x.id === id);
    if (idx === -1) throw new Error("Product not found");
    products[idx] = { ...products[idx], ...data };
    save("products", products);
    return products[idx];
  },
  delete: async (id) => {
    await delay(200);
    const products = load("products", SEED_PRODUCTS);
    save("products", products.filter(x => x._id !== id && x.id !== id));
    return { success: true };
  },
};

export const mockEmployeesAPI = {
  getAll: async () => { await delay(200); return load("employees", SEED_EMPLOYEES); },
  create: async (data) => {
    await delay(200);
    const employees = load("employees", SEED_EMPLOYEES);
    const e = { ...data, _id: uid(), id: uid(), createdAt: new Date().toISOString() };
    employees.unshift(e);
    save("employees", employees);
    return e;
  },
  update: async (id, data) => {
    await delay(200);
    const employees = load("employees", SEED_EMPLOYEES);
    const idx = employees.findIndex(x => x._id === id || x.id === id);
    if (idx === -1) throw new Error("Employee not found");
    employees[idx] = { ...employees[idx], ...data };
    save("employees", employees);
    return employees[idx];
  },
  delete: async (id) => {
    await delay(200);
    const employees = load("employees", SEED_EMPLOYEES);
    save("employees", employees.filter(x => x._id !== id && x.id !== id));
    return { success: true };
  },
};

export const mockCustomersAPI = {
  getAll: async () => { await delay(200); return load("customers", SEED_CUSTOMERS); },
  create: async (data) => {
    await delay(200);
    const customers = load("customers", SEED_CUSTOMERS);
    const c = { ...data, _id: uid(), id: uid(), totalPurchases: 0, joinDate: new Date().toISOString().split("T")[0] };
    customers.unshift(c);
    save("customers", customers);
    return c;
  },
  update: async (id, data) => {
    await delay(200);
    const customers = load("customers", SEED_CUSTOMERS);
    const idx = customers.findIndex(x => x._id === id || x.id === id);
    if (idx === -1) throw new Error("Customer not found");
    customers[idx] = { ...customers[idx], ...data };
    save("customers", customers);
    return customers[idx];
  },
  delete: async (id) => {
    await delay(200);
    const customers = load("customers", SEED_CUSTOMERS);
    save("customers", customers.filter(x => x._id !== id && x.id !== id));
    return { success: true };
  },
};

export const mockDiscountsAPI = {
  getAll: async () => { await delay(200); return load("discounts", SEED_DISCOUNTS); },
  validate: async (code, orderAmount) => {
    await delay(200);
    const discounts = load("discounts", SEED_DISCOUNTS);
    const disc = discounts.find(d => d.code === code.toUpperCase() && d.active);
    if (!disc) throw new Error("Invalid or expired coupon code");
    if (orderAmount < disc.minOrder) throw new Error(`Minimum order ₹${disc.minOrder} required`);
    const amount = disc.type === "percent" ? Math.floor(orderAmount * disc.value / 100) : disc.value;
    return { valid: true, discount: amount, type: disc.type, value: disc.value };
  },
  create: async (data) => {
    await delay(200);
    const discounts = load("discounts", SEED_DISCOUNTS);
    const d = { ...data, code: data.code.toUpperCase(), _id: uid(), id: uid(), usedCount: 0 };
    discounts.unshift(d);
    save("discounts", discounts);
    return d;
  },
  update: async (id, data) => {
    await delay(200);
    const discounts = load("discounts", SEED_DISCOUNTS);
    const idx = discounts.findIndex(x => x._id === id || x.id === id);
    if (idx === -1) throw new Error("Discount not found");
    discounts[idx] = { ...discounts[idx], ...data };
    save("discounts", discounts);
    return discounts[idx];
  },
  delete: async (id) => {
    await delay(200);
    const discounts = load("discounts", SEED_DISCOUNTS);
    save("discounts", discounts.filter(x => x._id !== id && x.id !== id));
    return { success: true };
  },
};

export const mockBillsAPI = {
  getAll: async () => { await delay(200); return load("bills", generateSeedBills); },
  getMy: async () => {
    await delay(200);
    const user = JSON.parse(localStorage.getItem("retailpos_user") || "{}");
    const bills = load("bills", generateSeedBills);
    return bills.filter(b => b.employeeId === user.id);
  },
  create: async (data) => {
    await delay(300);
    const bills = load("bills", generateSeedBills);
    const bill = {
      ...data,
      _id: uid(), id: uid(),
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    bills.unshift(bill);
    save("bills", bills);
    // Update customer totalPurchases
    const customers = load("customers", SEED_CUSTOMERS);
    const cIdx = customers.findIndex(c => c._id === data.customerId || c.id === data.customerId);
    if (cIdx !== -1) {
      customers[cIdx].totalPurchases = (customers[cIdx].totalPurchases || 0) + bill.total;
      save("customers", customers);
    }
    return bill;
  },
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
