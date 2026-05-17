const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =========================
// Signup
// =========================

exports.signup = async (req, res) => {

  try {

    const { name, email, password } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hash
    });

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: error.message
    });

  }

};

// =========================
// Login
// =========================

exports.login = async (req, res) => {

  try {

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    // Check user exists
    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password"
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: error.message
    });

  }

}; 

// =========================
// Mobile OTP Login
// =========================
 
exports.mobileLogin = async (req, res) => {

  try {

    const { phone } = req.body;

    if (!phone) {

      return res.status(400).json({
        error: "Phone number required"
      });

    }

    // Check existing user
    let user = await User.findOne({ phone });

    // Create user if not exists
    if (!user) {

      user = await User.create({
        name: phone,
        email: `${phone}@mobile.com`,
        password: "mobile-login",
        phone
      });

    }

    // JWT Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: error.message
    });

  }

};