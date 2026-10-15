const bcrypt = require("bcryptjs");
const User = require("./models/user");

const demoDoctors = [
  { name: "Dr. Priya Sharma", email: "priya@pulsecare.com", specialization: "Cardiologist", workingHours: "09:00 AM - 04:00 PM", workingDays: ["Monday","Tuesday","Wednesday","Thursday","Friday"], availableTimes: ["09:00 AM","10:00 AM","11:00 AM","02:00 PM","03:00 PM","04:00 PM"] },
  { name: "Dr. Arjun Rao", email: "arjun@pulsecare.com", specialization: "Dermatologist", workingHours: "10:00 AM - 06:00 PM", workingDays: ["Monday","Tuesday","Thursday","Friday","Saturday"], availableTimes: ["10:00 AM","11:00 AM","12:00 PM","03:00 PM","04:00 PM","05:00 PM"] },
  { name: "Dr. Meera Reddy", email: "meera@pulsecare.com", specialization: "General Medicine", workingHours: "08:00 AM - 03:00 PM", workingDays: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], availableTimes: ["08:00 AM","09:00 AM","10:00 AM","11:00 AM","01:00 PM","02:00 PM"] },
  { name: "Dr. Karthik Varma", email: "karthik@pulsecare.com", specialization: "Pediatrician", workingHours: "09:00 AM - 05:00 PM", workingDays: ["Monday","Wednesday","Thursday","Friday","Saturday"], availableTimes: ["09:00 AM","10:00 AM","12:00 PM","02:00 PM","03:00 PM","04:00 PM"] },
  { name: "Dr. Ananya Iyer", email: "ananya@pulsecare.com", specialization: "Neurologist", workingHours: "11:00 AM - 07:00 PM", workingDays: ["Monday","Tuesday","Wednesday","Friday","Saturday"], availableTimes: ["11:00 AM","12:00 PM","02:00 PM","04:00 PM","05:00 PM","06:00 PM"] },
  { name: "Dr. Rahul Menon", email: "rahul@pulsecare.com", specialization: "Orthopedic", workingHours: "09:00 AM - 05:00 PM", workingDays: ["Tuesday","Wednesday","Thursday","Friday","Saturday"], availableTimes: ["09:00 AM","10:00 AM","11:00 AM","01:00 PM","03:00 PM","05:00 PM"] }
];

async function ensureDemoDoctors(){
  const password = await bcrypt.hash("doctor123", 10);
  for(const doctor of demoDoctors){
    await User.findOneAndUpdate(
      { email: doctor.email },
      { $set: { ...doctor, role: "doctor", availability: "Available" }, $setOnInsert: { password } },
      { upsert: true, new: true }
    );
  }
  console.log("PulseCare demo doctors ready");
}

module.exports = { demoDoctors, ensureDemoDoctors };
