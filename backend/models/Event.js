import mongoose from "mongoose";

// Reviews are small and always read together with the event they belong to,
// and are never queried on their own — so they're embedded, not a separate collection.
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
  },
  { timestamps: true }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true }, // e.g. "Tech", "Cultural", "Sports"
    date: { type: Date, required: true },

    // Referenced, not embedded — venues and organizers are reused across many
    // events, so embedding them would duplicate data and make updates inconsistent.
    venue: { type: mongoose.Schema.Types.ObjectId, ref: "Venue", required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    totalSeats: { type: Number, required: true },
    seatsBooked: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["UPCOMING", "LIVE NOW", "POSTPONED", "CANCELLED"],
      default: "UPCOMING",
    },
    liveAnnouncement: { type: String, default: "" },

    reviews: [reviewSchema],
    waitlist: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Text index across title + description powers the search feature
eventSchema.index({ title: "text", description: "text" });

// Compound index — speeds up "events at this venue on this date" conflict checks
eventSchema.index({ venue: 1, date: 1 });

export default mongoose.model("Event", eventSchema);
