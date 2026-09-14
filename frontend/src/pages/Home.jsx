import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import EditEventModal from "../components/EditEventModal";

const CATEGORIES = [
  { name: "All", icon: "🌟", value: "" },
  { name: "Tech", icon: "💻", value: "Tech" },
  { name: "Cultural", icon: "🎭", value: "Cultural" },
  { name: "Sports", icon: "⚽", value: "Sports" },
  { name: "Workshop", icon: "🛠️", value: "Workshop" },
  { name: "Other", icon: "📌", value: "Other" },
];

export default function Home() {
  const { role } = useAuth();
  const isOrganizerOrAdmin = role === "organizer" || role === "admin";

  const [events, setEvents] = useState([]);
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "calendar"
  const [editingEvent, setEditingEvent] = useState(null);
  
  // Calendar month state
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);

  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("bookmarked_events") || "[]");
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [category]);

  function loadEvents() {
    setLoading(true);
    const params = category ? { category } : {};
    api
      .get("/events", { params })
      .then((res) => setEvents(res.data))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return loadEvents();
    setLoading(true);
    try {
      const { data } = await api.get("/events/search", { params: { q: query } });
      setEvents(data);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  function toggleBookmark(eventId, e) {
    e.preventDefault();
    e.stopPropagation();
    let updated;
    if (bookmarks.includes(eventId)) {
      updated = bookmarks.filter((id) => id !== eventId);
    } else {
      updated = [...bookmarks, eventId];
    }
    setBookmarks(updated);
    localStorage.setItem("bookmarked_events", JSON.stringify(updated));
  }

  let displayedEvents = events.filter((ev) => {
    if (showBookmarksOnly) return bookmarks.includes(ev._id);
    return true;
  });

  if (sortBy === "seats") {
    displayedEvents.sort(
      (a, b) => b.totalSeats - b.seatsBooked - (a.totalSeats - a.seatsBooked)
    );
  } else if (sortBy === "title") {
    displayedEvents.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    displayedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  const totalEvents = events.length;
  const totalSeatsAvailable = events.reduce(
    (acc, ev) => acc + (ev.totalSeats - ev.seatsBooked),
    0
  );
  const uniqueVenuesCount = new Set(
    events.map((ev) => ev.venue?._id || ev.venue?.name).filter(Boolean)
  ).size;

  // Calendar calculations
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = calendarDate.toLocaleString("default", { month: "long" });

  const getEventsForDay = (dayNum) => {
    return displayedEvents.filter((ev) => {
      const d = new Date(ev.date);
      return (
        d.getDate() === dayNum &&
        d.getMonth() === month &&
        d.getFullYear() === year
      );
    });
  };

  const nextMonth = () => setCalendarDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCalendarDate(new Date(year, month - 1, 1));
  const todayMonth = () => setCalendarDate(new Date());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10">
      {/* Hero Banner Section */}
      <div className="relative rounded-3xl overflow-hidden glass-card p-8 sm:p-12 border border-white/10 shadow-glass">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet/25 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet/20 border border-violet/40 text-violet-light text-xs font-medium">
            <span className="animate-pulse">🔴</span> Live Campus Event Feed
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Discover & Book Campus{" "}
            <span className="bg-gradient-to-r from-violet-light via-teal-light to-amber bg-clip-text text-transparent">
              Experiences
            </span>
          </h1>
          <p
            className="text-sm sm:text-base leading-relaxed font-medium"
            style={{ color: "#F1F5F9", opacity: 0.95 }}
          >
            Reserve your seats for tech hackathons, cultural fests, sports cups, and workshops across campus venues with instant ticket generation.
          </p>
        </div>

        {/* Live Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-border/70 relative z-10">
          <div className="bg-surface/80 p-4 rounded-2xl border border-border/60">
            <p className="text-xs font-medium text-muted">Active Events</p>
            <p className="font-display text-2xl font-bold text-white mt-1">
              {totalEvents}
            </p>
          </div>
          <div className="bg-surface/80 p-4 rounded-2xl border border-border/60">
            <p className="text-xs font-medium text-muted">Open Seats Left</p>
            <p className="font-display text-2xl font-bold text-teal mt-1">
              {totalSeatsAvailable}
            </p>
          </div>
          <div className="bg-surface/80 p-4 rounded-2xl border border-border/60">
            <p className="text-xs font-medium text-muted">Host Venues</p>
            <p className="font-display text-2xl font-bold text-amber mt-1">
              {uniqueVenuesCount}
            </p>
          </div>
          <div className="bg-surface/80 p-4 rounded-2xl border border-border/60">
            <p className="text-xs font-medium text-muted">Saved Events</p>
            <p className="font-display text-2xl font-bold text-violet-light mt-1">
              {bookmarks.length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter, Search & View Controls */}
      <div className="space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((c) => {
            const isActive = category === c.value;
            return (
              <button
                key={c.name}
                onClick={() => {
                  setQuery("");
                  setCategory(c.value);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-violet text-white shadow-glow-violet font-semibold scale-105"
                    : "bg-surface/80 text-muted hover:text-ink border border-border hover:bg-surface-hover"
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>

        {/* Search & View Mode Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <input
                placeholder="Search events by title or keywords..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-surface/90 border border-border text-ink text-sm placeholder:text-muted/60 focus:outline-none focus:border-violet transition-all"
              />
              <span className="absolute left-3.5 top-3.5 text-muted text-sm">
                🔍
              </span>
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    loadEvents();
                  }}
                  className="absolute right-3.5 top-3.5 text-muted hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            <button className="bg-gradient-to-r from-violet to-violet-dark hover:from-violet-light hover:to-violet text-white text-xs sm:text-sm font-semibold px-6 py-3 rounded-xl shadow-glow-violet transition-all">
              Search
            </button>
          </form>

          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            {/* View Mode Switcher */}
            <div className="flex bg-surface p-1 rounded-xl border border-border">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewMode === "grid"
                    ? "bg-violet text-white shadow-glow-violet"
                    : "text-muted hover:text-white"
                }`}
              >
                🎴 Grid
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewMode === "calendar"
                    ? "bg-violet text-white shadow-glow-violet"
                    : "text-muted hover:text-white"
                }`}
              >
                📅 Calendar
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-xl bg-surface/90 border border-border text-ink text-xs sm:text-sm focus:outline-none focus:border-violet"
            >
              <option value="date">📅 Sort: Upcoming First</option>
              <option value="seats">🎟️ Sort: Most Seats Left</option>
              <option value="title">🔤 Sort: Alphabetical</option>
            </select>

            <button
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-medium border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                showBookmarksOnly
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                  : "bg-surface/90 text-muted border-border hover:text-ink"
              }`}
            >
              <span>{showBookmarksOnly ? "❤️ Bookmarked" : "🤍 Saved"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-violet border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted text-sm">Fetching campus events...</p>
        </div>
      ) : viewMode === "calendar" ? (
        /* Step 1: Interactive Calendar View */
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-glass space-y-6 animate-fadeIn">
          {/* Calendar Month Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/80 pb-4">
            <div>
              <h2 className="font-display font-extrabold text-2xl text-white">
                {monthName} {year}
              </h2>
              <p className="text-xs text-muted">
                Interactive Campus Schedule Matrix
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="px-3 py-1.5 rounded-xl border border-border bg-surface text-xs text-ink hover:border-violet transition-all"
              >
                ◀ Prev
              </button>
              <button
                onClick={todayMonth}
                className="px-3 py-1.5 rounded-xl border border-violet/40 bg-violet/20 text-xs font-semibold text-violet-light hover:bg-violet hover:text-white transition-all"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="px-3 py-1.5 rounded-xl border border-border bg-surface text-xs text-ink hover:border-violet transition-all"
              >
                Next ▶
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-muted uppercase">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty Offset Cells */}
            {[...Array(firstDayIndex)].map((_, i) => (
              <div
                key={`empty-${i}`}
                className="min-h-[90px] rounded-2xl bg-surface/30 border border-border/20 opacity-30"
              />
            ))}

            {/* Day Cells */}
            {[...Array(daysInMonth)].map((_, i) => {
              const dayNum = i + 1;
              const dayEvents = getEventsForDay(dayNum);
              const isToday =
                dayNum === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();

              return (
                <div
                  key={dayNum}
                  onClick={() => dayEvents.length > 0 && setSelectedDayEvents({ dayNum, events: dayEvents })}
                  className={`min-h-[95px] p-2.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                    isToday
                      ? "border-teal/60 bg-teal/10 shadow-glow-teal"
                      : dayEvents.length > 0
                      ? "border-violet/40 bg-surface/90 hover:border-violet hover:shadow-glow-violet"
                      : "border-border/60 bg-surface/50 opacity-60"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? "w-6 h-6 rounded-full bg-teal text-base flex items-center justify-center text-black font-extrabold"
                          : "text-ink"
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet/30 text-violet-light border border-violet/40">
                        {dayEvents.length} event{dayEvents.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <Link
                        key={ev._id}
                        to={`/events/${ev._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="block text-[10px] font-semibold truncate px-2 py-0.5 rounded-md bg-violet/20 hover:bg-violet text-violet-light hover:text-white border border-violet/30 transition-all"
                      >
                        {ev.title}
                      </Link>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="block text-[9px] text-muted text-center font-semibold">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Day Events Popup Modal */}
          {selectedDayEvents && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
              <div className="glass-card p-6 rounded-3xl border border-white/10 max-w-lg w-full shadow-glass space-y-4 relative">
                <div className="flex justify-between items-center border-b border-border/80 pb-3">
                  <h3 className="font-display font-bold text-lg text-white">
                    📅 Events for {monthName} {selectedDayEvents.dayNum}, {year}
                  </h3>
                  <button
                    onClick={() => setSelectedDayEvents(null)}
                    className="text-muted hover:text-white text-lg"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {selectedDayEvents.events.map((ev) => (
                    <div
                      key={ev._id}
                      className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-violet/20 text-violet-light border border-violet/30">
                          {ev.category}
                        </span>
                        <h4 className="font-bold text-sm text-white">{ev.title}</h4>
                        <p className="text-xs text-muted">📍 {ev.venue?.name}</p>
                      </div>
                      <Link
                        to={`/events/${ev._id}`}
                        className="text-xs font-semibold px-4 py-2 rounded-xl bg-violet text-white shadow-glow-violet hover:bg-violet-dark whitespace-nowrap"
                      >
                        View & Book →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : displayedEvents.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-white/5 space-y-3">
          <span className="text-4xl block">🔍</span>
          <h3 className="font-display font-semibold text-lg text-white">
            No Events Found
          </h3>
          <p className="text-muted text-sm max-w-md mx-auto">
            {showBookmarksOnly
              ? "You haven't bookmarked any events yet. Click the heart icon on any event card to save it."
              : "Try relaxing your search query or selecting a different category."}
          </p>
          {(query || category || showBookmarksOnly) && (
            <button
              onClick={() => {
                setQuery("");
                setCategory("");
                setShowBookmarksOnly(false);
                loadEvents();
              }}
              className="mt-2 text-xs text-violet-light font-semibold underline"
            >
              Clear filters and view all events
            </button>
          )}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedEvents.map((ev) => {
            const seatsLeft = ev.totalSeats - ev.seatsBooked;
            const percentFilled = Math.min(
              100,
              Math.round((ev.seatsBooked / ev.totalSeats) * 100)
            );
            const isBookmarked = bookmarks.includes(ev._id);

            return (
              <div
                key={ev._id}
                className="group glass-card rounded-2xl overflow-hidden border border-border/80 hover:border-violet/50 hover:shadow-glow-violet transition-all duration-300 flex flex-col justify-between relative"
              >
                {/* Card Header & Content */}
                <div className="p-6 space-y-3">
                  {/* Live Announcement Ticker Banner if present */}
                  {ev.liveAnnouncement && (
                    <div className="p-2.5 rounded-xl bg-amber/15 border border-amber/30 text-amber-light text-xs font-semibold flex items-center gap-2 animate-pulse">
                      <span>📢</span>
                      <span className="truncate">{ev.liveAnnouncement}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet/15 text-violet-light border border-violet/30">
                        {ev.category}
                      </span>

                      {/* Status Badges */}
                      {ev.status === "LIVE NOW" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                          🔴 LIVE NOW
                        </span>
                      )}
                      {ev.status === "POSTPONED" && (
                        <span className="inline-block text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber/20 text-amber-light border border-amber/40">
                          ⏳ POSTPONED
                        </span>
                      )}
                      {ev.status === "CANCELLED" && (
                        <span className="inline-block text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-red-600/20 text-red-300 border border-red-600/40">
                          🚫 CANCELLED
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {isOrganizerOrAdmin && (
                        <button
                          onClick={() => setEditingEvent(ev)}
                          className="px-2 py-1 rounded-lg bg-violet/20 hover:bg-violet text-violet-light hover:text-white border border-violet/40 text-xs font-bold transition-all flex items-center gap-1"
                          title="Modify Live Card"
                        >
                          ✏️ Edit
                        </button>
                      )}
                      <button
                        onClick={(e) => toggleBookmark(ev._id, e)}
                        className="text-lg p-1 hover:scale-125 transition-transform"
                        title={isBookmarked ? "Remove Bookmark" : "Save Event"}
                      >
                        {isBookmarked ? "❤️" : "🤍"}
                      </button>
                    </div>
                  </div>

                  <Link to={`/events/${ev._id}`} className="block group-hover:text-violet-light transition-colors">
                    <h2 className="font-display font-bold text-xl leading-snug text-white line-clamp-1">
                      {ev.title}
                    </h2>
                  </Link>

                  <p className="text-xs text-muted leading-relaxed line-clamp-2">
                    {ev.description}
                  </p>
                </div>

                {/* Capacity Progress Bar */}
                <div className="px-6 space-y-1.5">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-muted">Seats Filled</span>
                    <span
                      className={
                        seatsLeft > 0 ? "text-teal" : "text-rose-400 font-bold"
                      }
                    >
                      {ev.seatsBooked} / {ev.totalSeats} ({percentFilled}%)
                    </span>
                  </div>
                  <div className="w-full bg-surface-hover h-2 rounded-full overflow-hidden border border-border/40">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        seatsLeft <= 0
                          ? "bg-rose-500"
                          : percentFilled > 80
                          ? "bg-amber"
                          : "bg-gradient-to-r from-violet to-teal"
                      }`}
                      style={{ width: `${percentFilled}%` }}
                    />
                  </div>
                </div>

                {/* Ticket Stub Divider */}
                <div className="relative my-4">
                  <div className="ticket-notch-left"></div>
                  <div className="ticket-notch-right"></div>
                  <div className="border-t border-dashed border-border/80 mx-4"></div>
                </div>

                {/* Footer Info & Action */}
                <div className="px-6 pb-6 pt-1 flex items-center justify-between gap-3">
                  <div className="text-xs space-y-0.5">
                    <p className="font-semibold text-ink truncate max-w-[140px]">
                      📍 {ev.venue?.name || "Campus Venue"}
                    </p>
                    <p className="text-muted text-[11px]">
                      📅{" "}
                      {new Date(ev.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <Link
                    to={`/events/${ev._id}`}
                    className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                      seatsLeft > 0
                        ? "bg-violet/20 hover:bg-violet text-violet-light hover:text-white border border-violet/40 shadow-sm"
                        : "bg-surface text-muted border border-border cursor-not-allowed"
                    }`}
                  >
                    {seatsLeft > 0 ? "Book Seat →" : "Sold Out"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Event Modal for Organizers and Admins */}
      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onUpdated={(updatedEv) => {
            setEvents((prev) =>
              prev.map((e) => (e._id === updatedEv._id ? updatedEv : e))
            );
          }}
        />
      )}
    </div>
  );
}
