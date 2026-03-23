import { Router } from "express";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { authenticate } from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// ============================================================
// VULNERABILITY #7: No file type validation on upload
// ------------------------------------------------------------
// The multer configuration accepts ANY file type with no
// filtering. An attacker can upload:
//   - .exe / .sh / .bat  (executable malware)
//   - .html / .svg        (stored XSS payloads)
//   - .php / .jsp         (server-side code if misconfigured)
//   - Huge files           (no size limit = denial of service)
//
// The file is written to disk with its ORIGINAL name, which
// could also contain path-traversal characters (../../).
// ============================================================

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, join(__dirname, "..", "..", "uploads"));
  },
  filename: (_req, file, cb) => {
    // BAD: using original filename without sanitization
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// No fileFilter — accepts everything
// No limits — no max file size
const upload = multer({ storage });

// -------------------------------------------------------
// POST /api/upload — Upload a product image
// -------------------------------------------------------
router.post("/", authenticate, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  res.status(201).json({
    message: "File uploaded successfully",
    file: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: `/uploads/${req.file.filename}`,
    },
  });
});

export default router;
