import mongoose from "mongoose";

const venueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    address: { type: String },
    // GeoJSON Point — required format for MongoDB geospatial queries
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
  },
  { timestamps: true }
);

// 2dsphere index enables geospatial queries like "venues near me"
venueSchema.index({ location: "2dsphere" });

export default mongoose.model("Venue", venueSchema);
