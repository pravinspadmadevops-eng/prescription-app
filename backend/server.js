require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/prescription", require("./routes/prescriptionRoutes"));

app.listen(process.env.PORT, () =>
  console.log(`Server running on ${process.env.PORT}`)
);

app.get('/', (req, res) => {
  res.send('API is running 🚀');
});

const uploadRoutes = require('./routes/upload');

app.use('/api/upload', uploadRoutes);

app.post("/medicine", async (req, res) => {
  try {
    const medicine = new Medicine(req.body);

    const savedMedicine = await medicine.save();

    res.status(201).json(savedMedicine);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});