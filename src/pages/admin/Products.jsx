import { useState } from "react";
import { useApp } from "../../store/AppContext";

const CATEGORIES = ["Electronics", "Accessories", "Clothing", "Food", "Books", "Other"];
const EMOJIS = ["📦", "🎧", "⌨️", "🔌", "💻", "📷", "🔊", "📱", "🖱️", "📺", "🎮", "🖨️"];

function ProductModal({ product, onSave, onClose }) {
  const [form, setForm] = useState(
    product || { name: "", category: "Electronics", price: "", stock: "", image: "📦", barcode: "", discount: 0 }
  );
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-white font-bold text-lg">{product ? "Edit Product" : "Add New Product"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-xl">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold block mb-2">Product Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => set("image", e)}
                  className={`w-10 h-10 rounded-xl text-xl transition-all ${form.image === e ? "bg-blue-600 scale-110" : "bg-white/5 hover:bg-white/10"}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
                      <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold block mb-2">Product Name</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Enter product name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold block mb-2">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500">
                {CATEGORIES.map((c) => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold block mb-2">Barcode / SKU</label>
              <input value={form.barcode} onChange={(e) => set("barcode", e.target.value.toUpperCase())} placeholder="e.g. BAR009" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold block mb-2">Price (₹)</label>
              <input type="number" value={form.price} onChange={(e) => set("price", Number(e.target.value))} placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold block mb-2">Stock Quantity</label>
              <input type="number" value={form.stock} onChange={(e) => set("stock", Number(e.target.value))} placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold block mb-2">
                Product Discount (%) — <span className="text-amber-400">0 = No discount</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.discount}
                  onChange={(e) => set("discount", Math.min(100, Math.max(0, Number(e.target.value))))}
                  placeholder="0"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 font-bold text-sm">%</span>
              </div>
              {form.discount > 0 && form.price > 0 && (
                <p className="text-emerald-400 text-xs mt-1.5 font-medium">
                  ✅ Discounted price: ₹{Math.round(form.price - (form.price * form.discount / 100)).toLocaleString()} (Save ₹{Math.round(form.price * form.discount / 100).toLocaleString()})
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-white/5">
          <button onClick={onClose} className="flex-1 bg-white/5 border border-white/10 text-slate-300 font-semibold py-3 rounded-xl hover:bg-white/10 transition-all">Cancel</button>
          <button
            onClick={async () => { if (form.name && form.price) { await onSave(form); } }}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/30"
          >
            {product ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [modal, setModal] = useState(null); // null | "add" | product
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === "All" || p.category === cat;
    return matchSearch && matchCat;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Product Management</h1>
          <p className="text-slate-400 text-sm mt-1">{products.length} products in inventory</p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
        >
          + Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${cat === c ? "bg-blue-600 text-white" : "bg-white/5 border border-white/10 text-slate-400 hover:text-white"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Products", val: products.length, color: "text-blue-400" },
          { label: "Low Stock (<20)", val: products.filter(p => p.stock < 20).length, color: "text-amber-400" },
          { label: "Out of Stock", val: products.filter(p => p.stock === 0).length, color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white/3 border border-white/8 rounded-2xl p-4 text-center">
            <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
            <div className="text-slate-500 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="bg-white/3 border border-white/8 rounded-2xl p-5 hover:border-blue-500/40 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{p.image}</div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                p.stock === 0 ? "bg-red-500/10 border-red-500/30 text-red-400" :
                p.stock < 20 ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              }`}>
                {p.stock === 0 ? "Out" : p.stock < 20 ? "Low" : "In Stock"}
              </span>
            </div>
            <h3 className="text-white font-bold text-sm mb-1 group-hover:text-blue-300 transition-colors">{p.name}</h3>
            <p className="text-slate-500 text-xs mb-1">{p.category}</p>
            {p.barcode && <p className="text-slate-600 font-mono text-xs mb-2">🔳 {p.barcode}</p>}
            <div className="flex items-center justify-between mb-1">
              <span className="text-blue-400 font-black text-lg">₹{p.price.toLocaleString()}</span>
              <span className="text-slate-400 text-xs">Qty: <span className="text-white font-bold">{p.stock}</span></span>
            </div>
            {p.discount > 0 ? (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-emerald-400 font-bold text-sm">₹{Math.round(p.price - p.price * p.discount / 100).toLocaleString()}</span>
                <span className="bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full">{p.discount}% OFF</span>
              </div>
            ) : (
              <div className="mb-3" />
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setModal(p)}
                className="flex-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold py-2 rounded-lg hover:bg-blue-500/20 transition-all"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => setDeleteConfirm(p.id)}
                className="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold py-2 rounded-lg hover:bg-red-500/20 transition-all"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {(modal === "add" || (modal && modal !== "add")) && (
        <ProductModal
          product={modal === "add" ? null : modal}
          onSave={async (data) => { try { modal === "add" ? await addProduct(data) : await updateProduct(modal.id, data); setModal(null); } catch(e){ alert(e.message); } }}
          onClose={() => setModal(null)}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-white font-bold text-lg mb-2">Delete Product?</h3>
            <p className="text-slate-400 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-white/5 border border-white/10 text-slate-300 font-semibold py-3 rounded-xl">Cancel</button>
              <button onClick={async () => { try { await deleteProduct(deleteConfirm); } catch(e){ alert(e.message); } setDeleteConfirm(null); }} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
