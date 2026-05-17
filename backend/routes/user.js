const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const User = require("../models/User");

router.post("/sync", protect, async (req, res) => {
  try {
    const { uid, phone_number } = req.user;

    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        phone: phone_number,
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;