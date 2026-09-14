import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import venueRoutes from "./routes/venues.js";
import eventRoutes from "./routes/events.js";
import bookingRoutes from "./routes/bookings.js";
import analyticsRoutes from "./routes/analytics.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or dev origins
      if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1") || origin === process.env.CLIENT_URL) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for dev demo ease
      }
    },
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => res.send("Campus Events API is running"));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
});
