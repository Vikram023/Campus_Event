import { Router } from "express";
import Event from "../models/Event.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// GET /api/events — list, optionally filter by category
router.get("/", async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;

  const events = await Event.find(filter)
    .populate("venue", "name capacity address")
    .populate("organizer", "name email")
    .sort({ date: 1 });

  res.json(events);
});

// GET /api/events/search?q=hackathon — uses the text index on title+description
router.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "q is required" });

  const events = await Event.find(
    { $text: { $search: q } },
    { score: { $meta: "textScore" } } // relevance score
  )
    .sort({ score: { $meta: "textScore" } })
    .populate("venue", "name address");

  res.json(events);
});

// GET /api/events/:id
router.get("/:id", async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate("venue", "name capacity address")
    .populate("organizer", "name email")
    .populate("reviews.user", "name");

  if (!event) return res.status(404).json({ error: "Event not found" });
  res.json(event);
});

// POST /api/events — organizers/admins only, blocks double-booking a venue
router.post("/", requireAuth, requireRole("organizer", "admin"), async (req, res) => {
  const { title, description, category, date, venue, totalSeats } = req.body;
  if (!title || !description || !category || !date || !venue || !totalSeats) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Conflict check using the venue+date compound index — same venue, same day
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const conflict = await Event.findOne({ venue, date: { $gte: dayStart, $lte: dayEnd } });
  if (conflict) {
    return res.status(409).json({ error: "This venue is already booked for that day" });
  }

  const event = await Event.create({
    title,
    description,
    category,
    date,
    venue,
    organizer: req.user.id,
    totalSeats,
  });

  res.status(201).json(event);
});

// PUT /api/events/:id — organizer who owns it, or admin
router.put("/:id", requireAuth, requireRole("organizer", "admin"), async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ error: "Event not found" });

  if (String(event.organizer) !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Not your event" });
  }

  Object.assign(event, req.body);
  await event.save();

  const updatedEvent = await Event.findById(event._id)
    .populate("venue", "name capacity address")
    .populate("organizer", "name email");

  res.json(updatedEvent);
});

// DELETE /api/events/:id
router.delete("/:id", requireAuth, requireRole("organizer", "admin"), async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ error: "Event not found" });

  if (String(event.organizer) !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Not your event" });
  }

  await event.deleteOne();
  res.json({ message: "Event deleted" });
});

// POST /api/events/:id/reviews — adds an embedded review (any logged-in user)
router.post("/:id/reviews", requireAuth, async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating) return res.status(400).json({ error: "rating is required" });

  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ error: "Event not found" });

  event.reviews.push({ user: req.user.id, rating, comment });
  await event.save();

  res.status(201).json(event.reviews);
});

// POST /api/events/:id/waitlist — join waitlist for sold-out event
router.post("/:id/waitlist", requireAuth, async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ error: "Event not found" });

  const exists = event.waitlist.some((w) => String(w.user) === req.user.id);
  if (exists) return res.status(409).json({ error: "You are already on the waitlist" });

  event.waitlist.push({ user: req.user.id });
  await event.save();

  res.status(201).json({ message: "Joined waitlist successfully", waitlist: event.waitlist });
});

// DELETE /api/events/:id/waitlist — leave waitlist
router.delete("/:id/waitlist", requireAuth, async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ error: "Event not found" });

  event.waitlist = event.waitlist.filter((w) => String(w.user) !== req.user.id);
  await event.save();

  res.json({ message: "Left waitlist successfully", waitlist: event.waitlist });
});

export default router;
