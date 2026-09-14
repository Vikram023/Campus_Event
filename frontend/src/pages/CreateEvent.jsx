import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const CATEGORIES = ["Tech", "Cultural", "Sports", "Workshop", "Other"];

export default function CreateEvent() {
  const [venues, setVenues] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Tech",
    date: "",
    venue: "",
    totalSeats: "100",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/venues")
      .then((res) => {
        setVenues(res.data);
        if (res.data.length > 0) {
          setForm((f) => ({ ...f, venue: res.data[0]._id }));
        }
      })
      .catch(() => setError("Failed to fetch venues list"));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/events", form);
      navigate(`/events/${data._id}`);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to create event. Please check details."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Selected venue object for live preview
  const selectedVenueObj = venues.find((v) => v._id === form.venue);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-border/80 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber/15 border border-amber/30 text-amber-light text-xs font-medium mb-2">
          🎪 Event Hosting Console
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Create & Publish Event
        </h1>
        <p className="text-muted text-xs sm:text-sm mt-1">
          Host a new workshop, hackathon, or tournament for students across campus.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-4 rounded-2xl text-xs font-medium animate-fadeIn">
          ⚠️ {error}
        </div>
      )}

      {/* Split View: Form + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container (7 cols) */}
        <div className="lg:col-span-7 glass-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-glass">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">
                Event Title
              </label>
              <input
                placeholder="e.g. AI & ML National Student Summit"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface/90 border border-border text-ink placeholder:text-muted/50 focus:outline-none focus:border-amber transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">
                Event Description
              </label>
              <textarea
                placeholder="Describe key highlights, schedule, prerequisite requirements, or prizes..."
                required
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-surface/90 border border-border text-ink placeholder:text-muted/50 focus:outline-none focus:border-amber transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-surface/90 border border-border text-ink focus:outline-none focus:border-amber cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Campus Venue
                </label>
                <select
                  required
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-surface/90 border border-border text-ink focus:outline-none focus:border-amber cursor-pointer"
                >
                  {venues.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.name} (Cap: {v.capacity})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Event Date
                </label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-surface/90 border border-border text-ink focus:outline-none focus:border-amber"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Total Seat Allocation
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedVenueObj ? selectedVenueObj.capacity : 1000}
                  placeholder="Total seats"
                  required
                  value={form.totalSeats}
                  onChange={(e) =>
                    setForm({ ...form, totalSeats: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-surface/90 border border-border text-ink focus:outline-none focus:border-amber"
                />
              </div>
            </div>

            <button
              disabled={submitting}
              className="w-full bg-gradient-to-r from-amber to-amber-dark hover:brightness-110 text-base font-semibold py-3.5 rounded-xl shadow-glow-amber text-sm disabled:opacity-50 transition-all duration-300 mt-2"
            >
              {submitting ? "Publishing Event..." : "Publish Event Listing →"}
            </button>
          </form>
        </div>

        {/* Live Card Preview Side (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              ✨ Live Card Preview
            </span>
            <span className="text-[10px] text-teal font-mono">
              REAL-TIME SYNC
            </span>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-amber/40 shadow-glow-amber space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber/15 text-amber-light border border-amber/30">
                {form.category || "Tech"}
              </span>
              <span className="text-xs text-teal font-semibold">
                {form.totalSeats || "100"} Seats
              </span>
            </div>

            <h3 className="font-display font-bold text-xl text-white">
              {form.title || "Your Event Title Here"}
            </h3>

            <p className="text-xs text-muted leading-relaxed line-clamp-3">
              {form.description ||
                "Your event description will appear here as students browse the live feed..."}
            </p>

            <div className="pt-3 border-t border-dashed border-border/80 flex justify-between items-center text-xs">
              <div>
                <p className="text-ink font-semibold">
                  📍 {selectedVenueObj?.name || "Selected Venue"}
                </p>
                <p className="text-muted text-[11px]">
                  📅 {form.date ? new Date(form.date).toLocaleDateString() : "Date TBD"}
                </p>
              </div>

              <span className="text-xs bg-violet/20 text-violet-light border border-violet/40 px-3 py-1.5 rounded-xl">
                Preview Card
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
