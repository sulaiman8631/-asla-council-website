const express = require("express");
const { body, param, query } = require("express-validator");

const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { ok, fail } = require("../lib/response");

const router = express.Router();

router.get(
  "/",
  [query("status").optional().isIn(["open", "closed"]).withMessage("الحالة غير صالحة")],
  validate,
  async (req, res) => {
    const where = { ...(req.query.status && { status: req.query.status }) };
    const items = await prisma.tender.findMany({ where, orderBy: { publishDate: "desc" } });
    return ok(res, items);
  }
);

router.get("/:id", [param("id").isInt().withMessage("معرف غير صالح")], validate, async (req, res) => {
  const id = Number(req.params.id);
  const item = await prisma.tender.findUnique({ where: { id } });
  if (!item) return fail(res, "العطاء غير موجود", 404);
  return ok(res, item);
});

const tenderValidators = [
  body("referenceNo").trim().notEmpty().withMessage("رقم العطاء مطلوب"),
  body("title").trim().notEmpty().withMessage("العنوان مطلوب"),
  body("description").optional({ nullable: true }).isString(),
  body("document").optional({ nullable: true }).isString(),
  body("publishDate").optional().isISO8601().withMessage("تاريخ النشر غير صالح"),
  body("deadline").isISO8601().withMessage("تاريخ الإغلاق غير صالح"),
  body("status").optional().isIn(["open", "closed"]).withMessage("الحالة غير صالحة"),
];

router.post("/", auth, tenderValidators, validate, async (req, res) => {
  const { referenceNo, title, description, document, publishDate, deadline, status } = req.body;

  const duplicate = await prisma.tender.findUnique({ where: { referenceNo } });
  if (duplicate) return fail(res, "رقم العطاء مستخدم مسبقًا", 400);

  const created = await prisma.tender.create({
    data: {
      referenceNo,
      title,
      description: description || null,
      document: document || null,
      ...(publishDate && { publishDate: new Date(publishDate) }),
      deadline: new Date(deadline),
      status: status || "open",
      createdBy: req.admin.id,
    },
  });
  return ok(res, created, "تم إنشاء العطاء بنجاح", 201);
});

router.put(
  "/:id",
  auth,
  [param("id").isInt().withMessage("معرف غير صالح"), ...tenderValidators],
  validate,
  async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.tender.findUnique({ where: { id } });
    if (!existing) return fail(res, "العطاء غير موجود", 404);

    const { referenceNo, title, description, document, publishDate, deadline, status } = req.body;

    if (referenceNo !== existing.referenceNo) {
      const duplicate = await prisma.tender.findUnique({ where: { referenceNo } });
      if (duplicate) return fail(res, "رقم العطاء مستخدم مسبقًا", 400);
    }

    const updated = await prisma.tender.update({
      where: { id },
      data: {
        referenceNo,
        title,
        description: description ?? existing.description,
        document: document !== undefined ? (document || null) : existing.document,
        ...(publishDate && { publishDate: new Date(publishDate) }),
        deadline: new Date(deadline),
        status: status || existing.status,
      },
    });
    return ok(res, updated, "تم تحديث العطاء بنجاح");
  }
);

router.delete("/:id", auth, [param("id").isInt().withMessage("معرف غير صالح")], validate, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.tender.findUnique({ where: { id } });
  if (!existing) return fail(res, "العطاء غير موجود", 404);

  await prisma.tender.delete({ where: { id } });
  return ok(res, null, "تم حذف العطاء بنجاح");
});

module.exports = router;
