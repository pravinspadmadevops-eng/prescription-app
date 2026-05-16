const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({

  name: String,

  dosage: String,

  timing: String,

  raw: String,

  startDate: String,

  reminderTime: String,

  // Reminder Type
  reminderType: {
    type: String,
    default: ""
  },

  // Next Reminder Date
  nextReminderDate: {
    type: String,
    default: ""
  }

});

const prescriptionSchema = new mongoose.Schema({
user: {

    type: mongoose.Schema.Types.ObjectId,

    ref: "User",

    required: true

  },
  patientName: String,
  doctorName: String,
  hospitalName: String,
  followUpDate: String,

  imagePath: String,

  text: String,

  medicines: [medicineSchema],

  createdAt: {
    type: Date,
    default: Date.now
  }
});



module.exports = mongoose.model('Prescription', prescriptionSchema);