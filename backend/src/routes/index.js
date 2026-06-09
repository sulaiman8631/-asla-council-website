const express = require("express");

const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/town", require("./town"));
router.use("/contact-info", require("./contactInfo"));
router.use("/contact", require("./contact"));
router.use("/news", require("./news"));
router.use("/jobs", require("./jobs"));
router.use("/tenders", require("./tenders"));
router.use("/reports", require("./reports"));
router.use("/gallery", require("./gallery"));
router.use("/categories", require("./categories"));
router.use("/upload", require("./upload"));
router.use("/dashboard", require("./dashboard"));

module.exports = router;
