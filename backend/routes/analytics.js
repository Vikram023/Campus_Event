import { Router } from "express";
import Booking from "../models/Booking.js";
import Event from "../models/Event.js";

const router = Router();

// GET /api/analytics/popular-venues
// Pipeline: bookings -> join to events -> join to venues -> group & count
router.get("/popular-venues", async (req, res) => {
  const result = await Booking.aggregate([
    {
      $lookup: { from: "events", localField: "event", foreignField: "_id", as: "event" },
    },
    { $unwind: "$event" },
    {
      $lookup: { from: "venues", localField: "event.venue", foreignField: "_id", as: "venue" },
    },
    { $unwind: "$venue" },
    {
      $group: {
        _id: "$venue._id",
        venueName: { $first: "$venue.name" },
        totalBookings: { $sum: 1 },
      },
    },
    { $sort: { totalBookings: -1 } },
    { $limit: 5 },
  ]);

  res.json(result);
});

// GET /api/analytics/category-stats
// Pipeline: events -> unwind embedded reviews -> group by category
// for average rating, total events, and total seats booked
router.get("/category-stats", async (req, res) => {
  const result = await Event.aggregate([
    {
      $unwind: { path: "$reviews", preserveNullAndEmptyArrays: true },
    },
    {
      $group: {
        _id: "$category",
        eventCount: { $addToSet: "$_id" }, // dedupe since unwind repeats each event per review
        totalSeatsBooked: { $sum: "$seatsBooked" },
        avgRating: { $avg: "$reviews.rating" },
      },
    },
    {
      $project: {
        category: "$_id",
        _id: 0,
        eventCount: { $size: "$eventCount" },
        avgRating: { $round: [{ $ifNull: ["$avgRating", 0] }, 2] },
      },
    },
    { $sort: { eventCount: -1 } },
  ]);

  res.json(result);
});

// GET /api/analytics/booking-trends
// Pipeline: bookings -> group by year-month -> count, for a trend chart
router.get("/booking-trends", async (req, res) => {
  const result = await Booking.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        totalBookings: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { month: "$_id", _id: 0, totalBookings: 1 } },
  ]);

  res.json(result);
});

export default router;
