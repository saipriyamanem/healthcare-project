const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { notifyWaitingPatients } = require("./waitlistcontroller");

const SECRET = process.env.JWT_SECRET || "healthcare-demo-secret";

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  specialization: user.specialization,
  availability: user.availability,
  workingHours: user.workingHours,
  workingDays: user.workingDays,
  availableTimes: user.availableTimes
});

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, specialization, availability, workingHours, workingDays, availableTimes } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: "Name, email and password are required" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: "User already exists" });

    const finalRole = role === "doctor" ? "doctor" : "patient";
    if (finalRole === "doctor" && !specialization?.trim()) return res.status(400).json({ message: "Specialization is required for doctors" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(), email: normalizedEmail, password: hashed, role: finalRole,
      specialization: finalRole === "doctor" ? specialization.trim() : "",
      availability: finalRole === "doctor" ? (availability || "Available") : "",
      workingHours: finalRole === "doctor" ? (workingHours || "09:00 AM - 05:00 PM") : "",
      workingDays: finalRole === "doctor" ? (workingDays?.length ? workingDays : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]) : [],
      availableTimes: finalRole === "doctor" ? (availableTimes?.length ? availableTimes : ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]) : []
    });

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: publicUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (!(await bcrypt.compare(password, user.password))) return res.status(400).json({ message: "Invalid password" });
    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "7d" });
    res.json({ token, user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

exports.me = async (req, res) => {
  const user = await User.findById(req.user).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "doctor") return res.status(403).json({ message: "Only doctors can update this profile" });
    const { specialization, availability, workingHours, workingDays, availableTimes } = req.body;
    const wasUnavailable = user.availability === "Unavailable";
    user.specialization = specialization?.trim() || user.specialization;
    user.availability = availability || user.availability;
    user.workingHours = workingHours?.trim() || user.workingHours;
    user.workingDays = Array.isArray(workingDays) && workingDays.length ? workingDays : user.workingDays;
    user.availableTimes = Array.isArray(availableTimes) && availableTimes.length ? availableTimes : user.availableTimes;
    await user.save();

    let notifiedWaitingPatients = 0;
    if (wasUnavailable && user.availability === "Available") {
      notifiedWaitingPatients = await notifyWaitingPatients(user._id, user.name, user.specialization);
    }
    res.json({ ...publicUser(user), notifiedWaitingPatients });
  } catch (error) {
    res.status(500).json({ message: "Could not update profile" });
  }
};
