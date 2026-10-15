const express = require("express");
const router = express.Router();
const auth = require("../middleware/authmiddleware");
const { registerUser, loginUser, me, updateProfile } = require("../controllers/authcontroller");
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", auth, me);
router.patch("/profile", auth, updateProfile);
module.exports = router;
