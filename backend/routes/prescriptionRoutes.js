const router = require("express").Router();
const multer = require("multer");
const auth = require("../middleware/auth");
const { upload } = require("../controllers/prescriptionController");

const uploadFile = multer({ dest: "uploads/" });

router.post("/upload", auth, uploadFile.single("file"), upload);

module.exports = router;