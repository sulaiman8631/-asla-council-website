const express = require("express");

const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");
const { ok } = require("../lib/response");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const [news, jobs, tenders, reports, gallery, unreadMessages] = await Promise.all([
    prisma.news.count(),
    prisma.job.count(),
    prisma.tender.count(),
    prisma.report.count(),
    prisma.galleryImage.count(),
    prisma.contactMessage.count({ where: { isRead: false } }),
  ]);

  return ok(res, { news, jobs, tenders, reports, gallery, unreadMessages });
});

module.exports = router;
