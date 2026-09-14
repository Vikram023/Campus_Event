import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/auth/register", form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-violet/20 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="glass-card p-8 sm:p-10 rounded-3xl shadow-glass w-full max-w-md relative z-10 border border-white/10">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-teal via-teal-dark to-violet flex items-center justify-center shadow-glow-teal">
            <span className="text-2xl">📝</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Create Account
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Join Campus Events to discover & host activities
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3.5 rounded-xl mb-5 text-xs text-center font-medium animate-fadeIn flex items-center justify-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 p-6 rounded-2xl text-center space-y-3">
            <span className="text-3xl block">🎉</span>
            <h3 className="font-display font-semibold text-lg">
              Registration Successful!
            </h3>
            <p className="text-xs text-emerald-200/80">
              Your account has been created. You can now log in.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-base font-semibold py-2.5 rounded-xl transition-all shadow-lg text-sm mt-2"
            >
              Log In Now
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">
                Full Name
              </label>
              <input
                placeholder="Rohan Verma"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface/90 border border-border text-ink placeholder:text-muted/50 text-sm focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="student@lpu.in"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface/90 border border-border text-ink placeholder:text-muted/50 text-sm focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-all"
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
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface/90 border border-border text-ink placeholder:text-muted/50 text-sm focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">
                Account Role
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface/90 border border-border text-ink text-sm focus:outline-none focus:border-teal transition-all cursor-pointer"
              >
                <option value="student">🎓 Student (Browse & Book Seats)</option>
                <option value="organizer">
                  🎪 Event Organizer (Host & Manage Events)
                </option>
              </select>
            </div>

            <button
              disabled={submitting}
              className="w-full bg-gradient-to-r from-teal-dark via-teal to-violet hover:brightness-110 text-base font-semibold py-3 rounded-xl shadow-glow-teal disabled:opacity-50 transition-all duration-300 text-sm mt-2"
            >
              {submitting ? "Registering..." : "Create Account"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-muted">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-teal-light font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
