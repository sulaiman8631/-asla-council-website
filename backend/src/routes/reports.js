const express = require("express");
const { body, param, query } = require("express-validator");

const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { ok, fail } = require("../lib/response");

const router = express.Router();

router.get(
  "/",
  [
    query("year").optional().isInt().withMessage("السنة غير صالحة"),
    query("category").optional().isInt().withMessage("التصنيف غير صالح"),
  ],
  validate,
  async (req, res) => {
    const where = {
      ...(req.query.year && { year: Number(req.query.year) }),
      ...(req.query.category && { categoryId: Number(req.query.category) }),
    };
    const items = await prisma.report.findMany({
      where,
      include: { category: true },
      orderBy: { publishedAt: "desc" },
    });
    return ok(res, items);
  }
);

router.get("/:id", [param("id").isInt().withMessage("معرف غير صالح")], validate, async (req, res) => {
  const id = Number(req.params.id);
  const item = await prisma.report.findUnique({ where: { id }, include: { category: true } });
  if (!item) return fail(res, "التقرير غير موجود", 404);
  return ok(res, item);
});

const reportValidators = [
  body("title").trim().notEmpty().withMessage("العنوان مطلوب"),
  body("description").optional({ nullable: true }).isString(),
  body("file").trim().notEmpty().withMessage("ملف التقرير مطلوب"),
  body("categoryId").optional({ nullable: true }).isInt().withMessage("التصنيف غير صالح"),
  body("year").optional({ nullable: true }).isInt().withMessage("السنة غير صالحة"),
  body("publishedAt").optional().isISO8601().withMessage("تاريخ النشر غير صالح"),
];

router.post("/", auth, reportValidators, validate, async (req, res) => {
  const { title, description, file, categoryId, year, publishedAt } = req.body;
  const created = await prisma.report.create({
    data: {
      title,
      description: description || null,
      file,
      categoryId: categoryId ? Number(categoryId) : null,
      year: year ? Number(year) : null,
      ...(publishedAt && { publishedAt: new Date(publishedAt) }),
      createdBy: req.admin.id,
    },
  });
  return ok(res, created, "تم إنشاء التقرير بنجاح", 201);
});

router.put(
  "/:id",
  auth,
  [param("id").isInt().withMessage("معرف غير صالح"), ...reportValidators],
  validate,
  async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.report.findUnique({ where: { id } });
    if (!existing) return fail(res, "التقرير غير موجود", 404);

    const { title, description, file, categoryId, year, publishedAt } = req.body;
    const updated = await prisma.report.update({
      where: { id },
      data: {
        title,
        description: description ?? existing.description,
        file,
        categoryId: categoryId ? Number(categoryId) : null,
        year: year ? Number(year) : existing.year,
        ...(publishedAt && { publishedAt: new Date(publishedAt) }),
      },
    });
    return ok(res, updated, "تم تحديث التقرير بنجاح");
  }
);

router.delete("/:id", auth, [param("id").isInt().withMessage("معرف غير صالح")], validate, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.report.findUnique({ where: { id } });
  if (!existing) return fail(res, "التقرير غير موجود", 404);

  await prisma.report.delete({ where: { id } });
  return ok(res, null, "تم حذف التقرير بنجاح");
});

module.exports = router;
