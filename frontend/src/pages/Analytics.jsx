import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import api from "../api/axios";

export default function Analytics() {
  const [venues, setVenues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/analytics/popular-venues"),
      api.get("/analytics/category-stats"),
      api.get("/analytics/booking-trends"),
    ])
      .then(([v, c, t]) => {
        setVenues(v.data || []);
        setCategories(c.data || []);
        setTrends(t.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-violet border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-muted text-sm">Aggregating campus analytics...</p>
      </div>
    );

  const totalBookingsRecorded = venues.reduce(
    (acc, v) => acc + (v.totalBookings || 0),
    0
  );

  const BAR_COLORS = ["#8B5CF6", "#2DD4BF", "#F59E0B", "#F43F5E", "#10B981"];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-border/80 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet/20 border border-violet/40 text-violet-light text-xs font-medium mb-2">
          📊 Real-Time Intelligence
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Campus Activity Analytics
        </h1>
        <p className="text-muted text-xs sm:text-sm mt-1">
          Insights into venue booking demand, category ratings, and monthly student participation trends.
        </p>
      </div>

      {/* KPI Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-1">
          <p className="text-xs font-semibold text-muted">Total Seat Bookings</p>
          <p className="font-display text-3xl font-extrabold text-violet-light">
            {totalBookingsRecorded}
          </p>
          <p className="text-[11px] text-teal">Across popular auditoriums</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-1">
          <p className="text-xs font-semibold text-muted">Categories Active</p>
          <p className="font-display text-3xl font-extrabold text-teal">
            {categories.length}
          </p>
          <p className="text-[11px] text-muted">Tech, Cultural, Sports & Workshops</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-1">
          <p className="text-xs font-semibold text-muted">Top Venue</p>
          <p className="font-display text-xl font-bold text-amber truncate">
            {venues.length > 0 ? venues[0].venueName : "N/A"}
          </p>
          <p className="text-[11px] text-muted">
            {venues.length > 0 ? `${venues[0].totalBookings} total bookings` : "No data"}
          </p>
        </div>
      </div>

      {/* Most Popular Venues Chart */}
      <section className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-glass space-y-4">
        <div>
          <h2 className="font-display font-bold text-xl text-white">
            🏛️ Top Most Booked Venues
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Ranking based on aggregated student ticket reservations
          </p>
        </div>

        {venues.length === 0 ? (
          <p className="text-muted text-xs py-8 text-center">
            No booking data available yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={venues} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A233D" />
              <XAxis dataKey="venueName" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9CA3AF" allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#141122",
                  borderColor: "#2A233D",
                  borderRadius: "12px",
                  color: "#F3F0FA",
                }}
              />
              <Bar dataKey="totalBookings" radius={[8, 8, 0, 0]}>
                {venues.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Category Stats */}
      <section className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-glass space-y-4">
        <div>
          <h2 className="font-display font-bold text-xl text-white">
            🎭 Events & Student Satisfaction by Category
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Event volume and average rating breakdown
          </p>
        </div>

        {categories.length === 0 ? (
          <p className="text-muted text-xs py-8 text-center">
            No category records found.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={categories} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A233D" />
                  <XAxis dataKey="category" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9CA3AF" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#141122",
                      borderColor: "#2A233D",
                      borderRadius: "12px",
                      color: "#F3F0FA",
                    }}
                  />
                  <Bar dataKey="eventCount" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Events Hosted" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="lg:col-span-5 space-y-2.5">
              {categories.map((c) => (
                <div
                  key={c.category}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface/80 border border-border/60 text-xs"
                >
                  <span className="font-semibold text-white">{c.category}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted">{c.eventCount} events</span>
                    <span className="bg-amber/15 text-amber-light font-bold px-2 py-0.5 rounded-lg border border-amber/30">
                      ⭐ {c.avgRating || "N/A"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Booking Trends Line Chart */}
      <section className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-glass space-y-4">
        <div>
          <h2 className="font-display font-bold text-xl text-white">
            📈 Monthly Reservation Growth
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Timeline of student bookings per month
          </p>
        </div>

        {trends.length === 0 ? (
          <p className="text-muted text-xs py-8 text-center">
            No booking trend data yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A233D" />
              <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9CA3AF" allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#141122",
                  borderColor: "#2A233D",
                  borderRadius: "12px",
                  color: "#F3F0FA",
                }}
              />
              <Line
                type="monotone"
                dataKey="totalBookings"
                stroke="#2DD4BF"
                strokeWidth={3}
                dot={{ fill: "#2DD4BF", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}
