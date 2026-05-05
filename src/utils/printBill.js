/**
 * Generates a printable HTML bill and opens print dialog or triggers download
 */
export function getBillHTML(bill, customer, employeeName) {
  const dateStr = new Date(bill.date).toLocaleString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });

  const itemRows = bill.items.map((item) => `
    <tr>
      <td style="padding:10px 12px; border-bottom:1px solid #f0f0f0;">
        <div style="font-weight:600; color:#1e293b; font-size:13px;">${item.name}</div>
        ${item.barcode ? `<div style="font-size:10px; color:#94a3b8; font-family:monospace; margin-top:2px;">${item.barcode}</div>` : ""}
        ${item.productDiscount > 0 ? `<div style="font-size:10px; color:#f59e0b; font-weight:700; margin-top:2px;">${item.productDiscount}% OFF applied</div>` : ""}
      </td>
      <td style="padding:10px 12px; border-bottom:1px solid #f0f0f0; text-align:center; color:#64748b; font-size:13px;">${item.qty}</td>
      <td style="padding:10px 12px; border-bottom:1px solid #f0f0f0; text-align:right; color:#64748b; font-size:13px;">₹${Number(item.price).toLocaleString("en-IN")}</td>
      <td style="padding:10px 12px; border-bottom:1px solid #f0f0f0; text-align:right; font-weight:700; color:#1e293b; font-size:13px;">₹${Number(item.total).toLocaleString("en-IN")}</td>
    </tr>
  `).join("");

  const totalItems = bill.items.reduce((a, i) => a + i.qty, 0);
  const payIcon = bill.paymentMethod === "Cash" ? "💵" : bill.paymentMethod === "Card" ? "💳" : "📱";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bill #${bill.id} — RetailPOS</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background:#f8fafc; color:#1e293b; }
    .page { max-width:620px; margin:30px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 32px rgba(0,0,0,0.10); }
    .header { background:linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color:#fff; padding:32px 28px 24px; }
    .header-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
    .logo { display:flex; align-items:center; gap:12px; }
    .logo-icon { width:44px; height:44px; background:rgba(255,255,255,0.2); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:22px; }
    .logo-text h1 { font-size:20px; font-weight:800; }
    .logo-text p { font-size:10px; opacity:0.75; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; margin-top:2px; }
    .bill-id { text-align:right; }
    .bill-id .label { font-size:10px; opacity:0.7; text-transform:uppercase; letter-spacing:0.08em; }
    .bill-id .value { font-size:22px; font-weight:900; font-family:monospace; }
    .bill-meta { display:grid; grid-template-columns:1fr 1fr; gap:16px; background:rgba(255,255,255,0.10); border-radius:12px; padding:16px; }
    .meta-item .meta-label { font-size:10px; opacity:0.65; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px; }
    .meta-item .meta-value { font-size:13px; font-weight:700; }
    .meta-item .meta-sub { font-size:11px; opacity:0.75; margin-top:2px; }
    .body { padding:24px 28px; }
    .section-title { font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:12px; }
    table { width:100%; border-collapse:collapse; margin-bottom:20px; }
    thead tr { background:#f1f5f9; }
    thead th { padding:10px 12px; text-align:left; font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.06em; }
    thead th:nth-child(2) { text-align:center; }
    thead th:nth-child(3), thead th:nth-child(4) { text-align:right; }
    .totals { background:#f8fafc; border-radius:12px; padding:16px 20px; margin-bottom:20px; }
    .total-row { display:flex; justify-content:space-between; align-items:center; padding:5px 0; }
    .total-row span:first-child { font-size:13px; color:#64748b; }
    .total-row span:last-child { font-size:13px; font-weight:600; color:#1e293b; }
    .total-row.discount span:last-child { color:#f59e0b; }
    .total-row.coupon span:last-child { color:#3b82f6; }
    .total-row.savings span:last-child { color:#10b981; }
    .total-divider { border:none; border-top:2px dashed #e2e8f0; margin:10px 0; }
    .grand-total { display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg,#1e3a8a,#3b82f6); color:#fff; padding:14px 20px; border-radius:12px; margin-bottom:20px; }
    .grand-total .label { font-size:15px; font-weight:800; }
    .grand-total .value { font-size:24px; font-weight:900; }
    .payment-badge { display:inline-flex; align-items:center; gap:8px; background:#eff6ff; border:1.5px solid #bfdbfe; border-radius:10px; padding:10px 16px; margin-bottom:20px; }
    .payment-badge span { font-size:13px; font-weight:700; color:#1d4ed8; }
    .footer { text-align:center; padding:20px 28px 28px; border-top:1px solid #f1f5f9; }
    .thank-you { font-size:16px; font-weight:800; color:#1e3a8a; margin-bottom:6px; }
    .footer-sub { font-size:11px; color:#94a3b8; }
    .stamp { display:inline-block; border:2px solid #10b981; color:#10b981; font-size:12px; font-weight:800; padding:4px 14px; border-radius:6px; transform:rotate(-4deg); letter-spacing:0.12em; margin-top:12px; }
    @media print {
      body { background:#fff; }
      .page { box-shadow:none; margin:0; border-radius:0; max-width:100%; }
      .no-print { display:none !important; }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="header-top">
        <div class="logo">
          <div class="logo-icon">🛒</div>
          <div class="logo-text">
            <h1>RetailPOS</h1>
            <p>Point of Sale System</p>
          </div>
        </div>
        <div class="bill-id">
          <div class="label">Tax Invoice</div>
          <div class="value">#${bill.id}</div>
        </div>
      </div>
      <div class="bill-meta">
        <div class="meta-item">
          <div class="meta-label">Customer</div>
          <div class="meta-value">${customer?.name || "—"}</div>
          <div class="meta-sub">${customer?.phone || ""}</div>
          ${customer?.email ? `<div class="meta-sub">${customer.email}</div>` : ""}
        </div>
        <div class="meta-item" style="text-align:right;">
          <div class="meta-label">Date & Time</div>
          <div class="meta-value" style="font-size:11px;">${dateStr}</div>
          <div class="meta-sub">Billed by: ${employeeName || "—"}</div>
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="body">
      <div class="section-title">Items Purchased</div>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <!-- Totals -->
      <div class="totals">
        <div class="total-row">
          <span>Subtotal (${totalItems} items)</span>
          <span>₹${Number(bill.subtotal).toLocaleString("en-IN")}</span>
        </div>
        ${bill.discount > 0 ? `
        <div class="total-row coupon">
          <span>🎫 Coupon Discount${bill.couponCode ? ` (${bill.couponCode})` : ""}</span>
          <span>−₹${Number(bill.discount).toLocaleString("en-IN")}</span>
        </div>` : ""}
        ${bill.discount > 0 ? `
        <div class="total-row savings">
          <span>✅ Total Savings</span>
          <span>−₹${Number(bill.discount).toLocaleString("en-IN")}</span>
        </div>` : ""}
      </div>

      <!-- Grand Total -->
      <div class="grand-total">
        <div class="label">TOTAL AMOUNT</div>
        <div class="value">₹${Number(bill.total).toLocaleString("en-IN")}</div>
      </div>

      <!-- Payment -->
      <div class="payment-badge">
        <span style="font-size:18px;">${payIcon}</span>
        <span>Paid via ${bill.paymentMethod}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="thank-you">🙏 Thank You for Shopping!</div>
      <div class="footer-sub">Please retain this bill for your records.</div>
      <div class="footer-sub" style="margin-top:4px;">For support, contact the store manager.</div>
      <div class="stamp">PAID</div>
    </div>
  </div>
</body>
</html>`;
}

export function printBill(bill, customer, employeeName) {
  const html = getBillHTML(bill, customer, employeeName);
  const win = window.open("", "_blank", "width=700,height=900,scrollbars=yes");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 500);
}

export function downloadBill(bill, customer, employeeName) {
  const html = getBillHTML(bill, customer, employeeName);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Bill_${bill.id}_${customer?.name?.replace(/\s+/g, "_") || "Customer"}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
