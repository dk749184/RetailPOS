import { useState } from "react";
import { useApp } from "../../store/AppContext";
import { printBill, downloadBill } from "../../utils/printBill";

function CustomerModal({ customer, onSave, onClose }) {
  const [form, setForm] = useState(customer || { name: "", email: "", phone: "", address: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-white font-bold text-lg">{customer ? "Edit Customer" : "Add Customer"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: "Full Name", key: "name", type: "text", placeholder: "Customer Name" },
            { label: "Email", key: "email", type: "email", placeholder: "email@example.com" },
            { label: "Phone", key: "phone", type: "text", placeholder: "9876543210" },
            { label: "Address / City", key: "address", type: "text", placeholder: "City / Address" },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold block mb-2">{f.label}</label>
              <input type={f.type} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} placeholder={f.placeholder} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500" />
            </div>
          ))}
        </div>
        <div className="flex gap-3 p-6 border-t border-white/5">
          <button onClick={onClose} className="flex-1 bg-white/5 border border-white/10 text-slate-300 font-semibold py-3 rounded-xl">Cancel</button>
          <button
            onClick={async () => { if (form.name) { await onSave(form); } }}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all"
          >
            {customer ? "Save Changes" : "Add Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Customers({ isEmployee = false }) {
  const { customers, bills, employees, addCustomer, updateCustomer, deleteCustomer } = useApp();
  const [modal, setModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const getCustomerBills = (custId) => {
    return bills.filter((b) => b.customerId === custId).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Customer Management</h1>
          <p className="text-slate-400 text-sm mt-1">{customers.length} registered customers</p>
        </div>
        {!isEmployee && (
          <button
            onClick={() => setModal("add")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-lg flex items-center gap-2"
          >
            + Add Customer
          </button>
        )}
      </div>

      <div className="relative max-w-sm">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, phone..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500" />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-blue-400">{customers.length}</div>
          <div className="text-slate-400 text-xs mt-1">Total Customers</div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-emerald-400">
            ₹{(customers.reduce((a, c) => a + c.totalPurchases, 0) / 1000).toFixed(1)}k
          </div>
          <div className="text-slate-400 text-xs mt-1">Total Revenue</div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-amber-400">
            ₹{customers.length > 0 ? Math.round(customers.reduce((a, c) => a + c.totalPurchases, 0) / customers.length).toLocaleString() : 0}
          </div>
          <div className="text-slate-400 text-xs mt-1">Avg. Spend</div>
        </div>
      </div>

      {/* Two panel layout — each panel scrolls independently */}
      <div className={`grid gap-6 ${selected ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`} style={{ height: "calc(100vh - 380px)", minHeight: "320px" }}>
        {/* Customer List — left panel scrolls */}
        <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden flex flex-col min-h-0">
          <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-white/5 bg-slate-900">
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Customer</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Contact</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Total Purchases</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(selected?.id === c.id ? null : c)}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${selected?.id === c.id ? "bg-blue-500/10 border-l-2 border-l-blue-500" : ""}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white font-semibold text-sm">{c.name}</div>
                          <div className="text-slate-500 text-xs">{c.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-slate-300 text-xs">{c.email}</div>
                      <div className="text-slate-500 text-xs mt-0.5">📞 {c.phone}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-emerald-400 font-bold text-sm">₹{c.totalPurchases.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-4">
                      {!isEmployee && (
                        <div className="flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); setModal(c); }} className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-blue-500/20 transition-all">✏️</button>
                          <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(c.id); }} className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-red-500/20 transition-all">🗑️</button>
                        </div>
                      )}
                      {isEmployee && <span className="text-slate-500 text-xs">Click to view</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Detail Panel — right panel scrolls independently */}
        {selected && (
          <div className="bg-white/3 border border-white/8 rounded-2xl flex flex-col min-h-0 overflow-hidden">
            {/* Fixed header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5 flex-shrink-0">
              <h2 className="text-white font-bold text-lg">Customer Details</h2>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-black text-2xl">
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-white font-black text-xl">{selected.name}</h3>
                  <p className="text-slate-400 text-sm">{selected.email}</p>
                  <p className="text-slate-500 text-xs mt-0.5">📞 {selected.phone} · 📍 {selected.address}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total Bills", val: getCustomerBills(selected.id).length, color: "text-blue-400" },
                  { label: "Total Spent", val: `₹${selected.totalPurchases.toLocaleString()}`, color: "text-emerald-400" },
                  { label: "Member Since", val: new Date(selected.joinDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" }), color: "text-amber-400" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/3 rounded-xl p-3 text-center">
                    <div className={`font-black text-sm ${s.color}`}>{s.val}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Print & Download buttons for admin */}
              {!isEmployee && getCustomerBills(selected.id).length > 0 && (
                <div className="bg-white/3 border border-white/8 rounded-xl p-3">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Bill Actions</p>
                  <p className="text-slate-400 text-xs mb-3">Click any bill below to print or download it.</p>
                </div>
              )}

              <div>
                <h4 className="text-white font-bold mb-3">Purchase History</h4>
                <div className="space-y-2">
                  {getCustomerBills(selected.id).map((b) => {
                    const emp = employees.find((e) => e.id === b.employeeId);
                    return (
                      <div
                        key={b.id}
                        className="bg-white/3 border border-white/5 rounded-xl p-3 hover:border-white/15 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="text-white text-xs font-bold">Bill #{b.id}</div>
                            <div className="text-slate-500 text-xs mt-0.5">by {emp?.name} · {b.paymentMethod}</div>
                            <div className="text-slate-600 text-xs">{new Date(b.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-emerald-400 font-bold text-sm">₹{b.total.toLocaleString()}</div>
                            {b.discount > 0 && <div className="text-amber-400 text-xs">-₹{b.discount} off</div>}
                          </div>
                        </div>
                        {/* Per-bill print/download */}
                        <div className="flex gap-2 pt-2 border-t border-white/5">
                          <button
                            onClick={() => printBill(b, selected, emp?.name || "Employee")}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold py-1.5 rounded-lg hover:bg-violet-500/20 transition-all"
                          >
                            🖨️ Print
                          </button>
                          <button
                            onClick={() => downloadBill(b, selected, emp?.name || "Employee")}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold py-1.5 rounded-lg hover:bg-blue-500/20 transition-all"
                          >
                            ⬇️ Download
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {getCustomerBills(selected.id).length === 0 && (
                    <p className="text-slate-500 text-sm text-center py-4">No purchase history</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {(modal === "add" || (modal && modal !== "add")) && (
        <CustomerModal
          customer={modal === "add" ? null : modal}
          onSave={async (data) => { try { modal === "add" ? await addCustomer(data) : await updateCustomer(modal.id, data); setModal(null); } catch(e){ alert(e.message); } }}
          onClose={() => setModal(null)}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-8 max-w-sm w-full text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-white font-bold text-lg mb-2">Delete Customer?</h3>
            <p className="text-slate-400 text-sm mb-6">All customer data will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-white/5 border border-white/10 text-slate-300 font-semibold py-3 rounded-xl">Cancel</button>
              <button onClick={async () => { try { await deleteCustomer(deleteConfirm); } catch(e){ alert(e.message); } setDeleteConfirm(null); setSelected(null); }} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
