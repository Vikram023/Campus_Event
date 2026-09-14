import { Router } from "express";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Event from "../models/Event.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/bookings/mine — this user's bookings
router.get("/mine", requireAuth, async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate({ path: "event", populate: { path: "venue", select: "name address" } })
    .sort({ createdAt: -1 });

  res.json(bookings);
});

// GET /api/bookings/event/:eventId — get attendees for an event (for organizers)
router.get("/event/:eventId", requireAuth, async (req, res) => {
  const bookings = await Booking.find({ event: req.params.eventId })
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  res.json(bookings);
});

// PATCH /api/bookings/:id/checkin — mark attendance status (ATTENDED / CONFIRMED)
router.patch("/:id/checkin", requireAuth, async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ error: "Booking not found" });

  booking.status = req.body.status || "ATTENDED";
  await booking.save();

  res.json({ message: "Attendance updated successfully", booking });
});

// POST /api/bookings — book a seat for an event
// Wrapped in a transaction: checking seat availability, creating the booking,
// and incrementing seatsBooked must all succeed together or not at all —
// otherwise two simultaneous requests could both pass the seat check and
// overbook the event.
router.post("/", requireAuth, async (req, res) => {
  const { eventId, quantity = 1 } = req.body;
  const numSeats = Math.min(Math.max(1, Number(quantity) || 1), 4);
  if (!eventId) return res.status(400).json({ error: "eventId is required" });

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const event = await Event.findById(eventId).session(session);
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.seatsBooked + numSeats > event.totalSeats) {
      await session.abortTransaction();
      return res.status(409).json({ error: `Not enough seats remaining (only ${event.totalSeats - event.seatsBooked} left)` });
    }

    const [booking] = await Booking.create(
      [{ user: req.user.id, event: eventId }],
      { session }
    );

    event.seatsBooked += numSeats;
    await event.save({ session });

    await session.commitTransaction();
    return res.status(201).json(booking);
  } catch (err) {
    if (session) {
      try { await session.abortTransaction(); } catch (e) {}
    }

    if (err.code === 11000) {
      return res.status(409).json({ error: "You already booked this event" });
    }

    // Fallback for standalone MongoDB deployments
    if (err.message && err.message.includes("replica set")) {
      try {
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ error: "Event not found" });
        if (event.seatsBooked + numSeats > event.totalSeats) return res.status(409).json({ error: `Not enough seats remaining (only ${event.totalSeats - event.seatsBooked} left)` });

        const booking = await Booking.create({ user: req.user.id, event: eventId });
        event.seatsBooked += numSeats;
        await event.save();
        return res.status(201).json(booking);
      } catch (fallbackErr) {
        if (fallbackErr.code === 11000) {
          return res.status(409).json({ error: "You already booked this event" });
        }
        return res.status(500).json({ error: fallbackErr.message || "Booking failed" });
      }
    }

    res.status(500).json({ error: err.message || "Booking failed" });
  } finally {
    if (session) session.endSession();
  }
});

// DELETE /api/bookings/:id — cancel a booking, also frees up the seat
router.delete("/:id", requireAuth, async (req, res) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const booking = await Booking.findById(req.params.id).session(session);
    if (!booking || String(booking.user) !== req.user.id) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Booking not found" });
    }

    await Event.findByIdAndUpdate(booking.event, { $inc: { seatsBooked: -1 } }, { session });
    await booking.deleteOne({ session });

    await session.commitTransaction();
    return res.json({ message: "Booking cancelled" });
  } catch (err) {
    if (session) {
      try { await session.abortTransaction(); } catch (e) {}
    }

    // Fallback for standalone MongoDB
    if (err.message && err.message.includes("replica set")) {
      try {
        const booking = await Booking.findById(req.params.id);
        if (!booking || String(booking.user) !== req.user.id) {
          return res.status(404).json({ error: "Booking not found" });
        }
        await Event.findByIdAndUpdate(booking.event, { $inc: { seatsBooked: -1 } });
        await booking.deleteOne();
        return res.json({ message: "Booking cancelled" });
      } catch (fallbackErr) {
        return res.status(500).json({ error: fallbackErr.message || "Cancellation failed" });
      }
    }

    res.status(500).json({ error: err.message || "Cancellation failed" });
  } finally {
    if (session) session.endSession();
  }
});

export default router;
