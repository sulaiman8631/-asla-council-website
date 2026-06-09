const express = require("express");

const auth = require("../middleware/auth");
const { upload, enforceSizeByType } = require("../middleware/upload");
const { ok, fail } = require("../lib/response");

const router = express.Router();

router.post("/", auth, upload.single("file"), enforceSizeByType, (req, res) => {
  if (!req.file) return fail(res, "لم يتم إرفاق أي ملف", 400);
  return ok(res, { url: `/uploads/${req.file.filename}` }, "تم رفع الملف بنجاح");
});

module.exports = router;
