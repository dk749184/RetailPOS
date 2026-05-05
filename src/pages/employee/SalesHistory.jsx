import { useState } from "react";
import { useApp } from "../../store/AppContext";
import { printBill, downloadBill } from "../../utils/printBill";

export default function SalesHistory() {
  const { currentUser, bills, customers, products } = useApp();
  const [period, setPeriod] = useState("monthly");
  const [search, setSearch] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);

  const myBills = bills.filter((b) => b.employeeId === currentUser.id);

  const now = new Date();
  const periodFiltered = myBills.filter((b) => {
    const bd = new Date(b.date);
    if (period === "daily") return bd.toDateString() === now.toDateString();
    if (period === "weekly") return (now - bd) / 86400000 <= 7;
    if (period === "monthly") return (now - bd) / 86400000 <= 30;
    return true;
  });

  const searched = periodFiltered.filter((b) => {
    const cust = customers.find((c) => c.id === b.customerId);
    return (
      String(b.id).includes(search) ||
      cust?.name.toLowerCase().includes(search.toLowerCase()) ||
      b.paymentMethod.toLowerCase().includes(search.toLowerCase())
    );
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalRevenue = searched.reduce((a, b) => a + b.total, 0);
  const totalDiscount = searched.reduce((a, b) => a + b.discount, 0);

  return (
    <div className="flex flex-col h-screen overflow-hidden p-6 gap-5">
      <div>
        <h1 className="text-2xl font-black text-white">My Sales History</h1>
        <p className="text-slate-400 text-sm mt-1">All your generated bills & transactions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 flex-shrink-0">
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          {[["daily", "Today"], ["weekly", "Week"], ["monthly", "Month"], ["all", "All Time"]].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setPeriod(val)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${period === val ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-48 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by bill #, customer, payment..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 flex-shrink-0">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
          <div className="text-2xl font-black text-blue-400">{searched.length}</div>
          <div className="text-slate-400 text-sm mt-1">Total Bills</div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
          <div className="text-2xl font-black text-emerald-400">₹{totalRevenue.toLocaleString()}</div>
          <div className="text-slate-400 text-sm mt-1">Revenue</div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
          <div className="text-2xl font-black text-amber-400">₹{totalDiscount.toLocaleString()}</div>
          <div className="text-slate-400 text-sm mt-1">Total Discounts</div>
        </div>
      </div>

      {/* Two-panel layout — both panels scroll independently */}
      <div className={`grid gap-6 flex-1 min-h-0 ${selectedBill ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        {/* Bills Table — left panel scrolls */}
        <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden flex flex-col min-h-0">
          <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-white/5 bg-slate-900">
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Bill #</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Customer</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Items</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Discount</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Total</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Payment</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {searched.map((b) => {
                  const cust = customers.find((c) => c.id === b.customerId);
                  return (
                    <tr
                      key={b.id}
                      onClick={() => setSelectedBill(selectedBill?.id === b.id ? null : b)}
                      className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${selectedBill?.id === b.id ? "bg-blue-500/10 border-l-2 border-l-blue-500" : ""}`}
                    >
                      <td className="px-5 py-3 text-blue-400 font-mono text-sm font-bold">#{b.id}</td>
                      <td className="px-5 py-3 text-slate-300 text-sm">{cust?.name || "—"}</td>
                      <td className="px-5 py-3 text-slate-400 text-sm">{b.items.length}</td>
                      <td className="px-5 py-3">
                        {b.discount > 0
                          ? <span className="text-amber-400 text-sm font-bold">-₹{b.discount}</span>
                          : <span className="text-slate-600 text-sm">—</span>}
                      </td>
                      <td className="px-5 py-3 text-emerald-400 font-bold text-sm">₹{b.total.toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <span className="bg-white/5 border border-white/10 text-slate-400 text-xs px-2.5 py-1 rounded-lg">{b.paymentMethod}</span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs">
                        {new Date(b.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  );
                })}
                {searched.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-500">No bills found for this period</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bill Detail — right panel scrolls independently */}
        {selectedBill && (() => {
          const cust = customers.find((c) => c.id === selectedBill.customerId);
          return (
            <div className="bg-white/3 border border-white/8 rounded-2xl flex flex-col min-h-0 overflow-hidden">
              {/* Fixed header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5 flex-shrink-0">
                <h2 className="text-white font-bold text-lg">Bill #{selectedBill.id}</h2>
                <button onClick={() => setSelectedBill(null)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 p-6 space-y-5">
                {/* Print & Download Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => printBill(selectedBill, cust, currentUser.name)}
                    className="flex items-center justify-center gap-2 bg-violet-600/20 border border-violet-500/40 text-violet-400 font-bold text-sm py-2.5 rounded-xl hover:bg-violet-600/30 transition-all"
                  >
                    <span>🖨️</span> Print Bill
                  </button>
                  <button
                    onClick={() => downloadBill(selectedBill, cust, currentUser.name)}
                    className="flex items-center justify-center gap-2 bg-blue-600/20 border border-blue-500/40 text-blue-400 font-bold text-sm py-2.5 rounded-xl hover:bg-blue-600/30 transition-all"
                  >
                    <span>⬇️</span> Download
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/3 rounded-xl p-3">
                    <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Customer</div>
                    <div className="text-white font-bold text-sm">{cust?.name}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{cust?.phone}</div>
                  </div>
                  <div className="bg-white/3 rounded-xl p-3">
                    <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Date & Time</div>
                    <div className="text-white font-bold text-sm">{new Date(selectedBill.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{new Date(selectedBill.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-bold text-sm mb-3">Items Purchased</h3>
                  <div className="space-y-2">
                    {selectedBill.items.map((item, i) => {
                      const prod = products.find((p) => p.id === item.productId);
                      return (
                        <div key={i} className="flex items-center gap-3 bg-white/3 border border-white/5 rounded-xl p-3">
                          <span className="text-2xl">{prod?.image || "📦"}</span>
                          <div className="flex-1">
                            <div className="text-white text-sm font-semibold">{item.name}</div>
                            <div className="text-slate-500 text-xs">₹{item.price} × {item.qty}</div>
                          </div>
                          <div className="text-blue-400 font-bold text-sm">₹{item.total.toLocaleString()}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white/3 border border-white/5 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-slate-300 text-sm">
                    <span>Subtotal</span><span>₹{selectedBill.subtotal.toLocaleString()}</span>
                  </div>
                  {selectedBill.discount > 0 && (
                    <div className="flex justify-between text-amber-400 text-sm">
                      <span>Discount ({selectedBill.couponCode})</span>
                      <span>-₹{selectedBill.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-black text-lg pt-2 border-t border-white/10">
                    <span>Total Paid</span>
                    <span className="text-emerald-400">₹{selectedBill.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                  <span className="text-xl">{selectedBill.paymentMethod === "Cash" ? "💵" : selectedBill.paymentMethod === "Card" ? "💳" : "📱"}</span>
                  <div>
                    <div className="text-white text-sm font-bold">Paid via {selectedBill.paymentMethod}</div>
                    {selectedBill.couponCode && <div className="text-blue-400 text-xs mt-0.5">Coupon applied: {selectedBill.couponCode}</div>}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
