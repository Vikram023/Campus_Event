import { useEffect, useState } from "react";
import api from "../api/axios";
import EditEventModal from "../components/EditEventModal";

export default function OrganizerStudio() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    loadOrganizerEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadAttendees(selectedEventId);
    }
  }, [selectedEventId]);

  function loadOrganizerEvents() {
    setLoading(true);
    api
      .get("/events")
      .then((res) => {
        setEvents(res.data || []);
        if (res.data.length > 0) {
          setSelectedEventId(res.data[0]._id);
        }
      })
      .catch(() => setMessage({ type: "error", text: "Failed to fetch events" }))
      .finally(() => setLoading(false));
  }

  function loadAttendees(eventId) {
    api
      .get(`/bookings/event/${eventId}`)
      .then((res) => setAttendees(res.data || []))
      .catch(() => setAttendees([]));
  }

  async function handleCheckin(bookingId, newStatus = "ATTENDED") {
    try {
      await api.patch(`/bookings/${bookingId}/checkin`, { status: newStatus });
      setMessage({ type: "success", text: "✓ Student attendance updated!" });
      loadAttendees(selectedEventId);
    } catch {
      setMessage({ type: "error", text: "Failed to update attendance status" });
    }
  }

  function handleExportCSV() {
    if (attendees.length === 0) return alert("No attendee data to export.");

    const selectedEv = events.find((e) => e._id === selectedEventId);
    const eventTitle = selectedEv ? selectedEv.title : "Event";

    const headers = ["Ticket Pass Code", "Student Name", "Email", "Status", "Booked At"];
    const rows = attendees.map((a) => [
      `PASS-${a._id.toUpperCase()}`,
      `"${a.user?.name || "Student"}"`,
      `"${a.user?.email || ""}"`,
      a.status || "CONFIRMED",
      new Date(a.createdAt).toLocaleString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Attendees_${eventTitle.replace(/[^a-z0-9]/gi, "_")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const selectedEventObj = events.find((e) => e._id === selectedEventId);

  const filteredAttendees = attendees.filter((a) => {
    const q = searchQuery.toLowerCase();
    const passCode = `pass-${a._id.toLowerCase()}`;
    return (
      a.user?.name?.toLowerCase().includes(q) ||
      a.user?.email?.toLowerCase().includes(q) ||
      passCode.includes(q)
    );
  });

  const attendedCount = attendees.filter((a) => a.status === "ATTENDED").length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet/20 border border-violet/40 text-violet-light text-xs font-medium mb-2">
            🎪 Host Dashboard
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Organizer Studio & Check-in
          </h1>
          <p className="text-muted text-xs sm:text-sm mt-1">
            Manage student registrations, check-in attendees at the door, and export CSV reports.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={attendees.length === 0}
          className="text-xs font-semibold bg-gradient-to-r from-teal to-teal-dark hover:brightness-110 text-base px-5 py-2.5 rounded-xl shadow-glow-teal disabled:opacity-50 transition-all flex items-center gap-2"
        >
          <span>📥</span> Export Attendee List (.CSV)
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-medium animate-fadeIn flex items-center justify-between border ${
            message.type === "error"
              ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
              : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Event Selection & Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Event Selector (5 cols) */}
        <div className="md:col-span-5 glass-card p-6 rounded-3xl border border-white/10 space-y-4">
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider">
            Select Hosted Event
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full p-3 rounded-xl bg-surface/90 border border-border text-ink text-sm focus:outline-none focus:border-violet"
          >
            {events.map((e) => (
              <option key={e._id} value={e._id}>
                {e.title} ({new Date(e.date).toLocaleDateString()})
              </option>
            ))}
          </select>

          {selectedEventObj && (
            <div className="p-4 rounded-2xl bg-surface/80 border border-border/60 text-xs space-y-2 relative">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-white text-sm">{selectedEventObj.title}</p>
                  <p className="text-muted">📍 {selectedEventObj.venue?.name}</p>
                  <p className="text-muted">
                    📅 {new Date(selectedEventObj.date).toLocaleString()}
                  </p>
                  {selectedEventObj.status && (
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet/20 text-violet-light border border-violet/30">
                      Status: {selectedEventObj.status}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setEditingEvent(selectedEventObj)}
                  className="px-3 py-1.5 rounded-xl bg-violet/20 hover:bg-violet text-violet-light hover:text-white border border-violet/40 font-semibold text-xs transition-all shadow-sm"
                >
                  ✏️ Edit Card
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Event Stats (7 cols) */}
        <div className="md:col-span-7 grid grid-cols-3 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
            <span className="text-xs text-muted font-semibold">Total Seats</span>
            <span className="font-display text-3xl font-bold text-white">
              {selectedEventObj ? selectedEventObj.totalSeats : 0}
            </span>
            <span className="text-[10px] text-muted">Allocated</span>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
            <span className="text-xs text-muted font-semibold">Reservations</span>
            <span className="font-display text-3xl font-bold text-teal">
              {attendees.length}
            </span>
            <span className="text-[10px] text-teal">Passes Booked</span>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
            <span className="text-xs text-muted font-semibold">Checked-in</span>
            <span className="font-display text-3xl font-bold text-amber">
              {attendedCount}
            </span>
            <span className="text-[10px] text-amber">Present at Door</span>
          </div>
        </div>
      </div>

      {/* Attendee Check-in Table */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-glass space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="font-display font-bold text-xl text-white">
              Student Registration Roster ({filteredAttendees.length})
            </h2>
            <p className="text-xs text-muted">
              Verify ticket codes and check-in students on arrival
            </p>
          </div>

          {/* Quick Check-in Search input */}
          <input
            placeholder="Search student name, email, or PASS code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-72 px-4 py-2 rounded-xl bg-surface/90 border border-border text-ink text-xs focus:outline-none focus:border-violet"
          />
        </div>

        {filteredAttendees.length === 0 ? (
          <div className="py-12 text-center text-muted text-xs">
            No attendees found matching query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-muted border-collapse">
              <thead>
                <tr className="border-b border-border/80 text-ink font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Ticket Pass Code</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Attendance Status</th>
                  <th className="py-3 px-4 text-right">Door Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredAttendees.map((a) => {
                  const isAttended = a.status === "ATTENDED";
                  return (
                    <tr key={a._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-violet-light font-bold">
                        PASS-{a._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {a.user?.name || "Student"}
                      </td>
                      <td className="py-3.5 px-4">{a.user?.email || "N/A"}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                            isAttended
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-surface text-muted border-border"
                          }`}
                        >
                          {a.status || "CONFIRMED"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isAttended ? (
                          <button
                            onClick={() => handleCheckin(a._id, "CONFIRMED")}
                            className="text-[11px] font-semibold text-muted hover:text-white underline"
                          >
                            Reset Check-in
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCheckin(a._id, "ATTENDED")}
                            className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-base transition-all"
                          >
                            ✓ Mark Attended
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onUpdated={(updatedEv) => {
            setEvents((prev) =>
              prev.map((e) => (e._id === updatedEv._id ? updatedEv : e))
            );
            setMessage({ type: "success", text: "✓ Live Event Card successfully updated!" });
          }}
        />
      )}
    </div>
  );
}
