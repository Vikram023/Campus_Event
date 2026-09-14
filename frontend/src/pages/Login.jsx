import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function performLogin(loginEmail, loginPassword) {
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });
      login(data.token, data.name, data.role);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Check server status.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    performLogin(email, password);
  }

  function handleDemoLogin(demoEmail) {
    setEmail(demoEmail);
    setPassword("password123");
    performLogin(demoEmail, "password123");
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal/15 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="glass-card p-8 sm:p-10 rounded-3xl shadow-glass w-full max-w-md relative z-10 border border-white/10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-violet via-violet-dark to-teal flex items-center justify-center shadow-glow-violet">
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Access your campus events dashboard & ticket pass
          </p>
        </div>

        {/* Quick Demo Login Preset Bar */}
        <div className="mb-6 p-3 bg-surface/80 rounded-2xl border border-border">
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wider text-center mb-2">
            ⚡ Quick Demo Logins (1-Click)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin("student1@lpu.in")}
              className="text-[11px] font-medium py-1.5 px-2 rounded-xl bg-teal/10 hover:bg-teal/20 text-teal-light border border-teal/30 transition-all text-center"
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("organizer@lpu.in")}
              className="text-[11px] font-medium py-1.5 px-2 rounded-xl bg-amber/10 hover:bg-amber/20 text-amber-light border border-amber/30 transition-all text-center"
            >
              🎪 Organizer
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("admin@lpu.in")}
              className="text-[11px] font-medium py-1.5 px-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all text-center"
            >
              👑 Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3.5 rounded-xl mb-5 text-xs text-center font-medium animate-fadeIn flex items-center justify-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="student1@lpu.in"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface/90 border border-border text-ink placeholder:text-muted/50 text-sm focus:outline-none focus:border-violet focus:ring-1 focus:ring-violet transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface/90 border border-border text-ink placeholder:text-muted/50 text-sm focus:outline-none focus:border-violet focus:ring-1 focus:ring-violet transition-all"
            />
          </div>

          <button
            disabled={submitting}
            className="w-full bg-gradient-to-r from-violet to-violet-dark hover:from-violet-light hover:to-violet text-white font-semibold py-3 rounded-xl shadow-glow-violet disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm mt-2"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-violet-light font-semibold hover:underline"
          >
            Create one now
          </Link>
        </p>
      </div>
    </div>
  );
}
