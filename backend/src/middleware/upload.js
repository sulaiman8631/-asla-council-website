const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadsDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_DOC_TYPES = ["application/pdf"];
const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
const MAX_DOC_SIZE = 10 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

function fileFilter(req, file, cb) {
  if ([...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES].includes(file.mimetype)) {
    return cb(null, true);
  }
  return cb(new Error("نوع الملف غير مدعوم"));
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_DOC_SIZE },
});

function enforceSizeByType(req, res, next) {
  if (!req.file) return next();
  const isImage = ALLOWED_IMAGE_TYPES.includes(req.file.mimetype);
  const limit = isImage ? MAX_IMAGE_SIZE : MAX_DOC_SIZE;
  if (req.file.size > limit) {
    fs.unlink(req.file.path, () => {});
    return res.status(400).json({
      success: false,
      message: isImage ? "حجم الصورة يجب ألا يتجاوز 3 ميغابايت" : "حجم الملف يجب ألا يتجاوز 10 ميغابايت",
    });
  }
  return next();
}

module.exports = { upload, enforceSizeByType };
