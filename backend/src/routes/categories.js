const express = require("express");
const { body, param, query } = require("express-validator");

const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { ok, fail } = require("../lib/response");

const router = express.Router();

router.get(
  "/",
  [query("kind").optional().isIn(["news", "report"]).withMessage("النوع غير صالح")],
  validate,
  async (req, res) => {
    const where = { ...(req.query.kind && { kind: req.query.kind }) };
    const items = await prisma.category.findMany({ where, orderBy: { name: "asc" } });
    return ok(res, items);
  }
);

router.post(
  "/",
  auth,
  [
    body("name").trim().notEmpty().withMessage("اسم التصنيف مطلوب"),
    body("kind").isIn(["news", "report"]).withMessage("النوع غير صالح"),
  ],
  validate,
  async (req, res) => {
    const { name, kind } = req.body;
    const duplicate = await prisma.category.findUnique({ where: { name_kind: { name, kind } } });
    if (duplicate) return fail(res, "التصنيف موجود مسبقًا", 400);

    const created = await prisma.category.create({ data: { name, kind } });
    return ok(res, created, "تم إنشاء التصنيف بنجاح", 201);
  }
);

router.delete("/:id", auth, [param("id").isInt().withMessage("معرف غير صالح")], validate, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return fail(res, "التصنيف غير موجود", 404);

  await prisma.category.delete({ where: { id } });
  return ok(res, null, "تم حذف التصنيف بنجاح");
});

module.exports = router;
