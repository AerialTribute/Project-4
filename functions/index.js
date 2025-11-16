const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({
  origin: [
    "https://aerialtributeproject.org",
    "https://www.aerialtributeproject.org",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
  ],
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
});

const express = require("express");
const app = express();
app.use(cors);

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage().bucket();

app.post("/submitReimbursement", upload.fields([
  { name: "logbook", maxCount: 1 },
  { name: "receipt", maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, certificate, date, rate, hours, amount } = req.body;

    // Create Firestore document
    const docRef = await db.collection("reimbursements").add({
      name, certificate, date, rate, hours, amount,
      logbookUrl: "",
      receiptUrl: "",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    const docId = docRef.id;

    // Upload logbook
    const logbookFile = req.files.logbook[0];
    const logDest = `reimbursements/logbooks/${docId}_${logbookFile.originalname}`;
    const logUpload = storage.file(logDest);
    await logUpload.save(logbookFile.buffer);
    const [logbookUrl] = await logUpload.getSignedUrl({
      action: "read",
      expires: "03-01-2030",
    });

    // Upload receipt
    const receiptFile = req.files.receipt[0];
    const receiptDest = `reimbursements/receipts/${docId}_${receiptFile.originalname}`;
    const receiptUpload = storage.file(receiptDest);
    await receiptUpload.save(receiptFile.buffer);
    const [receiptUrl] = await receiptUpload.getSignedUrl({
      action: "read",
      expires: "03-01-2030",
    });

    // Update Firestore with URLs
    await docRef.update({
      logbookUrl,
      receiptUrl,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Required for Cloud Run
exports.api = functions.https.onRequest(app);

