const mongoose = require("mongoose");
const { ensureDemoDoctors } = require("./demoDoctors");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/healthcare";

async function seed(){
  await mongoose.connect(MONGO_URI);
  await ensureDemoDoctors();
  console.log("Demo doctors ready. Password: doctor123");
  await mongoose.disconnect();
}
seed().catch(err=>{ console.error(err); process.exit(1); });
