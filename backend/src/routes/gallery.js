const express = require("express");
const { body, param } = require("express-validator");

const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { ok, fail } = require("../lib/response");

const router = express.Router();

router.get("/", async (req, res) => {
  const items = await prisma.galleryImage.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return ok(res, items);
});

router.post(
  "/",
  auth,
  [
    body("url").trim().notEmpty().withMessage("رابط الصورة مطلوب"),
    body("caption").optional({ nullable: true }).isString(),
    body("sortOrder").optional().isInt().withMessage("ترتيب العرض غير صالح"),
  ],
  validate,
  async (req, res) => {
    const { url, caption, sortOrder } = req.body;
    const created = await prisma.galleryImage.create({
      data: { url, caption: caption || null, sortOrder: sortOrder ?? 0 },
    });
    return ok(res, created, "تمت إضافة الصورة بنجاح", 201);
  }
);

router.delete("/:id", auth, [param("id").isInt().withMessage("معرف غير صالح")], validate, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.galleryImage.findUnique({ where: { id } });
  if (!existing) return fail(res, "الصورة غير موجودة", 404);

  await prisma.galleryImage.delete({ where: { id } });
  return ok(res, null, "تم حذف الصورة بنجاح");
});

module.exports = router;
