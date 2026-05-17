const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {

  try {

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {

      return res.status(401).json({
        error: 'No token'
      });

    }

    const token =
      authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = {
      id: decoded.id
    };

    next();

  } catch (error) {

    res.status(401).json({
      error: 'Invalid token'
    });

  }

};

const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token" });
    }

    const decoded = await admin.auth().verifyIdToken(token);

    req.user = decoded; // contains uid + phone

    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = protect;