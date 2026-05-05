// @ts-nocheck
import { useState } from "react";
import { AppProvider, useApp } from "./store/AppContext";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";

import AdminDashboard  from "./pages/admin/AdminDashboard";
import Products        from "./pages/admin/Products";
import Discounts       from "./pages/admin/Discounts";
import Employees       from "./pages/admin/Employees";
import Customers       from "./pages/admin/Customers";
import Reports         from "./pages/admin/Reports";
import SalesPrediction from "./pages/admin/SalesPrediction";

import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import BillGenerator     from "./pages/employee/BillGenerator";
import SalesHistory      from "./pages/employee/SalesHistory";

function AppContent() {
  const { currentUser } = useApp();
  const [activePage, setActivePage] = useState("dashboard");

  // currentUser is set by AppContext (from JWT in localStorage or after login)
  if (!currentUser) {
    return <Login />;
  }

  const role = currentUser.role;

  const renderPage = () => {
    if (role === "admin") {
      switch (activePage) {
        case "dashboard":   return <AdminDashboard />;
        case "products":    return <Products />;
        case "discounts":   return <Discounts />;
        case "employees":   return <Employees />;
        case "customers":   return <Customers />;
        case "reports":     return <Reports />;
        case "predictions": return <SalesPrediction />;
        default:            return <AdminDashboard />;
      }
    } else {
      switch (activePage) {
        case "dashboard": return <EmployeeDashboard />;
        case "billing":   return <BillGenerator />;
        case "history":   return <SalesHistory />;
        case "customers": return <Customers isEmployee={true} />;
        default:          return <EmployeeDashboard />;
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar role={role} activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 ml-64 h-screen overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
