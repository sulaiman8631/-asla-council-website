const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");

const prisma = require("../lib/prisma");
const validate = require("../middleware/validate");
const { ok, fail } = require("../lib/response");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "محاولات تسجيل دخول كثيرة، حاول لاحقًا" },
});

router.post(
  "/login",
  loginLimiter,
  [
    body("username").trim().notEmpty().withMessage("اسم المستخدم مطلوب"),
    body("password").notEmpty().withMessage("كلمة المرور مطلوبة"),
  ],
  validate,
  async (req, res) => {
    const { username, password } = req.body;

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      return fail(res, "اسم المستخدم أو كلمة المرور غير صحيحة", 401);
    }

    const matches = await bcrypt.compare(password, admin.passwordHash);
    if (!matches) {
      return fail(res, "اسم المستخدم أو كلمة المرور غير صحيحة", 401);
    }

    const token = jwt.sign({ id: admin.id, role: admin.role, username: admin.username }, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });

    return ok(res, {
      token,
      admin: { id: admin.id, username: admin.username, role: admin.role },
    });
  }
);

router.put(
  "/profile",
  require("../middleware/auth"),
  [
    body("currentPassword").notEmpty().withMessage("كلمة المرور الحالية مطلوبة"),
    body("username").optional().trim().notEmpty().withMessage("اسم المستخدم لا يمكن أن يكون فارغاً"),
    body("newPassword").optional().isLength({ min: 6 }).withMessage("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل"),
  ],
  validate,
  async (req, res) => {
    const { currentPassword, username, newPassword } = req.body;

    const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } });
    if (!admin) return fail(res, "الحساب غير موجود", 404);

    const matches = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!matches) return fail(res, "كلمة المرور الحالية غير صحيحة", 401);

    const data = {};
    if (username && username !== admin.username) {
      const exists = await prisma.admin.findUnique({ where: { username } });
      if (exists) return fail(res, "اسم المستخدم مستخدم بالفعل", 400);
      data.username = username;
    }
    if (newPassword) {
      data.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(data).length === 0) {
      return fail(res, "لم يتم إجراء أي تغيير", 400);
    }

    const updated = await prisma.admin.update({ where: { id: req.admin.id }, data });
    return ok(res, { id: updated.id, username: updated.username, role: updated.role }, "تم تحديث بيانات الحساب بنجاح");
  }
);

module.exports = router;
