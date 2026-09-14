import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }, // bcrypt hash, never plaintext
    role: { type: String, enum: ["student", "organizer", "admin"], default: "student" },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

export default mongoose.model("User", userSchema);
