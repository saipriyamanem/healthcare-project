const express = require("express");
const router = express.Router();
const auth = require("../middleware/authmiddleware");
const {
  getDoctors, addAppointment, getMyAppointments, getDoctorAppointments,
  updateStatus, cancelAppointment
} = require("../controllers/appointmentcontroller");
router.get("/doctors", auth, getDoctors);
router.post("/add", auth, addAppointment);
router.get("/my", auth, getMyAppointments);
router.get("/doctor", auth, getDoctorAppointments);
router.patch("/status/:id", auth, updateStatus);
router.patch("/cancel/:id", auth, cancelAppointment);
module.exports = router;
