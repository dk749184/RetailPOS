import { useState } from "react";
import { useApp } from "../../store/AppContext";
import { printBill, downloadBill } from "../../utils/printBill";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";

const formatY = (v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`);

function ChartTooltip({ active, payload, label }) {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 border border-white/15 rounded-xl px-4 py-3 shadow-2xl">
        <p className="text-slate-400 text-xs font-semibold mb-1">{label}</p>
        <p className="text-white text-sm font-bold">₹{Number(payload[0].value).toLocaleString("en-IN")}</p>
      </div>
    );
  }
  return null;
}

export default function Reports() {
  const { bills, employees, customers, products } = useApp();
  const [period, setPeriod] = useState("monthly");
  const [selectedEmp, setSelectedEmp] = useState("all");

  const now = new Date();
  const filtered = bills.filter((b) => {
    const bd = new Date(b.date);
    if (period === "daily") return bd.toDateString() === now.toDateString();
    if (period === "weekly") return (now - bd) / 86400000 <= 7;
    if (period === "monthly") return (now - bd) / 86400000 <= 30;
    return true;
  });

  const empFiltered = selectedEmp === "all" ? filtered : filtered.filter((b) => b.employeeId === Number(selectedEmp));

  const totalRevenue = empFiltered.reduce((a, b) => a + b.total, 0);
  const totalDiscount = empFiltered.reduce((a, b) => a + b.discount, 0);
  const totalBills = empFiltered.length;

  // Employee performance
  const empPerformance = employees.map((e) => {
    const empBills = filtered.filter((b) => b.employeeId === e.id);
    const revenue = empBills.reduce((a, b) => a + b.total, 0);
    const discountGiven = empBills.reduce((a, b) => a + b.discount, 0);
    const avgBillValue = empBills.length > 0 ? revenue / empBills.length : 0;
    return { ...e, revenue, billCount: empBills.length, discountGiven, avgBillValue };
  }).sort((a, b) => b.revenue - a.revenue);

  const maxRevenue = Math.max(...empPerformance.map((e) => e.revenue), 1);

  // Product sales
  const productSales = products.map((p) => {
    let qty = 0;
    let revenue = 0;
    filtered.forEach((b) => {
      b.items.forEach((item) => {
        if (item.productId === p.id) {
          qty += item.qty;
          revenue += item.total;
        }
      });
    });
    return { ...p, soldQty: qty, revenue };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // Last 30 days chart
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dayBills = bills.filter((b) => {
      const bd = new Date(b.date);
      return bd.toDateString() === d.toDateString() &&
        (selectedEmp === "all" || b.employeeId === Number(selectedEmp));
    });
    return {
      day: d.getDate(),
      month: d.toLocaleDateString("en-IN", { month: "short" }),
      amount: dayBills.reduce((a, b) => a + b.total, 0),
    };
  });

  const maxChart = Math.max(...last30.map((d) => d.amount), 1);

  // Payment methods
  const payMethods = ["Cash", "Card", "UPI"].map((m) => ({
    method: m,
    count: empFiltered.filter((b) => b.paymentMethod === m).length,
    amount: empFiltered.filter((b) => b.paymentMethod === m).reduce((a, b) => a + b.total, 0),
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Sales Reports</h1>
        <p className="text-slate-400 text-sm mt-1">Comprehensive sales analytics & employee performance</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
          {["daily", "weekly", "monthly", "all"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${period === p ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
            >
              {p === "all" ? "All Time" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <select
          value={selectedEmp}
          onChange={(e) => setSelectedEmp(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all" className="bg-slate-800">All Employees</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id} className="bg-slate-800">{e.name}</option>
          ))}
        </select>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", val: `₹${totalRevenue.toLocaleString()}`, icon: "💰", color: "from-emerald-500 to-teal-600", glow: "shadow-emerald-500/20" },
          { label: "Total Bills", val: totalBills, icon: "🧾", color: "from-blue-500 to-indigo-600", glow: "shadow-blue-500/20" },
          { label: "Discounts Given", val: `₹${totalDiscount.toLocaleString()}`, icon: "🏷️", color: "from-amber-500 to-orange-600", glow: "shadow-amber-500/20" },
          { label: "Avg Bill Value", val: `₹${totalBills > 0 ? Math.round(totalRevenue / totalBills).toLocaleString() : 0}`, icon: "📊", color: "from-violet-500 to-purple-600", glow: "shadow-violet-500/20" },
        ].map((s) => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color}/10 border border-white/8 rounded-2xl p-5 shadow-lg ${s.glow}`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-black text-white">{s.val}</div>
            <div className="text-slate-400 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Leaderboard */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-5">👑 Employee Leaderboard</h2>
          <div className="space-y-4">
            {empPerformance.map((e, i) => (
              <div key={e.id} className={`bg-white/3 border rounded-xl p-4 ${i === 0 ? "border-amber-500/30 bg-amber-500/5" : "border-white/5"}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${i === 0 ? "bg-amber-500 text-white" : i === 1 ? "bg-slate-400 text-white" : "bg-orange-700 text-white"}`}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-bold text-sm">{e.name}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex-1 bg-white/10 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full"
                          style={{ width: `${(e.revenue / maxRevenue) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-black text-sm">₹{(e.revenue / 1000).toFixed(1)}k</div>
                    <div className="text-slate-500 text-xs">{e.billCount} bills</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/3 rounded-lg p-2">
                    <span className="text-slate-500">Avg Bill</span>
                    <div className="text-white font-bold">₹{Math.round(e.avgBillValue).toLocaleString()}</div>
                  </div>
                  <div className="bg-white/3 rounded-lg p-2">
                    <span className="text-slate-500">Discounts</span>
                    <div className="text-amber-400 font-bold">₹{e.discountGiven.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Chart — Recharts AreaChart */}
        <div className="lg:col-span-2 bg-white/3 border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-white font-bold text-lg">Daily Sales (Last 30 Days)</h2>
              <p className="text-slate-500 text-xs mt-0.5">Revenue trend for selected period & employee</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={last30} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rptGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.38} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tickFormatter={formatY}
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                name="Revenue"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#rptGrad)"
                dot={false}
                activeDot={{ r: 5, fill: "#818cf8", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4">🔥 Top Selling Products</h2>
          <div className="space-y-3">
            {productSales.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 bg-white/3 border border-white/5 rounded-xl p-3">
                <span className="text-2xl">{p.image}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-semibold truncate">{p.name}</div>
                  <div className="text-slate-500 text-xs mt-0.5">Sold: {p.soldQty} units</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold text-sm">₹{p.revenue.toLocaleString()}</div>
                  <div className="text-slate-500 text-xs">#{i + 1}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4">💳 Payment Methods</h2>
          <div className="space-y-4">
            {payMethods.map((m) => {
              const pct = totalBills > 0 ? Math.round((m.count / totalBills) * 100) : 0;
              const colors = { Cash: "from-emerald-500 to-teal-500", Card: "from-blue-500 to-indigo-500", UPI: "from-violet-500 to-purple-500" };
              return (
                <div key={m.method} className="bg-white/3 border border-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{m.method === "Cash" ? "💵" : m.method === "Card" ? "💳" : "📱"}</span>
                      <span className="text-white font-semibold text-sm">{m.method}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold text-sm">₹{m.amount.toLocaleString()}</span>
                      <span className="text-slate-500 text-xs ml-2">{m.count} bills</span>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${colors[m.method]} h-2 rounded-full transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-slate-500 text-xs mt-1 text-right">{pct}% of total</div>
                </div>
              );
            })}
          </div>

          {/* All bills table */}
          <div className="mt-5 pt-5 border-t border-white/5">
            <h3 className="text-white font-bold text-sm mb-3">Recent Bills ({empFiltered.length})</h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {[...empFiltered].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map((b) => {
                const emp = employees.find((e) => e.id === b.employeeId);
                const cust = customers.find((c) => c.id === b.customerId);
                return (
                  <div key={b.id} className="bg-white/3 border border-white/5 rounded-xl p-3 hover:border-white/10 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-blue-400 font-mono text-xs font-bold">#{b.id}</span>
                        <span className="text-slate-300 text-xs ml-2 font-medium">{cust?.name || "—"}</span>
                        <span className="text-slate-600 text-xs ml-1">· {emp?.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold text-sm">₹{b.total.toLocaleString()}</span>
                        <div className="text-slate-600 text-xs">{b.paymentMethod}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1.5 border-t border-white/5">
                      <button
                        onClick={() => printBill(b, cust, emp?.name || "Employee")}
                        className="flex-1 flex items-center justify-center gap-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold py-1.5 rounded-lg hover:bg-violet-500/20 transition-all"
                      >
                        🖨️ Print
                      </button>
                      <button
                        onClick={() => downloadBill(b, cust, emp?.name || "Employee")}
                        className="flex-1 flex items-center justify-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold py-1.5 rounded-lg hover:bg-blue-500/20 transition-all"
                      >
                        ⬇️ Download
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
