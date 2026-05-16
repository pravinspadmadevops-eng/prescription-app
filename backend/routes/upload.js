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