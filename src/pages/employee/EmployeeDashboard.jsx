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
  Legend,
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
              {entry.name === "Sales" ? `₹${Number(entry.value).toLocaleString("en-IN")}` : `${entry.value} bills`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

// ── Y-Axis formatter ─────────────────────────────────────────
const formatY = (v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`);

export default function EmployeeDashboard() {
  const { currentUser, bills, customers, products } = useApp();

  const myBills = bills.filter((b) => b.employeeId === currentUser.id);

  const now = new Date();
  const todayBills = myBills.filter((b) => new Date(b.date).toDateString() === now.toDateString());
  const weekBills = myBills.filter((b) => (now - new Date(b.date)) / 86400000 <= 7);
  const monthBills = myBills.filter((b) => (now - new Date(b.date)) / 86400000 <= 30);

  const sum = (arr) => arr.reduce((a, b) => a + b.total, 0);

  const stats = [
    {
      label: "Today's Sales",
      val: `₹${sum(todayBills).toLocaleString("en-IN")}`,
      sub: `${todayBills.length} bills`,
      icon: "📅",
      color: "from-blue-500 to-blue-700",
      border: "border-blue-500/20",
    },
    {
      label: "This Week",
      val: `₹${sum(weekBills).toLocaleString("en-IN")}`,
      sub: `${weekBills.length} bills`,
      icon: "📆",
      color: "from-indigo-500 to-indigo-700",
      border: "border-indigo-500/20",
    },
    {
      label: "This Month",
      val: `₹${sum(monthBills).toLocaleString("en-IN")}`,
      sub: `${monthBills.length} bills`,
      icon: "🗓️",
      color: "from-violet-500 to-violet-700",
      border: "border-violet-500/20",
    },
    {
      label: "Total Bills",
      val: myBills.length,
      sub: "all time",
      icon: "🧾",
      color: "from-emerald-500 to-teal-700",
      border: "border-emerald-500/20",
    },
  ];

  // ── Last 14 days data ────────────────────────────────────
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dayBills = myBills.filter(
      (b) => new Date(b.date).toDateString() === d.toDateString()
    );
    const amount = dayBills.reduce((a, b) => a + b.total, 0);
    const count = dayBills.length;
    const label = d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
    return { label, amount, count };
  });

  // ── Weekly comparison (last 4 weeks) ────────────────────
  const weekly = Array.from({ length: 4 }, (_, i) => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (3 - i) * 7 - 6);
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() - (3 - i) * 7);
    const wBills = myBills.filter((b) => {
      const bd = new Date(b.date);
      return bd >= weekStart && bd <= weekEnd;
    });
    const label = `W${4 - (3 - i)}`;
    return {
      label,
      amount: wBills.reduce((a, b) => a + b.total, 0),
      count: wBills.length,
    };
  });

  // ── Top customers ────────────────────────────────────────
  const custSales = customers
    .map((c) => {
      const custBills = myBills.filter((b) => b.customerId === c.id);
      return {
        ...c,
        mySpend: custBills.reduce((a, b) => a + b.total, 0),
        billCount: custBills.length,
      };
    })
    .filter((c) => c.mySpend > 0)
    .sort((a, b) => b.mySpend - a.mySpend);

  // ── Most sold products ───────────────────────────────────
  const prodSales = {};
  myBills.forEach((b) =>
    b.items.forEach((item) => {
      prodSales[item.productId] = (prodSales[item.productId] || 0) + item.qty;
    })
  );
  const topProds = products
    .map((p) => ({ ...p, sold: prodSales[p.id] || 0 }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  // ── Recent bills ─────────────────────────────────────────
  const recentBills = [...myBills]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  // bar chart COLORS
  const BAR_COLORS = [
    "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe",
    "#4f46e5", "#4338ca", "#6366f1", "#818cf8",
    "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe",
    "#4f46e5", "#4338ca",
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            Welcome, {currentUser.name}! 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Here's your sales performance overview
          </p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Active Shift
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${s.color}/10 border ${s.border} rounded-2xl p-5 hover:-translate-y-0.5 transition-transform duration-200`}
          >
            <div className="text-2xl mb-3">{s.icon}</div>
            <div className="text-2xl font-black text-white">{s.val}</div>
            <div className="text-white text-sm font-semibold mt-1">{s.label}</div>
            <div className="text-slate-500 text-xs mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Area Chart: Last 14 Days ─────────────────────── */}
        <div className="lg:col-span-2 bg-white/3 border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white font-bold text-lg">My Sales — Last 14 Days</h2>
              <p className="text-slate-500 text-xs mt-0.5">Daily revenue trend</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
                Revenue
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={last14}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
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
                name="Sales"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#salesGrad)"
                dot={{ r: 3, fill: "#6366f1", stroke: "#1e1b4b", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#818cf8", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Mini bill-count bar chart below */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-slate-500 text-xs font-semibold mb-3">Bills per Day</p>
            <ResponsiveContainer width="100%" height={60}>
              <BarChart
                data={last14}
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                barSize={12}
              >
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
                <Bar dataKey="count" name="Bills" radius={[3, 3, 0, 0]}>
                  {last14.map((_, idx) => (
                    <Cell key={idx} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Right Side Panel ─────────────────────────────── */}
        <div className="space-y-4">

          {/* Weekly comparison */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <h3 className="text-white font-bold text-sm mb-4">📅 Weekly Comparison</h3>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart
                data={weekly}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                barSize={24}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tickFormatter={formatY} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
                        <p className="text-slate-400 mb-1">{label}</p>
                        <p className="text-indigo-300 font-bold">₹{Number(payload[0].value).toLocaleString("en-IN")}</p>
                        <p className="text-slate-400">{payload[1]?.value} bills</p>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="amount" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Customers */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <h3 className="text-white font-bold text-sm mb-3">🏆 Top Customers</h3>
            <div className="space-y-2.5">
              {custSales.slice(0, 4).map((c, i) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 bg-white/3 border border-white/5 rounded-xl p-2.5"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-xs font-semibold truncate">{c.name}</div>
                    <div className="text-slate-500 text-xs">{c.billCount} bills</div>
                  </div>
                  <div className="text-emerald-400 font-bold text-xs">
                    ₹{(c.mySpend / 1000).toFixed(1)}k
                  </div>
                </div>
              ))}
              {custSales.length === 0 && (
                <p className="text-slate-500 text-xs text-center py-3">
                  No customer data yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Top Products + Recent Bills ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Top Products horizontal bar */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-5">🔥 Top Selling Products</h2>
          <div className="space-y-3">
            {topProds.map((p, i) => {
              const maxSold = topProds[0]?.sold || 1;
              const pct = Math.max((p.sold / maxSold) * 100, 2);
              const colors = [
                "from-indigo-500 to-blue-500",
                "from-violet-500 to-purple-500",
                "from-blue-500 to-cyan-500",
                "from-emerald-500 to-teal-500",
                "from-amber-500 to-orange-500",
              ];
              return (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{p.image}</span>
                      <span className="text-white text-sm font-medium truncate max-w-[120px]">{p.name}</span>
                    </div>
                    <span className="text-amber-400 text-xs font-black">{p.sold} sold</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${colors[i]} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {topProds.every((p) => p.sold === 0) && (
              <p className="text-slate-500 text-sm text-center py-4">No sales data yet</p>
            )}
          </div>
        </div>

        {/* Recent Bills Table */}
        <div className="lg:col-span-2 bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h2 className="text-white font-bold">My Recent Bills</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/3">
                  {["Bill #", "Customer", "Items", "Discount", "Amount", "Payment", "Date"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentBills.map((b) => {
                  const cust = customers.find((c) => c.id === b.customerId);
                  return (
                    <tr key={b.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3 text-blue-400 font-mono text-sm font-bold">#{b.id}</td>
                      <td className="px-5 py-3 text-slate-300 text-sm">{cust?.name || "—"}</td>
                      <td className="px-5 py-3 text-slate-400 text-sm">{b.items.length} items</td>
                      <td className="px-5 py-3">
                        {b.discount > 0 ? (
                          <span className="text-amber-400 text-sm font-bold">-₹{b.discount}</span>
                        ) : (
                          <span className="text-slate-600 text-sm">—</span>
                        )}
                      </td>
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
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  );
                })}
                {recentBills.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-500 text-sm">
                      No bills generated yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
