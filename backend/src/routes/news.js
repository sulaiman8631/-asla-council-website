const express = require("express");
const { body, param, query } = require("express-validator");

const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { ok, fail } = require("../lib/response");

const router = express.Router();

const imageInclude = {
  images: { orderBy: { sortOrder: "asc" } },
};

router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("رقم الصفحة غير صالح"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("الحد غير صالح"),
    query("category").optional().isInt().withMessage("التصنيف غير صالح"),
  ],
  validate,
  async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 9;
    const where = {
      isPublished: true,
      ...(req.query.category && { categoryId: Number(req.query.category) }),
    };

    const [items, total] = await Promise.all([
      prisma.news.findMany({
        where,
        include: { category: true, ...imageInclude },
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.news.count({ where }),
    ]);

    return ok(res, {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
  }
);

router.get("/:id", [param("id").isInt().withMessage("معرف غير صالح")], validate, async (req, res) => {
  const id = Number(req.params.id);
  const item = await prisma.news.findUnique({
    where: { id },
    include: { category: true, author: { select: { username: true } }, ...imageInclude },
  });
  if (!item || !item.isPublished) return fail(res, "الخبر غير موجود", 404);
  return ok(res, item);
});

// Admin: get any news item (including unpublished) for editing
router.get("/:id/edit", auth, [param("id").isInt().withMessage("معرف غير صالح")], validate, async (req, res) => {
  const id = Number(req.params.id);
  const item = await prisma.news.findUnique({
    where: { id },
    include: { category: true, ...imageInclude },
  });
  if (!item) return fail(res, "الخبر غير موجود", 404);
  return ok(res, item);
});

const newsValidators = [
  body("title").trim().notEmpty().withMessage("العنوان مطلوب"),
  body("body").trim().notEmpty().withMessage("نص الخبر مطلوب"),
  body("categoryId").optional({ nullable: true }).isInt().withMessage("التصنيف غير صالح"),
  body("coverImage").optional({ nullable: true }).isString(),
  body("isPublished").optional().isBoolean().withMessage("حالة النشر غير صالحة"),
  body("images").optional().isArray().withMessage("قائمة الصور غير صالحة"),
  body("images.*.url").optional().isString().withMessage("رابط الصورة غير صالح"),
  body("images.*.isMain").optional().isBoolean(),
  body("images.*.sortOrder").optional().isInt(),
];

function extractCoverImage(images, fallback) {
  if (!images || images.length === 0) return fallback ?? null;
  const main = images.find((img) => img.isMain);
  return main ? main.url : images[0].url;
}

router.post("/", auth, newsValidators, validate, async (req, res) => {
  const { title, body: content, categoryId, coverImage, isPublished, publishedAt, images } = req.body;

  const resolvedCover = images?.length ? extractCoverImage(images, coverImage) : (coverImage || null);

  const created = await prisma.news.create({
    data: {
      title,
      body: content,
      categoryId: categoryId ? Number(categoryId) : null,
      coverImage: resolvedCover,
      isPublished: isPublished ?? true,
      ...(publishedAt && { publishedAt: new Date(publishedAt) }),
      createdBy: req.admin.id,
      ...(images?.length && {
        images: {
          create: images.map((img, i) => ({
            url: img.url,
            isMain: img.isMain ?? false,
            sortOrder: img.sortOrder ?? i,
          })),
        },
      }),
    },
    include: imageInclude,
  });

  return ok(res, created, "تم إنشاء الخبر بنجاح", 201);
});

router.put(
  "/:id",
  auth,
  [param("id").isInt().withMessage("معرف غير صالح"), ...newsValidators],
  validate,
  async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) return fail(res, "الخبر غير موجود", 404);

    const { title, body: content, categoryId, coverImage, isPublished, publishedAt, images } = req.body;

    const resolvedCover = images?.length ? extractCoverImage(images, coverImage) : (coverImage ?? existing.coverImage);

    // Replace images: delete all existing, recreate from request
    const updated = await prisma.$transaction(async (tx) => {
      if (images !== undefined) {
        await tx.newsImage.deleteMany({ where: { newsId: id } });
        if (images.length > 0) {
          await tx.newsImage.createMany({
            data: images.map((img, i) => ({
              newsId: id,
              url: img.url,
              isMain: img.isMain ?? false,
              sortOrder: img.sortOrder ?? i,
            })),
          });
        }
      }

      return tx.news.update({
        where: { id },
        data: {
          title,
          body: content,
          categoryId: categoryId ? Number(categoryId) : null,
          coverImage: resolvedCover,
          isPublished: isPublished ?? existing.isPublished,
          ...(publishedAt && { publishedAt: new Date(publishedAt) }),
        },
        include: imageInclude,
      });
    });

    return ok(res, updated, "تم تحديث الخبر بنجاح");
  }
);

router.delete("/:id", auth, [param("id").isInt().withMessage("معرف غير صالح")], validate, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.news.findUnique({ where: { id } });
  if (!existing) return fail(res, "الخبر غير موجود", 404);

  await prisma.news.delete({ where: { id } });
  return ok(res, null, "تم حذف الخبر بنجاح");
});

module.exports = router;
