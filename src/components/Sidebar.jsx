import { useApp } from "../store/AppContext";

export default function Sidebar({ role, activePage, setActivePage }) {
  const { currentUser, logout } = useApp();

  const adminNav = [
    { id: "dashboard",   label: "Dashboard",       icon: "📊" },
    { id: "products",    label: "Products",         icon: "📦" },
    { id: "discounts",   label: "Discounts",        icon: "🏷️" },
    { id: "employees",   label: "Employees",        icon: "👥" },
    { id: "customers",   label: "Customers",        icon: "🧑‍🤝‍🧑" },
    { id: "reports",     label: "Sales Reports",    icon: "📈" },
    { id: "predictions", label: "AI Predictions",   icon: "🤖" },
  ];

  const employeeNav = [
    { id: "dashboard", label: "Dashboard",     icon: "📊" },
    { id: "billing",   label: "Generate Bill", icon: "🧾" },
    { id: "history",   label: "Sales History", icon: "📋" },
    { id: "customers", label: "Customers",     icon: "🧑‍🤝‍🧑" },
  ];

  const nav = role === "admin" ? adminNav : employeeNav;

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-slate-900 border-r border-white/5 flex flex-col z-40 overflow-y-auto">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-xl">🛒</span>
          </div>
          <div>
            <div className="text-white font-black text-lg leading-none">RetailPOS</div>
            <div className="text-blue-400 text-xs font-semibold tracking-widest uppercase mt-0.5">
              {role === "admin" ? "Admin Panel" : "Employee Portal"}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              activePage === item.id
                ? item.id === "predictions"
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30"
                  : "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
            {activePage === item.id && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
            )}
            {item.id === "predictions" && activePage !== "predictions" && (
              <span className="ml-auto text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded-md">
                AI
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="bg-white/3 border border-white/8 rounded-xl p-4 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${role === "admin" ? "bg-amber-500/20 text-amber-400" : "bg-green-500/20 text-green-400"}`}>
              {currentUser?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold truncate">{currentUser?.name}</div>
              <div className={`text-xs font-medium ${role === "admin" ? "text-amber-400" : "text-green-400"}`}>
                {role === "admin" ? "👑 Admin" : "👤 Employee"}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold py-2.5 rounded-xl hover:bg-red-500/20 transition-all"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
