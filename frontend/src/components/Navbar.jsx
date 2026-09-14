import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isLoggedIn, name, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate("/login");
  }

  const links = [
    { to: "/", label: "Events", icon: "✨" },
    { to: "/venues", label: "Venues", icon: "📍" },
    ...(isLoggedIn ? [{ to: "/my-bookings", label: "My Bookings", icon: "🎟️" }] : []),
    ...(role === "organizer" || role === "admin"
      ? [
          { to: "/create-event", label: "Create Event", icon: "➕" },
          { to: "/organizer-studio", label: "Studio", icon: "🎙️" },
        ]
      : []),
    { to: "/analytics", label: "Analytics", icon: "📊" },
  ];

  const getRoleBadge = (userRole) => {
    if (userRole === "admin")
      return "bg-rose-500/25 text-rose-300 border-rose-500/50";
    if (userRole === "organizer")
      return "bg-amber/25 text-amber-light border-amber/50";
    return "bg-teal/25 text-teal-light border-teal/50";
  };

  return (
    <nav className="glass-nav sticky top-0 z-50 border-b border-white/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-8 py-3.5">
        {/* Brand Logo */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-white"
          onClick={() => setMenuOpen(false)}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-dark via-violet to-teal flex items-center justify-center shadow-glow-violet group-hover:scale-105 transition-transform duration-300">
            <span className="text-white text-lg">🎓</span>
          </div>
          <span className="bg-gradient-to-r from-white via-gray-100 to-violet-light bg-clip-text text-transparent group-hover:from-violet-light group-hover:to-teal transition-all duration-300">
            Campus<span className="text-teal font-extrabold">Events</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-1 bg-surface/80 border border-white/10 p-1.5 rounded-full shadow-inner">
          {links.map((l) => {
            const isActive = location.pathname === l.to;
            return (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-violet text-white shadow-glow-violet font-bold"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="text-xs">{l.icon}</span>
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-3 bg-surface/90 border border-white/15 pl-3 pr-1.5 py-1.5 rounded-full">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-violet/30 border border-violet/50 flex items-center justify-center font-bold text-xs text-violet-light">
                  {name ? name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold leading-tight text-white max-w-[110px] truncate">
                    {name}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded border w-max ${getRoleBadge(role)}`}
                  >
                    {role}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold bg-white/10 hover:bg-rose-500/20 text-gray-200 hover:text-rose-300 border border-white/15 hover:border-rose-500/40 px-3 py-1.5 rounded-full transition-all duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-gray-200 hover:text-white px-4 py-2 rounded-full transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-xs font-bold bg-gradient-to-r from-violet to-violet-dark hover:from-violet-light hover:to-violet text-white px-5 py-2 rounded-full shadow-glow-violet transition-all duration-300"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col justify-center items-center gap-1.5 w-9 h-9 rounded-lg bg-surface border border-white/15 text-white"
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-5 bg-white transition-transform duration-300 ${
              menuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-white transition-opacity duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-white transition-transform duration-300 ${
              menuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden glass-nav border-t border-white/10 px-4 py-5 space-y-3 animate-fadeIn">
          <div className="flex flex-col gap-1">
            {links.map((l) => {
              const isActive = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-violet/30 text-white border border-violet/50"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{l.icon}</span>
                  {l.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-white/10">
            {isLoggedIn ? (
              <div className="flex items-center justify-between bg-surface p-3 rounded-xl border border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-violet/30 border border-violet/50 flex items-center justify-center font-bold text-sm text-violet-light">
                    {name ? name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{name}</p>
                    <span
                      className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${getRoleBadge(role)}`}
                    >
                      {role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/40 px-3 py-1.5 rounded-lg hover:bg-rose-500/30 transition-all font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-center text-xs font-semibold border border-white/15 py-2.5 rounded-xl text-gray-200 hover:bg-white/10"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="text-center text-xs font-bold bg-violet text-white py-2.5 rounded-xl shadow-glow-violet"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
