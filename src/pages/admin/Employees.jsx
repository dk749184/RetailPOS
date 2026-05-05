import { useState } from "react";
import { useApp } from "../../store/AppContext";

function EmployeeModal({ employee, onSave, onClose }) {
  const [form, setForm] = useState(
    employee || { name: "", email: "", password: "", phone: "", active: true }
  );
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-white font-bold text-lg">{employee ? "Edit Employee" : "Add New Employee"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold block mb-2">Full Name</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Enter full name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold block mb-2">Email</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="email@store.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold block mb-2">{employee ? "New Password (leave blank to keep)" : "Password"}</label>
            <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold block mb-2">Phone</label>
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="9876543210" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-xl p-4">
            <button
              onClick={() => set("active", !form.active)}
              className={`w-12 h-6 rounded-full transition-all duration-300 relative ${form.active ? "bg-emerald-500" : "bg-slate-600"}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300 ${form.active ? "left-6" : "left-0.5"}`} />
            </button>
            <span className="text-slate-300 text-sm font-medium">Account Active</span>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-white/5">
          <button onClick={onClose} className="flex-1 bg-white/5 border border-white/10 text-slate-300 font-semibold py-3 rounded-xl">Cancel</button>
          <button
            onClick={async () => { if (form.name && form.email) { await onSave(form); } }}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all"
          >
            {employee ? "Save Changes" : "Add Employee"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Employees() {
  const { employees, bills, addEmployee, updateEmployee, deleteEmployee } = useApp();
  const [modal, setModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = employees.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase()));

  const getStats = (empId) => {
    const empBills = bills.filter((b) => b.employeeId === empId);
    const total = empBills.reduce((a, b) => a + b.total, 0);
    const today = empBills.filter((b) => new Date(b.date).toDateString() === new Date().toDateString());
    return { total, billCount: empBills.length, todayCount: today.length };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Employee Management</h1>
          <p className="text-slate-400 text-sm mt-1">{employees.length} employees registered</p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
        >
          + Add Employee
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500" />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-4">
          <span className="text-3xl">✅</span>
          <div>
            <div className="text-2xl font-black text-emerald-400">{employees.filter(e => e.active).length}</div>
            <div className="text-slate-400 text-sm">Active Employees</div>
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-center gap-4">
          <span className="text-3xl">⏸️</span>
          <div>
            <div className="text-2xl font-black text-red-400">{employees.filter(e => !e.active).length}</div>
            <div className="text-slate-400 text-sm">Inactive Employees</div>
          </div>
        </div>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((e) => {
          const stats = getStats(e.id);
          return (
            <div key={e.id} className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-blue-500/30 transition-all">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl">
                    {e.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{e.name}</h3>
                    <p className="text-slate-400 text-sm">{e.email}</p>
                    <p className="text-slate-500 text-xs mt-0.5">📞 {e.phone}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${e.active ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`}>
                  {e.active ? "● Active" : "● Inactive"}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-white/3 rounded-xl p-3 text-center">
                  <div className="text-blue-400 font-black text-lg">{stats.billCount}</div>
                  <div className="text-slate-500 text-xs mt-0.5">Bills</div>
                </div>
                <div className="bg-white/3 rounded-xl p-3 text-center">
                  <div className="text-emerald-400 font-black text-sm">₹{(stats.total / 1000).toFixed(1)}k</div>
                  <div className="text-slate-500 text-xs mt-0.5">Revenue</div>
                </div>
                <div className="bg-white/3 rounded-xl p-3 text-center">
                  <div className="text-amber-400 font-black text-lg">{stats.todayCount}</div>
                  <div className="text-slate-500 text-xs mt-0.5">Today</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <span>Joined: {new Date(e.joinDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={async () => { try { await updateEmployee(e.id, { active: !e.active }); } catch(err){ alert(err.message); } }}
                  className={`flex-1 text-xs font-bold py-2.5 rounded-lg border transition-all ${e.active ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"}`}
                >
                  {e.active ? "⏸️ Deactivate" : "▶️ Activate"}
                </button>
                <button onClick={() => setModal(e)} className="flex-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold py-2.5 rounded-lg hover:bg-blue-500/20 transition-all">✏️ Edit</button>
                <button onClick={() => setDeleteConfirm(e.id)} className="px-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg hover:bg-red-500/20 transition-all">🗑️</button>
              </div>
            </div>
          );
        })}
      </div>

      {(modal === "add" || (modal && modal !== "add")) && (
        <EmployeeModal
          employee={modal === "add" ? null : modal}
          onSave={async (data) => { try { modal === "add" ? await addEmployee(data) : await updateEmployee(modal.id, data); setModal(null); } catch(e){ alert(e.message); } }}
          onClose={() => setModal(null)}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-8 max-w-sm w-full text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-white font-bold text-lg mb-2">Delete Employee?</h3>
            <p className="text-slate-400 text-sm mb-6">This will permanently remove the employee account.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-white/5 border border-white/10 text-slate-300 font-semibold py-3 rounded-xl">Cancel</button>
              <button onClick={async () => { try { await deleteEmployee(deleteConfirm); } catch(e){ alert(e.message); } setDeleteConfirm(null); }} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
