



const express = require('express');
const multer = require('multer');
const axios = require('axios');

const {
  readFileSync,
  unlinkSync
} = require('fs');

const router = express.Router();

const {
  DocumentProcessorServiceClient
} = require('@google-cloud/documentai');

const Prescription = require('../models/Prescription');

// =========================
// Google Document AI Client
// =========================

const client =
  new DocumentProcessorServiceClient();

// =========================
// Multer Setup
// =========================

const upload = multer({
  dest: 'uploads/'
});

// =========================
// Convert 1-0-1 → Readable
// =========================

function formatTiming(t) {

  if (!t) return null;

  const [m, a, n] = t.split('-');

  let result = [];

  if (m === '1') result.push('Morning');
  if (a === '1') result.push('Afternoon');
  if (n === '1') result.push('Night');

  return result.join(', ');

}

// =========================
// Upload Prescription
// =========================

router.post(
  '/',
  upload.single('file'),
  async (req, res) => {

    try {

      if (!req.file) {

        return res.status(400).json({
          error: 'No file uploaded'
        });

      }

      const filePath = req.file.path;

      const projectId =
        process.env.GOOGLE_PROJECT_ID;

      const location = 'us';

      const processorId =
        process.env.GOOGLE_PROCESSOR_ID;

      const name =
        `projects/${projectId}/locations/${location}/processors/${processorId}`;

      const file =
        readFileSync(filePath);

      const request = {

        name,

        rawDocument: {

          content:
            file.toString('base64'),

          mimeType:
            req.file.mimetype

        }

      };

      // =========================
      // Process Document
      // =========================

      const [result] =
        await client.processDocument(request);

      console.log(
        'Google AI processed document'
      );

      const text =
        result.document?.text || '';

      console.log(text);

      const lines =
        text.split('\n');

      // =========================
      // Extract Timings
      // =========================

      const timings = lines
        .map(line => line.trim())
        .filter(line =>
          /^\d-\d-\d$/.test(line)
        );

      // =========================
      // Detect Medicine Lines
      // =========================

      const medicinesRaw = lines
        .map(line => line.trim())
        .filter(line =>

          line.length > 2 &&

          (

            /^T\.|^C\.|^Tab|^Cap/i.test(line)

            ||

            /tablet|capsule|drops|syrup/i.test(line)

            ||

            /\d+\s?(mg|ml|g|IU|%)/i.test(line)

          )

        );

      // =========================
      // Extract Medicines
      // =========================

      const medicines =
        medicinesRaw.map((line, index) => {

          let cleaned = line
            .replace(
              /^T\.|^C\.|^Tab|^Cap/i,
              ''
            )
            .trim();

          const doseMatch =
            cleaned.match(
              /\d+\s?(mg|ml|g|IU|%)/i
            );

          let medicineName =
            cleaned
              .split('(')[0]
              .replace(
                /[^A-Za-z0-9\s-]/g,
                ''
              )
              .trim();

          // Remove unwanted text
          medicineName =
            medicineName.replace(
              /Right Eye|Left Eye|Oral|Route|Medicine Name|Dosage|Qty|Timings|Duration/gi,
              ''
            ).trim();

          // Skip invalid entries
          if (
            !medicineName ||
            medicineName.length < 2
          ) {
            return null;
          }

          return {

            name: medicineName,

            dosage:
              doseMatch
                ? doseMatch[0]
                : null,

            timing:
              formatTiming(
                timings[index]
              ),

            raw: line

          };

        }).filter(Boolean);

      // =========================
      // Remove Duplicate Medicines
      // =========================

      const uniqueMedicines = [];

      const seen = new Set();

      for (const med of medicines) {

        if (!seen.has(med.name)) {

          seen.add(med.name);

          uniqueMedicines.push(med);

        }

      }

      console.log(
        'Medicines:',
        uniqueMedicines
      );

      // =========================
      // Extract Patient Name
      // =========================

      let patientName =
        'Unknown';

      const patientMatch =
        text.match(
          /Name:\s*\n?\s*([A-Za-z.\s]+)/i
        );

      if (
        patientMatch &&
        patientMatch[1]
      ) {

        patientName =
          patientMatch[1]
            .trim()
            .split('\n')[0]
            .replace(/\s+/g, ' ');

      }

      // =========================
      // Extract Hospital Name
      // =========================

      let hospitalName =
        'Unknown Hospital';

      const hospitalPatterns = [

        /SHANTILAL SHANGHVI EYE INSTITUTE/i,

        /Asian Institute of Medical Sciences/i,

        /Apollo Hospital/i,

        /Fortis Hospital/i,

        /Lilavati Hospital/i

      ];

      for (const pattern of hospitalPatterns) {

        const match =
          text.match(pattern);

        if (match) {

          hospitalName =
            match[0].trim();

          break;

        }

      }

      // =========================
      // Extract Follow-up Date
      // =========================

      const followUpMatch =
        text.match(
          /FOLLOW UP ADVICE[:\s]+([^\n]+)/i
        );

      const followUpDate =
        followUpMatch
          ? followUpMatch[1].trim()
          : null;

      // =========================
      // Extract Doctor Name
      // =========================

      let doctorName =
        'Unknown Doctor';

      const doctorMatch =
        text.match(
          /Dr\.?\s+([A-Za-z\s]+)/i
        );

      if (
        doctorMatch &&
        doctorMatch[1]
      ) {

        doctorName =
          doctorMatch[1]
            .trim()
            .split('\n')[0]
            .replace(/\s+/g, ' ');

      }

      // =========================
      // Save to MongoDB
      // =========================

      console.log(
        'Saving to MongoDB...'
      );

      const savedPrescription =
        await Prescription.create({

          user: req.user.id,

          patientName,
          doctorName,
          hospitalName,
          medicines,

          imagePath:
            req.file.path,

          text,

          medicines:
            uniqueMedicines

        });

      console.log(
        'Saved Successfully'
      );

      console.log(savedPrescription);

      // =========================
      // Delete Temp File
      // =========================

      unlinkSync(filePath);

      // =========================
      // Response
      // =========================

      res.json({

        success: true,

        data: savedPrescription

      });

    } catch (error) {

      console.error(
        'FULL ERROR:',
        error
      );

      res.status(500).json({

        error: error.message

      });

    }

  }
);

// =========================
// Medicine Search API
// =========================

router.get(
  '/search-medicine',
  async (req, res) => {

    try {

      const query =
        req.query.q;

      if (!query) {

        return res.json({

          success: true,

          data: []

        });

      }

      const response =
        await axios.get(
          `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${query}`
        );

      const groups =
        response.data.drugGroup
          ?.conceptGroup || [];

      let medicines = [];

      groups.forEach(group => {

        if (
          group.conceptProperties
        ) {

          const names =
            group.conceptProperties.map(
              item => item.name
            );

          medicines.push(...names);

        }

      });

      // Remove duplicates
      medicines =
        [...new Set(medicines)];

      res.json({

        success: true,

        data:
          medicines.slice(0, 10)

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        error: error.message

      });

    }

  }
);

// =========================
// Get All Prescriptions
// =========================

router.get(
  '/',
  async (req, res) => {

    try {

     const prescriptions =
        await Prescription.find({
            user: req.user.id
        }).sort({ createdAt: -1 });

      res.json({

        success: true,

        count:
          prescriptions.length,

        data: prescriptions

      });

    } catch (error) {

      res.status(500).json({

        error: error.message

      });

    }

  }
);

// =========================
// Get Medicines Only
// =========================

router.get(
  '/medicines',
  async (req, res) => {

    try {

      const prescriptions =
        await Prescription.find({
          user: req.user.id
        });

      const medicines =
        prescriptions.flatMap(
          p => p.medicines
        );

      res.json({

        success: true,

        count:
          medicines.length,

        data: medicines

      });

    } catch (error) {

      res.status(500).json({

        error: error.message

      });

    }

  }
);

// =========================
// Get Full Details
// =========================

router.get(
  '/all',
  async (req, res) => {

    try {

      const prescriptions =
        await Prescription.find({
          user: req.user.id
        }).sort({
          createdAt: -1
        });

      res.json({

        success: true,

        data: prescriptions

      });

    } catch (error) {

      res.status(500).json({

        error: error.message

      });

    }

  }
);

// =========================
// Update Medicine Reminder
// =========================

router.put(
  "/reminder/:prescriptionId/:medicineIndex",
  async (req, res) => {

    try {

      const {
        prescriptionId,
        medicineIndex
      } = req.params;

      const {
        reminderType,
        nextReminderDate
      } = req.body;

      const prescription =
        await Prescription.findOne({

          _id: prescriptionId,

          user: req.user.id

        });

      if (!prescription) {

        return res.status(404).json({
          error: "Prescription not found"
        });

      }

      prescription.medicines[
        medicineIndex
      ].reminderType =
        reminderType;

      prescription.medicines[
        medicineIndex
      ].nextReminderDate =
        nextReminderDate;

      await prescription.save();

      res.json({
        success: true,
        data: prescription
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error: error.message
      });

    }

  }
);

module.exports = router;


