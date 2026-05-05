// @ts-nocheck
/**
 * SalesPrediction.jsx
 * AI-powered 30-day sales forecast using Linear Regression.
 * Works fully in-browser — no external server needed.
 * Uses Simple Linear Regression + feature engineering (pure JS).
 */

import { useState, useMemo } from "react";
import { useApp } from "../../store/AppContext";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, Cell,
} from "recharts";

// ─── Pure-JS Linear Regression (Ridge) ────────────────────────────────────────
// No external ML library needed — runs entirely in the browser.

function matMul(A, B) {
  const rows = A.length, inner = B.length, cols = B[0].length;
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) =>
      A[i].reduce((sum, _, k) => sum + A[i][k] * B[k][j], 0)
    )
  );
}

function matT(A) {
  return A[0].map((_, j) => A.map(row => row[j]));
}

function matInv2(A) {
  // Gauss-Jordan inversion for NxN
  const n = A.length;
  const aug = A.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++)
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    const div = aug[col][col];
    if (Math.abs(div) < 1e-12) continue;
    aug[col] = aug[col].map(v => v / div);
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = aug[row][col];
      aug[row] = aug[row].map((v, k) => v - factor * aug[col][k]);
    }
  }
  return aug.map(row => row.slice(n));
}

function buildFeatures(date, dayIndex) {
  const wd = date.getDay();          // 0=Sun
  const dm = date.getDate();         // 1-31
  const mo = date.getMonth() + 1;    // 1-12
  const isWE = wd === 0 || wd === 6 ? 1 : 0;
  // Use only cyclic + weekend features — NO raw dayIndex/wd/dm/mo
  // Raw integers cause scale problems when predicting future dates
  return [
    1,                                           // bias
    isWE,                                        // is weekend (0/1)
    Math.sin(2 * Math.PI * wd / 7),              // cyclic weekday
    Math.cos(2 * Math.PI * wd / 7),
    Math.sin(2 * Math.PI * dm / 31),             // cyclic day-of-month
    Math.cos(2 * Math.PI * dm / 31),
    Math.sin(2 * Math.PI * mo / 12),             // cyclic month
    Math.cos(2 * Math.PI * mo / 12),
  ];
}

function trainRidge(X, y, alpha = 100) {
  // w = (X'X + αI)^{-1} X'y  — high alpha = strong regularization = stable predictions
  const Xt  = matT(X);
  const XtX = matMul(Xt, X);
  const n = XtX.length;
  for (let i = 0; i < n; i++) XtX[i][i] += alpha;
  const XtXinv = matInv2(XtX);
  const Xty = matMul(Xt, y.map(v => [v]));
  const w   = matMul(XtXinv, Xty).map(r => r[0]);
  return w;
}

function predict(w, features, meanSales) {
  const raw = features.reduce((s, f, i) => s + f * w[i], 0);
  // Fallback to mean if prediction is unreasonably low (< 10% of mean)
  return Math.max(raw, meanSales * 0.1);
}

function r2Score(y, yPred) {
  const mean  = y.reduce((a, b) => a + b, 0) / y.length;
  const ssTot = y.reduce((s, v) => s + (v - mean) ** 2, 0);
  const ssRes = y.reduce((s, v, i) => s + (v - yPred[i]) ** 2, 0);
  return ssTot < 1e-9 ? 0 : 1 - ssRes / ssTot;
}

function mae(y, yPred) {
  return y.reduce((s, v, i) => s + Math.abs(v - yPred[i]), 0) / y.length;
}

// ─── Main Model Runner ─────────────────────────────────────────────────────────
function runPrediction(bills) {
  // 1. Aggregate bills → daily totals
  const daily = {};
  for (const b of bills) {
    const d = b.date.slice(0, 10);
    daily[d] = (daily[d] || 0) + b.total;
  }

  const sortedDates = Object.keys(daily).sort();
  if (sortedDates.length < 7) return { error: "Need at least 7 days of sales data." };

  // 2. Build X, y  (no raw dayIndex — only cyclic features are stable for future dates)
  const X = sortedDates.map(ds => buildFeatures(new Date(ds), 0));
  const y = sortedDates.map(ds => daily[ds]);

  // Mean & std of y for z-score normalization
  const meanSales = y.reduce((a, b) => a + b, 0) / y.length;
  const stdSales  = Math.sqrt(y.reduce((s, v) => s + (v - meanSales) ** 2, 0) / y.length) || 1;

  // Normalize y so Ridge alpha is scale-independent
  const yNorm = y.map(v => (v - meanSales) / stdSales);

  // Normalize X columns (StandardScaler)
  const nCols = X[0].length;
  const xMeans = Array(nCols).fill(0);
  const xStds  = Array(nCols).fill(1);
  for (let c = 0; c < nCols; c++) {
    xMeans[c] = X.reduce((s, r) => s + r[c], 0) / X.length;
    const variance = X.reduce((s, r) => s + (r[c] - xMeans[c]) ** 2, 0) / X.length;
    xStds[c] = Math.sqrt(variance) || 1;
  }
  const Xnorm = X.map(row => row.map((v, c) => (v - xMeans[c]) / xStds[c]));

  // 3. Train on normalized y  (high alpha = stable, no blow-up on unseen dates)
  const w = trainRidge(Xnorm, yNorm, 100);

  // 4. Training metrics — denormalize back to rupees
  const yPredTrainNorm = Xnorm.map(row => predict(w, row, 0));
  const yPredTrain = yPredTrainNorm.map(v => v * stdSales + meanSales);
  const trainR2  = r2Score(y, yPredTrain);
  const trainMAE = mae(y, yPredTrain);

  // 5. Predict next 30 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const predictions = [];
  for (let i = 0; i < 30; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + i + 1);
    const feats     = buildFeatures(futureDate, 0);
    const featsNorm = feats.map((v, c) => (v - xMeans[c]) / xStds[c]);
    // Predict in normalized space → denormalize → clamp to min 10% of mean
    const predNorm  = predict(w, featsNorm, 0);
    const pred      = Math.max(predNorm * stdSales + meanSales, meanSales * 0.1);
    const margin    = pred * 0.20;
    const wd        = futureDate.getDay();
    predictions.push({
      date:        futureDate.toISOString().slice(0, 10),
      label:       futureDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      predicted:   Math.round(pred),
      lower_bound: Math.round(Math.max(pred - margin, 0)),
      upper_bound: Math.round(pred + margin),
      day_of_week: futureDate.toLocaleDateString("en-IN", { weekday: "short" }),
      is_weekend:  wd === 0 || wd === 6,
      week:        `W${Math.ceil((i + 1) / 7)}`,
    });
  }

  const totalPred  = predictions.reduce((s, p) => s + p.predicted, 0);
  const bestDay    = predictions.reduce((a, b) => b.predicted > a.predicted ? b : a);
  const worstDay   = predictions.reduce((a, b) => b.predicted < a.predicted ? b : a);

  return {
    predictions,
    model_stats: {
      training_samples: sortedDates.length,
      r2:  parseFloat(trainR2.toFixed(4)),
      mae: Math.round(trainMAE),
      mean_daily_sales: Math.round(meanSales),
      std_daily_sales:  Math.round(stdSales),
    },
    summary: {
      total_predicted_30d:  totalPred,
      avg_daily_predicted:  Math.round(totalPred / 30),
      weekly_avg:           Math.round(totalPred / 4.3),
      best_day:  bestDay,
      worst_day: worstDay,
      confidence: trainR2 >= 0.7 ? "high" : trainR2 >= 0.4 ? "medium" : "low",
    },
  };
}

// ─── UI Components ─────────────────────────────────────────────────────────────
const formatY = (v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`);

function PredictTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-slate-900 border border-cyan-500/30 rounded-xl px-4 py-3 shadow-2xl min-w-[160px]">
      <p className="text-cyan-400 text-xs font-bold mb-2">{label}</p>
      {payload.map((e, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: e.color }} />
            <span className="text-slate-400 text-xs">{e.name}</span>
          </div>
          <span className="text-white text-sm font-bold">₹{Number(e.value).toLocaleString("en-IN")}</span>
        </div>
      ))}
      {d?.is_weekend && (
        <div className="mt-2 pt-2 border-t border-white/10">
          <span className="text-amber-400 text-xs font-semibold">📅 Weekend</span>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className={`bg-gradient-to-br ${color}/10 border border-white/8 rounded-2xl p-5 hover:-translate-y-0.5 transition-transform duration-200`}>
      <div className="text-2xl mb-3">{icon}</div>
      <div className="text-xl font-black text-white">{value}</div>
      <div className="text-white/80 font-semibold text-sm mt-1">{label}</div>
      {sub && <div className="text-slate-500 text-xs mt-0.5">{sub}</div>}
    </div>
  );
}

function AccuracyBadge({ r2 }) {
  const pct = Math.round(r2 * 100);
  const cls =
    pct >= 70 ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" :
    pct >= 40 ? "text-amber-400 border-amber-500/30 bg-amber-500/10" :
                "text-red-400 border-red-500/30 bg-red-500/10";
  return (
    <span className={`text-xs font-bold border px-2.5 py-1 rounded-lg ${cls}`}>
      Model Fit: {pct}%
    </span>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function SalesPrediction() {
  const { bills } = useApp();

  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState(null);
  const [error,      setError]      = useState(null);
  const [viewMode,   setViewMode]   = useState("line");
  const [weekFilter, setWeekFilter] = useState("all");

  const historicalDays = useMemo(() => {
    const dates = bills.map(b => b.date.slice(0, 10));
    return new Set(dates).size;
  }, [bills]);

  const handleRunPrediction = () => {
    setLoading(true);
    setError(null);
    setResult(null);
    // Small timeout so the UI shows the loading state
    setTimeout(() => {
      try {
        const res = runPrediction(bills);
        if (res.error) { setError(res.error); }
        else           { setResult(res); }
      } catch (e) {
        setError("Unexpected error: " + e.message);
      }
      setLoading(false);
    }, 600);
  };

  const chartData = useMemo(() => {
    if (!result) return [];
    return weekFilter === "all"
      ? result.predictions
      : result.predictions.filter(p => p.week === weekFilter);
  }, [result, weekFilter]);

  return (
    <div className="p-6 space-y-6 max-w-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🤖</span>
            <h1 className="text-2xl font-black text-white">AI Sales Predictions</h1>
          </div>
          <p className="text-slate-400 text-sm">
            Linear Regression model trained on your billing history
            <span className="ml-2 text-cyan-500 font-semibold">({historicalDays} days of data)</span>
          </p>
        </div>

        <button
          onClick={handleRunPrediction}
          disabled={loading || bills.length === 0}
          className={`
            flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200
            ${loading
              ? "bg-cyan-800/50 text-cyan-300 cursor-wait"
              : bills.length === 0
              ? "bg-white/5 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25 active:scale-95"
            }
          `}
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Training Model…
            </>
          ) : (
            <><span>⚡</span> Run AI Prediction</>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <div>
            <p className="text-red-400 font-bold text-sm">Prediction Failed</p>
            <p className="text-slate-400 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && !error && (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-4">
          <div className="text-6xl">🧠</div>
          <h2 className="text-white font-bold text-xl">Ready to Predict</h2>
          <p className="text-slate-400 text-sm max-w-md">
            Click <strong className="text-cyan-400">Run AI Prediction</strong> to train a Ridge Regression model
            on your {bills.length} bills and forecast the next 30 days of sales — entirely in-browser, no server needed.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs text-slate-500">
            {["📊 11 Features", "📈 Ridge Regression", "🎯 30-day Forecast", "📉 Confidence Bands"].map(t => (
              <span key={t} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">{t}</span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-1 text-xs text-slate-600">
            <span>Day trend · Weekday · Day of month · Month · Weekend flag · Cyclical sin/cos encodings</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white/3 border border-cyan-500/20 rounded-2xl p-12 flex flex-col items-center gap-4">
          <svg className="w-12 h-12 animate-spin text-cyan-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-cyan-400 font-bold">Training Ridge Regression Model…</p>
          <p className="text-slate-500 text-sm">Building features · Normalizing data · Solving weights</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon="💰" label="30-Day Forecast"
              value={`₹${result.summary.total_predicted_30d.toLocaleString("en-IN")}`}
              sub="Total predicted revenue"
              color="from-cyan-500 to-blue-600"
            />
            <StatCard
              icon="📅" label="Daily Average"
              value={`₹${result.summary.avg_daily_predicted.toLocaleString("en-IN")}`}
              sub="Per day prediction"
              color="from-indigo-500 to-violet-600"
            />
            <StatCard
              icon="🏆" label="Best Day"
              value={`₹${result.summary.best_day.predicted.toLocaleString("en-IN")}`}
              sub={`${result.summary.best_day.label} (${result.summary.best_day.day_of_week})`}
              color="from-emerald-500 to-teal-600"
            />
            <StatCard
              icon="📉" label="Slowest Day"
              value={`₹${result.summary.worst_day.predicted.toLocaleString("en-IN")}`}
              sub={`${result.summary.worst_day.label} (${result.summary.worst_day.day_of_week})`}
              color="from-amber-500 to-orange-600"
            />
          </div>

          {/* Chart */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-white font-bold text-lg">30-Day Sales Forecast</h2>
                  <AccuracyBadge r2={result.model_stats.r2} />
                  <span className={`text-xs font-bold border px-2.5 py-1 rounded-lg ${
                    result.summary.confidence === "high"
                      ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                      : result.summary.confidence === "medium"
                      ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                      : "text-slate-400 border-white/10 bg-white/5"
                  }`}>
                    {result.summary.confidence.toUpperCase()} CONFIDENCE
                  </span>
                </div>
                <p className="text-slate-500 text-xs mt-1">
                  Shaded = ±15% confidence band · MAE: ₹{result.model_stats.mae.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">
                <div className="flex gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
                  {[["line", "📈 Line"], ["bar", "📊 Bar"]].map(([v, l]) => (
                    <button key={v} onClick={() => setViewMode(v)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === v ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}>
                      {l}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
                  {[["all","All"],["W1","W1"],["W2","W2"],["W3","W3"],["W4","W4"]].map(([v,l]) => (
                    <button key={v} onClick={() => setWeekFilter(v)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${weekFilter === v ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              {viewMode === "line" ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}  />
                    </linearGradient>
                    <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}  />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false}
                    interval={weekFilter === "all" ? 4 : 0} />
                  <YAxis tickFormatter={formatY} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
                  <Tooltip content={<PredictTooltip />} />
                  <Area type="monotone" dataKey="upper_bound" name="Upper" stroke="none" fill="url(#confGrad)" />
                  <Area type="monotone" dataKey="predicted" name="Predicted Sales"
                    stroke="#06b6d4" strokeWidth={2.5} fill="url(#predGrad)"
                    dot={{ r: 3, fill: "#06b6d4", stroke: "#0e1628", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#22d3ee", stroke: "#fff", strokeWidth: 2 }}
                  />
                  <Area type="monotone" dataKey="lower_bound" name="Lower" stroke="none" fill="transparent" />
                  <ReferenceLine y={result.summary.avg_daily_predicted} stroke="#6366f1"
                    strokeDasharray="4 4" strokeWidth={1.5}
                    label={{ value: "Avg", fill: "#818cf8", fontSize: 11, position: "insideTopRight" }}
                  />
                </AreaChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false}
                    interval={weekFilter === "all" ? 4 : 0} />
                  <YAxis tickFormatter={formatY} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
                  <Tooltip content={<PredictTooltip />} />
                  <Bar dataKey="predicted" name="Predicted Sales" radius={[4, 4, 0, 0]}>
                    {chartData.map((e, i) => (
                      <Cell key={i} fill={e.is_weekend ? "#f59e0b" : "#06b6d4"} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>

            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/5 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-cyan-500 inline-block" /> Predicted Sales
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-indigo-500 inline-block" /> Daily Average
              </div>
              {viewMode === "bar" && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-amber-500 rounded-sm inline-block" /> Weekend
                </div>
              )}
            </div>
          </div>

          {/* Model Stats + Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Model Info */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">🧪 Model Details</h3>
              <div className="space-y-3">
                {[
                  ["Algorithm",     "Ridge Regression (JS)"],
                  ["Features",      "8 (cyclic only, stable)"],
                  ["Training Days", result.model_stats.training_samples],
                  ["R² Score",      result.model_stats.r2.toFixed(4)],
                  ["MAE",           `₹${result.model_stats.mae.toLocaleString("en-IN")}`],
                  ["Mean Daily",    `₹${result.model_stats.mean_daily_sales.toLocaleString("en-IN")}`],
                  ["Std Dev",       `₹${result.model_stats.std_daily_sales.toLocaleString("en-IN")}`],
                  ["Confidence",    result.summary.confidence.toUpperCase()],
                  ["Weekly Avg",    `₹${result.summary.weekly_avg.toLocaleString("en-IN")}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-slate-400 text-xs">{k}</span>
                    <span className="text-white text-xs font-semibold">{v}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-3">
                <p className="text-cyan-400 text-xs font-semibold mb-2">💡 Improve Accuracy</p>
                <ul className="text-slate-400 text-xs space-y-1">
                  <li>• Add 90+ days of history</li>
                  <li>• Mark holidays in data</li>
                  <li>• Include product categories</li>
                  <li>• More bills per day = better fit</li>
                </ul>
              </div>
            </div>

            {/* Day Table */}
            <div className="lg:col-span-2 bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-white font-bold">📋 Day-by-Day Forecast</h3>
                <span className="text-slate-500 text-xs">First 14 of 30 days</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/2">
                      {["Date", "Day", "Predicted", "Lower", "Upper", "Week"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.predictions.slice(0, 14).map((p, i) => (
                      <tr key={i} className={`border-b border-white/5 hover:bg-white/3 transition-colors ${p.is_weekend ? "bg-amber-500/5" : ""}`}>
                        <td className="px-4 py-2.5 text-slate-300 text-sm font-mono">{p.label}</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs font-semibold ${p.is_weekend ? "text-amber-400" : "text-slate-400"}`}>
                            {p.day_of_week}{p.is_weekend ? " 🌟" : ""}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-cyan-400 font-bold text-sm">
                          ₹{p.predicted.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 text-xs">₹{p.lower_bound.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-2.5 text-slate-500 text-xs">₹{p.upper_bound.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-2.5">
                          <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs px-2 py-0.5 rounded font-semibold">
                            {p.week}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
