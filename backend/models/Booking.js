import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    status: {
      type: String,
      enum: ["CONFIRMED", "ATTENDED", "CANCELLED", "confirmed", "cancelled"],
      default: "CONFIRMED",
    },
  },
  { timestamps: true }
);

// Prevents the same user from booking the same event twice
bookingSchema.index({ user: 1, event: 1 }, { unique: true });

export default mongoose.model("Booking", bookingSchema);
