const Waitlist = require("../models/Waitlist");
const User = require("../models/user");
const Notification = require("../models/Notification");

exports.joinWaitlist = async (req, res) => {
  try {
    const { doctorId } = req.body;
    if (!doctorId) return res.status(400).json({ message: "Doctor is required" });

    const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const existing = await Waitlist.findOne({
      patientId: req.user,
      doctorId,
      status: { $in: ["Waiting", "Notified"] }
    });
    if (existing) return res.status(409).json({ message: "You are already on this doctor's waitlist" });

    const entry = await Waitlist.create({
      patientId: req.user,
      doctorId,
      doctorName: doctor.name,
      specialization: doctor.specialization,
      status: "Waiting"
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not join waitlist" });
  }
};

exports.getMyWaitlist = async (req, res) => {
  try {
    const data = await Waitlist.find({
      patientId: req.user,
      status: { $in: ["Waiting", "Notified"] }
    }).sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch waitlist" });
  }
};

exports.leaveWaitlist = async (req, res) => {
  try {
    const entry = await Waitlist.findOneAndUpdate(
      { _id: req.params.id, patientId: req.user, status: { $in: ["Waiting", "Notified"] } },
      { status: "Removed" },
      { new: true }
    );
    if (!entry) return res.status(404).json({ message: "Waitlist entry not found" });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: "Could not leave waitlist" });
  }
};

async function notifyWaitingPatients(doctorId, doctorName, specialization) {
  const entries = await Waitlist.find({ doctorId, status: "Waiting" });
  if (!entries.length) return 0;

  await Notification.insertMany(entries.map(entry => ({
    userId: entry.patientId,
    type: "AVAILABILITY",
    title: `${doctorName} is available`,
    message: `${doctorName} (${specialization}) is now available. You were waiting for this doctor—open PulseCare to book an appointment.`,
  })));

  await Waitlist.updateMany(
    { doctorId, status: "Waiting" },
    { $set: { status: "Notified" } }
  );

  return entries.length;
}

module.exports.notifyWaitingPatients = notifyWaitingPatients;
