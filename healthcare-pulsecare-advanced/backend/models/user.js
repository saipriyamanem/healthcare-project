const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["patient", "doctor"], default: "patient" },
  specialization: { type: String, default: "" },
  availability: { type: String, default: "Available" },
  workingHours: { type: String, default: "09:00 AM - 05:00 PM" },
  workingDays: { type: [String], default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] },
  availableTimes: { type: [String], default: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"] }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
