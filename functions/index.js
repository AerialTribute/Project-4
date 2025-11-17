const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
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

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage().bucket("aerialtributeproject25.firebasestorage.app");

const app = express();

/* ---------------------------
   REQUIRED FIXES FOR GEN 2 CLOUD RUN
   --------------------------- */
app.use(cors);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
/* --------------------------- */

app.post(
  "/submitReimbursement",
  upload.fields([
    { name: "logbook", maxCount: 1 },
    { name: "receipt", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { name, certificate, date, rate, hours, amount } = req.body;

      if (!name || !certificate || !date || !rate || !hours) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

      // Create Firestore document
      const docRef = await db.collection("reimbursements").add({
        name,
        certificate,
        date,
        rate,
        hours,
        amount,
        logbookUrl: "",
        receiptUrl: "",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      const docId = docRef.id;

      /* ---------------------------
         Upload LOGBOOK
         --------------------------- */
      const logbookFile = req.files.logbook[0];
      const logDest = `reimbursements/logbooks/${docId}_${logbookFile.originalname}`;
      const logUpload = storage.file(logDest);

      await logUpload.save(logbookFile.buffer);
      const [logbookUrl] = await logUpload.getSignedUrl({
        action: "read",
        expires: "03-01-2030",
      });

      /* ---------------------------
         Upload RECEIPT
         --------------------------- */
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

      return res.json({ success: true });
    } catch (err) {
      console.error("ERROR:", err);
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
);

/* ---------------------------
   EXPORT FOR FIREBASE FUNCTIONS GEN 2
   --------------------------- */
exports.api = functions.https.onRequest(app);
