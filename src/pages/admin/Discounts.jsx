import { useState } from "react";
import { useApp } from "../../store/AppContext";

function DiscountModal({ discount, onSave, onClose }) {
  const [form, setForm] = useState(
    discount || { code: "", type: "percent", value: "", minOrder: "", active: true }
  );
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-white font-bold text-lg">{discount ? "Edit Coupon" : "Add New Coupon"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold block mb-2">Coupon Code</label>
            <input value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="SAVE10" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono font-bold text-sm focus:outline-none focus:border-blue-500 uppercase" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold block mb-2">Discount Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500">
                <option value="percent" className="bg-slate-800">Percentage (%)</option>
                <option value="flat" className="bg-slate-800">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold block mb-2">
                Value ({form.type === "percent" ? "%" : "₹"})
              </label>
              <input type="number" value={form.value} onChange={(e) => set("value", Number(e.target.value))} placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold block mb-2">Minimum Order (₹)</label>
            <input type="number" value={form.minOrder} onChange={(e) => set("minOrder", Number(e.target.value))} placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-xl p-4">
            <button
              onClick={() => set("active", !form.active)}
              className={`w-12 h-6 rounded-full transition-all duration-300 relative ${form.active ? "bg-emerald-500" : "bg-slate-600"}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300 ${form.active ? "left-6" : "left-0.5"}`} />
            </button>
            <span className="text-slate-300 text-sm font-medium">Coupon Active</span>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-white/5">
          <button onClick={onClose} className="flex-1 bg-white/5 border border-white/10 text-slate-300 font-semibold py-3 rounded-xl hover:bg-white/10 transition-all">Cancel</button>
          <button
            onClick={async () => { if (form.code && form.value) { await onSave(form); } }}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/30"
          >
            {discount ? "Save Changes" : "Add Coupon"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Discounts() {
  const { discounts, addDiscount, updateDiscount, deleteDiscount } = useApp();
  const [modal, setModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const totalSaved = discounts.reduce((a, d) => a + d.usedCount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Discount & Coupons</h1>
          <p className="text-slate-400 text-sm mt-1">Manage promotional discount codes</p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
        >
          + Add Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Coupons", val: discounts.length, color: "text-blue-400", icon: "🏷️" },
          { label: "Active Coupons", val: discounts.filter(d => d.active).length, color: "text-emerald-400", icon: "✅" },
          { label: "Total Used", val: totalSaved, color: "text-amber-400", icon: "📊" },
        ].map((s) => (
          <div key={s.label} className="bg-white/3 border border-white/8 rounded-2xl p-5 flex items-center gap-4">
            <div className="text-3xl">{s.icon}</div>
            <div>
              <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
              <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Discounts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {discounts.map((d) => (
          <div key={d.id} className={`bg-white/3 border rounded-2xl p-6 transition-all hover:-translate-y-0.5 ${d.active ? "border-emerald-500/20 hover:border-emerald-500/40" : "border-white/8 opacity-60"}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${d.active ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                  <span className={`text-xs font-bold ${d.active ? "text-emerald-400" : "text-slate-500"}`}>
                    {d.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="font-mono text-2xl font-black text-white tracking-wider">{d.code}</div>
              </div>
              <div className={`px-3 py-1.5 rounded-xl font-black text-lg ${d.type === "percent" ? "bg-blue-500/15 text-blue-400" : "bg-purple-500/15 text-purple-400"}`}>
                {d.type === "percent" ? `${d.value}%` : `₹${d.value}`}
              </div>
            </div>

            <div className="space-y-2 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Type</span>
                <span className="text-slate-300 font-medium capitalize">{d.type === "percent" ? "Percentage" : "Flat Discount"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Min. Order</span>
                <span className="text-slate-300 font-medium">₹{d.minOrder.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Times Used</span>
                <span className="text-amber-400 font-bold">{d.usedCount}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={async () => { try { await updateDiscount(d.id, { active: !d.active }); } catch(err){ alert(err.message); } }}
                className={`flex-1 text-xs font-bold py-2.5 rounded-lg border transition-all ${d.active ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"}`}
              >
                {d.active ? "⏸️ Deactivate" : "▶️ Activate"}
              </button>
              <button onClick={() => setModal(d)} className="px-3 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs rounded-lg hover:bg-blue-500/20 transition-all">✏️</button>
              <button onClick={() => setDeleteConfirm(d.id)} className="px-3 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg hover:bg-red-500/20 transition-all">🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {/* Products Discount Overview */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
        <h2 className="text-white font-bold mb-4">How Coupons Apply</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left pb-3 text-xs font-bold text-slate-500 uppercase">Code</th>
                <th className="text-left pb-3 text-xs font-bold text-slate-500 uppercase">Discount</th>
                <th className="text-left pb-3 text-xs font-bold text-slate-500 uppercase">Min. Order</th>
                <th className="text-left pb-3 text-xs font-bold text-slate-500 uppercase">Example Product</th>
                <th className="text-left pb-3 text-xs font-bold text-slate-500 uppercase">Final Price</th>
                <th className="text-left pb-3 text-xs font-bold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {discounts.map((d) => {
                const ex = 2999;
                const final = d.type === "percent" ? ex - (ex * d.value / 100) : ex - d.value;
                return (
                  <tr key={d.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="py-3 font-mono text-blue-400 font-bold">{d.code}</td>
                    <td className="py-3 text-white font-semibold">
                      {d.type === "percent" ? `${d.value}% OFF` : `₹${d.value} OFF`}
                    </td>
                    <td className="py-3 text-slate-300">₹{d.minOrder}</td>
                    <td className="py-3 text-slate-300">₹{ex.toLocaleString()}</td>
                    <td className="py-3 text-emerald-400 font-bold">₹{Math.max(0, final).toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${d.active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                        {d.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {(modal === "add" || (modal && modal !== "add")) && (
        <DiscountModal
          discount={modal === "add" ? null : modal}
          onSave={async (data) => { try { modal === "add" ? await addDiscount(data) : await updateDiscount(modal.id, data); setModal(null); } catch(e){ alert(e.message); } }}
          onClose={() => setModal(null)}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-white font-bold text-lg mb-2">Delete Coupon?</h3>
            <p className="text-slate-400 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-white/5 border border-white/10 text-slate-300 font-semibold py-3 rounded-xl">Cancel</button>
              <button onClick={async () => { try { await deleteDiscount(deleteConfirm); } catch(e){ alert(e.message); } setDeleteConfirm(null); }} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
