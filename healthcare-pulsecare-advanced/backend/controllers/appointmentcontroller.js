const Appointment = require("../models/Appointment");
const User = require("../models/user");
const Notification = require("../models/Notification");
const Waitlist = require("../models/Waitlist");

exports.getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select("name specialization availability workingHours workingDays availableTimes").sort({ name: 1 });
    res.json(doctors);
  } catch (error) { res.status(500).json({ message: "Could not fetch doctors" }); }
};

exports.addAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, problem } = req.body;
    if (!doctorId || !appointmentDate || !appointmentTime || !problem?.trim()) return res.status(400).json({ message: "Please fill all appointment fields" });
    if (new Date(`${appointmentDate}T${appointmentTime}`) < new Date()) return res.status(400).json({ message: "Please choose a future date and time" });

    const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    if (doctor.availability === "Unavailable") return res.status(400).json({ message: "This doctor is currently unavailable" });

    const selectedDate = new Date(`${appointmentDate}T12:00:00`);
    const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" });
    if (Array.isArray(doctor.workingDays) && doctor.workingDays.length && !doctor.workingDays.includes(dayName)) {
      return res.status(400).json({ message: `${doctor.name} does not work on ${dayName}. Please choose another date.` });
    }

    if (Array.isArray(doctor.availableTimes) && doctor.availableTimes.length && !doctor.availableTimes.includes(appointmentTime)) return res.status(400).json({ message: "Please choose one of the doctor's available time slots" });

    const conflict = await Appointment.findOne({ doctorId, appointmentDate, appointmentTime, status: { $in: ["Pending", "Confirmed"] } });
    if (conflict) return res.status(409).json({ message: "That time slot is already requested. Please choose another time." });

    const appt = await Appointment.create({
      patientId: req.user, doctorId, doctorName: doctor.name, specialization: doctor.specialization,
      appointmentDate, appointmentTime, problem: problem.trim(), status: "Pending"
    });
    await Notification.create({
      userId: doctor._id,
      type: "APPOINTMENT",
      title: "New appointment request",
      message: `A patient requested ${appointmentDate} at ${appointmentTime}. Please review the request.`,
      appointmentId: appt._id
    });
    await Waitlist.updateMany(
      { patientId: req.user, doctorId, status: { $in: ["Waiting", "Notified"] } },
      { $set: { status: "Removed" } }
    );
    res.status(201).json(await appt.populate("doctorId", "name specialization"));
  } catch (error) { console.error(error); res.status(500).json({ message: "Could not create appointment" }); }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const data = await Appointment.find({ patientId: req.user }).populate("doctorId", "name specialization availability workingHours").sort({ appointmentDate: 1, appointmentTime: 1, createdAt: -1 });
    res.json(data);
  } catch (error) { res.status(500).json({ message: "Could not fetch appointments" }); }
};

exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await User.findById(req.user);
    if (!doctor || doctor.role !== "doctor") return res.status(403).json({ message: "Doctor access required" });
    const data = await Appointment.find({ doctorId: req.user }).populate("patientId", "name email").sort({ appointmentDate: 1, appointmentTime: 1, createdAt: -1 });
    res.json(data);
  } catch (error) { res.status(500).json({ message: "Could not fetch doctor appointments" }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, doctorNote } = req.body;
    if (!["Confirmed", "Declined", "Completed"].includes(status)) return res.status(400).json({ message: "Invalid status" });
    const doctor = await User.findById(req.user);
    if (!doctor || doctor.role !== "doctor") return res.status(403).json({ message: "Doctor access required" });
    const appt = await Appointment.findOne({ _id: req.params.id, doctorId: req.user });
    if (!appt) return res.status(404).json({ message: "Appointment not found" });
    appt.status = status;
    if (typeof doctorNote === "string") appt.doctorNote = doctorNote.trim();
    await appt.save();

    const messages = {
      Confirmed: `Your appointment with ${doctor.name} on ${appt.appointmentDate} at ${appt.appointmentTime} has been confirmed.`,
      Declined: `Your appointment request with ${doctor.name} was declined. Please choose another slot.`,
      Completed: `Your visit with ${doctor.name} is marked completed. Thank you for using PulseCare.`
    };
    await Notification.create({
      userId: appt.patientId,
      type: "APPOINTMENT",
      title: `Appointment ${status.toLowerCase()}`,
      message: messages[status],
      appointmentId: appt._id
    });
    res.json(appt);
  } catch (error) { res.status(500).json({ message: "Could not update appointment" }); }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findOne({ _id: req.params.id, patientId: req.user });
    if (!appt) return res.status(404).json({ message: "Appointment not found" });
    if (["Completed", "Declined", "Cancelled"].includes(appt.status)) return res.status(400).json({ message: "This appointment cannot be cancelled" });
    appt.status = "Cancelled";
    await appt.save();
    await Notification.create({
      userId: appt.doctorId,
      type: "APPOINTMENT",
      title: "Appointment cancelled",
      message: `The appointment with ${appt.doctorName} on ${appt.appointmentDate} at ${appt.appointmentTime} was cancelled by the patient.`,
      appointmentId: appt._id
    });
    res.json(appt);
  } catch (error) { res.status(500).json({ message: "Could not cancel appointment" }); }
};
