import { useState } from "react";
import { useApp } from "../store/AppContext";

export default function Login() {
  const { login } = useApp();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  // login() is now async — calls MongoDB backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || "Invalid email or password. Please try again.");
    }
    // On success, AppContext sets currentUser → App.tsx re-renders to dashboard
    setLoading(false);
  };

  const fillDemo = (type) => {
    if (type === "admin")    { setEmail("admin@store.com");  setPassword("admin123"); }
    else                     { setEmail("rahul@store.com");  setPassword("emp123");   }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/40 mb-4">
            <span className="text-3xl">🛒</span>
          </div>
          <h1 className="text-3xl font-black text-white">RetailPOS</h1>
          <p className="text-slate-400 text-sm mt-1">Point of Sale & Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Sign In to Your Account</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 focus:bg-blue-500/5 transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 focus:bg-blue-500/5 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-3">
                <span className="text-red-400 text-xs font-medium">⚠️ {error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all shadow-2xl shadow-blue-500/30 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </>
              ) : "Sign In →"}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Quick Demo Login</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => fillDemo("admin")}
                className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold py-2.5 rounded-xl hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                👑 Admin
              </button>
              <button
                onClick={() => fillDemo("employee")}
                className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold py-2.5 rounded-xl hover:bg-green-500/20 transition-all flex items-center justify-center gap-2"
              >
                👤 Employee
              </button>
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Admin:</span>
                <span className="font-mono">admin@store.com / admin123</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Employee:</span>
                <span className="font-mono">rahul@store.com / emp123</span>
              </div>
            </div>
          </div>
        </div>

        {/* DB status hint */}
        <p className="text-center text-slate-600 text-xs mt-4">
          🔗 Connecting to MongoDB · Make sure backend is running on port 5000
        </p>
      </div>
    </div>
  );
}
