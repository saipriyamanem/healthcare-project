const express = require("express");
const router = express.Router();
const auth = require("../middleware/authmiddleware");
const { joinWaitlist, getMyWaitlist, leaveWaitlist } = require("../controllers/waitlistcontroller");

router.get("/my", auth, getMyWaitlist);
router.post("/join", auth, joinWaitlist);
router.patch("/leave/:id", auth, leaveWaitlist);

module.exports = router;
