import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Venues() {
  const { role } = useAuth();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [nearbyMode, setNearbyMode] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [viewMode, setViewMode] = useState("map"); // "map" or "grid"
  const [selectedPinVenue, setSelectedPinVenue] = useState(null);

  // Add Venue Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [venueForm, setVenueForm] = useState({
    name: "",
    capacity: "",
    address: "",
    lng: "75.7033",
    lat: "31.2469",
  });
  const [submittingVenue, setSubmittingVenue] = useState(false);

  useEffect(() => {
    loadAllVenues();
  }, []);

  function loadAllVenues() {
    setNearbyMode(false);
    setLoading(true);
    api
      .get("/venues")
      .then((res) => {
        setVenues(res.data);
        if (res.data.length > 0) setSelectedPinVenue(res.data[0]);
      })
      .catch(() => setError("Failed to load venues"))
      .finally(() => setLoading(false));
  }

  function findNearby() {
    setError("");
    setSuccess("");
    if (!navigator.geolocation) {
      setError("Your browser doesn't support geolocation.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const { data } = await api.get("/venues/nearby", {
            params: { lat: latitude, lng: longitude, maxDistance: 20000 },
          });
          setVenues(data);
          setNearbyMode(true);
          setSuccess(`Found ${data.length} venues near your location.`);
        } catch {
          setError("Couldn't fetch nearby venues from API.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setError("Location permission denied or unavailable.");
        setLocating(false);
      }
    );
  }

  async function handleAddVenue(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmittingVenue(true);
    try {
      const { data } = await api.post("/venues", venueForm);
      setSuccess(`Venue "${data.name}" added successfully!`);
      setShowAddModal(false);
      setVenueForm({
        name: "",
        capacity: "",
        address: "",
        lng: "75.7033",
        lat: "31.2469",
      });
      loadAllVenues();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add venue");
    } finally {
      setSubmittingVenue(false);
    }
  }

  const canAddVenue = role === "organizer" || role === "admin";

  // Coordinates preset offset mapping for map pins
  const getMapCoords = (index) => {
    const positions = [
      { x: 30, y: 35 }, // Main Aud
      { x: 65, y: 40 }, // Sports Complex
      { x: 45, y: 70 }, // Seminar Hall B
      { x: 80, y: 75 }, // Open Air Theatre
    ];
    return positions[index % positions.length];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/15 border border-teal/30 text-teal-light text-xs font-medium mb-2">
            📍 Campus Infrastructure
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Campus Venues & Map
          </h1>
          <p className="text-muted text-xs sm:text-sm mt-1">
            Browse auditoriums, seminar halls, sports complexes, and open grounds on the interactive campus map.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* View Switcher */}
          <div className="flex bg-surface p-1 rounded-xl border border-border">
            <button
              onClick={() => setViewMode("map")}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === "map"
                  ? "bg-teal text-base font-bold shadow-glow-teal"
                  : "text-muted hover:text-white"
              }`}
            >
              🗺️ Map Canvas
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === "grid"
                  ? "bg-teal text-base font-bold shadow-glow-teal"
                  : "text-muted hover:text-white"
              }`}
            >
              🏢 Grid Roster
            </button>
          </div>

          {nearbyMode && (
            <button
              onClick={loadAllVenues}
              className="text-xs font-semibold px-4 py-2 rounded-xl border border-border text-muted hover:text-white transition-all"
            >
              Show All
            </button>
          )}

          <button
            onClick={findNearby}
            disabled={locating}
            className="text-xs font-semibold bg-violet/20 hover:bg-violet text-violet-light hover:text-white border border-violet/40 px-4 py-2 rounded-xl transition-all shadow-glow-violet disabled:opacity-50"
          >
            {locating ? "Locating..." : "📍 Nearby Me"}
          </button>

          {canAddVenue && (
            <button
              onClick={() => setShowAddModal(true)}
              className="text-xs font-semibold bg-gradient-to-r from-teal to-teal-dark hover:brightness-110 text-base px-4 py-2 rounded-xl transition-all shadow-glow-teal"
            >
              ➕ Add Venue
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-4 rounded-2xl text-xs font-medium animate-fadeIn">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 p-4 rounded-2xl text-xs font-medium animate-fadeIn">
          ✅ {success}
        </div>
      )}

      {/* Step 7: Interactive Campus Map View */}
      {viewMode === "map" && !loading && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-glass space-y-6 relative overflow-hidden animate-fadeIn">
          <div className="flex justify-between items-center border-b border-border/80 pb-3">
            <div>
              <h2 className="font-display font-bold text-xl text-white">
                🗺️ Campus Blueprint & Venue Radar
              </h2>
              <p className="text-xs text-muted">
                Click any venue pin to inspect location details and seating limits
              </p>
            </div>
            <span className="text-xs text-teal font-mono bg-teal/10 px-3 py-1 rounded-full border border-teal/30">
              {venues.length} Active Pins
            </span>
          </div>

          {/* Interactive Map Visual Grid */}
          <div className="relative w-full h-[380px] bg-gradient-to-b from-surface via-surface-hover to-base rounded-2xl border border-border/80 overflow-hidden p-6">
            {/* Campus Road lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#2A233D_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-border/40 border-t border-b border-dashed border-teal/20 pointer-events-none" />
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-border/40 border-l border-r border-dashed border-violet/20 pointer-events-none" />

            {/* Pins */}
            {venues.map((v, idx) => {
              const pos = getMapCoords(idx);
              const isSelected = selectedPinVenue?._id === v._id;

              return (
                <button
                  key={v._id}
                  onClick={() => setSelectedPinVenue(v)}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 ${
                    isSelected ? "scale-125 z-30" : "hover:scale-110 z-20"
                  }`}
                >
                  <div
                    className={`px-3 py-1.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-lg border transition-all ${
                      isSelected
                        ? "bg-teal text-black border-white shadow-glow-teal font-extrabold"
                        : "bg-surface/90 text-white border-violet/40 hover:border-violet"
                    }`}
                  >
                    <span className="animate-bounce text-sm">📍</span>
                    <span>{v.name}</span>
                  </div>
                </button>
              );
            })}

            {/* Selected Pin Info Drawer */}
            {selectedPinVenue && (
              <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 glass-card p-4 rounded-2xl border border-teal/40 shadow-glow-teal z-40 space-y-2 animate-fadeIn">
                <div className="flex justify-between items-start">
                  <h3 className="font-display font-bold text-base text-white">
                    {selectedPinVenue.name}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal/20 text-teal-light border border-teal/40">
                    Cap: {selectedPinVenue.capacity}
                  </span>
                </div>
                <p className="text-xs text-muted">📍 {selectedPinVenue.address}</p>
                <div className="pt-2 border-t border-border/60 flex justify-between items-center text-xs">
                  <span className="text-[11px] font-mono text-muted">
                    {selectedPinVenue.location?.coordinates
                      ? `${selectedPinVenue.location.coordinates[1].toFixed(4)}, ${selectedPinVenue.location.coordinates[0].toFixed(4)}`
                      : "LPU Campus"}
                  </span>
                  <span className="text-teal font-semibold">Active Venue ✓</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Venue Cards Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted text-sm">Loading campus venues...</p>
        </div>
      ) : venues.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-white/5 space-y-3">
          <span className="text-4xl block">🏢</span>
          <h3 className="font-display font-semibold text-lg text-white">
            No Venues Available
          </h3>
          <p className="text-muted text-sm max-w-md mx-auto">
            {nearbyMode
              ? "No venues were found within range of your coordinates."
              : "No venue records have been created yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((v) => (
            <div
              key={v._id}
              onClick={() => {
                setSelectedPinVenue(v);
                setViewMode("map");
              }}
              className="glass-card p-6 rounded-2xl border border-border/80 hover:border-teal/50 hover:shadow-glow-teal transition-all duration-300 space-y-4 flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h2 className="font-display font-bold text-xl text-white">
                    {v.name}
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal/15 text-teal-light border border-teal/30 shrink-0">
                    Cap: {v.capacity}
                  </span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  📍 {v.address || "Campus Block, LPU"}
                </p>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted">
                <span>
                  🌐 Coordinates:{" "}
                  {v.location?.coordinates
                    ? `${v.location.coordinates[1].toFixed(4)}, ${v.location.coordinates[0].toFixed(4)}`
                    : "LPU Campus"}
                </span>
                <span className="text-teal font-medium hover:underline">View on Map →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Venue Modal (for Organizer / Admin) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card p-8 rounded-3xl border border-white/10 max-w-md w-full shadow-glass space-y-5">
            <div className="flex justify-between items-center border-b border-border/80 pb-3">
              <h2 className="font-display font-bold text-xl text-white">
                Add New Campus Venue
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-muted hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVenue} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-semibold mb-1">
                  Venue Name
                </label>
                <input
                  placeholder="e.g. Innovation Lab 4"
                  required
                  value={venueForm.name}
                  onChange={(e) =>
                    setVenueForm({ ...venueForm, name: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-surface/90 border border-border text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div>
                <label className="block text-muted font-semibold mb-1">
                  Seating Capacity
                </label>
                <input
                  type="number"
                  placeholder="e.g. 150"
                  required
                  min="1"
                  value={venueForm.capacity}
                  onChange={(e) =>
                    setVenueForm({ ...venueForm, capacity: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-surface/90 border border-border text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div>
                <label className="block text-muted font-semibold mb-1">
                  Campus Address / Location Info
                </label>
                <input
                  placeholder="e.g. Block 34, Floor 2, LPU"
                  required
                  value={venueForm.address}
                  onChange={(e) =>
                    setVenueForm({ ...venueForm, address: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-surface/90 border border-border text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={venueForm.lng}
                    onChange={(e) =>
                      setVenueForm({ ...venueForm, lng: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-surface/90 border border-border text-ink focus:outline-none focus:border-teal"
                  />
                </div>
                <div>
                  <label className="block text-muted font-semibold mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={venueForm.lat}
                    onChange={(e) =>
                      setVenueForm({ ...venueForm, lat: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-surface/90 border border-border text-ink focus:outline-none focus:border-teal"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl border border-border text-muted hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  disabled={submittingVenue}
                  className="flex-1 py-3 rounded-xl bg-teal text-base font-semibold shadow-glow-teal hover:brightness-110 text-sm disabled:opacity-50"
                >
                  {submittingVenue ? "Saving..." : "Save Venue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
