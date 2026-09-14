import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { getGoogleCalendarUrl, downloadICalFile } from "../utils/calendar";
import EditEventModal from "../components/EditEventModal";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, name, role } = useAuth();
  const isOrganizerOrAdmin = role === "organizer" || role === "admin";

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [booking, setBooking] = useState(false);
  const [seatQuantity, setSeatQuantity] = useState(1);
  const [submittingWaitlist, setSubmittingWaitlist] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [id]);

  function loadEvent() {
    setLoading(true);
    api
      .get(`/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch(() => setMessage({ type: "error", text: "Event not found" }))
      .finally(() => setLoading(false));
  }

  async function handleBook() {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setBooking(true);
    setMessage(null);
    try {
      await api.post("/bookings", { eventId: id, quantity: seatQuantity });
      setMessage({
        type: "success",
        text: `🎉 ${seatQuantity} seat(s) booked successfully! Your passes are saved under My Bookings.`,
      });
      loadEvent();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Booking failed. Try again.",
      });
    } finally {
      setBooking(false);
    }
  }

  async function handleJoinWaitlist() {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setSubmittingWaitlist(true);
    setMessage(null);
    try {
      await api.post(`/events/${id}/waitlist`);
      setMessage({
        type: "success",
        text: "⏳ You have joined the waitlist! We will notify you if a seat opens.",
      });
      loadEvent();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to join waitlist",
      });
    } finally {
      setSubmittingWaitlist(false);
    }
  }

  async function handleLeaveWaitlist() {
    setSubmittingWaitlist(true);
    setMessage(null);
    try {
      await api.delete(`/events/${id}/waitlist`);
      setMessage({
        type: "success",
        text: "You have left the waitlist.",
      });
      loadEvent();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to leave waitlist",
      });
    } finally {
      setSubmittingWaitlist(false);
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post(`/events/${id}/reviews`, reviewForm);
      setReviewForm({ rating: 5, comment: "" });
      setMessage({
        type: "success",
        text: "✨ Thank you! Your review has been submitted.",
      });
      loadEvent();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Review submission failed",
      });
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading)
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-violet border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-muted text-sm">Loading event pass details...</p>
      </div>
    );

  if (!event)
    return (
      <div className="max-w-md mx-auto my-16 p-8 glass-card rounded-3xl text-center space-y-4 border border-white/10">
        <span className="text-4xl">⚠️</span>
        <h2 className="font-display font-bold text-xl text-white">
          Event Not Found
        </h2>
        <p className="text-muted text-sm">
          The requested event may have been removed or does not exist.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-violet text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-glow-violet"
        >
          Back to Events
        </button>
      </div>
    );

  const seatsLeft = event.totalSeats - event.seatsBooked;
  const percentFilled = Math.min(
    100,
    Math.round((event.seatsBooked / event.totalSeats) * 100)
  );

  const waitlistCount = event.waitlist ? event.waitlist.length : 0;

  const avgRating =
    event.reviews.length > 0
      ? (
          event.reviews.reduce((sum, r) => sum + r.rating, 0) /
          event.reviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Toast Notification */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-medium animate-fadeIn flex items-center justify-between border ${
            message.type === "error"
              ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
              : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
          }`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="text-xs font-bold ml-2 opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Ticket Pass Card */}
      <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-glass relative">
        <div className="p-8 sm:p-10 space-y-6">
          {/* Live Announcement Banner if present */}
          {event.liveAnnouncement && (
            <div className="p-3.5 rounded-2xl bg-amber/15 border border-amber/30 text-amber-light text-xs font-semibold flex items-center gap-2.5 animate-pulse mb-4">
              <span className="text-base">📢</span>
              <span><strong>Live Announcement:</strong> {event.liveAnnouncement}</span>
            </div>
          )}

          {/* Header Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-violet/20 text-violet-light border border-violet/40">
                {event.category}
              </span>

              {/* Live Status Badges */}
              {event.status === "LIVE NOW" && (
                <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                  🔴 LIVE NOW
                </span>
              )}
              {event.status === "POSTPONED" && (
                <span className="inline-block text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-amber/20 text-amber-light border border-amber/40">
                  ⏳ POSTPONED
                </span>
              )}
              {event.status === "CANCELLED" && (
                <span className="inline-block text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-red-600/20 text-red-300 border border-red-600/40">
                  🚫 CANCELLED
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted">
              {isOrganizerOrAdmin && (
                <button
                  onClick={() => setEditingEvent(event)}
                  className="px-3.5 py-1.5 rounded-xl bg-violet/20 hover:bg-violet text-violet-light hover:text-white border border-violet/40 font-bold transition-all shadow-sm flex items-center gap-1"
                >
                  ✏️ Edit Live Event
                </button>
              )}
              {waitlistCount > 0 && (
                <span className="bg-amber/20 text-amber-light border border-amber/40 px-2.5 py-1 rounded-full font-semibold">
                  ⏳ {waitlistCount} on Waitlist
                </span>
              )}
              {avgRating ? (
                <span className="bg-amber/15 text-amber-light border border-amber/30 px-2.5 py-1 rounded-full font-semibold">
                  ⭐ {avgRating} ({event.reviews.length} reviews)
                </span>
              ) : (
                <span className="bg-surface text-muted border border-border px-2.5 py-1 rounded-full">
                  No ratings yet
                </span>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-3">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {event.title}
            </h1>
            <p className="text-muted text-sm sm:text-base leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Key Event Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/80">
            <div className="bg-surface/80 p-4 rounded-2xl border border-border/60 flex items-start gap-3">
              <span className="text-xl">📍</span>
              <div>
                <p className="text-xs font-semibold text-muted">Venue</p>
                <p className="text-sm font-bold text-white mt-0.5">
                  {event.venue?.name || "Campus Venue"}
                </p>
                <p className="text-xs text-muted">{event.venue?.address}</p>
              </div>
            </div>

            <div className="bg-surface/80 p-4 rounded-2xl border border-border/60 flex items-start gap-3">
              <span className="text-xl">📅</span>
              <div>
                <p className="text-xs font-semibold text-muted">Date & Time</p>
                <p className="text-sm font-bold text-white mt-0.5">
                  {new Date(event.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="text-xs text-muted">
                  {new Date(event.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="bg-surface/80 p-4 rounded-2xl border border-border/60 flex items-start gap-3">
              <span className="text-xl">🧑‍💼</span>
              <div>
                <p className="text-xs font-semibold text-muted">Organized By</p>
                <p className="text-sm font-bold text-white mt-0.5">
                  {event.organizer?.name || "Campus Organizer"}
                </p>
                <p className="text-xs text-muted">{event.organizer?.email}</p>
              </div>
            </div>

            <div className="bg-surface/80 p-4 rounded-2xl border border-border/60 flex items-start gap-3">
              <span className="text-xl">🎟️</span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted">Seat Capacity</p>
                <p
                  className={`text-sm font-bold mt-0.5 ${
                    seatsLeft > 0 ? "text-teal" : "text-rose-400"
                  }`}
                >
                  {seatsLeft > 0 ? `${seatsLeft} seats remaining` : "Fully Booked"}
                </p>
                <div className="w-full bg-border h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-gradient-to-r from-violet to-teal transition-all"
                    style={{ width: `${percentFilled}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Calendar Export Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={getGoogleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2.5 px-4 rounded-xl bg-surface border border-border hover:border-amber/50 text-amber-light text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <span>📅</span> Add to Google Calendar
            </a>
            <button
              onClick={() => downloadICalFile(event)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-surface border border-border hover:border-teal/50 text-teal-light text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <span>📥</span> Download iCal (.ics)
            </button>
          </div>

          {/* Action Button & Step 6: Multi-seat quantity selector */}
          <div className="pt-2 space-y-3">
            {seatsLeft > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-surface/80 p-3 rounded-xl border border-border">
                  <span className="text-xs font-semibold text-muted">
                    👥 Seats to Reserve:
                  </span>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setSeatQuantity(num)}
                        disabled={num > seatsLeft}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                          seatQuantity === num
                            ? "bg-violet text-white shadow-glow-violet scale-105"
                            : "bg-surface border border-border text-muted hover:text-white disabled:opacity-30"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleBook}
                  disabled={booking}
                  className={`w-full py-4 rounded-2xl font-bold text-sm shadow-glow-violet transition-all duration-300 ${
                    booking
                      ? "bg-violet-dark text-white animate-pulse"
                      : "bg-gradient-to-r from-violet via-violet-dark to-teal hover:brightness-110 text-white"
                  }`}
                >
                  {booking
                    ? "Reserving Seats..."
                    : `🎟️ Reserve ${seatQuantity} Seat${seatQuantity > 1 ? "s" : ""} Now`}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  disabled
                  className="w-full py-3 rounded-2xl font-bold text-xs bg-surface text-rose-400 border border-rose-500/30 text-center"
                >
                  ⛔ Event Fully Booked
                </button>
                <button
                  onClick={handleJoinWaitlist}
                  disabled={submittingWaitlist}
                  className="w-full py-3.5 rounded-2xl font-semibold text-xs bg-amber/20 text-amber-light hover:bg-amber hover:text-black border border-amber/40 shadow-glow-amber transition-all disabled:opacity-50"
                >
                  {submittingWaitlist ? "Processing..." : "⏳ Join Event Waitlist"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews & Ratings Section */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <span>💬</span> Student Reviews ({event.reviews.length})
        </h2>

        {/* Review Submission Form */}
        <form
          onSubmit={handleReviewSubmit}
          className="glass-card p-6 rounded-3xl border border-white/10 space-y-4"
        >
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">
            Share Your Experience
          </p>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted font-medium">Rating:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() =>
                    setReviewForm({ ...reviewForm, rating: star })
                  }
                  className={`text-xl transition-transform hover:scale-125 ${
                    star <= reviewForm.rating ? "opacity-100" : "opacity-30"
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-light">
              {reviewForm.rating} / 5 Stars
            </span>
          </div>

          <textarea
            placeholder="Write your feedback or event experience..."
            value={reviewForm.comment}
            onChange={(e) =>
              setReviewForm({ ...reviewForm, comment: e.target.value })
            }
            className="w-full p-4 rounded-2xl bg-surface/90 border border-border text-ink placeholder:text-muted/50 text-sm focus:outline-none focus:border-violet transition-all"
            rows={3}
          />

          <button
            disabled={submittingReview}
            className="bg-amber hover:bg-amber-dark text-base font-semibold px-6 py-2.5 rounded-xl text-xs transition-all disabled:opacity-50"
          >
            {submittingReview ? "Submitting..." : "Submit Review"}
          </button>
        </form>

        {/* Reviews List Feed */}
        <div className="space-y-3">
          {event.reviews.length === 0 ? (
            <div className="glass-card p-6 rounded-2xl text-center text-muted text-xs">
              No reviews written yet. Be the first student to review this event!
            </div>
          ) : (
            event.reviews.map((r, i) => (
              <div
                key={i}
                className="glass-card p-5 rounded-2xl border border-border/60 flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-violet/20 border border-violet/40 flex items-center justify-center font-bold text-xs text-violet-light shrink-0">
                  {r.user?.name ? r.user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">
                      {r.user?.name || "Campus Student"}
                    </span>
                    <span className="text-xs text-amber-light font-semibold">
                      {"★".repeat(r.rating)}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="text-xs text-muted leading-relaxed">
                      {r.comment}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onUpdated={(updatedEv) => {
            setEvent(updatedEv);
            setMessage({ type: "success", text: "✓ Live Event Card & details updated successfully!" });
          }}
        />
      )}
    </div>
  );
}
