import { useState, useEffect } from "react";
import api from "../api/axios";

export default function EditEventModal({ event, onClose, onUpdated }) {
  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [category, setCategory] = useState(event?.category || "Tech");
  const [date, setDate] = useState(
    event?.date ? new Date(event.date).toISOString().slice(0, 16) : ""
  );
  const [totalSeats, setTotalSeats] = useState(event?.totalSeats || 100);
  const [venueId, setVenueId] = useState(
    typeof event?.venue === "object" ? event?.venue?._id : event?.venue || ""
  );
  const [status, setStatus] = useState(event?.status || "UPCOMING");
  const [liveAnnouncement, setLiveAnnouncement] = useState(
    event?.liveAnnouncement || ""
  );

  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/venues")
      .then((res) => {
        setVenues(res.data || []);
        if (!venueId && res.data?.length > 0) {
          setVenueId(res.data[0]._id);
        }
      })
      .catch(() => setError("Failed to fetch venues list"))
      .finally(() => setLoadingVenues(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        title,
        description,
        category,
        date: new Date(date).toISOString(),
        totalSeats: Number(totalSeats),
        venue: venueId,
        status,
        liveAnnouncement,
      };

      const { data } = await api.put(`/events/${event._id}`, payload);
      onUpdated(data);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to update event. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-glass space-y-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet/20 border border-violet/40 text-violet-light text-[11px] font-semibold mb-1">
              ✏️ Live Event Card Editor
            </div>
            <h2 className="font-display font-bold text-2xl text-white">
              Modify Event & Ticker
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface/80 hover:bg-surface border border-border text-muted hover:text-white flex items-center justify-center text-sm transition-all"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Status & Live Announcement Broadcast Bar */}
          <div className="p-4 rounded-2xl bg-violet/10 border border-violet/30 space-y-3">
            <label className="block font-bold text-violet-light text-xs">
              🔴 Live Event Status & Announcement Ticker
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "UPCOMING", label: "🗓️ Upcoming", color: "border-teal/50 bg-teal/10 text-teal-light" },
                { id: "LIVE NOW", label: "🔴 Live Now", color: "border-rose-500/50 bg-rose-500/10 text-rose-300" },
                { id: "POSTPONED", label: "⏳ Postponed", color: "border-amber/50 bg-amber/10 text-amber-light" },
                { id: "CANCELLED", label: "🚫 Cancelled", color: "border-red-600/50 bg-red-600/10 text-red-300" },
              ].map((st) => (
                <button
                  type="button"
                  key={st.id}
                  onClick={() => setStatus(st.id)}
                  className={`py-2 px-2.5 rounded-xl border font-bold text-[11px] transition-all text-center ${
                    status === st.id
                      ? `${st.color} shadow-sm ring-1 ring-white/20 scale-105`
                      : "border-border/60 bg-surface/50 text-muted hover:text-white"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-muted font-semibold mb-1">
                📢 Live Announcement Message (Shows on Card)
              </label>
              <input
                type="text"
                placeholder="e.g. Venue changed to Main Auditorium / Hackathon started!"
                value={liveAnnouncement}
                onChange={(e) => setLiveAnnouncement(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface/90 border border-border text-ink text-xs focus:outline-none focus:border-violet"
              />
            </div>
          </div>

          {/* Event Title */}
          <div>
            <label className="block font-semibold text-muted mb-1">
              Event Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface/90 border border-border text-white text-sm focus:outline-none focus:border-violet"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-muted mb-1">
              Description
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface/90 border border-border text-ink text-xs focus:outline-none focus:border-violet"
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-muted mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface/90 border border-border text-ink text-xs focus:outline-none focus:border-violet"
              >
                <option value="Tech">💻 Tech</option>
                <option value="Cultural">🎭 Cultural</option>
                <option value="Sports">⚽ Sports</option>
                <option value="Workshop">🛠️ Workshop</option>
                <option value="Other">📌 Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-muted mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface/90 border border-border text-ink text-xs focus:outline-none focus:border-violet"
              />
            </div>
          </div>

          {/* Venue & Total Seats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-muted mb-1">
                Campus Venue
              </label>
              {loadingVenues ? (
                <div className="p-2 text-muted text-xs">Loading venues...</div>
              ) : (
                <select
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface/90 border border-border text-ink text-xs focus:outline-none focus:border-violet"
                >
                  {venues.map((v) => (
                    <option key={v._id} value={v._id}>
                      📍 {v.name} (Cap: {v.capacity})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block font-semibold text-muted mb-1">
                Total Seats Limit
              </label>
              <input
                type="number"
                min={event.seatsBooked || 1}
                required
                value={totalSeats}
                onChange={(e) => setTotalSeats(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface/90 border border-border text-ink text-xs focus:outline-none focus:border-violet"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/80">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-muted hover:text-white font-medium transition-all"
            >
              Cancel
            </button>
            <button
              disabled={submitting}
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet to-violet-dark hover:from-violet-light hover:to-violet text-white font-bold shadow-glow-violet disabled:opacity-50 transition-all"
            >
              {submitting ? "Saving Changes..." : "✓ Update Live Event Card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
