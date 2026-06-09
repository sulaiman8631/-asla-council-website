const express = require("express");
const { body } = require("express-validator");

const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { ok, fail } = require("../lib/response");

const router = express.Router();

router.get("/", async (req, res) => {
  const town = await prisma.townInfo.findUnique({
    where: { id: 1 },
    include: { statistics: { orderBy: { sortOrder: "asc" } } },
  });
  if (!town) return fail(res, "لم يتم العثور على معلومات البلدة", 404);
  return ok(res, town);
});

router.put(
  "/",
  auth,
  [
    body("name").optional().trim().notEmpty(),
    body("population").optional({ nullable: true }).isInt().withMessage("عدد السكان يجب أن يكون رقمًا"),
    body("statistics").optional().isArray(),
  ],
  validate,
  async (req, res) => {
    const {
      name,
      tagline,
      about,
      history,
      population,
      area,
      established,
      mayorName,
      logo,
      statistics,
    } = req.body;

    const data = {
      ...(name !== undefined && { name }),
      ...(tagline !== undefined && { tagline }),
      ...(about !== undefined && { about }),
      ...(history !== undefined && { history }),
      ...(population !== undefined && { population: population === null ? null : Number(population) }),
      ...(area !== undefined && { area }),
      ...(established !== undefined && { established }),
      ...(mayorName !== undefined && { mayorName }),
      ...(logo !== undefined && { logo }),
    };

    if (Array.isArray(statistics)) {
      await prisma.townStatistic.deleteMany({ where: { townInfoId: 1 } });
      data.statistics = {
        create: statistics.map((s, idx) => ({
          label: s.label,
          value: s.value,
          sortOrder: s.sortOrder ?? idx,
        })),
      };
    }

    const town = await prisma.townInfo.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
      include: { statistics: { orderBy: { sortOrder: "asc" } } },
    });

    return ok(res, town, "تم تحديث معلومات البلدة بنجاح");
  }
);

module.exports = router;
