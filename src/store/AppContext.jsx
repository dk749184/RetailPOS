import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  authAPI, productsAPI, employeesAPI, customersAPI,
  discountsAPI, billsAPI, setToken, clearToken, getToken,
} from "../utils/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [products,    setProducts]    = useState([]);
  const [employees,   setEmployees]   = useState([]);
  const [customers,   setCustomers]   = useState([]);
  const [discounts,   setDiscounts]   = useState([]);
  const [bills,       setBills]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [dbError,     setDbError]     = useState(null);

  // Normalise MongoDB _id -> id so existing UI code still works
  const norm = (arr) =>
    arr.map((item) => {
      const obj = { ...item };
      if (obj._id && !obj.id) obj.id = obj._id;
      if (obj.employeeId?._id) obj.employeeId = obj.employeeId._id;
      if (obj.customerId?._id)  obj.customerId  = obj.customerId._id;
      return obj;
    });

  const loadAll = useCallback(async () => {
    setLoading(true);
    setDbError(null);
    try {
      const [prods, emps, custs, discs, bls] = await Promise.all([
        productsAPI.getAll(),
        employeesAPI.getAll(),
        customersAPI.getAll(),
        discountsAPI.getAll(),
        billsAPI.getAll(),
      ]);
      setProducts(norm(prods));
      setEmployees(norm(emps));
      setCustomers(norm(custs));
      setDiscounts(norm(discs));
      setBills(norm(bls));
    } catch (err) {
      setDbError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-hydrate on page refresh
  useEffect(() => {
    const token = getToken();
    const saved = localStorage.getItem("retailpos_user");
    if (token && saved) {
      setCurrentUser(JSON.parse(saved));
      loadAll();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const { token, user } = await authAPI.login(email, password);
      setToken(token);
      localStorage.setItem("retailpos_user", JSON.stringify(user));
      setCurrentUser(user);
      await loadAll();
      return { success: true, role: user.role };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem("retailpos_user");
    setCurrentUser(null);
    setProducts([]); setEmployees([]);
    setCustomers([]); setDiscounts([]); setBills([]);
  };

  const addProduct = async (data) => {
    const p = await productsAPI.create(data);
    setProducts((prev) => [{ ...p, id: p._id }, ...prev]);
    return p;
  };
  const updateProduct = async (id, data) => {
    const p = await productsAPI.update(id, data);
    setProducts((prev) => prev.map((x) => x.id === id ? { ...p, id: p._id } : x));
  };
  const deleteProduct = async (id) => {
    await productsAPI.delete(id);
    setProducts((prev) => prev.filter((x) => x.id !== id));
  };

  const addEmployee = async (data) => {
    const e = await employeesAPI.create(data);
    setEmployees((prev) => [{ ...e, id: e._id }, ...prev]);
    return e;
  };
  const updateEmployee = async (id, data) => {
    const e = await employeesAPI.update(id, data);
    setEmployees((prev) => prev.map((x) => x.id === id ? { ...e, id: e._id } : x));
  };
  const deleteEmployee = async (id) => {
    await employeesAPI.delete(id);
    setEmployees((prev) => prev.filter((x) => x.id !== id));
  };

  const addCustomer = async (data) => {
    const c = await customersAPI.create(data);
    const n = { ...c, id: c._id };
    setCustomers((prev) => [n, ...prev]);
    return n;
  };
  const updateCustomer = async (id, data) => {
    const c = await customersAPI.update(id, data);
    setCustomers((prev) => prev.map((x) => x.id === id ? { ...c, id: c._id } : x));
  };
  const deleteCustomer = async (id) => {
    await customersAPI.delete(id);
    setCustomers((prev) => prev.filter((x) => x.id !== id));
  };

  const addDiscount = async (data) => {
    const d = await discountsAPI.create(data);
    setDiscounts((prev) => [{ ...d, id: d._id }, ...prev]);
  };
  const updateDiscount = async (id, data) => {
    const d = await discountsAPI.update(id, data);
    setDiscounts((prev) => prev.map((x) => x.id === id ? { ...d, id: d._id } : x));
  };
  const deleteDiscount = async (id) => {
    await discountsAPI.delete(id);
    setDiscounts((prev) => prev.filter((x) => x.id !== id));
  };

  const addBill = async (billData) => {
    const bill = await billsAPI.create(billData);
    const normalized = { ...bill, id: bill._id };
    setBills((prev) => [normalized, ...prev]);
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === billData.customerId
          ? { ...c, totalPurchases: (c.totalPurchases || 0) + bill.total }
          : c
      )
    );
    return normalized;
  };

  const getEmployeeBills = (empId) =>
    bills.filter((b) => b.employeeId === empId || b.employeeId?._id === empId);

  const getSalesByPeriod = (period) => {
    const now = new Date();
    return bills.filter((b) => {
      const bd = new Date(b.date);
      if (period === "daily")   return bd.toDateString() === now.toDateString();
      if (period === "weekly")  return (now - bd) / 86400000 <= 7;
      if (period === "monthly") return (now - bd) / 86400000 <= 30;
      return true;
    });
  };

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center flex-col gap-4">
        <svg className="w-10 h-10 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <p className="text-slate-400 font-semibold">Connecting to database…</p>
      </div>
    );
  }

  if (dbError && currentUser) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <div className="text-4xl mb-4">🔌</div>
          <h2 className="text-white font-bold text-xl mb-2">Database Connection Failed</h2>
          <p className="text-slate-400 text-sm mb-4">{dbError}</p>
          <p className="text-slate-500 text-xs mb-4">Make sure MongoDB is running and backend server is started.</p>
          <code className="block bg-black/30 rounded-lg px-4 py-2 text-green-400 text-xs text-left">
            cd backend && npm run dev
          </code>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      currentUser, login, logout,
      products,  addProduct,  updateProduct,  deleteProduct,
      employees, addEmployee, updateEmployee, deleteEmployee,
      customers, addCustomer, updateCustomer, deleteCustomer,
      discounts, addDiscount, updateDiscount, deleteDiscount,
      bills, addBill, getEmployeeBills, getSalesByPeriod,
      loading, dbError, loadAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
