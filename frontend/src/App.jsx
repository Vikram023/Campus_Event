import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Venues from "./pages/Venues";
import MyBookings from "./pages/MyBookings";
import CreateEvent from "./pages/CreateEvent";
import Analytics from "./pages/Analytics";
import EventDetail from "./pages/EventDetail";
import OrganizerStudio from "./pages/OrganizerStudio";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/analytics" element={<Analytics />} />

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-event"
            element={
              <ProtectedRoute roles={["organizer", "admin"]}>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer-studio"
            element={
              <ProtectedRoute roles={["organizer", "admin"]}>
                <OrganizerStudio />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
