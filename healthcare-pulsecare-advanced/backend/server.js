require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { ensureDemoDoctors } = require("./demoDoctors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req,res)=>res.json({message:"PulseCare API is running"}));
app.use("/api/auth", require("./routes/authroutes"));
app.use("/api/appointments", require("./routes/appointmentroutes"));
app.use("/api/notifications", require("./routes/notificationroutes"));
app.use("/api/waitlist", require("./routes/waitlistroutes"));
app.use((err,req,res,next)=>{ console.error(err); res.status(500).json({message:"Internal server error"}); });

async function start(){
  await connectDB();
  await ensureDemoDoctors();
  const port = process.env.PORT || 5000;
  app.listen(port,()=>console.log(`PulseCare API running on http://localhost:${port}`));
}
start().catch(err=>{ console.error("Server startup failed:",err.message); process.exit(1); });
