import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true,
  },
  medicineName: {
    type: String,
    required: true,
  },
  dosage: {
    type: String,
  },
  frequency: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Medicine = mongoose.model("Medicine", medicineSchema);

export default Medicine;