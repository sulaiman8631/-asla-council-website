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
    const items = await prisma.job.findMany({ where, orderBy: { createdAt: "desc" } });
    return ok(res, items);
  }
);

router.get("/:id", [param("id").isInt().withMessage("معرف غير صالح")], validate, async (req, res) => {
  const id = Number(req.params.id);
  const item = await prisma.job.findUnique({ where: { id } });
  if (!item) return fail(res, "الوظيفة غير موجودة", 404);
  return ok(res, item);
});

const jobValidators = [
  body("title").trim().notEmpty().withMessage("العنوان مطلوب"),
  body("description").trim().notEmpty().withMessage("الوصف مطلوب"),
  body("requirements").optional({ nullable: true }).isString(),
  body("type").optional({ nullable: true }).isString(),
  body("location").optional({ nullable: true }).isString(),
  body("deadline").isISO8601().withMessage("تاريخ الإغلاق غير صالح"),
  body("status").optional().isIn(["open", "closed"]).withMessage("الحالة غير صالحة"),
  body("attachment").optional({ nullable: true }).isString(),
];

router.post("/", auth, jobValidators, validate, async (req, res) => {
  const { title, description, requirements, type, location, deadline, status, attachment } = req.body;
  const created = await prisma.job.create({
    data: {
      title,
      description,
      requirements: requirements || null,
      type: type || null,
      location: location || "عسلة",
      deadline: new Date(deadline),
      status: status || "open",
      attachment: attachment || null,
      createdBy: req.admin.id,
    },
  });
  return ok(res, created, "تم إنشاء الإعلان الوظيفي بنجاح", 201);
});

router.put(
  "/:id",
  auth,
  [param("id").isInt().withMessage("معرف غير صالح"), ...jobValidators],
  validate,
  async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.job.findUnique({ where: { id } });
    if (!existing) return fail(res, "الوظيفة غير موجودة", 404);

    const { title, description, requirements, type, location, deadline, status, attachment } = req.body;
    const updated = await prisma.job.update({
      where: { id },
      data: {
        title,
        description,
        requirements: requirements ?? existing.requirements,
        type: type ?? existing.type,
        location: location ?? existing.location,
        deadline: new Date(deadline),
        status: status || existing.status,
        attachment: attachment ?? existing.attachment,
      },
    });
    return ok(res, updated, "تم تحديث الإعلان الوظيفي بنجاح");
  }
);

router.delete("/:id", auth, [param("id").isInt().withMessage("معرف غير صالح")], validate, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.job.findUnique({ where: { id } });
  if (!existing) return fail(res, "الوظيفة غير موجودة", 404);

  await prisma.job.delete({ where: { id } });
  return ok(res, null, "تم حذف الإعلان الوظيفي بنجاح");
});

module.exports = router;
