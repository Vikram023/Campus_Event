import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { getGoogleCalendarUrl, downloadICalFile } from "../utils/calendar";

export default function MyBookings() {
  const { name } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [certificateBooking, setCertificateBooking] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBookings();
  }, []);

  function loadBookings() {
    setLoading(true);
    api
      .get("/bookings/mine")
      .then((res) => setBookings(res.data))
      .catch(() => setError("Failed to fetch your bookings"))
      .finally(() => setLoading(false));
  }

  async function handleCancel(id) {
    if (!confirm("Are you sure you want to cancel this booking pass?")) return;
    setCancellingId(id);
    setError("");
    try {
      await api.delete(`/bookings/${id}`);
      loadBookings();
    } catch (err) {
      setError(err.response?.data?.error || "Cancellation failed");
    } finally {
      setCancellingId(null);
    }
  }

  if (loading)
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-violet border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-muted text-sm">Fetching your event passes...</p>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-border/80 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet/20 border border-violet/40 text-violet-light text-xs font-medium mb-2">
          🎟️ Digital Pass Wallet
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          My Reserved Passes & Certificates
        </h1>
        <p className="text-muted text-xs sm:text-sm mt-1">
          View your confirmed campus event tickets, QR check-in codes, and official participation certificates.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-4 rounded-2xl text-xs font-medium animate-fadeIn">
          ⚠️ {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-white/5 space-y-4">
          <span className="text-4xl block">🎟️</span>
          <h3 className="font-display font-semibold text-lg text-white">
            No Event Passes Reserved Yet
          </h3>
          <p className="text-muted text-sm max-w-md mx-auto">
            You haven't booked seats for any campus events yet. Explore upcoming hackathons, sports cups, and workshops.
          </p>
          <Link
            to="/"
            className="inline-block bg-gradient-to-r from-violet to-violet-dark hover:from-violet-light hover:to-violet text-white text-xs font-semibold px-6 py-3 rounded-xl shadow-glow-violet transition-all"
          >
            Browse Upcoming Events →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((b) => {
            const ev = b.event;
            if (!ev) return null;

            return (
              <div
                key={b._id}
                className="glass-card rounded-2xl overflow-hidden border border-border/80 hover:border-violet/50 transition-all duration-300 flex flex-col justify-between relative shadow-glass"
              >
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      ✓ {b.status || "CONFIRMED"}
                    </span>
                    <span className="text-xs text-muted font-mono">
                      PASS-{b._id.slice(-6).toUpperCase()}
                    </span>
                  </div>

                  <Link
                    to={`/events/${ev._id}`}
                    className="block group-hover:text-violet-light transition-colors"
                  >
                    <h2 className="font-display font-bold text-xl text-white leading-snug">
                      {ev.title}
                    </h2>
                  </Link>

                  <div className="text-xs space-y-1 text-muted pt-1">
                    <p className="font-medium text-ink">
                      📍 {ev.venue?.name || "Campus Venue"} — {ev.venue?.address}
                    </p>
                    <p>
                      📅{" "}
                      {new Date(ev.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Ticket Stub Notch */}
                <div className="relative my-2">
                  <div className="ticket-notch-left"></div>
                  <div className="ticket-notch-right"></div>
                  <div className="border-t border-dashed border-border/80 mx-4"></div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 pt-1 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedTicket(b)}
                    className="text-xs font-semibold bg-violet/20 hover:bg-violet text-violet-light hover:text-white border border-violet/40 px-3.5 py-2 rounded-xl transition-all shadow-glow-violet flex items-center gap-1.5"
                  >
                    <span>📱</span> Pass QR
                  </button>

                  <button
                    onClick={() => setCertificateBooking(b)}
                    className="text-xs font-semibold bg-amber/20 hover:bg-amber text-amber-light hover:text-black border border-amber/40 px-3.5 py-2 rounded-xl transition-all shadow-glow-amber flex items-center gap-1.5"
                  >
                    <span>📜</span> Certificate
                  </button>

                  <button
                    onClick={() => handleCancel(b._id)}
                    disabled={cancellingId === b._id}
                    className="text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3.5 py-2 rounded-xl transition-all disabled:opacity-50"
                  >
                    {cancellingId === b._id ? "Cancelling..." : "Cancel"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Digital Pass QR Code Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card p-8 rounded-3xl border border-white/10 max-w-sm w-full shadow-glass text-center space-y-4 relative">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 text-muted hover:text-white text-lg"
            >
              ✕
            </button>

            <div className="w-12 h-12 rounded-2xl bg-violet/20 border border-violet/40 mx-auto flex items-center justify-center text-2xl shadow-glow-violet">
              🎓
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal">
                OFFICIAL ENTRY PASS
              </span>
              <h3 className="font-display font-bold text-lg text-white mt-0.5">
                {selectedTicket.event?.title}
              </h3>
              <p className="text-xs text-muted mt-1">
                📍 {selectedTicket.event?.venue?.name}
              </p>
            </div>

            {/* Simulated QR Code Graphic */}
            <div className="p-4 bg-white rounded-2xl mx-auto w-44 h-44 flex items-center justify-center border-4 border-violet/40 shadow-inner">
              <div className="grid grid-cols-6 gap-1 w-full h-full p-2 bg-slate-900 rounded-lg">
                {[...Array(36)].map((_, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xs ${
                      (idx * 7) % 3 === 0 || idx % 5 === 0
                        ? "bg-white"
                        : "bg-slate-800"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="text-xs text-muted font-mono bg-surface p-2 rounded-xl border border-border">
              PASS CODE: PASS-{selectedTicket._id.toUpperCase()}
            </div>

            {/* Calendar Export Buttons inside Ticket Modal */}
            <div className="flex gap-2 text-xs">
              <a
                href={getGoogleCalendarUrl(selectedTicket.event)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-2 rounded-xl bg-surface border border-border hover:border-amber/50 text-amber-light font-semibold text-[11px] flex items-center justify-center gap-1"
              >
                <span>📅</span> Google Cal
              </a>
              <button
                onClick={() => downloadICalFile(selectedTicket.event)}
                className="flex-1 py-2 px-2 rounded-xl bg-surface border border-border hover:border-teal/50 text-teal-light font-semibold text-[11px] flex items-center justify-center gap-1"
              >
                <span>📥</span> iCal .ics
              </button>
            </div>

            <button
              onClick={() => {
                alert("Pass details printed / saved!");
                setSelectedTicket(null);
              }}
              className="w-full py-2.5 rounded-xl bg-violet text-white text-xs font-semibold shadow-glow-violet hover:bg-violet-dark"
            >
              📥 Download / Print Ticket Pass
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Digital Certificate Modal */}
      {certificateBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="glass-card p-8 sm:p-10 rounded-3xl border-2 border-amber/60 max-w-2xl w-full shadow-glow-amber text-center space-y-6 relative bg-gradient-to-b from-surface via-surface to-base">
            <button
              onClick={() => setCertificateBooking(null)}
              className="absolute top-4 right-4 text-muted hover:text-white text-xl"
            >
              ✕
            </button>

            {/* Certificate Header Banner */}
            <div className="space-y-2 border-b border-amber/30 pb-4">
              <div className="w-16 h-16 rounded-full bg-amber/20 border-2 border-amber/60 mx-auto flex items-center justify-center text-3xl shadow-glow-amber">
                🏆
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-light">
                OFFICIAL CAMPUS CERTIFICATE
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                Certificate of Participation
              </h2>
            </div>

            {/* Certificate Body Content */}
            <div className="space-y-4 py-2 text-sm text-ink leading-relaxed">
              <p className="text-xs text-muted">THIS IS PROUDLY PRESENTED TO</p>
              <h3 className="font-display font-bold text-2xl text-teal border-b border-dashed border-teal/40 pb-2 max-w-md mx-auto">
                {name || "Student Delegate"}
              </h3>
              <p className="text-xs sm:text-sm max-w-lg mx-auto text-muted">
                For successfully registering and participating in the campus event{" "}
                <span className="font-bold text-white">
                  "{certificateBooking.event?.title}"
                </span>{" "}
                hosted at {certificateBooking.event?.venue?.name || "Campus Venue"} on{" "}
                {new Date(certificateBooking.event?.date).toLocaleDateString()}.
              </p>
            </div>

            {/* Footer Verification Badge */}
            <div className="pt-4 border-t border-amber/30 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
              <div className="text-left font-mono text-muted text-[11px]">
                <p>VERIFICATION ID: CERT-{certificateBooking._id.toUpperCase()}</p>
                <p>STATUS: OFFICIALLY VERIFIED ✓</p>
              </div>

              <button
                onClick={() => {
                  window.print();
                }}
                className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-amber text-base font-bold shadow-glow-amber hover:bg-amber-dark text-xs"
              >
                🖨️ Print / Save Certificate PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
