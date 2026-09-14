import { Router } from "express";
import Venue from "../models/Venue.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// GET /api/venues — list all venues
router.get("/", async (req, res) => {
  const venues = await Venue.find();
  res.json(venues);
});

// GET /api/venues/nearby?lng=..&lat=..&maxDistance=5000
// Geospatial query using the 2dsphere index on Venue.location
router.get("/nearby", async (req, res) => {
  const { lng, lat, maxDistance = 5000 } = req.query; // maxDistance in meters
  if (!lng || !lat) return res.status(400).json({ error: "lng and lat are required" });

  const venues = await Venue.find({
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
        $maxDistance: Number(maxDistance),
      },
    },
  });

  res.json(venues);
});

// GET /api/venues/:id
router.get("/:id", async (req, res) => {
  const venue = await Venue.findById(req.params.id);
  if (!venue) return res.status(404).json({ error: "Venue not found" });
  res.json(venue);
});

// POST /api/venues — organizers/admins only
router.post("/", requireAuth, requireRole("organizer", "admin"), async (req, res) => {
  const { name, capacity, address, lng, lat } = req.body;
  if (!name || !capacity || lng === undefined || lat === undefined) {
    return res.status(400).json({ error: "name, capacity, lng and lat are required" });
  }

  const venue = await Venue.create({
    name,
    capacity,
    address,
    location: { type: "Point", coordinates: [Number(lng), Number(lat)] },
  });

  res.status(201).json(venue);
});

// PUT /api/venues/:id — organizers/admins only
router.put("/:id", requireAuth, requireRole("organizer", "admin"), async (req, res) => {
  const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!venue) return res.status(404).json({ error: "Venue not found" });
  res.json(venue);
});

// DELETE /api/venues/:id — admins only
router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  await Venue.findByIdAndDelete(req.params.id);
  res.json({ message: "Venue deleted" });
});

export default router;
