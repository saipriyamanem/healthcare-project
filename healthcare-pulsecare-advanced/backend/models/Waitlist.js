const mongoose = require("mongoose");

const waitlistSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  doctorName: { type: String, required: true },
  specialization: { type: String, default: "" },
  status: { type: String, enum: ["Waiting", "Notified", "Removed"], default: "Waiting" },
  createdAt: { type: Date, default: Date.now }
});

waitlistSchema.index({ patientId: 1, doctorId: 1, status: 1 });

module.exports = mongoose.model("Waitlist", waitlistSchema);
