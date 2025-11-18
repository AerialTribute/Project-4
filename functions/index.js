const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const uuid = require("uuid").v4;

admin.initializeApp();
const db = admin.firestore();
const bucket = admin.storage().bucket();

const app = express();

// ====== FIXED CORS ======
const corsOptions = {
  origin: [
    "https://aerialtributeproject25.web.app",
    "https://www.aerialtributeproject23.org",
    "https://aerialtributeproject.org",
    "http://localhost:5500"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
};

// Enable CORS properly for ALL requests
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));   // preflight requests

// ====== Multer for file uploads ======
const upload = multer({
  storage: multer.memoryStorage(),
});

// ====== Submit Awardee Form ======
app.post("/submitAwardeeForm", upload.fields([
  { name: "logbookPhoto", maxCount: 1 },
  { name: "receiptPhoto", maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      fullName,
      email,
      lessonDescription,
      dateOfLesson,
      cfiRate,
      totalHours,
      amount,
      pilotCertificateNumber
    } = req.body;

    // Prepare the Firestore document
    const docData = {
      fullName,
      email,
      lessonDescription,
      dateOfLesson,
      cfiRate: Number(cfiRate),
      totalHours: Number(totalHours),
      reimbursementAmount: Number(amount),
      pilotCertificateNumber,
      submittedAt: admin.firestore.Timestamp.now()
    };

    // Upload logbook
    if (req.files["logbookPhoto"]) {
      const logbookFile = req.files["logbookPhoto"][0];
      const logbookName = `awardees/logbook_${Date.now()}_${uuid()}.jpg`;
      const file = bucket.file(logbookName);
      await file.save(logbookFile.buffer, {
        contentType: logbookFile.mimetype,
      });
      docData.logbookPhotoURL = `https://storage.googleapis.com/${bucket.name}/${logbookName}`;
    }

    // Upload receipt
    if (req.files["receiptPhoto"]) {
      const receiptFile = req.files["receiptPhoto"][0];
      const receiptName = `awardees/receipt_${Date.now()}_${uuid()}.jpg`;
      const file = bucket.file(receiptName);
      await file.save(receiptFile.buffer, {
        contentType: receiptFile.mimetype,
      });
      docData.receiptPhotoURL = `https://storage.googleapis.com/${bucket.name}/${receiptName}`;
    }

    // Save to Firestore
    await db.collection("awardee_submissions").add(docData);

    return res.status(200).json({
      success: true,
      message: "Awardee form submitted successfully!",
    });

  } catch (error) {
    console.error("Awardee Form Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Export the API
exports.api = functions.https.onRequest(app);
