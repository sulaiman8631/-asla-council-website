const express = require("express");
const { body, param } = require("express-validator");
const rateLimit = require("express-rate-limit");

const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { ok, fail } = require("../lib/response");

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "تم إرسال عدد كبير من الرسائل، حاول لاحقًا" },
});

router.post(
  "/",
  contactLimiter,
  [
    body("name").trim().notEmpty().withMessage("الاسم مطلوب"),
    body("email").optional({ nullable: true, checkFalsy: true }).isEmail().withMessage("البريد الإلكتروني غير صالح"),
    body("subject").optional({ nullable: true }).trim(),
    body("message").trim().notEmpty().withMessage("نص الرسالة مطلوب"),
  ],
  validate,
  async (req, res) => {
    const { name, email, subject, message } = req.body;
    const created = await prisma.contactMessage.create({
      data: { name, email: email || null, subject: subject || null, message },
    });
    return ok(res, { id: created.id }, "تم إرسال رسالتك بنجاح، سنتواصل معك قريبًا", 201);
  }
);

router.get("/", auth, async (req, res) => {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  return ok(res, messages);
});

router.patch(
  "/:id/read",
  auth,
  [param("id").isInt().withMessage("معرف غير صالح")],
  validate,
  async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) return fail(res, "الرسالة غير موجودة", 404);

    const updated = await prisma.contactMessage.update({ where: { id }, data: { isRead: true } });
    return ok(res, updated, "تم تحديد الرسالة كمقروءة");
  }
);

router.delete(
  "/:id",
  auth,
  [param("id").isInt().withMessage("معرف غير صالح")],
  validate,
  async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) return fail(res, "الرسالة غير موجودة", 404);

    await prisma.contactMessage.delete({ where: { id } });
    return ok(res, null, "تم حذف الرسالة");
  }
);

module.exports = router;
