const express = require("express");
const router = express.Router();
const auth = require("../middleware/authmiddleware");
const { getMyNotifications, markRead, markAllRead } = require("../controllers/notificationcontroller");

router.get("/", auth, getMyNotifications);
router.patch("/:id/read", auth, markRead);
router.patch("/read-all", auth, markAllRead);

module.exports = router;
