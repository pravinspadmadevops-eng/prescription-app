const router = require("express").Router();

const {
  signup,
  login,
  mobileLogin
} = require("../controllers/authController");

router.post("/signup", signup);

router.post("/login", login);

// Mobile OTP Login
router.post("/mobile-login", mobileLogin);

module.exports = router;