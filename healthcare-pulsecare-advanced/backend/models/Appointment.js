const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctorName: { type: String, required: true, trim: true },
  specialization: { type: String, default: "General Medicine" },
  appointmentDate: { type: String, required: true },
  appointmentTime: { type: String, required: true },
  problem: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Declined", "Completed", "Cancelled"],
    default: "Pending"
  },
  doctorNote: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);
