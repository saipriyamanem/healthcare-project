const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, enum: ["APPOINTMENT", "AVAILABILITY", "WAITLIST", "REMINDER", "SYSTEM"], default: "SYSTEM" },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", default: null },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", notificationSchema);
