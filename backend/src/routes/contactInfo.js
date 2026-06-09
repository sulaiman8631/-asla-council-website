const express = require("express");
const { body } = require("express-validator");

const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { ok, fail } = require("../lib/response");

const router = express.Router();

router.get("/", async (req, res) => {
  const info = await prisma.contactInfo.findUnique({ where: { id: 1 } });
  if (!info) return fail(res, "لم يتم العثور على معلومات الاتصال", 404);
  return ok(res, info);
});

router.put(
  "/",
  auth,
  [
    body("email").optional({ nullable: true, checkFalsy: true }).isEmail().withMessage("البريد الإلكتروني غير صالح"),
    body("lat").optional({ nullable: true }).isFloat().withMessage("الإحداثية غير صالحة"),
    body("lng").optional({ nullable: true }).isFloat().withMessage("الإحداثية غير صالحة"),
  ],
  validate,
  async (req, res) => {
    const fields = [
      "address",
      "phone",
      "email",
      "workingHours",
      "mapEmbedUrl",
      "lat",
      "lng",
      "facebook",
      "instagram",
      "twitter",
      "youtube",
    ];
    const data = {};
    for (const f of fields) {
      if (req.body[f] !== undefined) data[f] = req.body[f];
    }
    if (data.lat !== undefined && data.lat !== null) data.lat = Number(data.lat);
    if (data.lng !== undefined && data.lng !== null) data.lng = Number(data.lng);

    const info = await prisma.contactInfo.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });

    return ok(res, info, "تم تحديث معلومات الاتصال بنجاح");
  }
);

module.exports = router;
