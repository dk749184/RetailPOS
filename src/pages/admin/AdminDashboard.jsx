import { useApp } from "../../store/AppContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

// ── Custom Tooltip ───────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-white/15 rounded-xl px-4 py-3 shadow-2xl shadow-black/50">
        <p className="text-slate-400 text-xs font-semibold mb-2">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-white text-sm font-bold">
              ₹{Number(entry.value).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

const formatY = (v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`);

const BAR_COLORS = [
  "#6366f1","#818cf8","#a5b4fc","#c7d2fe",
  "#4f46e5","#4338ca","#6366f1",
];

export default function AdminDashboard() {
  const { bills, products, employees, customers, discounts, getSalesByPeriod } = useApp();

  const today = getSalesByPeriod("daily");
  const week  = getSalesByPeriod("weekly");
  const month = getSalesByPeriod("monthly");

  const sum = (arr) => arr.reduce((a, b) => a + b.total, 0);

  const stats = [
    { label: "Today's Sales",    value: `₹${sum(today).toLocaleString("en-IN")}`, sub: `${today.length} bills`,                              icon: "📅", color: "from-blue-500 to-blue-700",    border: "border-blue-500/20"    },
    { label: "Weekly Sales",     value: `₹${sum(week).toLocaleString("en-IN")}`,  sub: `${week.length} bills`,                               icon: "📆", color: "from-indigo-500 to-indigo-700", border: "border-indigo-500/20"  },
    { label: "Monthly Sales",    value: `₹${sum(month).toLocaleString("en-IN")}`, sub: `${month.length} bills`,                              icon: "🗓️", color: "from-violet-500 to-violet-700", border: "border-violet-500/20"  },
    { label: "Total Products",   value: products.length,                           sub: `${products.filter(p => p.stock < 20).length} low stock`, icon: "📦", color: "from-amber-500 to-orange-600",  border: "border-amber-500/20"   },
    { label: "Active Employees", value: employees.filter(e => e.active).length,   sub: `of ${employees.length} total`,                       icon: "👥", color: "from-emerald-500 to-teal-600",  border: "border-emerald-500/20" },
    { label: "Total Customers",  value: customers.length,                          sub: "registered",                                         icon: "🧑‍🤝‍🧑", color: "from-pink-500 to-rose-600",     border: "border-pink-500/20"    },
  ];

  // ── Employee leaderboard ────────────────────────────────
  const empSales = employees
    .map((e) => {
      const empBills = bills.filter((b) => b.employeeId === e.id);
      return {
        ...e,
        totalSales: empBills.reduce((a, b) => a + b.total, 0),
        billCount: empBills.length,
      };
    })
    .sort((a, b) => b.totalSales - a.totalSales);

  // ── Last 14 days data ────────────────────────────────────
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dayBills = bills.filter(
      (b) => new Date(b.date).toDateString() === d.toDateString()
    );
    return {
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      amount: dayBills.reduce((a, b) => a + b.total, 0),
      count:  dayBills.length,
    };
  });

  // ── Last 7 days mini bars ───────────────────────────────
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayBills = bills.filter(
      (b) => new Date(b.date).toDateString() === d.toDateString()
    );
    return {
      label: d.toLocaleDateString("en-IN", { weekday: "short" }),
      amount: dayBills.reduce((a, b) => a + b.total, 0),
    };
  });

  // ── Recent bills ────────────────────────────────────────
  const recentBills = [...bills]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Overview of all store operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${s.color}/10 border ${s.border} rounded-2xl p-5 hover:-translate-y-0.5 transition-transform duration-200`}
          >
            <div className="text-2xl mb-3">{s.icon}</div>
            <div className="text-2xl font-black text-white">{s.value}</div>
            <div className="text-white font-semibold text-sm mt-1">{s.label}</div>
            <div className="text-slate-500 text-xs mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Area Chart: Last 14 Days */}
        <div className="lg:col-span-2 bg-white/3 border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white font-bold text-lg">Store Revenue — Last 14 Days</h2>
              <p className="text-slate-500 text-xs mt-0.5">Daily sales trend across all employees</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg font-semibold">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              Live
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={last14} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                interval={1}
              />
              <YAxis
                tickFormatter={formatY}
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                name="Revenue"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#adminGrad)"
                dot={{ r: 3, fill: "#6366f1", stroke: "#1e1b4b", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#818cf8", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Bills per day mini bars */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-slate-500 text-xs font-semibold mb-3">Bills per Day</p>
            <ResponsiveContainer width="100%" height={55}>
              <BarChart data={last14} margin={{ top: 0, right: 10, left: 0, bottom: 0 }} barSize={12}>
                <XAxis dataKey="label" hide />
                <Tooltip
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
                        <p className="text-slate-400 mb-1">{label}</p>
                        <p className="text-indigo-300 font-bold">{payload[0].value} bills</p>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {last14.map((_, idx) => (
                    <Cell key={idx} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: Employee Performance + Coupons */}
        <div className="space-y-4">

          {/* Last 7 days mini bar */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <h3 className="text-white font-bold text-sm mb-4">📊 Last 7 Days</h3>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={last7} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatY} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
                        <p className="text-slate-400 mb-1">{label}</p>
                        <p className="text-indigo-300 font-bold">₹{Number(payload[0].value).toLocaleString("en-IN")}</p>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Employee Performance */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <h3 className="text-white font-bold text-sm mb-4">👥 Employee Performance</h3>
            <div className="space-y-3">
              {empSales.map((e, i) => (
                <div key={e.id} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-xs font-semibold truncate">{e.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-white/5 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-700"
                          style={{ width: `${(e.totalSales / (empSales[0]?.totalSales || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-slate-400 text-xs flex-shrink-0">
                        ₹{(e.totalSales / 1000).toFixed(1)}k
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Active Discounts */}
            <div className="mt-5 pt-4 border-t border-white/5">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">🏷️ Active Coupons</h4>
              <div className="space-y-2">
                {discounts
                  .filter((d) => d.active)
                  .slice(0, 3)
                  .map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between bg-white/3 rounded-lg px-3 py-2"
                    >
                      <span className="text-blue-400 font-mono text-xs font-bold">{d.code}</span>
                      <span className="text-emerald-400 text-xs font-semibold">
                        {d.type === "percent" ? `${d.value}% OFF` : `₹${d.value} OFF`}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bills */}
      <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-white font-bold">Recent Transactions</h2>
          <span className="text-slate-500 text-xs">{recentBills.length} latest bills</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                {["Bill #", "Employee", "Customer", "Amount", "Payment", "Date"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentBills.map((b) => {
                const emp  = employees.find((e) => e.id === b.employeeId);
                const cust = customers.find((c) => c.id === b.customerId);
                return (
                  <tr key={b.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3 text-blue-400 font-mono text-sm font-bold">#{b.id}</td>
                    <td className="px-5 py-3 text-slate-300 text-sm">{emp?.name  || "—"}</td>
                    <td className="px-5 py-3 text-slate-300 text-sm">{cust?.name || "—"}</td>
                    <td className="px-5 py-3 text-emerald-400 font-bold text-sm">
                      ₹{b.total.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3">
                      <span className="bg-white/5 border border-white/10 text-slate-400 text-xs px-2.5 py-1 rounded-lg">
                        {b.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(b.date).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
