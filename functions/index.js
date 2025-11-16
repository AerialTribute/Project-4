const functions = require("firebase-functions");
const admin = require("firebase-admin");
const multer = require("multer");
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage().bucket();

const app = express();
app.use(cors({ origin: true }));

// Multer setup for handling multipart/form-data
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// -------------------------------------------------------
// Reimbursement Form Submission
// -------------------------------------------------------
app.post("/submitReimbursement", upload.fields([
  { name: "logbook", maxCount: 1 },
  { name: "receipt", maxCount: 1 }
]), async (req, res) => {
  try {
    const submissionId = uuidv4();

    const { amount, certificate, date, hours } = req.body;

    // Create folder path
    const folderPath = `submissions/${submissionId}/`;

    // Upload logbook file
    let logbookUrl = "";
    if (req.files["logbook"]) {
      const logFile = req.files["logbook"][0];
      const logbookFilePath = folderPath + "logbook_" + logFile.originalname;

      await storage.file(logbookFilePath).save(logFile.buffer, {
        contentType: logFile.mimetype,
      });

      logbookUrl = await storage.file(logbookFilePath).getSignedUrl({
        action: "read",
        expires: "03-01-2100",
      }).then(urls => urls[0]);
    }

    // Upload receipt file
    let receiptUrl = "";
    if (req.files["receipt"]) {
      const recFile = req.files["receipt"][0];
      const receiptFilePath = folderPath + "receipt_" + recFile.originalname;

      await storage.file(receiptFilePath).save(recFile.buffer, {
        contentType: recFile.mimetype,
      });

      receiptUrl = await storage.file(receiptFilePath).getSignedUrl({
        action: "read",
        expires: "03-01-2100",
      }).then(urls => urls[0]);
    }

    // Save Firestore document
    await db.collection("reimbursements").doc(submissionId).set({
      amount,
      certificate,
      date,
      hours,
      logbookUrl,
      receiptUrl,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({
      success: true,
      submissionId,
    });
  } catch (error) {
    console.error("Error submitting reimbursement:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Export the Express API
exports.api = functions.https.onRequest(app);
