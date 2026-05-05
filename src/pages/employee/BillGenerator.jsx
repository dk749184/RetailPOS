import { useState, useRef, useEffect } from "react";
import { useApp } from "../../store/AppContext";
import { printBill, downloadBill } from "../../utils/printBill";

// ────────────────────────────────────────────────────────────
// Payment & Customer Info Modal (New Customer Only)
// ────────────────────────────────────────────────────────────
function PaymentModal({ cart, subtotal, productDiscountAmount, couponDiscountAmount, total, appliedCoupon, onConfirm, onClose }) {
  const { addCustomer } = useApp();
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [newCust, setNewCust] = useState({ name: "", phone: "", email: "", address: "" });
  const [error, setError] = useState("");

  const totalDiscountAmount = productDiscountAmount + couponDiscountAmount;

  const handleConfirm = async () => {
    if (!newCust.name.trim()) { setError("Customer name is required"); return; }
    if (!newCust.phone.trim()) { setError("Phone number is required"); return; }
    try {
      const customer = await addCustomer(newCust);
      onConfirm(customer, paymentMethod);
    } catch(err) {
      setError("Customer add karne mein error: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 flex-shrink-0">
          <div>
            <h2 className="text-white font-black text-xl">💳 Checkout</h2>
            <p className="text-slate-400 text-sm mt-0.5">Enter customer details & choose payment</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl transition-colors">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Bill Summary */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-4">
            <h3 className="text-white font-bold text-sm mb-3">🧾 Bill Summary</h3>
            <div className="space-y-1.5 max-h-32 overflow-y-auto mb-3">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-slate-300">{item.image} {item.name} <span className="text-slate-500">× {item.qty}</span></span>
                    {item.productDiscount > 0 && (
                      <span className="ml-2 text-xs bg-amber-500/15 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full font-bold">{item.productDiscount}% OFF</span>
                    )}
                  </div>
                  <div className="text-right">
                    {item.productDiscount > 0 && (
                      <div className="text-slate-500 text-xs line-through">₹{(item.originalPrice * item.qty).toLocaleString()}</div>
                    )}
                    <span className="text-white font-semibold">₹{item.total.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-3 space-y-1.5">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Subtotal (after product discounts)</span><span>₹{subtotal.toLocaleString()}</span>
              </div>
              {productDiscountAmount > 0 && (
                <div className="flex justify-between text-sm text-amber-400">
                  <span>🏷️ Product Discounts</span>
                  <span>-₹{productDiscountAmount.toLocaleString()}</span>
                </div>
              )}
              {couponDiscountAmount > 0 && (
                <div className="flex justify-between text-sm text-blue-400">
                  <span>🎫 Coupon ({appliedCoupon?.code})</span>
                  <span>-₹{couponDiscountAmount.toLocaleString()}</span>
                </div>
              )}
              {totalDiscountAmount > 0 && (
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Total savings</span>
                  <span className="text-emerald-400 font-bold">-₹{totalDiscountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-black text-lg pt-1 border-t border-white/10">
                <span>Total</span>
                <span className="text-emerald-400">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <h3 className="text-white font-bold mb-3">👤 Customer Info</h3>
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 mb-4 flex items-start gap-2">
              <span className="text-blue-400 text-sm mt-0.5">ℹ️</span>
              <p className="text-slate-300 text-xs leading-relaxed">Enter the customer's name and contact number. This will be saved automatically to the customer database.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold block mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  value={newCust.name}
                  onChange={(e) => { setNewCust((n) => ({ ...n, name: e.target.value })); setError(""); }}
                  placeholder="Customer full name"
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold block mb-1.5">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  value={newCust.phone}
                  onChange={(e) => { setNewCust((n) => ({ ...n, phone: e.target.value })); setError(""); }}
                  placeholder="10-digit mobile number"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold block mb-1.5">Email (optional)</label>
                <input
                  value={newCust.email}
                  onChange={(e) => setNewCust((n) => ({ ...n, email: e.target.value }))}
                  placeholder="email@example.com"
                  type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold block mb-1.5">Address / City (optional)</label>
                <input
                  value={newCust.address}
                  onChange={(e) => setNewCust((n) => ({ ...n, address: e.target.value }))}
                  placeholder="City or full address"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="text-white font-bold mb-3">💳 Payment Method</h3>
            <div className="grid grid-cols-3 gap-3">
              {[["Cash", "💵"], ["Card", "💳"], ["UPI", "📱"]].map(([m, icon]) => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`py-4 rounded-xl font-bold text-sm transition-all ${
                    paymentMethod === m
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                      : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/30"
                  }`}
                >
                  <div className="text-2xl mb-1">{icon}</div>
                  <div>{m}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-red-400 text-sm">⚠️ {error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex-shrink-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white/5 border border-white/10 text-slate-300 font-semibold py-3.5 rounded-xl hover:bg-white/10 transition-all"
          >
            ← Back
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black py-3.5 rounded-xl hover:opacity-90 transition-all shadow-2xl shadow-emerald-500/30 text-sm"
          >
            🧾 Confirm & Generate Bill
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main Bill Generator
// ────────────────────────────────────────────────────────────
export default function BillGenerator() {
  const { currentUser, products, customers, discounts, addBill, addCustomer } = useApp();

  const [cart, setCart] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcodeError, setBarcodeError] = useState("");
  const [barcodeSuccess, setBarcodeSuccess] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [generatedBill, setGeneratedBill] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const barcodeRef = useRef(null);

  // Auto-focus barcode on mount
  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(productSearch.toLowerCase());
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  // ── Cart helpers ─────────────────────────────────────────
  const addToCart = (product, qty = 1) => {
    if (product.stock === 0) return;
    const disc = product.discount || 0;
    const discountedPrice = disc > 0 ? Math.round(product.price - (product.price * disc / 100)) : product.price;
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        const newQty = existing.qty + qty;
        return prev.map((i) =>
          i.productId === product.id ? { ...i, qty: newQty, total: newQty * i.price } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          originalPrice: product.price,
          price: discountedPrice,
          productDiscount: disc,
          qty,
          total: discountedPrice * qty,
          image: product.image,
          barcode: product.barcode,
        },
      ];
    });
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, qty, total: qty * i.price } : i))
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  // ── Barcode scan ─────────────────────────────────────────
  const handleBarcodeScan = (e) => {
    e.preventDefault();
    const code = barcodeInput.trim().toUpperCase();
    if (!code) return;

    const product = products.find(
      (p) => p.barcode?.toUpperCase() === code || String(p.id) === code
    );

    if (!product) {
      setBarcodeError(`❌ No product found for barcode "${code}"`);
      setBarcodeSuccess("");
      setBarcodeInput("");
      setTimeout(() => setBarcodeError(""), 3000);
      return;
    }

    if (product.stock === 0) {
      setBarcodeError(`⚠️ "${product.name}" is out of stock`);
      setBarcodeSuccess("");
      setBarcodeInput("");
      setTimeout(() => setBarcodeError(""), 3000);
      return;
    }

    addToCart(product);
    setBarcodeSuccess(`✅ ${product.name} added to cart`);
    setBarcodeError("");
    setBarcodeInput("");
    setTimeout(() => setBarcodeSuccess(""), 2000);
    barcodeRef.current?.focus();
  };

  // ── Discount calculations ────────────────────────────────
  // subtotal = already discounted prices (product discounts applied at cart level)
  const subtotal = cart.reduce((a, i) => a + i.total, 0);

  // How much was saved via product discounts
  const productDiscountAmount = cart.reduce((a, i) => {
    const saved = (i.originalPrice || i.price) * i.qty - i.total;
    return a + (saved > 0 ? saved : 0);
  }, 0);

  const applyDiscount = () => {
    setCouponError("");
    const coupon = discounts.find((d) => d.code === couponCode.toUpperCase() && d.active);
    if (!coupon) { setCouponError("Invalid or inactive coupon code"); return; }
    if (subtotal < coupon.minOrder) { setCouponError(`Minimum order ₹${coupon.minOrder.toLocaleString()} required`); return; }
    setAppliedCoupon(coupon);
    setCouponCode("");
  };

  const couponDiscountAmount = appliedCoupon
    ? appliedCoupon.type === "percent"
      ? Math.floor((subtotal * appliedCoupon.value) / 100)
      : appliedCoupon.value
    : 0;

  const discountAmount = couponDiscountAmount; // for bill record
  const total = subtotal - couponDiscountAmount;

  // ── Generate bill ────────────────────────────────────────
  const handleConfirmBill = async (customer, paymentMethod) => {
    try {
      const bill = await addBill({
        employeeId: currentUser.id || currentUser._id,
        customerId: customer.id || customer._id,
        items: cart.map((item) => ({
          productId: item.id || item._id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          total: item.price * item.qty,
        })),
        subtotal,
        discount: discountAmount,
        total,
        couponCode: appliedCoupon?.code || null,
        paymentMethod,
      });
      setGeneratedBill({
        ...bill,
        customer,
        employeeName: currentUser.name,
      });
      setCart([]);
      setAppliedCoupon(null);
      setCouponCode("");
      setShowPaymentModal(false);
    } catch (err) {
      alert("Bill generate karne mein error: " + err.message);
    }
  };

  // ── Print bill view ──────────────────────────────────────
  if (generatedBill) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-white/3 border border-emerald-500/30 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/10">
          {/* Success header */}
          <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-b border-emerald-500/20 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-4xl mx-auto mb-3">✅</div>
            <h2 className="text-white font-black text-2xl">Bill Generated!</h2>
            <p className="text-emerald-400 font-mono font-bold text-lg mt-2">Bill #{generatedBill.id}</p>
            <p className="text-slate-400 text-sm mt-1">{new Date(generatedBill.date).toLocaleString("en-IN")}</p>
          </div>

          <div className="p-6">
            {/* Store + Customer */}
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-white/10">
              <div>
                <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Customer</div>
                <div className="text-white font-bold text-lg">{generatedBill.customer.name}</div>
                <div className="text-slate-400 text-sm">📞 {generatedBill.customer.phone}</div>
                {generatedBill.customer.email && (
                  <div className="text-slate-400 text-sm">✉️ {generatedBill.customer.email}</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Billed By</div>
                <div className="text-white font-bold text-lg">{generatedBill.employeeName}</div>
                <div className="flex items-center justify-end gap-1.5 mt-1">
                  <span className="text-lg">{generatedBill.paymentMethod === "Cash" ? "💵" : generatedBill.paymentMethod === "Card" ? "💳" : "📱"}</span>
                  <span className="text-slate-400 text-sm">{generatedBill.paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Items table */}
            <div className="bg-white/3 rounded-xl overflow-hidden mb-5">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 bg-white/3">
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Item</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase">Qty</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase">Rate</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedBill.items.map((item, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="px-4 py-3">
                        <span className="text-xl mr-2">{item.image}</span>
                        <span className="text-white text-sm font-medium">{item.name}</span>
                        {item.barcode && <span className="text-slate-600 text-xs font-mono ml-2">[{item.barcode}]</span>}
                        {item.productDiscount > 0 && (
                          <span className="ml-2 text-xs bg-amber-500/15 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full font-bold">{item.productDiscount}% OFF</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-300 text-sm">{item.qty}</td>
                      <td className="px-4 py-3 text-right text-slate-300 text-sm">₹{item.price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-white font-bold text-sm">₹{item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-slate-300 text-sm">
                <span>Subtotal ({generatedBill.items.length} items)</span>
                <span>₹{generatedBill.subtotal.toLocaleString()}</span>
              </div>
              {generatedBill.discount > 0 && (
                <div className="flex justify-between text-amber-400 text-sm">
                  <span>Discount {generatedBill.couponCode && `(${generatedBill.couponCode})`}</span>
                  <span>-₹{generatedBill.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-black text-2xl pt-3 border-t border-white/10">
                <span>TOTAL</span>
                <span className="text-emerald-400">₹{generatedBill.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="text-center text-slate-500 text-sm mb-6 py-3 border-y border-white/5">
              🙏 Thank you for shopping with us!
            </div>

            {/* Print & Download Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={() => printBill(generatedBill, generatedBill.customer, generatedBill.employeeName)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-violet-500/30"
              >
                <span className="text-lg">🖨️</span>
                Print Bill
              </button>
              <button
                onClick={() => downloadBill(generatedBill, generatedBill.customer, generatedBill.employeeName)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/30"
              >
                <span className="text-lg">⬇️</span>
                Download Bill
              </button>
            </div>

            <button
              onClick={() => setGeneratedBill(null)}
              className="w-full bg-white/5 border border-white/10 text-slate-300 font-bold py-3.5 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <span>＋</span> Generate New Bill
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main billing UI ──────────────────────────────────────
  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-2xl font-black text-white">🧾 Generate Bill</h1>
        <p className="text-slate-400 text-sm mt-1">Scan barcodes or pick products, then checkout</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── LEFT: Product Catalog ─────────────────────── */}
        <div className="xl:col-span-2 space-y-4">

          {/* Barcode Scanner Bar */}
          <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xl">🔳</div>
              <div>
                <h3 className="text-white font-bold">Barcode Scanner</h3>
                <p className="text-slate-400 text-xs">Scan or type barcode / product ID, then press Enter</p>
              </div>
            </div>
            <form onSubmit={handleBarcodeScan} className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  ref={barcodeRef}
                  value={barcodeInput}
                  onChange={(e) => { setBarcodeInput(e.target.value); setBarcodeError(""); setBarcodeSuccess(""); }}
                  placeholder="Scan or type barcode (e.g. BAR001, BAR002...)"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3.5 text-white font-mono text-sm focus:outline-none focus:border-blue-400 focus:bg-blue-500/5 transition-all"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                <span className="text-lg">⏎</span>
                <span className="hidden sm:inline text-sm">Add</span>
              </button>
            </form>
            {barcodeError && (
              <div className="mt-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-xs font-medium">
                {barcodeError}
              </div>
            )}
            {barcodeSuccess && (
              <div className="mt-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-emerald-400 text-xs font-medium">
                {barcodeSuccess}
              </div>
            )}
            {/* Quick barcode hints */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-slate-500 text-xs font-semibold">Quick scan:</span>
              {products.slice(0, 5).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { addToCart(p); setBarcodeSuccess(`✅ ${p.name} added`); setTimeout(() => setBarcodeSuccess(""), 2000); }}
                  className="bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-blue-500/40 text-xs px-2.5 py-1 rounded-lg font-mono transition-all"
                  title={p.name}
                >
                  {p.barcode || `#${p.id}`}
                </button>
              ))}
            </div>
          </div>

          {/* Product search + filter */}
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-48 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
              <input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products or barcode..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeCategory === cat
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "bg-white/5 border border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
            {filteredProducts.map((p) => {
              const inCart = cart.find((i) => i.productId === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => { addToCart(p); setBarcodeSuccess(`✅ ${p.name} added`); setTimeout(() => setBarcodeSuccess(""), 1500); barcodeRef.current?.focus(); }}
                  disabled={p.stock === 0}
                  className={`relative bg-white/3 border rounded-xl p-3 text-left transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                    inCart
                      ? "border-blue-500/50 bg-blue-500/5"
                      : "border-white/8 hover:border-blue-500/40 hover:bg-white/6"
                  }`}
                >
                  {inCart && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-xs font-black">{inCart.qty}</span>
                    </div>
                  )}
                  <div className="text-3xl mb-2">{p.image}</div>
                  <div className="text-white font-semibold text-xs leading-tight mb-1">{p.name}</div>
                  {p.discount > 0 ? (
                    <div className="flex items-center gap-1 flex-wrap mb-0.5">
                      <span className="text-emerald-400 font-black text-sm">₹{Math.round(p.price - p.price * p.discount / 100).toLocaleString()}</span>
                      <span className="text-slate-500 text-xs line-through">₹{p.price.toLocaleString()}</span>
                    </div>
                  ) : (
                    <div className="text-blue-400 font-black text-sm mb-0.5">₹{p.price.toLocaleString()}</div>
                  )}
                  {p.discount > 0 && (
                    <div className="bg-amber-500/15 border border-amber-500/20 text-amber-400 text-xs font-bold px-1.5 py-0.5 rounded-full inline-block mb-1">{p.discount}% OFF</div>
                  )}
                  <div className="text-slate-600 font-mono text-xs">{p.barcode}</div>
                  {p.stock === 0 && <div className="text-red-400 text-xs mt-1">Out of stock</div>}
                </button>
              );
            })}
          </div>

          {/* Cart */}
          {cart.length > 0 && (
            <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/3">
                <h3 className="text-white font-bold">🛒 Cart <span className="text-blue-400 font-mono ml-1">({cart.length} items)</span></h3>
                <button
                  onClick={() => setCart([])}
                  className="text-red-400 text-xs font-semibold hover:text-red-300 transition-colors bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg"
                >
                  Clear All
                </button>
              </div>
              <div className="divide-y divide-white/5">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 px-4 py-3">
                    <span className="text-2xl flex-shrink-0">{item.image}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-semibold truncate">{item.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-slate-400 text-xs">₹{item.price.toLocaleString()} each</span>
                        {item.barcode && <span className="text-slate-600 font-mono text-xs">[{item.barcode}]</span>}
                      </div>
                    </div>
                    {/* Qty controls */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => updateQty(item.productId, item.qty - 1)}
                        className="w-7 h-7 rounded-lg bg-white/8 hover:bg-red-500/30 text-white font-bold text-lg leading-none transition-all flex items-center justify-center"
                      >−</button>
                      <span className="text-white font-black w-6 text-center text-sm">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.qty + 1)}
                        className="w-7 h-7 rounded-lg bg-white/8 hover:bg-emerald-500/30 text-white font-bold text-lg leading-none transition-all flex items-center justify-center"
                      >+</button>
                    </div>
                    <div className="text-blue-400 font-black text-sm w-20 text-right flex-shrink-0">
                      ₹{item.total.toLocaleString()}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-slate-600 hover:text-red-400 transition-colors ml-1 flex-shrink-0"
                    >✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Summary Panel ──────────────────────── */}
        <div className="space-y-4">

          {/* Coupon */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <h3 className="text-white font-bold mb-3">🏷️ Discount Coupon</h3>
            {appliedCoupon ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-emerald-400 font-mono font-black text-lg">{appliedCoupon.code}</div>
                    <div className="text-emerald-300 text-xs mt-0.5">
                      {appliedCoupon.type === "percent" ? `${appliedCoupon.value}% off` : `₹${appliedCoupon.value} off`}
                      {" "}<span className="text-emerald-200 font-bold">· Save ₹{discountAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    className="w-7 h-7 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-all flex items-center justify-center font-bold"
                  >✕</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-2">
                  <input
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && applyDiscount()}
                    placeholder="Enter coupon code"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-blue-500 uppercase"
                  />
                  <button
                    onClick={applyDiscount}
                    className="bg-blue-600 text-white text-xs font-bold px-4 rounded-xl hover:bg-blue-500 transition-all"
                  >Apply</button>
                </div>
                {couponError && <p className="text-red-400 text-xs">{couponError}</p>}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-slate-600 text-xs">Active:</span>
                  {discounts.filter((d) => d.active).map((d) => (
                    <button
                      key={d.id}
                      onClick={() => { setCouponCode(d.code); setCouponError(""); }}
                      className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all"
                    >
                      {d.code}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Bill Summary */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4">📋 Bill Summary</h3>

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🛒</div>
                <p className="text-slate-500 text-sm">Cart is empty</p>
                <p className="text-slate-600 text-xs mt-1">Scan a barcode or click a product</p>
              </div>
            ) : (
              <>
                <div className="space-y-2.5 mb-4">
                  <div className="flex justify-between text-slate-300 text-sm">
                    <span>Items ({cart.reduce((a, i) => a + i.qty, 0)})</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  {productDiscountAmount > 0 && (
                    <div className="flex justify-between text-amber-400 text-sm">
                      <span>🏷️ Product discounts saved</span>
                      <span className="font-bold">-₹{productDiscountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400 text-sm">
                    <span>🎫 Coupon discount</span>
                    <span className={couponDiscountAmount > 0 ? "text-blue-400 font-bold" : "text-slate-600"}>
                      {couponDiscountAmount > 0 ? `-₹${couponDiscountAmount.toLocaleString()}` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-white font-black text-xl pt-3 border-t border-white/10">
                    <span>Total</span>
                    <span className="text-emerald-400">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black py-4 rounded-xl hover:opacity-90 transition-all shadow-2xl shadow-emerald-500/30 text-sm flex items-center justify-center gap-2"
                >
                  <span className="text-lg">🧾</span>
                  Proceed to Checkout
                </button>
              </>
            )}
          </div>

          {/* Barcode legend */}
          <div className="bg-white/2 border border-white/5 rounded-2xl p-4">
            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">📦 Product Barcodes</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {products.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{p.image} {p.name}</span>
                  <span className="font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/8">{p.barcode}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          cart={cart}
          subtotal={subtotal}
          productDiscountAmount={productDiscountAmount}
          couponDiscountAmount={couponDiscountAmount}
          total={total}
          appliedCoupon={appliedCoupon}
          onConfirm={handleConfirmBill}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}
